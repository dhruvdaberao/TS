import React from 'react';
import { User } from '../../types';

interface UserCardProps {
    user: User;
    currentUser: User;
    onToggleFollow: (targetUserId: string) => void;
    onViewProfile: (user: User) => void;
}

const UserPlaceholderIcon = ({ className = '' }: { className?: string }) => (
    <div className={`bg-background border border-border rounded-full flex items-center justify-center text-secondary ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3/5 h-3/5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    </div>
);

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onToggleFollow, onViewProfile }) => {
    const isFollowing = currentUser.following.includes(user.id);

    return (
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
                <div 
                    className="w-12 h-12 rounded-full cursor-pointer flex-shrink-0"
                    onClick={() => onViewProfile(user)}
                >
                    {user.avatarUrl ? (
                         <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <UserPlaceholderIcon className="w-full h-full" />
                    )}
                </div>
                <div className="ml-4 overflow-hidden">
                    <p 
                        className="font-bold text-primary truncate cursor-pointer hover:underline"
                        onClick={() => onViewProfile(user)}
                    >
                        {user.name}
                    </p>
                    <p className="text-sm text-secondary truncate">@{user.username}</p>
                </div>
            </div>
            <button 
                onClick={() => onToggleFollow(user.id)}
                className={`font-semibold px-4 py-1.5 rounded-lg transition-colors text-sm ml-2 flex-shrink-0 ${
                   isFollowing 
                   ? 'bg-surface text-primary border border-border hover:bg-background'
                   : 'bg-accent text-accent-text hover:bg-accent-hover'
                }`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        </div>
    );
};

export default UserCard;
