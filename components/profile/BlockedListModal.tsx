import React from 'react';
import { User } from '../../types';
import UserAvatar from '../common/UserAvatar';

interface BlockedListModalProps {
    userIds: string[];
    allUsers: User[];
    onClose: () => void;
    onToggleBlock: (targetUserId: string) => void;
}

const BlockedListModal: React.FC<BlockedListModalProps> = ({ userIds, allUsers, onClose, onToggleBlock }) => {
    const blockedUsers = allUsers.filter(u => userIds.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-border">
                    <h2 className="text-xl font-bold text-primary">Blocked Users</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="overflow-y-auto p-4">
                    {blockedUsers.length > 0 ? (
                        <div className="space-y-3">
                            {blockedUsers.map(user => (
                                <div key={user.id} className="bg-background p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center overflow-hidden">
                                        <UserAvatar user={user} className="w-10 h-10 flex-shrink-0" />
                                        <div className="ml-3 overflow-hidden">
                                            <p className="font-semibold text-primary truncate">{user.name}</p>
                                            <p className="text-sm text-secondary truncate">@{user.username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onToggleBlock(user.id)}
                                        className="font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors ml-2 flex-shrink-0 bg-surface text-primary border border-border hover:bg-accent hover:text-accent-text"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary text-center py-8">You haven't blocked anyone.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockedListModal;
