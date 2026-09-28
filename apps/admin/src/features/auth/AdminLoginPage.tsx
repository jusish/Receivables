import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  BrandLogo,
} from '@receivables/ui';
import { Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [phone, setPhone] = useState('+250788123456');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phone, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or administrative privileges required');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
        <CardHeader className="text-center pb-6 border-b border-slate-800/60">
          <BrandLogo size="lg" showText={false} theme="dark" className="justify-center mx-auto mb-3" />
          <CardTitle className="text-xl font-bold text-white tracking-tight">
            Admin Operations Console
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Restricted access for platform administrators and system operators
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Admin Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="tel"
                  placeholder="+250 788 000 000"
                  className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Console'}
            </Button>
          </form>

          {/* Quick-fill Helper for seeded Super Admin */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Seeded Super Admin Credentials
            </p>
            <button
              type="button"
              onClick={() => {
                setPhone('+250788123456');
                setPassword('Password123!');
              }}
              className="w-full text-left p-2.5 rounded border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-semibold text-white">Justin Ishimwe</span>
                <span className="text-indigo-400 ml-1.5 font-mono text-[11px]">
                  (SUPER_ADMIN)
                </span>
                <p className="text-[11px] text-slate-500">+250788123456 • Password123!</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
