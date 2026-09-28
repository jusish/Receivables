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
import { Phone, Lock, KeyRound, Copy, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('+250788123456');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });

      if (res.otp) {
        setGeneratedOtp(res.otp);
        setOtpInput(res.otp); // Pre-fill or let them copy
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP for this phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          otp: otpInput,
          newPassword,
        }),
      });

      setSuccess(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="text-center pb-6">
          <BrandLogo size="lg" showText={false} className="justify-center mx-auto mb-3" />
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Enter your registered phone number to receive a verification OTP'
              : 'Enter the verification OTP and set your new account password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Generating Code...' : 'Send Verification OTP'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Visible OTP banner as requested */}
              {generatedOtp && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      Testing Verification OTP:
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOtp}
                      className="h-7 text-xs gap-1 border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center py-1">
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-slate-900 bg-white px-4 py-1 rounded border border-amber-200">
                      {generatedOtp}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 text-center">
                    (SMS gateway simulation: copy this OTP and paste below)
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700">Enter OTP Code</label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="6-digit OTP code"
                    className="pl-9 font-mono tracking-wider font-semibold"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Use a different phone number
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
