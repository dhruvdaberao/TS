import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
        <code>{children}</code>
    </pre>
);

const DevNotesPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 bg-surface rounded-2xl border border-border text-primary">
      <h1 className="text-3xl font-bold font-display text-accent mb-6">Full-Stack Integration Guide</h1>
      
      <div className="space-y-12 text-secondary">
        
        <section>
          <h2 className="text-2xl font-semibold font-display text-primary mb-3">1. Setting Up Your Backend</h2>
          <p className="mb-4">
            You now have a complete backend in the <code className="bg-background px-2 py-1 rounded">/backend</code> directory. Follow these steps to get it running:
          </p>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Navigate to the backend directory:</strong><br/>
              <CodeBlock>cd backend</CodeBlock>
            </li>
            <li>
              <strong>Install dependencies:</strong><br/>
              <CodeBlock>npm install</CodeBlock>
            </li>
            <li>
                <strong>Configure Environment Variables:</strong><br/>
                Create a file named <code className="bg-background px-2 py-1 rounded">.env</code> in the <code className="bg-background px-2 py-1 rounded">/backend</code> directory. Copy the contents of <code className="bg-background px-2 py-1 rounded">.env.example</code> into it and fill in your details.
                <CodeBlock>{`# .env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_very_long_and_secure_random_string`}</CodeBlock>
                You can get a free MongoDB Atlas connection string from their website.
            </li>
            <li>
              <strong>Start the development server:</strong><br/>
              <CodeBlock>npm run server</CodeBlock>
              Your backend API will now be running on <code className="bg-background px-2 py-1 rounded">http://localhost:5001</code>.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-display text-primary mb-3">2. Frontend API Layer</h2>
          <p className="mb-4">
            Instead of calling <code className="bg-background px-2 py-1 rounded">fetch</code> directly in your components, it's best practice to create a centralized API service. Create a new folder <code className="bg-background px-2 py-1 rounded">src/api</code> and a file <code className="bg-background px-2 py-1 rounded">src/api/index.ts</code>.
          </p>
          <p className="mb-4">First, install axios: <code className="bg-background px-2 py-1 rounded">npm install axios</code></p>
          <CodeBlock>{`// src/api/index.ts
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

// This function will run on every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = \`Bearer \${token}\`;
  }
  return req;
});

// Auth routes
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// Post routes
export const fetchPosts = () => API.get('/posts');
export const createPost = (newPost) => API.post('/posts', newPost);
export const likePost = (id) => API.put(\`/posts/\${id}/like\`);
// ... add other API calls here ...
`}</CodeBlock>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold font-display text-primary mb-3">3. Modifying App.tsx for Real Data</h2>
          <p className="mb-4">
            The biggest changes will happen in your main <code className="bg-background px-2 py-1 rounded">App.tsx</code> component. You'll move from managing mock data in state to fetching data from your new API.
          </p>
          
          <h3 className="text-xl font-semibold text-primary mt-6 mb-2">Authentication Flow</h3>
          <p className="mb-4">Update your login/signup handlers to call the API and store the JWT.</p>
          <CodeBlock>{`// App.tsx - Example Login Handler
import * as api from './api';

const handleLogin = async (email, password) => {
  try {
    const { data } = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    // You might want to store user profile in state as well
    setCurrentUser(data); // Assuming login returns user data
  } catch (error) {
    console.error('Login failed:', error);
    alert('Invalid credentials');
  }
};`}</CodeBlock>
          
          <h3 className="text-xl font-semibold text-primary mt-6 mb-2">Fetching Initial Data</h3>
           <p className="mb-4">Use <code className="bg-background px-2 py-1 rounded">useEffect</code> to load posts and users when the app starts.</p>
           <CodeBlock>{`// App.tsx
useEffect(() => {
  const getPosts = async () => {
    try {
      const { data } = await api.fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  if(currentUser) { // Only fetch if user is logged in
      getPosts();
  }
}, [currentUser]);`}</CodeBlock>

          <h3 className="text-xl font-semibold text-primary mt-6 mb-2">Updating State after API Calls</h3>
           <p className="mb-4">Your handlers will now make an API call and then update the state with the response from the server.</p>
           <CodeBlock>{`// App.tsx - Example Add Post Handler
const handleAddPost = async (content, imageUrl) => {
    if (!currentUser) return;
    try {
        const { data: newPost } = await api.createPost({ content, imageUrl });
        setPosts([newPost, ...posts]); // Add the new post returned from API
    } catch (error) {
        console.error("Failed to create post", error);
    }
};
`}</CodeBlock>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-display text-primary mb-3">Summary of Changes</h2>
          <ul className="list-disc list-inside space-y-2">
              <li><strong>Backend:</strong> Set up and run the Node.js server.</li>
              <li><strong>API Layer:</strong> Create a service in React to handle all network requests.</li>
              <li><strong>Auth:</strong> Modify <code className="bg-background px-2 py-1 rounded">LoginPage.tsx</code> and <code className="bg-background px-2 py-1 rounded">App.tsx</code> to use the auth API and JWTs.</li>
              <li><strong>Data Fetching:</strong> Replace all direct uses of <code className="bg-background px-2 py-1 rounded">MOCK_POSTS</code> and <code className="bg-background px-2 py-1 rounded">MOCK_USERS</code> with API calls.</li>
              <li><strong>State Updates:</strong> Refactor all handler functions (<code className="bg-background px-2 py-1 rounded">handleLikePost</code>, <code className="bg-background px-2 py-1 rounded">handleToggleFollow</code>, etc.) to call the API first, then update the local state.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DevNotesPage;
