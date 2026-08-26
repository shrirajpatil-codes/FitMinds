import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI placeholder action
    navigate('/onboarding');
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
          <h2 className="text-xl font-bold text-slate-100">Create Student Account</h2>
          <p className="text-xs text-slate-400">Start building your adaptive fitness strategy</p>
        </div>

        {/* Register Form Card */}
        <Card variant="default" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Chen"
              leftIcon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth rightIcon={ArrowRight}>
              Create Account
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
