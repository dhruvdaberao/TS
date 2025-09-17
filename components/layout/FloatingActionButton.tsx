import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center text-accent-text hover:bg-accent-hover transition-all duration-300 ease-in-out transform hover:scale-110"
      aria-label="Open Ember AI Assistant"
    >
      <img src="ember.png" alt="Ember AI" className="w-8 h-8" />
    </button>
  );
};

export default FloatingActionButton;