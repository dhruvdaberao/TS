import React from 'react';
import { Tribe, User } from '../../types';

interface TribeCardProps {
    tribe: Tribe;
    isMember: boolean;
    currentUser: User;
    onJoinToggle: (tribeId: string) => void;
    onViewTribe: (tribe: Tribe) => void;
    onEditTribe: (tribe: Tribe) => void;
}

const TribePlaceholderIcon = () => (
    <div className="w-20 h-20 rounded-full mb-4 bg-background border border-border flex items-center justify-center text-secondary p-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    </div>
);


const TribeCard: React.FC<TribeCardProps> = ({ tribe, isMember, currentUser, onJoinToggle, onViewTribe, onEditTribe }) => {
    return (
        <div className="bg-surface rounded-2xl shadow-md border border-border flex flex-col text-center items-center transition-transform transform hover:-translate-y-1 relative group">
             {currentUser.id === tribe.owner && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditTribe(tribe);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-surface/50 backdrop-blur-sm rounded-full text-secondary hover:text-primary hover:bg-background transition-colors z-10"
                    aria-label="Edit Tribe"
                >
                    <EditIcon />
                </button>
            )}
            <div className="w-full p-4 flex flex-col items-center text-center flex-grow">
                {tribe.avatarUrl ? (
                    <img 
                        src={tribe.avatarUrl} 
                        alt={tribe.name} 
                        className="w-20 h-20 rounded-full mb-4 object-cover"
                    />
                ) : (
                    <TribePlaceholderIcon/>
                )}
                <h3 className="font-bold text-lg text-primary">{tribe.name}</h3>
                <p className="text-sm text-secondary mb-2">{tribe.members.length.toLocaleString()} members</p>
                <p className="text-sm text-primary flex-grow mb-4 px-2">{tribe.description}</p>
            </div>
            <div className="p-4 pt-0 w-full flex items-center space-x-2">
                 <button 
                    onClick={() => onViewTribe(tribe)}
                    className={`w-full font-semibold px-4 py-2 rounded-lg transition-colors text-sm bg-surface text-primary border border-border hover:bg-background`}
                >
                    Chat
                </button>
                <button 
                    onClick={() => onJoinToggle(tribe.id)}
                    className={`w-full font-semibold px-4 py-2 rounded-lg transition-colors text-sm ${
                       isMember
                       ? 'bg-surface text-primary border border-border hover:bg-background'
                       : 'bg-accent text-accent-text hover:bg-accent-hover'
                    }`}
                >
                    {isMember ? 'Joined' : 'Join'}
                </button>
            </div>
        </div>
    );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" /></svg>

export default TribeCard;