import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Icon } from '../../components/ui/Icon';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  React.useEffect(() => { document.title = 'Login Admin — Peta Tematik Padang Pariaman'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-brand shadow-brand mb-4">
            <Icon name="layers" className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">Masuk ke Admin Panel</h1>
          <p className="text-sm text-neutral-500 mt-1">Peta Tematik Kabupaten Padang Pariaman</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-100 text-sm text-danger-700">
                <Icon name="x" className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />

            <Button type="submit" isLoading={loading} fullWidth size="lg">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          &copy; 2025 Dinas PUPR Kabupaten Padang Pariaman
        </p>
      </div>
    </div>
  );
}
