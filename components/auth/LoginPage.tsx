import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

// Define the context type locally for this component
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
}

const LoginPage: React.FC = () => {
  const auth = useContext(AuthContext) as AuthContextType;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        if (!email || !password) {
          setError('Please enter email and password.');
          setIsLoading(false);
          return;
        }
        await auth.login(email, password);
      } else {
        if (!name || !username || !email || !password) {
          setError('Please fill all fields.');
          setIsLoading(false);
          return;
        }
        await auth.register(name, username, email, password);
      }
    // Fix: Changed error type to `any` to allow property access for error handling.
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            setError(err.response.data?.message || `Server error: ${err.response.status}. Please try again.`);
        } else if (err.request) {
            // The request was made but no response was received
            setError('Cannot connect to server. Please make sure the backend is running.');
        } else {
            // Something happened in setting up the request that triggered an Error
            setError('An unexpected error occurred while sending the request.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center space-x-3">
                <img src="tribe.png" alt="Tribe Logo" className="w-12 h-12" />
                <h1 className="text-4xl font-bold font-display text-primary">Tribe</h1>
            </div>
            <p className="text-secondary mt-2">Connect with your community.</p>
        </div>

        <div className="bg-surface p-8 rounded-2xl shadow-lg border border-border">
          <h2 className="text-2xl font-bold text-center text-primary mb-8">{isLogin ? 'Log In' : 'Sign Up'}</h2>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
                <>
                    <div className="mb-4">
                        <label className="block text-secondary text-sm font-semibold mb-2" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                            placeholder="Alex Jordan"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-secondary text-sm font-semibold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                            placeholder="alexj"
                            disabled={isLoading}
                        />
                    </div>
                </>
            )}
            <div className="mb-4">
              <label className="block text-secondary text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-secondary text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-text font-semibold p-3 rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center text-secondary text-sm mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => {setIsLogin(!isLogin); setError('')}} className="font-semibold text-accent hover:underline ml-2" disabled={isLoading}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;