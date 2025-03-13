import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { adminApi, authApi } from '../lib/api';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: 'admin',  // Pre-filling for development
    password: 'admin123'  // Pre-filling for development
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    if (adminApi.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { token } = await authApi.adminLogin(credentials.username, credentials.password);
      
      // Store token in localStorage
      localStorage.setItem('adminToken', token);
      
      // Redirect to admin page
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Admin Login</h1>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md border border-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Default admin credentials:</p>
            <p className="font-semibold">Username: admin / Password: admin123</p>
            <p className="mt-2 text-xs">(For demonstration purposes only)</p>
          </div>
        </div>
      </div>
    </div>
  );
}