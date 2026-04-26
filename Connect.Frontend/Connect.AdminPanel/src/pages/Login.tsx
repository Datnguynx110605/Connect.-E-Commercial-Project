import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { login, getProfile, tokenStorage } from '../api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Step 1: Get tokens
      const result = await login({ email, password });

      // Step 2: Temporarily set access token in storage so getProfile() can auth.
      // We write a throw-away save first; if role check fails we clear everything.
      tokenStorage.save(result, 0);

      // Step 3: Verify the user is an Admin before committing
      let user;
      try {
        user = await getProfile();
      } catch (profileErr) {
        // Profile fetch failed — clear dirty tokens and surface the error
        tokenStorage.clear();
        setError('Failed to verify account. Please try again.');
        return;
      }

      if (user.role !== 'Admin') {
        tokenStorage.clear();
        setError('Access denied. Admin role required.');
        return;
      }

      // Step 4: Commit with the real userID now that we know they are Admin
      tokenStorage.save(result, user.userID);
      navigate('/');
    } catch (err: any) {
      tokenStorage.clear();
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">AdminUI.</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={loading}
          />

          <div className="pt-2">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}