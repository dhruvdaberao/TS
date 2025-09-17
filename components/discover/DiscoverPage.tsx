// import React, { useState, useMemo } from 'react';
// import { Post, User, Tribe } from '../../types';
// import PostCard from '../feed/PostCard';
// import UserCard from '../users/UserCard';
// import TribeCard from '../tribes/TribeCard';

// interface DiscoverPageProps {
//   posts: Post[];
//   users: User[];
//   tribes: Tribe[];
//   currentUser: User;
//   onLikePost: (postId: string) => void;
//   onCommentPost: (postId: string, text: string) => void;
//   onDeletePost: (postId: string) => void;
//   onDeleteComment: (postId: string, commentId: string) => void;
//   onToggleFollow: (targetUserId: string) => void;
//   onViewProfile: (user: User) => void;
//   onViewTribe: (tribe: Tribe) => void;
//   onJoinToggle: (tribeId: string) => void;
//   onEditTribe: (tribe: Tribe) => void;
//   onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
// }

// const DiscoverPage: React.FC<DiscoverPageProps> = (props) => {
//     const { posts, users, tribes, currentUser, onToggleFollow, onViewProfile, onLikePost, onCommentPost, onDeletePost, onDeleteComment, onViewTribe, onJoinToggle, onEditTribe, onSharePost } = props;
//     const [searchTerm, setSearchTerm] = useState('');
//     const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'tribes'>('users');

//     const otherUsers = useMemo(() => users.filter(u => u.id !== currentUser.id), [users, currentUser.id]);

//     const filteredResults = useMemo(() => {
//         const term = searchTerm.toLowerCase().trim();
//         if (!term) return null;

//         const tagMatch = term.match(/^#(\w+)/);
//         if (tagMatch) {
//             const tag = tagMatch[1];
//             return {
//                 users: [],
//                 posts: posts.filter(p => p.content.toLowerCase().includes(`#${tag}`)),
//                 tribes: []
//             };
//         }

//         const userMatch = term.match(/^@(\w+)/);
//         if (userMatch) {
//             const username = userMatch[1];
//             return {
//                 users: otherUsers.filter(u => u.username.toLowerCase().includes(username)),
//                 posts: [],
//                 tribes: []
//             };
//         }

//         // General search
//         return {
//             users: otherUsers.filter(u => u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)),
//             posts: posts.filter(p => p.content.toLowerCase().includes(term)),
//             tribes: tribes.filter(t => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term))
//         };
//     }, [searchTerm, posts, otherUsers, tribes]);
    
//     // Set active tab based on search results
//     React.useEffect(() => {
//         if(filteredResults){
//             if(filteredResults.users.length > 0) setActiveTab('users');
//             else if (filteredResults.tribes.length > 0) setActiveTab('tribes');
//             else if (filteredResults.posts.length > 0) setActiveTab('posts');
//             else setActiveTab('users');
//         }
//     }, [filteredResults]);

//     return (
//         <div>
//             <h1 className="text-2xl font-bold text-primary mb-6 font-display">Discover</h1>

//             <div className="relative mb-8">
//                 <input
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     placeholder="Search for people, tribes, or #tags..."
//                     className="w-full bg-surface border border-border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent text-primary"
//                 />
//                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
//                     <SearchIcon />
//                 </div>
//             </div>

//             {/* Conditional Rendering */}
//             {!filteredResults ? (
//                 <div>
//                     <h2 className="text-xl font-bold text-primary mb-4 font-display">Newest Users</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {otherUsers.slice(0, 9).map(user => (
//                             <UserCard 
//                                 key={user.id}
//                                 user={user}
//                                 currentUser={currentUser}
//                                 onToggleFollow={onToggleFollow}
//                                 onViewProfile={onViewProfile}
//                             />
//                         ))}
//                     </div>
//                 </div>
//             ) : (
//                 <div>
//                     <div className="border-b border-border mb-4">
//                         <nav className="-mb-px flex space-x-6" aria-label="Tabs">
//                            <TabButton name="People" count={filteredResults.users.length} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
//                            <TabButton name="Tribes" count={filteredResults.tribes.length} isActive={activeTab === 'tribes'} onClick={() => setActiveTab('tribes')} />
//                            <TabButton name="Posts" count={filteredResults.posts.length} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
//                         </nav>
//                     </div>
                    
//                     {activeTab === 'users' && (
//                         filteredResults.users.length > 0 ? (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {filteredResults.users.map(user => (
//                                     <UserCard key={user.id} user={user} currentUser={currentUser} onToggleFollow={onToggleFollow} onViewProfile={onViewProfile} />
//                                 ))}
//                             </div>
//                         ) : <p className="text-secondary text-center p-8">No people found for '{searchTerm}'.</p>
//                     )}
//                      {activeTab === 'tribes' && (
//                         filteredResults.tribes.length > 0 ? (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {filteredResults.tribes.map(tribe => (
//                                     <TribeCard key={tribe.id} tribe={tribe} currentUser={currentUser} isMember={tribe.members.includes(currentUser.id)} onJoinToggle={onJoinToggle} onViewTribe={onViewTribe} onEditTribe={onEditTribe} />
//                                 ))}
//                             </div>
//                         ) : <p className="text-secondary text-center p-8">No tribes found for '{searchTerm}'.</p>
//                     )}
//                     {activeTab === 'posts' && (
//                        filteredResults.posts.length > 0 ? (
//                             <div className="max-w-2xl mx-auto space-y-6">
//                                 {filteredResults.posts.map(post => (
//                                     <PostCard 
//                                         key={post.id} 
//                                         post={post} 
//                                         currentUser={currentUser} 
//                                         allUsers={users}
//                                         allTribes={tribes}
//                                         onLike={onLikePost} 
//                                         onComment={onCommentPost} 
//                                         onDeletePost={onDeletePost} 
//                                         onDeleteComment={onDeleteComment} 
//                                         onViewProfile={onViewProfile} 
//                                         onSharePost={onSharePost}
//                                     />
//                                 ))}
//                             </div>
//                        ) : <p className="text-secondary text-center p-8">No posts found for '{searchTerm}'.</p>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// const TabButton: React.FC<{name: string, count: number, isActive: boolean, onClick: () => void}> = ({name, count, isActive, onClick}) => (
//     <button onClick={onClick} className={`${ isActive ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary hover:border-border'} group inline-flex items-center py-3 px-1 border-b-2 font-semibold text-sm transition-colors`}>
//         {name}
//         <span className={`${isActive ? 'bg-accent text-accent-text' : 'bg-border text-primary group-hover:bg-background'} ml-2 py-0.5 px-2 rounded-full text-xs font-bold`}>
//             {count}
//         </span>
//     </button>
// )

// const SearchIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//     </svg>
// );

// export default DiscoverPage;






import React, { useState, useMemo, useEffect } from 'react';
import { Post, User, Tribe } from '../../types';
import PostCard from '../feed/PostCard';
import UserCard from '../users/UserCard';
import TribeCard from '../tribes/TribeCard';

interface DiscoverPageProps {
  posts: Post[];
  users: User[];
  tribes: Tribe[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onViewProfile: (user: User) => void;
  onViewTribe: (tribe: Tribe) => void;
  onJoinToggle: (tribeId: string) => void;
  onEditTribe: (tribe: Tribe) => void;
  onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
  onLoadMore: () => void;
}

const DiscoverPage: React.FC<DiscoverPageProps> = (props) => {
    const { posts, users, tribes, currentUser, onToggleFollow, onViewProfile, onLikePost, onCommentPost, onDeletePost, onDeleteComment, onViewTribe, onJoinToggle, onEditTribe, onSharePost, onLoadMore } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'tribes'>('users');

    useEffect(() => {
        onLoadMore();
    }, [onLoadMore]);

    const otherUsers = useMemo(() => users.filter(u => u.id !== currentUser.id), [users, currentUser.id]);

    const filteredResults = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return null;

        const tagMatch = term.match(/^#(\w+)/);
        if (tagMatch) {
            const tag = tagMatch[1];
            return {
                users: [],
                posts: posts.filter(p => p.content.toLowerCase().includes(`#${tag}`)),
                tribes: []
            };
        }

        const userMatch = term.match(/^@(\w+)/);
        if (userMatch) {
            const username = userMatch[1];
            return {
                users: otherUsers.filter(u => u.username.toLowerCase().includes(username)),
                posts: [],
                tribes: []
            };
        }

        // General search
        return {
            users: otherUsers.filter(u => u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)),
            posts: posts.filter(p => p.content.toLowerCase().includes(term)),
            tribes: tribes.filter(t => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term))
        };
    }, [searchTerm, posts, otherUsers, tribes]);
    
    React.useEffect(() => {
        if(filteredResults){
            if(filteredResults.users.length > 0) setActiveTab('users');
            else if (filteredResults.tribes.length > 0) setActiveTab('tribes');
            else if (filteredResults.posts.length > 0) setActiveTab('posts');
            else setActiveTab('users');
        }
    }, [filteredResults]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-primary mb-6 font-display">Discover</h1>

            <div className="relative mb-8">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for people, tribes, or #tags..."
                    className="w-full bg-surface border border-border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                    <SearchIcon />
                </div>
            </div>

            {/* Conditional Rendering */}
            {!filteredResults ? (
                <div>
                    <h2 className="text-xl font-bold text-primary mb-4 font-display">Newest Users</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherUsers.slice(0, 9).map(user => (
                            <UserCard 
                                key={user.id}
                                user={user}
                                currentUser={currentUser}
                                onToggleFollow={onToggleFollow}
                                onViewProfile={onViewProfile}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="border-b border-border mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                           <TabButton name="People" count={filteredResults.users.length} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                           <TabButton name="Tribes" count={filteredResults.tribes.length} isActive={activeTab === 'tribes'} onClick={() => setActiveTab('tribes')} />
                           <TabButton name="Posts" count={filteredResults.posts.length} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                        </nav>
                    </div>
                    
                    {activeTab === 'users' && (
                        filteredResults.users.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredResults.users.map(user => (
                                    <UserCard key={user.id} user={user} currentUser={currentUser} onToggleFollow={onToggleFollow} onViewProfile={onViewProfile} />
                                ))}
                            </div>
                        ) : <p className="text-secondary text-center p-8">No people found for '{searchTerm}'.</p>
                    )}
                     {activeTab === 'tribes' && (
                        filteredResults.tribes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredResults.tribes.map(tribe => (
                                    <TribeCard key={tribe.id} tribe={tribe} currentUser={currentUser} isMember={tribe.members.includes(currentUser.id)} onJoinToggle={onJoinToggle} onViewTribe={onViewTribe} onEditTribe={onEditTribe} />
                                ))}
                            </div>
                        ) : <p className="text-secondary text-center p-8">No tribes found for '{searchTerm}'.</p>
                    )}
                    {activeTab === 'posts' && (
                       filteredResults.posts.length > 0 ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                {filteredResults.posts.map(post => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        currentUser={currentUser} 
                                        allUsers={users}
                                        allTribes={tribes}
                                        onLike={onLikePost} 
                                        onComment={onCommentPost} 
                                        onDeletePost={onDeletePost} 
                                        onDeleteComment={onDeleteComment} 
                                        onViewProfile={onViewProfile} 
                                        onSharePost={onSharePost}
                                    />
                                ))}
                            </div>
                       ) : <p className="text-secondary text-center p-8">No posts found for '{searchTerm}'.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{name: string, count: number, isActive: boolean, onClick: () => void}> = ({name, count, isActive, onClick}) => (
    <button onClick={onClick} className={`${ isActive ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary hover:border-border'} group inline-flex items-center py-3 px-1 border-b-2 font-semibold text-sm transition-colors`}>
        {name}
        <span className={`${isActive ? 'bg-accent text-accent-text' : 'bg-border text-primary group-hover:bg-background'} ml-2 py-0.5 px-2 rounded-full text-xs font-bold`}>
            {count}
        </span>
    </button>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export default DiscoverPage;