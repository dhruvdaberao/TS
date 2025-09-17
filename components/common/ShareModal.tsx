import React, { useState, useMemo } from 'react';
import { Post, User, Tribe } from '../../types';
import UserAvatar from './UserAvatar';

interface ShareModalProps {
  post: Post;
  currentUser: User;
  tribes: Tribe[];
  users: User[];
  onClose: () => void;
  onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, currentUser, tribes, users, onClose, onSharePost }) => {
  const [activeTab, setActiveTab] = useState<'tribes' | 'users'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ type: 'tribe' | 'user', id: string } | null>(null);
  
  const myTribes = useMemo(() => tribes.filter(t => t.members.includes(currentUser.id)), [tribes, currentUser.id]);
  const otherUsers = useMemo(() => users.filter(u => u.id !== currentUser.id), [users, currentUser.id]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return otherUsers;
    return otherUsers.filter(u =>
      u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)
    );
  }, [searchTerm, otherUsers]);

  const handleSend = () => {
    if (selected) {
      onSharePost(post, selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md h-[70vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-primary">Share Post</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary text-2xl leading-none">&times;</button>
        </div>

        <div className="border-b border-border flex-shrink-0">
          <nav className="flex space-x-1 p-1">
            <TabButton name="Share with User" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <TabButton name="Share to Tribe" isActive={activeTab === 'tribes'} onClick={() => setActiveTab('tribes')} />
          </nav>
        </div>

        <div className="overflow-y-auto flex-1">
          {activeTab === 'users' && (
            <div>
              <div className="p-2 sticky top-0 bg-surface">
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a user..."
                    className="w-full bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
              </div>
              <div className="divide-y divide-border">
                {filteredUsers.map(user => (
                  <ListItem key={user.id} type="user" item={user} isSelected={selected?.id === user.id} onSelect={() => setSelected({ type: 'user', id: user.id })} />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'tribes' && (
            <div className="divide-y divide-border">
              {myTribes.map(tribe => (
                <ListItem key={tribe.id} type="tribe" item={tribe} isSelected={selected?.id === tribe.id} onSelect={() => setSelected({ type: 'tribe', id: tribe.id })} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={!selected}
            className="w-full bg-accent text-accent-text font-semibold p-3 rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{name: string, isActive: boolean, onClick: () => void}> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full text-center font-semibold p-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-accent text-accent-text' : 'text-secondary hover:bg-background'}`}>
        {name}
    </button>
);

const ListItem: React.FC<{type: 'user' | 'tribe', item: User | Tribe, isSelected: boolean, onSelect: () => void}> = ({ type, item, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`p-3 flex items-center cursor-pointer transition-colors ${isSelected ? 'bg-accent/10' : 'hover:bg-background'}`}>
        {type === 'user' ? 
            <UserAvatar user={item as User} className="w-10 h-10 flex-shrink-0" />
            : 
            <TribeAvatar tribe={item as Tribe} />
        }
        <div className="ml-3 overflow-hidden">
            <p className="font-semibold text-primary truncate">{item.name}</p>
            {type === 'user' && <p className="text-sm text-secondary truncate">@{(item as User).username}</p>}
            {type === 'tribe' && <p className="text-sm text-secondary truncate">{(item as Tribe).members.length} members</p>}
        </div>
        {isSelected && <div className="ml-auto w-5 h-5 bg-accent rounded-full flex items-center justify-center text-accent-text"><CheckIcon /></div>}
    </div>
);

const TribeAvatar = ({tribe}: {tribe: Tribe}) => (
    <div className="w-10 h-10 rounded-full flex-shrink-0">
        {tribe.avatarUrl ? (
            <img src={tribe.avatarUrl} alt={tribe.name} className="w-full h-full rounded-full object-cover" />
        ) : (
             <div className="w-full h-full rounded-full bg-background border border-border flex items-center justify-center text-secondary p-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
        )}
    </div>
);

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

export default ShareModal;
