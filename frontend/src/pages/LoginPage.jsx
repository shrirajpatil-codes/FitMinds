import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await loginUser(email, password);
    setLoading(false);

    if (result && result.success) {
      if (result.user?.onboardingCompleted === false) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(result?.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand flex items-center justify-center text-slate-950 font-bold shadow-brand-glow">
              <Zap className="w-6 h-6 fill-slate-950 stroke-none" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-100">FITMIRROR AI</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your adaptive student fitness portal</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="danger" title="Authentication Error" icon={AlertCircle}>
            {errorMsg}
          </Alert>
        )}

        {/* Login Form Card */}
        <Card variant="default" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Email"
              type="email"
              placeholder="student@university.edu"
              leftIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth rightIcon={ArrowRight} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">Don't have an account yet?</p>
            <Button
              variant="outline"
              fullWidth
              leftIcon={UserPlus}
              onClick={() => navigate('/register')}
            >
              Register New Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
