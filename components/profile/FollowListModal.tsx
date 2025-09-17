import React from 'react';
import { User } from '../../types';
import UserCard from '../users/UserCard';

interface FollowListModalProps {
    title: string;
    userIds: string[];
    allUsers: User[];
    currentUser: User;
    onClose: () => void;
    onToggleFollow: (targetUserId: string) => void;
    onViewProfile: (user: User) => void;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ title, userIds, allUsers, currentUser, onClose, onToggleFollow, onViewProfile }) => {
    const usersToShow = allUsers.filter(u => userIds.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-border">
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="overflow-y-auto p-4">
                    {usersToShow.length > 0 ? (
                        <div className="space-y-3">
                            {usersToShow.map(user => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    currentUser={currentUser}
                                    onToggleFollow={onToggleFollow}
                                    onViewProfile={onViewProfile}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary text-center py-8">No users to show.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;