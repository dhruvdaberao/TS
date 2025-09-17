import React from 'react';
import { Notification, User } from '../../types';
import UserAvatar from '../common/UserAvatar';

interface NotificationsPageProps {
  notifications: Notification[];
  userMap: Map<string, User>;
  onViewProfile: (user: User) => void;
}

const NotificationItem: React.FC<{ notification: Notification; onViewProfile: (user: User) => void; }> = ({ notification, onViewProfile }) => {
  const { sender, type, timestamp } = notification;

  const renderText = () => {
    switch (type) {
      case 'follow':
        return 'started following you.';
      case 'like':
        return 'liked your post.';
      case 'comment':
        return 'commented on your post.';
      default:
        return '';
    }
  };

  return (
    <div className={`p-4 flex items-start space-x-4 border-b border-border ${!notification.read ? 'bg-accent/5' : ''}`}>
      <div className="w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => onViewProfile(sender)}>
        <UserAvatar user={sender} />
      </div>
      <div className="flex-1">
        <p className="text-primary">
          <strong className="cursor-pointer hover:underline" onClick={() => onViewProfile(sender)}>{sender.name}</strong>
          <span className="text-secondary"> @{sender.username} </span>
          {renderText()}
        </p>
        <p className="text-sm text-secondary mt-1">{new Date(timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, userMap, onViewProfile }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6 font-display">Notifications</h1>
      <div className="bg-surface rounded-2xl border border-border shadow-md overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onViewProfile={onViewProfile} 
            />
          ))
        ) : (
          <p className="text-center text-secondary p-8">You have no notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
