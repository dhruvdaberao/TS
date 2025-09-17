import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import UserAvatar from '../common/UserAvatar';

interface CreatePostProps {
  currentUser: User;
  allUsers: User[];
  onAddPost: (content: string, imageUrl?: string) => void;
  isPosting: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, allUsers, onAddPost, isPosting }) => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    const match = text.match(/@(\w*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1]);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    const newContent = content.replace(/@(\w*)$/, `@${username} `);
    setContent(newContent);
    setShowMentions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPosting && (content.trim() || imagePreview)) {
      onAddPost(content, imagePreview || undefined);
      setContent('');
      removeImage();
    }
  };

  return (
    <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border mb-6 relative overflow-hidden">
      {isPosting && (
        <div className="absolute inset-x-0 top-0 h-1 bg-accent/20 overflow-hidden">
            <div className="h-1 bg-accent animate-indeterminate"></div>
            <style>{`
                @keyframes indeterminate {
                    0% { transform: translateX(-100%) scaleX(0.5); }
                    50% { transform: translateX(0) scaleX(0.3); }
                    100% { transform: translateX(100%) scaleX(0.5); }
                }
                .animate-indeterminate {
                    animation: indeterminate 2s infinite linear;
                }
            `}</style>
        </div>
      )}
      <div className={`flex items-start space-x-4 ${isPosting ? 'opacity-50 pointer-events-none' : ''}`}>
        <UserAvatar user={currentUser} className="w-12 h-12 flex-shrink-0" />
        <div className="w-full relative">
          <form onSubmit={handleSubmit} className="w-full">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              className="w-full p-2 bg-background border-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none text-primary"
              rows={3}
              disabled={isPosting}
            />
          </form>

          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="p-2 flex items-center hover:bg-background cursor-pointer"
                  onClick={() => handleMentionSelect(user.username)}
                >
                  <UserAvatar user={user} className="w-8 h-8 mr-2" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-secondary">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {imagePreview && (
            <div className="mt-4 relative">
              <img src={imagePreview} alt="Image preview" className="rounded-lg w-full max-h-80 object-cover" />
              <button 
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 leading-none hover:bg-black/80 transition-colors"
                aria-label="Remove image"
                disabled={isPosting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-secondary hover:text-accent p-2 rounded-full transition-colors"
                aria-label="Add image"
                disabled={isPosting}
              >
                <ImageIcon />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                disabled={isPosting}
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imagePreview) || isPosting}
              className="bg-accent text-accent-text font-semibold px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default CreatePost;