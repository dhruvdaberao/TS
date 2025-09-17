import React from 'react';
import { Post, User, Tribe } from '../../types';
import PostCard from './PostCard';

interface FeedPageProps {
  posts: Post[];
  currentUser: User;
  allUsers: User[];
  allTribes: Tribe[];
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onViewProfile: (user: User) => void;
  onSharePost: (post: Post, destination: { type: 'tribe' | 'user', id: string }) => void;
}

const FeedPage: React.FC<FeedPageProps> = (props) => {
  const { posts, currentUser, allUsers, allTribes, onLikePost, onCommentPost, onDeletePost, onDeleteComment, onViewProfile, onSharePost } = props;
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6 font-display">Home Feed</h1>
      <div>
        {posts.map(post => (
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
        ))}
      </div>
    </div>
  );
};

export default FeedPage;