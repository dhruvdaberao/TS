import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import UserAvatar from '../common/UserAvatar';

interface NewMessageModalProps {
    allUsers: User[];
    onClose: () => void;
    onUserSelect: (user: User) => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ allUsers, onClose, onUserSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return allUsers;
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term)
        );
    }, [searchTerm, allUsers]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md h-[70vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-primary">New Message</h2>
                        <button onClick={onClose} className="text-secondary hover:text-primary text-2xl leading-none">&times;</button>
                    </div>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for someone..."
                        className="w-full bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                    />
                </div>

                <div className="overflow-y-auto flex-1">
                    {filteredUsers.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filteredUsers.map(user => (
                                <div 
                                    key={user.id}
                                    onClick={() => onUserSelect(user)}
                                    className="p-4 flex items-center cursor-pointer hover:bg-background transition-colors"
                                >
                                    <UserAvatar user={user} className="w-10 h-10 flex-shrink-0" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-primary">{user.name}</p>
                                        <p className="text-sm text-secondary">@{user.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary text-center p-8">No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewMessageModal;
