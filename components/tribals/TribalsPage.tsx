import React from 'react';
import { User } from '../../types';
import UserCard from './UserCard';

interface TribalsPageProps {
    users: User[];
    currentUser: User;
    onToggleFollow: (targetUserId: string) => void;
    onViewProfile: (user: User) => void;
}

const TribalsPage: React.FC<TribalsPageProps> = ({ users, currentUser, onToggleFollow, onViewProfile }) => {
    const otherUsers = users.filter(u => u.id !== currentUser.id);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-primary mb-6 font-display">Discover Tribals</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherUsers.map(user => (
                    <UserCard 
                        key={user.id}
                        user={user}
                        currentUser={currentUser}
                        onToggleFollow={onToggleFollow}
                        onViewProfile={onViewProfile}
                    />
                ))}
            </div>
        </div>
    );
};

export default TribalsPage;
