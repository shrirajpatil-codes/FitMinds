import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, ShieldCheck, Brain, LineChart, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand flex items-center justify-center text-slate-950 font-bold shadow-brand-glow">
            <Zap className="w-5 h-5 fill-slate-950 stroke-none" />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-slate-100">FITMIRROR AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Register</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 lg:py-24 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="brand" icon={Sparkles} className="px-3 py-1">
            AI-POWERED ADAPTIVE FITNESS & VISION CAMERA
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Your fitness plan should <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan-300">fit your life.</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            FitMirror AI adapts your workout schedule around exams, energy levels, and student stress—so you build a fitness habit that lasts.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={ArrowRight}>
                Register Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-brand">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Adaptive Planning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically scales session intensity based on exam schedules, sleep quality, and daily student stress.
            </p>
          </Card>

          <Card variant="aiInsight" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-purple-200">Behaviour Learning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learns your consistency patterns and prevents burnout before missed workouts turn into complete dropouts.
            </p>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Strategy Adaptation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides transparent AI decision history explaining why your fitness plan was adjusted.
            </p>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-400">
        <p>© 2026 FitMirror AI — AI-Powered Adaptive Student Fitness Platform.</p>
      </footer>
    </div>
  );
};
