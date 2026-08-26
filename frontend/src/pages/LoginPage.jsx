import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI placeholder action
    navigate('/dashboard');
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
            <span className="font-extrabold text-2xl tracking-wider text-slate-100">FITMINDS</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your adaptive student fitness portal</p>
        </div>

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

            <Button type="submit" variant="primary" fullWidth rightIcon={ArrowRight}>
              Sign In
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
