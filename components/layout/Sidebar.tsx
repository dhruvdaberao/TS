import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from '../../types';
import type { NavItem } from '../../App';
import UserAvatar from '../common/UserAvatar';

interface SidebarProps {
  activeItem: NavItem;
  onSelectItem: (item: NavItem) => void;
  currentUser: User | null;
  unreadMessageCount: number;
  unreadTribeCount: number;
  unreadNotificationCount: number;
}

const NavBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    return (
        <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-accent"></span>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onSelectItem, currentUser, unreadMessageCount, unreadTribeCount, unreadNotificationCount }) => {
  const { theme, toggleTheme } = useTheme();

  const mainNavItems: { name: Exclude<NavItem, 'Profile' | 'TribeDetail' | 'Ember'>; icon: JSX.Element; unreadCount: number; }[] = [
    { name: 'Home', icon: <HomeIcon />, unreadCount: 0 },
    { name: 'Discover', icon: <DiscoverIcon />, unreadCount: 0 },
    { name: 'Messages', icon: <MessagesIcon />, unreadCount: unreadMessageCount },
    { name: 'Notifications', icon: <HeartIcon />, unreadCount: unreadNotificationCount },
    { name: 'Tribes', icon: <TribesIcon />, unreadCount: unreadTribeCount },
  ];
  
  const mobileNavItems = mainNavItems;

  const DesktopNavLink: React.FC<{item: typeof mainNavItems[0]}> = ({ item }) => (
      <button
        key={item.name}
        onClick={() => onSelectItem(item.name)}
        className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          activeItem === item.name
          ? 'text-primary bg-surface shadow-sm'
          : 'text-accent-text/80 hover:bg-black/10'
        }`}
      >
        {item.name}
        <NavBadge count={item.unreadCount} />
      </button>
  );

  const MobileNavButton: React.FC<{item: typeof mainNavItems[0]}> = ({ item }) => (
    <button
      key={item.name}
      onClick={() => onSelectItem(item.name)}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-colors ${
        activeItem === item.name
          ? 'text-accent'
          : 'text-secondary hover:bg-background hover:text-primary'
      }`}
    >
      {React.cloneElement(item.icon, { isActive: activeItem === item.name })}
      <NavBadge count={item.unreadCount} />
    </button>
  );

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-accent shadow-md z-50 flex items-center justify-between px-4 md:px-6">
        <div 
          className="flex items-center space-x-3 cursor-pointer flex-shrink-0"
          onClick={() => onSelectItem('Home')}
        >
          <img src="/tribe.png" alt="Tribe Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold font-display text-accent-text inline">Tribe</span>
        </div>

        <nav className="hidden md:flex items-center space-x-2 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
           {mainNavItems.map(item => (
              <DesktopNavLink key={item.name} item={item} />
           ))}
        </nav>

        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="text-accent-text/80 hover:text-accent-text hover:bg-black/10 rounded-full p-2"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button
              onClick={() => onSelectItem('Ember')}
              className="text-accent-text/80 hover:text-accent-text hover:bg-black/10 rounded-full p-2"
              aria-label="Open Ember AI Assistant"
            >
                <EmberIcon />
            </button>
            <div className="flex items-center space-x-3">
                <button onClick={() => onSelectItem('Profile')} aria-label="View Profile">
                   <UserAvatar user={currentUser} className="w-10 h-10 border-2 border-surface/50" />
                </button>
                <div className="hidden lg:block text-right">
                    <p className="font-semibold text-accent-text text-sm leading-tight">{currentUser?.name}</p>
                    <p className="text-accent-text/80 text-xs leading-tight">@{currentUser?.username}</p>
                </div>
            </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around p-1 z-50">
         {mobileNavItems.map(item => (
            <MobileNavButton key={item.name} item={item} />
         ))}
      </nav>
    </>
  );
};


// Icons
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="w-7 h-7">{children}</div>;

const HomeIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></IconWrapper>;
const DiscoverIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></IconWrapper>;
const MessagesIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></IconWrapper>;
const TribesIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></IconWrapper>;
const HeartIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></IconWrapper>;

const EmberIcon = () => <IconWrapper><img src="/ember.png" alt="Ember AI" className="w-full h-full p-0.5" /></IconWrapper>;
const SunIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></IconWrapper>;
const MoonIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></IconWrapper>;

export default Sidebar;