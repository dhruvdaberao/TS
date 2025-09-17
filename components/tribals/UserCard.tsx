import React from 'react';
import { User } from '../../types';

interface UserCardProps {
    user: User;
    currentUser: User;
    onToggleFollow: (targetUserId: string) => void;
    onViewProfile: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onToggleFollow, onViewProfile }) => {
    const isFollowing = currentUser.following.includes(user.id);

    return (
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
                <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full cursor-pointer"
                    onClick={() => onViewProfile(user)}
                />
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
