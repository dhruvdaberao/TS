import React, { useState, useRef, useEffect } from 'react';
import { Tribe, User, TribeMessage } from '../../types';

interface TribeDetailPageProps {
  tribe: Tribe;
  currentUser: User;
  onSendMessage: (tribeId: string, text: string) => void;
  onBack: () => void;
  onViewProfile: (user: User) => void;
  onEditTribe: (tribe: Tribe) => void;
}

const TribePlaceholderIcon = () => (
     <div className="w-10 h-10 rounded-full mr-3 bg-background border border-border flex items-center justify-center text-secondary p-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    </div>
);


const TribeDetailPage: React.FC<TribeDetailPageProps> = ({ tribe, currentUser, onSendMessage, onBack, onViewProfile, onEditTribe }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tribe.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(tribe.id, inputText);
      setInputText('');
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-surface rounded-2xl border border-border shadow-md">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-border flex-shrink-0">
        <button onClick={onBack} className="p-2 mr-2 text-primary">
            <BackIcon />
        </button>
        {tribe.avatarUrl ? (
            <img src={tribe.avatarUrl} alt={tribe.name} className="w-10 h-10 rounded-full mr-3 object-cover"/>
        ) : (
            <TribePlaceholderIcon />
        )}
        <div>
            <h2 className="text-lg font-bold text-primary">{tribe.name}</h2>
            <p className="text-sm text-secondary">{tribe.members.length} members</p>
        </div>
        <div className="ml-auto">
            {currentUser.id === tribe.owner && (
                <button 
                    onClick={() => onEditTribe(tribe)} 
                    className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-background flex items-center space-x-1 text-sm font-semibold"
                    aria-label="Edit Tribe"
                >
                    <EditIcon />
                    <span>Edit</span>
                </button>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex flex-col space-y-2">
          {tribe.messages.map(message => {
            const isCurrentUser = message.sender.id === currentUser.id;
            return (
              <div key={message.id} className={`flex items-end gap-2.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                 {!isCurrentUser && (
                     <img 
                        src={message.sender.avatarUrl} 
                        alt={message.sender.name} 
                        className="w-8 h-8 rounded-full cursor-pointer self-start"
                        onClick={() => onViewProfile(message.sender)}
                     />
                 )}
                <div className={`flex flex-col w-full max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                        <p 
                            className="text-xs text-secondary mb-1 ml-3 cursor-pointer hover:underline"
                            onClick={() => onViewProfile(message.sender)}
                        >
                            {message.sender.name}
                        </p>
                    )}
                    <div className={`px-4 py-2.5 rounded-xl text-sm ${isCurrentUser ? 'bg-accent text-accent-text' : 'bg-surface text-primary shadow-sm'}`}>
                        <p className="leading-relaxed">{message.text}</p>
                    </div>
                    <p className="text-xs text-secondary mt-1.5 px-1">{message.timestamp}</p>
                </div>
              </div>
            );
          })}
          {tribe.messages.length === 0 && (
              <div className="text-center text-secondary p-8">
                  <p>Welcome to #{tribe.name}!</p>
                  <p className="text-sm">Be the first one to send a message.</p>
              </div>
          )}
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${tribe.name}`}
            className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-primary"
          />
          <button type="submit" className="bg-accent text-accent-text rounded-full p-3 hover:bg-accent-hover transition-colors disabled:opacity-50" disabled={!inputText.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" /></svg>

export default TribeDetailPage;
