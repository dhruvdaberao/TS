import axios from 'axios';

// The backend server is expected to be running on localhost:5001
const API = axios.create({ baseURL: 'https://ts-backend-puce.vercel.app/api'  });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const login = (formData: any) => API.post('/auth/login', formData);
export const register = (formData: any) => API.post('/auth/register', formData);

// Users
export const fetchUsers = () => API.get('/users');
export const fetchUser = (id: string) => API.get(`/users/${id}`);
export const updateProfile = (profileData: any) => API.put('/users/profile', profileData);
export const toggleFollow = (id: string) => API.put(`/users/${id}/follow`);
export const toggleBlock = (id: string) => API.put(`/users/${id}/block`);
export const deleteAccount = () => API.delete('/users/profile');

// Posts
export const fetchPosts = () => API.get('/posts');
export const createPost = (newPost: any) => API.post('/posts', newPost);
export const deletePost = (id: string) => API.delete(`/posts/${id}`);
export const likePost = (id: string) => API.put(`/posts/${id}/like`);
export const commentOnPost = (id: string, commentData: any) => API.post(`/posts/${id}/comments`, commentData);
export const deleteComment = (postId: string, commentId: string) => API.delete(`/posts/${postId}/comments/${commentId}`);

// Conversations & Messages
export const fetchConversations = () => API.get('/messages/conversations');
export const fetchMessages = (otherUserId: string) => API.get(`/messages/${otherUserId}`);
export const sendMessage = (receiverId: string, messageData: any) => API.post(`/messages/send/${receiverId}`, messageData);

// Tribes
export const fetchTribes = () => API.get('/tribes');
export const createTribe = (tribeData: any) => API.post('/tribes', tribeData);
export const updateTribe = (id: string, tribeData: any) => API.put(`/tribes/${id}`, tribeData);
export const joinTribe = (id: string) => API.put(`/tribes/${id}/join`);
export const fetchTribeMessages = (id: string) => API.get(`/tribes/${id}/messages`);
export const sendTribeMessage = (id: string, messageData: any) => API.post(`/tribes/${id}/messages`, messageData);
