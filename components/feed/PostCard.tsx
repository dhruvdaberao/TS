import React, { useState, useMemo } from 'react';
import { Post, User, Tribe } from '../../types';
import UserAvatar from '../common/UserAvatar';
import ShareModal from '../common/ShareModal';

interface PostCardProps {
  post: Post;
  currentUser: User;
  allUsers: User[];
  allTribes: Tribe[];
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onViewProfile: (user: User) => void;
  onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
}

const PostCard: React.FC<PostCardProps> = (props) => {
  const { post, currentUser, allUsers, allTribes, onLike, onComment, onDeletePost, onDeleteComment, onViewProfile, onSharePost } = props;
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isLiked = post.likes.includes(currentUser.id);
  const isOwnPost = post.author.id === currentUser.id;

  const handleLikeClick = () => {
    onLike(post.id);
    if (!isLiked) {
      setIsAnimating(true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleDeletePostClick = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
        onDeletePost(post.id);
    }
    setOptionsOpen(false);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        onDeleteComment(post.id, commentId);
    }
  };
  
  const visibleComments = useMemo(() => {
    return post.comments.filter(comment => !currentUser.blockedUsers.includes(comment.author.id));
  }, [post.comments, currentUser.blockedUsers]);

  return (
    <>
    <div className="bg-surface border border-border rounded-2xl shadow-md mb-6">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <div className="w-12 h-12 rounded-full cursor-pointer" onClick={() => onViewProfile(post.author)}>
             <UserAvatar user={post.author} className="w-full h-full" />
        </div>
        <div className="ml-4">
          <p
            className="font-bold text-primary cursor-pointer hover:underline"
            onClick={() => onViewProfile(post.author)}
          >
            {post.author.name}
          </p>
          <p className="text-sm text-secondary">{post.timestamp}</p>
        </div>
        <div className="ml-auto relative">
          {isOwnPost && (
            <button 
              id={`options-menu-button-${post.id}`}
              aria-haspopup="true"
              aria-expanded={optionsOpen}
              onClick={() => setOptionsOpen(!optionsOpen)} 
              onBlur={() => setTimeout(() => setOptionsOpen(false), 150)} 
              className="text-secondary p-2 rounded-full hover:bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <OptionsIcon />
            </button>
          )}
          {optionsOpen && (
            <div 
              className="absolute right-0 mt-2 w-36 bg-surface rounded-lg shadow-lg border border-border z-10"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby={`options-menu-button-${post.id}`}
            >
              <button 
                onClick={handleDeletePostClick} 
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center space-x-2"
                role="menuitem"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="px-4 pb-4 text-primary whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="w-full" />}

      {/* Post Actions */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-b border-border text-secondary text-sm">
        <div className="flex space-x-2">
            <span>{post.likes.length} Likes</span>
            <span>·</span>
            <span>{visibleComments.length} Comments</span>
        </div>
      </div>
      <div className="flex justify-around items-center p-1 text-secondary font-semibold">
        <button
          onClick={handleLikeClick}
          onAnimationEnd={() => setIsAnimating(false)}
          className={`flex items-center space-x-2 p-2 rounded-lg w-full justify-center transition-colors ${
            isLiked ? 'text-accent hover:bg-accent/10' : 'text-secondary hover:bg-background'
          } ${isAnimating ? 'animate-pop' : ''}`}
        >
          <LikeIcon filled={isLiked} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background w-full justify-center transition-colors"
        >
          <CommentIcon />
          <span>Comment</span>
        </button>
         <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background w-full justify-center transition-colors"
        >
            <ShareIcon />
            <span>Share</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="p-4 border-t border-border">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-start space-x-2 mb-4">
            <UserAvatar user={currentUser} className="w-8 h-8 flex-shrink-0 mt-1"/>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-background border border-border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm min-w-0"
            />
            <button type="submit" className="text-accent font-semibold text-sm disabled:text-secondary px-3 py-2 flex-shrink-0" disabled={!commentText.trim()}>Post</button>
          </form>

          {/* Existing Comments */}
          <div className="space-y-3">
            {visibleComments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-2 group">
                 <div className="w-8 h-8 rounded-full cursor-pointer flex-shrink-0" onClick={() => onViewProfile(comment.author)}>
                    <UserAvatar user={comment.author} className="w-full h-full"/>
                 </div>
                <div className="flex-1">
                  <div className="bg-background rounded-xl p-3">
                    <p className="font-semibold text-sm text-primary cursor-pointer hover:underline" onClick={() => onViewProfile(comment.author)}>{comment.author.name}</p>
                    <p className="text-sm text-primary whitespace-pre-wrap">{comment.text}</p>
                  </div>
                  <p className="text-xs text-secondary ml-3 mt-1">{comment.timestamp}</p>
                </div>
                {(comment.author.id === currentUser.id || isOwnPost) && (
                    <button onClick={() => handleDeleteCommentClick(comment.id)} className="text-secondary p-1 rounded-full hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
              </div>
            ))}
            {visibleComments.length === 0 && <p className="text-sm text-secondary text-center">No comments yet.</p>}
          </div>
        </div>
      )}
    </div>
    {isShareModalOpen && (
        <ShareModal
            post={post}
            currentUser={currentUser}
            users={allUsers}
            tribes={allTribes}
            onClose={() => setIsShareModalOpen(false)}
            onSharePost={onSharePost}
        />
    )}
    </>
  );
};

// Icons
const LikeIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
const CommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const OptionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);
const TrashIcon = ({className = ''}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export default PostCard;