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
} from '@receivables/ui';
import { Phone, Lock, KeyRound, Copy, Check, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminForgotPasswordPage: React.FC = () => {
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
      const res = await adminApiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });

      if (res.otp) {
        setGeneratedOtp(res.otp);
        setOtpInput(res.otp);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP for this admin phone number');
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
      const res = await adminApiFetch('/auth/reset-password', {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
        <CardHeader className="text-center pb-6 border-b border-slate-800/60">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-white tracking-tight">
            Reset Admin Password
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            {step === 1
              ? 'Enter registered administrator phone number for verification'
              : 'Enter verification OTP code and choose your new admin password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Generating Code...' : 'Request Admin Reset Code'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Admin Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Visible OTP banner as requested */}
              {generatedOtp && (
                <div className="p-3.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Testing Verification OTP:
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOtp}
                      className="h-7 text-xs gap-1 border-indigo-400/50 bg-indigo-900/60 hover:bg-indigo-800 text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center py-1">
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-emerald-400 bg-slate-950 px-4 py-1 rounded border border-indigo-500/30">
                      {generatedOtp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    (SMS gateway simulation: copy this OTP and paste below)
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300">Verification OTP</label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="6-digit OTP code"
                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono tracking-wider font-semibold focus:border-indigo-500"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save & Proceed to Login'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white"
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
