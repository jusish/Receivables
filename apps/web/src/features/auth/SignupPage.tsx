import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, BrandLogo } from '@receivables/ui';
import { Building2, User, Phone, Lock, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCode, setBusinessCode] = useState('');
  const [currency, setCurrency] = useState('RWF');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          phone,
          password,
          businessName,
          businessCode: businessCode || undefined,
          currency,
        }),
      });

      // Save token and context
      if (res.accessToken) {
        setSession(res.accessToken, res.user, res.business, res.role, res.businesses || [res.business]);
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-slate-700 bg-white/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <BrandLogo size="lg" showText={false} className="justify-center mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Create Free Business Account
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Join the receivables management platform and start tracking invoices in minutes
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1: User Profile */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Your Administrator Profile
              </p>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    placeholder="e.g. David Rukundo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <Input
                      placeholder="+250 788 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Business Profile */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Your Business Organization
              </p>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Business Legal / Trading Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    placeholder="e.g. Kigali Wholesale Traders Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Business Code (Optional)
                  </label>
                  <Input
                    placeholder="e.g. BIZ-KWT (Auto if empty)"
                    value={businessCode}
                    onChange={(e) => setBusinessCode(e.target.value)}
                    className="text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Primary Currency
                  </label>
                  <Input
                    placeholder="RWF"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2 text-white"
              disabled={loading}
            >
              {loading ? 'Setting up business...' : 'Create Account & Access Dashboard'}
            </Button>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
