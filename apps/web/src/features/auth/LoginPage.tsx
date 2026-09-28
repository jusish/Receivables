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
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      setError(err.message || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="text-center pb-6">
          <BrandLogo size="lg" showText={false} className="justify-center mx-auto mb-3" />
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Receivables Platform</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Sign in with your registered business phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="tel"
                  placeholder="+250 788 000 000"
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create a free business account
              </Link>
            </div>
          </form>

          {/* Seed demo quick-fill helper */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Test Accounts (Seeded)
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('+250788123456')}
                className="w-full text-left p-2 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800">Justin Ishimwe</span>
                  <span className="text-slate-500 ml-1.5">(Business Owner)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('+250788654321')}
                className="w-full text-left p-2 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800">Alice Uwase</span>
                  <span className="text-slate-500 ml-1.5">(Accountant)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
