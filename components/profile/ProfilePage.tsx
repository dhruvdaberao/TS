import React, { useState, useRef } from 'react';
import { Post, User, Tribe } from '../../types';
import PostCard from '../feed/PostCard';
import CreatePost from '../feed/CreatePost';
import FollowListModal from './FollowListModal';
import BlockedListModal from './BlockedListModal';
import UserAvatar from '../common/UserAvatar';
import ShareButton from '../common/ShareButton';

interface ProfilePageProps {
  user: User;
  allUsers: User[];
  allTribes: Tribe[];
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onViewProfile: (user: User) => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onAddPost: (content: string, imageUrl?: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onToggleBlock: (targetUserId: string) => void;
  onStartConversation: (user: User) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
    const { user, allUsers, allTribes, posts, currentUser, onLikePost, onCommentPost, onDeletePost, onDeleteComment, onViewProfile, onUpdateUser, onAddPost, onToggleFollow, onToggleBlock, onStartConversation, onLogout, onDeleteAccount, onSharePost } = props;
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isBlockedModalOpen, setBlockedModalOpen] = useState(false);
    const [followModal, setFollowModal] = useState<{isOpen: boolean, type: 'followers' | 'following', userIds: string[]}>({isOpen: false, type: 'followers', userIds: []});
    const [optionsOpen, setOptionsOpen] = useState(false);

  const isOwnProfile = user.id === currentUser.id;
  const isFollowing = currentUser.following.includes(user.id);
  const isBlockedByCurrentUser = currentUser.blockedUsers.includes(user.id);
  
  const openFollowModal = (type: 'followers' | 'following', userIds: string[]) => {
    setFollowModal({isOpen: true, type, userIds});
  }

  const handleBlockClick = () => {
      onToggleBlock(user.id);
      setOptionsOpen(false);
  }
  
  const handleMessageClick = () => {
      if (!isFollowing) {
          alert(`You must follow ${user.name} to send them a message.`);
          return;
      }
      onStartConversation(user);
  }

  return (
    <div>
      <div className="bg-surface rounded-2xl shadow-sm border border-border mb-6 overflow-hidden">
        <div className="h-48 md:h-64 bg-background rounded-t-2xl">
            {user.bannerUrl ? (
                <img src={user.bannerUrl} alt={`${user.name}'s banner`} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-background via-surface to-background" />
            )}
        </div>
        
        <div className="p-4 md:p-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="sm:-mt-20 -mt-16 flex-shrink-0">
                  <UserAvatar user={user} className="w-28 h-28 md:w-36 md:h-36 border-4 border-surface" />
                </div>
                
                <div className="w-full sm:w-auto pt-2 sm:pt-4 flex items-center space-x-2">
                    {isOwnProfile ? (
                        <button onClick={() => setEditModalOpen(true)} className="w-full sm:w-auto bg-accent text-accent-text font-semibold px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors">
                            Edit Profile
                        </button>
                    ) : (
                        <>
                           <button onClick={handleMessageClick} className="w-full sm:w-auto font-semibold px-6 py-2 rounded-lg transition-colors bg-surface text-primary border border-border hover:bg-background">
                                Message
                           </button>
                           {!isBlockedByCurrentUser && (
                            <button onClick={() => onToggleFollow(user.id)} className={`w-full sm:w-auto font-semibold px-6 py-2 rounded-lg transition-colors ${
                                isFollowing 
                                ? 'bg-surface text-primary border border-border hover:bg-background'
                                : 'bg-accent text-accent-text hover:bg-accent-hover'
                            }`}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                           )}
                           <div className="relative">
                               <button 
                                onClick={() => setOptionsOpen(!optionsOpen)}
                                onBlur={() => setTimeout(() => setOptionsOpen(false), 150)}
                                className="p-2 rounded-full bg-surface text-primary border border-border hover:bg-background"
                                aria-label="More options"
                               >
                                  <OptionsIcon />
                               </button>
                                {optionsOpen && (
                                     <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-10">
                                         <ShareButton
                                            shareData={{
                                                title: `Check out ${user.name}'s profile on Tribe!`,
                                                text: `See what ${user.name} (@${user.username}) is up to.`,
                                                url: window.location.href,
                                            }}
                                            className="w-full text-left px-4 py-2 text-primary hover:bg-background rounded-t-lg transition-colors flex items-center space-x-2"
                                            onShare={() => setOptionsOpen(false)}
                                         >
                                             <ShareIcon />
                                             <span>Share Profile</span>
                                         </ShareButton>
                                         <button 
                                            onClick={handleBlockClick} 
                                            className={`w-full text-left px-4 py-2 hover:bg-red-500/10 rounded-b-lg transition-colors flex items-center space-x-2 ${isBlockedByCurrentUser ? 'text-green-600' : 'text-red-500'}`}
                                         >
                                            <BlockIcon />
                                            <span>{isBlockedByCurrentUser ? 'Unblock' : 'Block'} @{user.username}</span>
                                         </button>
                                     </div>
                                )}
                           </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-2">
              <h1 className="text-3xl font-bold text-primary font-display">{user.name}</h1>
              <p className="text-md text-secondary">@{user.username}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <button onClick={() => openFollowModal('following', user.following)} className="hover:underline">
                    <span className="font-bold text-primary">{user.following.length}</span> <span className="text-secondary">Following</span>
                  </button>
                  <button onClick={() => openFollowModal('followers', user.followers)} className="hover:underline">
                    <span className="font-bold text-primary">{user.followers.length}</span> <span className="text-secondary">Followers</span>
                  </button>
              </div>
              <p className="text-primary mt-4 max-w-2xl whitespace-pre-wrap">{user.bio}</p>
            </div>
        </div>
      </div>
      
      {isOwnProfile && <CreatePost currentUser={currentUser} allUsers={allUsers} onAddPost={onAddPost} isPosting={false} />}

      <h2 className="text-xl font-bold text-primary my-6 font-display">{isOwnProfile ? "Your Posts" : `${user.name.split(' ')[0]}'s Posts`}</h2>
      
      {isOwnProfile || isFollowing ? (
        <div className="space-y-6">
            {posts.length > 0 ? (
            posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allTribes={allTribes}
                    onLike={onLikePost}
                    onComment={onCommentPost}
                    onDeletePost={onDeletePost}
                    onDeleteComment={onDeleteComment}
                    onViewProfile={onViewProfile}
                    onSharePost={onSharePost}
                />
            ))
            ) : (
            <div className="bg-surface p-8 text-center rounded-2xl border border-border">
                <p className="text-secondary">No posts yet.</p>
            </div>
            )}
        </div>
      ) : (
        <div className="bg-surface p-8 text-center rounded-2xl border border-border">
            <p className="text-secondary font-semibold">This account's posts are private.</p>
            <p className="text-secondary text-sm">Follow them to see their posts.</p>
        </div>
      )}
      
      {isOwnProfile && (
        <div className="mt-8 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-secondary mb-4 font-display">Account Management</h2>
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={onLogout}
                    className="w-full sm:w-auto bg-surface text-secondary border border-border font-semibold px-6 py-2 rounded-lg hover:bg-background transition-colors"
                >
                    Logout
                </button>
                 <button
                    onClick={() => setBlockedModalOpen(true)}
                    className="w-full sm:w-auto bg-surface text-secondary border border-border font-semibold px-6 py-2 rounded-lg hover:bg-background transition-colors"
                >
                    Blocked Users ({currentUser.blockedUsers.length})
                </button>
                <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="w-full sm:w-auto bg-red-500/10 text-red-500 font-semibold px-6 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
      )}
      
      {isOwnProfile && isEditModalOpen && (
        <EditProfileModal 
            user={currentUser} 
            onClose={() => setEditModalOpen(false)} 
            onSave={onUpdateUser}
        />
      )}
      
      {isOwnProfile && isDeleteConfirmOpen && (
        <DeleteAccountModal
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={onDeleteAccount}
        />
      )}

      {isOwnProfile && isBlockedModalOpen && (
        <BlockedListModal
            userIds={currentUser.blockedUsers}
            allUsers={allUsers}
            onClose={() => setBlockedModalOpen(false)}
            onToggleBlock={onToggleBlock}
        />
      )}
      
      {followModal.isOpen && (
        <FollowListModal
            title={followModal.type === 'followers' ? 'Followers' : 'Following'}
            userIds={followModal.userIds}
            allUsers={allUsers}
            currentUser={currentUser}
            onClose={() => setFollowModal({isOpen: false, type: 'followers', userIds: []})}
            onToggleFollow={onToggleFollow}
            onViewProfile={(userToView) => {
                setFollowModal({isOpen: false, type: 'followers', userIds: []});
                onViewProfile(userToView);
            }}
        />
      )}
    </div>
  );
};

// Edit Profile Modal
interface EditProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: Partial<User>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        username: user.username,
        bio: user.bio,
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.bannerUrl);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') setAvatarPreview(reader.result as string);
                if (type === 'banner') setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser: Partial<User> = {
            ...formData,
            avatarUrl: avatarPreview,
            bannerUrl: bannerPreview,
        };
        onSave(updatedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border">
                <div className="p-4 flex justify-between items-center border-b border-border">
                    <h2 className="text-xl font-bold text-primary">Edit Profile</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary">&times;</button>
                </div>
                
                <div className="overflow-y-auto">
                    <div className="relative">
                        <div className="h-40 bg-background">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-background via-surface to-background" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <button onClick={() => bannerInputRef.current?.click()} className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70"><CameraIcon /></button>
                            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />
                        </div>

                        <div className="absolute bottom-0 left-4 translate-y-1/2">
                            <div className="w-24 h-24 rounded-full border-4 border-surface bg-surface relative">
                                <UserAvatar user={{...user, avatarUrl: avatarPreview}} className="w-full h-full" />
                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <button onClick={() => avatarInputRef.current?.click()} className="bg-black/50 text-white rounded-full p-2"><CameraIcon /></button>
                                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" className="hidden" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-4 pt-16">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-secondary">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-2 bg-background border border-border rounded-lg" />
                            </div>
                             <div>
                                <label className="text-sm font-semibold text-secondary">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full mt-1 p-2 bg-background border border-border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-secondary">Bio</label>
                                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full mt-1 p-2 bg-background border border-border rounded-lg resize-none" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 flex justify-end items-center border-t border-border mt-auto">
                    <button onClick={onClose} className="text-secondary font-semibold px-4 py-2 rounded-lg hover:bg-background">Cancel</button>
                    <button onClick={handleSubmit} className="bg-accent text-accent-text font-semibold px-6 py-2 rounded-lg hover:bg-accent-hover">Save</button>
                </div>
            </div>
        </div>
    );
};

// Delete Account Modal
const DeleteAccountModal: React.FC<{onClose: () => void, onConfirm: () => void}> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6 border border-border">
                <h2 className="text-xl font-bold text-primary">Delete Account</h2>
                <p className="text-secondary my-4">Are you sure you want to permanently delete your account and all of your data? This action is irreversible.</p>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="text-secondary font-semibold px-4 py-2 rounded-lg hover:bg-background">
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(); 
                            onClose();
                        }} 
                        className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const OptionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
const BlockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>

export default ProfilePage;