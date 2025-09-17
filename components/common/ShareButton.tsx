import React from 'react';

interface ShareButtonProps {
  shareData: ShareData;
  className?: string;
  children: React.ReactNode;
  onShare?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ shareData, className, children, onShare }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      if (shareData.url) {
        navigator.clipboard.writeText(shareData.url)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.error('Failed to copy link:', err));
      } else {
        alert('Sharing is not supported on this browser.');
      }
    }
    if (onShare) {
        onShare();
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      {children}
    </button>
  );
};

export default ShareButton;
