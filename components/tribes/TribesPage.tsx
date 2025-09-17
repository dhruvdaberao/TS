import React, { useState } from 'react';
import { Tribe, User } from '../../types';
import TribeCard from './TribeCard';
import CreateTribeModal from './CreateTribeModal';

interface TribesPageProps {
    tribes: Tribe[];
    currentUser: User;
    onJoinToggle: (tribeId: string) => void;
    onCreateTribe: (name: string, description: string, avatarUrl?: string) => void;
    onViewTribe: (tribe: Tribe) => void;
    onEditTribe: (tribe: Tribe) => void;
}

const TribesPage: React.FC<TribesPageProps> = ({ tribes, currentUser, onJoinToggle, onCreateTribe, onViewTribe, onEditTribe }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    
    const myTribes = tribes.filter(c => c.members.includes(currentUser.id));
    const otherTribes = tribes.filter(c => !c.members.includes(currentUser.id));

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary font-display">Tribes</h1>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-accent text-accent-text font-semibold px-5 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                    <PlusIcon/>
                    <span>Create Tribe</span>
                </button>
            </div>

            {myTribes.length > 0 && (
                 <div className="mb-8">
                    <h2 className="text-xl font-bold text-primary mb-4 font-display">Your Tribes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myTribes.map(tribe => (
                            <TribeCard 
                                key={tribe.id}
                                tribe={tribe}
                                currentUser={currentUser}
                                isMember={true}
                                onJoinToggle={onJoinToggle}
                                onViewTribe={onViewTribe}
                                onEditTribe={onEditTribe}
                            />
                        ))}
                    </div>
                </div>
            )}
           
            <div>
                <h2 className="text-xl font-bold text-primary mb-4 font-display">Discover Tribes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherTribes.map(tribe => (
                        <TribeCard 
                            key={tribe.id}
                            tribe={tribe}
                            currentUser={currentUser}
                            isMember={false}
                            onJoinToggle={onJoinToggle}
                            onViewTribe={onViewTribe}
                            onEditTribe={onEditTribe}
                        />
                    ))}
                </div>
                 {tribes.length === 0 && (
                    <div className="bg-surface p-8 text-center rounded-2xl border border-border col-span-full shadow-md">
                        <p className="text-secondary">No tribes found. Why not create the first one?</p>
                    </div>
                 )}
            </div>

            {isCreateModalOpen && (
                <CreateTribeModal 
                    onClose={() => setCreateModalOpen(false)}
                    onCreate={onCreateTribe}
                />
            )}
        </div>
    );
};

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

export default TribesPage;