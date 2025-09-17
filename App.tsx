import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useSocket } from './contexts/SocketContext';
import { User, Post, Tribe, TribeMessage, Conversation, Notification as NotificationType } from './types';
import * as api from './api';

// Components
import Sidebar from './components/layout/Sidebar';
import FeedPage from './components/feed/FeedPage';
import ProfilePage from './components/profile/ProfilePage';
import ChatPage from './components/chat/ChatPage';
import DiscoverPage from './components/discover/DiscoverPage';
import LoginPage from './components/auth/LoginPage';
import TribesPage from './components/tribes/TribesPage';
import TribeDetailPage from './components/tribes/TribeDetailPage';
import EditTribeModal from './components/tribes/EditTribeModal';
import CreatePost from './components/feed/CreatePost';
import NotificationsPage from './components/notifications/NotificationsPage';
import { Toaster } from './components/common/Toast';

export type NavItem = 'Home' | 'Discover' | 'Messages' | 'Tribes' | 'Notifications' | 'Profile' | 'Ember' | 'TribeDetail';

const EMBER_AI_USER: User = {
    id: 'ember-ai',
    name: 'Ember AI',
    username: 'ember_ai',
    avatarUrl: '/ember.png',
    bannerUrl: null,
    bio: 'Your fiery AI guide. Ask me anything!',
    followers: [],
    following: [],
    blockedUsers: [],
};

const App: React.FC = () => {
    const { currentUser, setCurrentUser, logout } = useAuth();
    const { socket, notifications, unreadMessageCount, unreadTribeCount, unreadNotificationCount } = useSocket();
    
    // Global State
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [tribes, setTribes] = useState<Tribe[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isCreatingPost, setIsCreatingPost] = useState(false);

    // Navigation State
    const [activeNavItem, setActiveNavItem] = useState<NavItem>('Home');
    const [viewedUser, setViewedUser] = useState<User | null>(null);
    const [viewedTribe, setViewedTribe] = useState<Tribe | null>(null);
    const [editingTribe, setEditingTribe] = useState<Tribe | null>(null);
    const [chatTarget, setChatTarget] = useState<User | null>(null);

    const userMap = useMemo(() => new Map(users.map((user: User) => [user.id, user])), [users]);

    const populatePost = useCallback((post: any): Post | null => {
        const author = userMap.get(post.user);
        if (!author) return null;
        return {
            ...post,
            author,
            comments: post.comments ? post.comments.map((comment: any) => ({
                ...comment,
                author: userMap.get(comment.user),
            })).filter((c: any) => c.author) : [],
        };
    }, [userMap]);

    const fetchData = useCallback(async () => {
        if (!currentUser) {
            setIsInitialLoading(false);
            return;
        }
        try {
            const [usersData, postsData, tribesData] = await Promise.all([
                api.fetchUsers(),
                api.fetchPosts(),
                api.fetchTribes(),
            ]);

            setUsers(usersData.data);
            const localUserMap = new Map(usersData.data.map((user: User) => [user.id, user]));

            const populatedPosts = postsData.data.map((post: any) => ({
                ...post,
                author: localUserMap.get(post.user),
                comments: post.comments ? post.comments.map((comment: any) => ({
                    ...comment,
                    author: localUserMap.get(comment.user),
                })).filter((c: any) => c.author) : [],
            })).filter((p: Post) => p.author);

            const populatedTribes = tribesData.data.map((tribe: any) => ({
                ...tribe,
                messages: [], // Messages will be fetched on demand or received via socket
            }));

            setPosts(populatedPosts);
            setTribes(populatedTribes);

        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            if ((error as any)?.response?.status === 401) {
                logout();
            }
        } finally {
            setIsInitialLoading(false);
        }
    }, [currentUser, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- REAL-TIME EVENT LISTENERS ---
    useEffect(() => {
        if (!socket || !userMap.size) return;

        socket.on('newPost', (post) => {
            const populated = populatePost(post);
            if (populated) setPosts(prev => [populated, ...prev]);
        });
        
        socket.on('postUpdated', (updatedPost) => {
            const populated = populatePost(updatedPost);
            if (populated) setPosts(prev => prev.map(p => p.id === populated.id ? populated : p));
        });

        socket.on('postDeleted', (postId) => {
            setPosts(prev => prev.filter(p => p.id !== postId));
        });

        socket.on('newTribeMessage', (message: TribeMessage) => {
            if(viewedTribe && viewedTribe.id === message.tribeId) {
                const sender = userMap.get(message.senderId);
                if (sender) {
                     setViewedTribe(prev => prev ? { ...prev, messages: [...prev.messages, {...message, sender}] } : null);
                }
            }
        });

        socket.on('userUpdated', (updatedUser: User) => {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            if (currentUser?.id === updatedUser.id) {
                setCurrentUser(updatedUser);
            }
            if (viewedUser?.id === updatedUser.id) {
                setViewedUser(updatedUser);
            }
        });

        return () => {
            socket.off('newPost');
            socket.off('postUpdated');
            socket.off('postDeleted');
            socket.off('newTribeMessage');
            socket.off('userUpdated');
        };

    }, [socket, userMap, populatePost, currentUser?.id, setCurrentUser, viewedUser?.id, viewedTribe]);
    
    const handleSelectItem = (item: NavItem) => {
        setChatTarget(null);
        if (item === 'Profile') {
            setViewedUser(currentUser);
        } else {
            setViewedUser(null);
        }
        if (item !== 'TribeDetail') {
            setViewedTribe(null);
        }
        
        if (item === 'Ember') {
            handleStartConversation(EMBER_AI_USER);
            return;
        }
        
        setActiveNavItem(item);
    };

    const handleViewProfile = (user: User) => {
        setViewedUser(user);
        setActiveNavItem('Profile');
    };
    
    const handleStartConversation = (targetUser: User) => {
        setChatTarget(targetUser);
        setActiveNavItem('Messages');
    };

    // --- Post Handlers ---
    const handleAddPost = async (content: string, imageUrl?: string) => {
        if (!currentUser) return;
        setIsCreatingPost(true);
        try {
            await api.createPost({ content, imageUrl });
            // UI update will happen via socket event 'newPost'
        } catch (error) {
            console.error("Failed to add post:", error);
            alert("Could not create post. Please try again.");
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!currentUser) return;
        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const isLiked = p.likes.includes(currentUser.id);
                const newLikes = isLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id];
                return { ...p, likes: newLikes };
            }
            return p;
        }));
        try {
            await api.likePost(postId);
            // Final state will be synced via 'postUpdated' socket event
        } catch (error) {
            console.error("Failed to like post:", error);
            // Revert on error could be implemented here, but socket will correct it
        }
    };

    const handleCommentPost = async (postId: string, text: string) => {
        if (!currentUser) return;
        try {
            await api.commentOnPost(postId, { text });
            // UI update will happen via socket event 'postUpdated'
        } catch (error) {
            console.error("Failed to comment:", error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!currentUser) return;
        try {
            await api.deletePost(postId);
            // UI update will happen via socket event 'postDeleted'
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!currentUser) return;
        try {
            await api.deleteComment(postId, commentId);
            // UI update will happen via socket event 'postUpdated'
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const handleSharePost = async (post: Post, destination: { type: 'tribe' | 'user', id: string }) => {
        if (!currentUser) return;
        const formattedText = `[Shared Post by @${post.author.username}]:\n${post.content}`;
        
        try {
            if (destination.type === 'tribe') {
                await api.sendTribeMessage(destination.id, { text: formattedText, imageUrl: post.imageUrl });
                alert(`Post successfully shared to tribe!`);
            } else {
                await api.sendMessage(destination.id, { message: formattedText, imageUrl: post.imageUrl });
                if (activeNavItem !== 'Messages') {
                    alert(`Post successfully shared with user! Check your messages.`);
                }
            }
        } catch (error) {
            console.error("Failed to share post:", error);
            alert("Could not share post. Please try again.");
        }
    };

    // --- User Handlers ---
    const handleUpdateUser = async (updatedUserData: Partial<User>) => {
        if (!currentUser) return;
        try {
            await api.updateProfile(updatedUserData);
            // UI update via `userUpdated` socket event
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };
    
    const handleToggleFollow = async (targetUserId: string) => {
        if (!currentUser) return;
        try {
            await api.toggleFollow(targetUserId);
            // UI update for both users will happen via `userUpdated` socket event
        } catch(error) {
            console.error('Failed to toggle follow', error);
        }
    };

    const handleToggleBlock = async (targetUserId: string) => {
        if (!currentUser) return;
        try {
            await api.toggleBlock(targetUserId);
            // Block is a significant action, refetch all data to ensure consistency.
            await fetchData(); 
        } catch(error) {
            console.error('Failed to toggle block', error);
        }
    };
    
    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure? This action is irreversible.")) {
            try {
                await api.deleteAccount();
                alert("Account deleted successfully.");
                logout();
            } catch(error) {
                console.error("Failed to delete account:", error);
                alert("Could not delete account. Please try again.");
            }
        }
    };

    // --- Tribe Handlers ---
    const handleJoinToggle = async (tribeId: string) => {
        if (!currentUser) return;
        try {
            const { data: updatedTribe } = await api.joinTribe(tribeId);
            setTribes(tribes.map(t => t.id === tribeId ? { ...t, members: updatedTribe.members } : t));
             if (viewedTribe?.id === tribeId) {
                setViewedTribe(prev => prev ? { ...prev, members: updatedTribe.members } : null);
            }
        } catch (error) {
            console.error("Failed to join/leave tribe:", error);
        }
    };

    const handleCreateTribe = async (name: string, description: string, avatarUrl?: string) => {
        try {
            const { data: newTribe } = await api.createTribe({ name, description, avatarUrl });
            setTribes(prev => [{...newTribe, messages: []}, ...prev]);
        } catch (error) {
            console.error("Failed to create tribe:", error);
        }
    };

    const handleViewTribe = async (tribe: Tribe) => {
        try {
            setViewedTribe({ ...tribe, messages: [] }); // Start with empty messages
            setActiveNavItem('TribeDetail');
            
            socket?.emit('joinRoom', `tribe-${tribe.id}`);

            const { data: messages } = await api.fetchTribeMessages(tribe.id);
            const populatedMessages = messages.map((msg: any) => ({
                ...msg,
                sender: userMap.get(msg.sender)
            })).filter((m: TribeMessage) => m.sender);

            setViewedTribe(prev => prev ? { ...prev, messages: populatedMessages } : null);
        } catch (error) {
            console.error("Failed to fetch tribe messages:", error);
        }
    };

    const handleEditTribe = async (tribeId: string, name: string, description: string, avatarUrl?: string | null) => {
      try {
          const { data: updatedTribeData } = await api.updateTribe(tribeId, { name, description, avatarUrl });
          setTribes(tribes.map(t => (t.id === tribeId ? { ...t, ...updatedTribeData } : t)));
          if (viewedTribe && viewedTribe.id === tribeId) {
              setViewedTribe(prev => prev ? { ...prev, ...updatedTribeData } : null);
          }
          setEditingTribe(null);
      } catch (error) {
          console.error("Failed to edit tribe:", error);
      }
    };
    
    const handleSendTribeMessage = async (tribeId: string, text: string, imageUrl?: string) => {
        if (!currentUser || !viewedTribe) return;
        try {
            // Optimistically update UI
            const newMessage: TribeMessage = {
                id: Date.now().toString(),
                sender: currentUser,
                text,
                imageUrl,
                timestamp: new Date().toISOString(),
            };
            setViewedTribe(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);

            await api.sendTribeMessage(tribeId, { text, imageUrl });
            // Final message will arrive via 'newTribeMessage' socket event, replacing the optimistic one if needed.
        } catch (error) {
            console.error("Failed to send tribe message:", error);
            // Implement error handling, e.g., show a "failed to send" indicator
        }
    };

    const visiblePosts = useMemo(() => {
        if (!currentUser) return [];
        return posts.filter(p => !currentUser.blockedUsers.includes(p.author.id) && !p.author.blockedUsers?.includes(currentUser.id));
    }, [posts, currentUser]);

    const visibleUsers = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => !currentUser.blockedUsers.includes(u.id) && !u.blockedUsers?.includes(currentUser.id));
    }, [users, currentUser]);
    
    if (!currentUser) {
        return <LoginPage />;
    }
    
    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <img src="/loader.svg" alt="Loading..." className="w-24 h-24" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeNavItem) {
            case 'Home':
                const feedPosts = visiblePosts.filter(p => currentUser.following.includes(p.author.id) || p.author.id === currentUser.id);
                return (
                    <div className="max-w-2xl mx-auto">
                        <CreatePost currentUser={currentUser} allUsers={visibleUsers} onAddPost={handleAddPost} isPosting={isCreatingPost}/>
                        <FeedPage
                            posts={feedPosts}
                            currentUser={currentUser}
                            allUsers={visibleUsers}
                            allTribes={tribes}
                            onLikePost={handleLikePost}
                            onCommentPost={handleCommentPost}
                            onDeletePost={handleDeletePost}
                            onDeleteComment={handleDeleteComment}
                            onViewProfile={handleViewProfile}
                            onSharePost={handleSharePost}
                        />
                    </div>
                );
            case 'Discover':
                return <DiscoverPage
                    posts={visiblePosts}
                    users={visibleUsers}
                    tribes={tribes}
                    currentUser={currentUser}
                    onLikePost={handleLikePost}
                    onCommentPost={handleCommentPost}
                    onDeletePost={handleDeletePost}
                    onDeleteComment={handleDeleteComment}
                    onToggleFollow={handleToggleFollow}
                    onViewProfile={handleViewProfile}
                    onViewTribe={handleViewTribe}
                    onJoinToggle={handleJoinToggle}
                    onEditTribe={(tribe) => setEditingTribe(tribe)}
                    onSharePost={handleSharePost}
                />;
            case 'Messages':
                return <ChatPage 
                    currentUser={currentUser}
                    allUsers={visibleUsers}
                    emberUser={EMBER_AI_USER}
                    initialTargetUser={chatTarget}
                    onViewProfile={handleViewProfile}
                    onSharePost={handleSharePost}
                />;
            case 'Tribes':
                return <TribesPage 
                    tribes={tribes}
                    currentUser={currentUser}
                    onJoinToggle={handleJoinToggle}
                    onCreateTribe={handleCreateTribe}
                    onViewTribe={handleViewTribe}
                    onEditTribe={(tribe) => setEditingTribe(tribe)}
                />;
            case 'TribeDetail':
                if (!viewedTribe) return <div className="text-center p-8">Tribe not found. Go back to discover more tribes.</div>;
                return <TribeDetailPage
                    tribe={viewedTribe}
                    currentUser={currentUser}
                    onSendMessage={handleSendTribeMessage}
                    onBack={() => setActiveNavItem('Tribes')}
                    onViewProfile={handleViewProfile}
                    onEditTribe={(tribe) => setEditingTribe(tribe)}
                    onJoinToggle={handleJoinToggle}
                />;
            case 'Notifications':
                return <NotificationsPage notifications={notifications} userMap={userMap} onViewProfile={handleViewProfile}/>;
            case 'Profile':
                if (!viewedUser || currentUser.blockedUsers.includes(viewedUser.id) || viewedUser.blockedUsers?.includes(currentUser.id)) {
                     return <div className="text-center p-8">User not found or is blocked.</div>;
                }
                const userPosts = visiblePosts.filter(p => p.author.id === viewedUser.id);
                return <ProfilePage
                    user={viewedUser}
                    allUsers={visibleUsers}
                    allTribes={tribes}
                    posts={userPosts}
                    currentUser={currentUser}
                    onLikePost={handleLikePost}
                    onCommentPost={handleCommentPost}
                    onDeletePost={handleDeletePost}
                    onDeleteComment={handleDeleteComment}
                    onViewProfile={handleViewProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddPost={handleAddPost}
                    onToggleFollow={handleToggleFollow}
                    onToggleBlock={handleToggleBlock}
                    onStartConversation={handleStartConversation}
                    onLogout={logout}
                    onDeleteAccount={handleDeleteAccount}
                    onSharePost={handleSharePost}
                />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
        <div className="bg-background min-h-screen text-primary">
            <Toaster />
            <Sidebar 
                activeItem={activeNavItem} 
                onSelectItem={handleSelectItem} 
                currentUser={currentUser}
                unreadMessageCount={unreadMessageCount}
                unreadTribeCount={unreadTribeCount}
                unreadNotificationCount={unreadNotificationCount}
            />
            <main className="pt-20 pb-20 md:pb-4 px-4 md:px-6 max-w-7xl mx-auto">
                {renderContent()}
            </main>
            {editingTribe && (
              <EditTribeModal
                tribe={editingTribe}
                onClose={() => setEditingTribe(null)}
                onSave={handleEditTribe}
              />
            )}
        </div>
    );
};

export default App;