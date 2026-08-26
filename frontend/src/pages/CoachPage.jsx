import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { suggestedCoachQuestions } from '../data/coach';
import { useApp } from '../context/AppContext';

export const CoachPage = () => {
  const { coachMessages, sendCoachMessage } = useApp();
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendCoachMessage(inputText);
    setInputText('');
  };

  const handleQuestionClick = (q) => {
    sendCoachMessage(q);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            FITMINDS AI Coach
          </h2>
          <p className="text-xs text-slate-400">
            Ask questions about your adaptive workout strategy, routine consistency, or workout timing.
          </p>
        </div>

        <Badge variant="ai" icon={Sparkles}>
          CONTEXTUAL ASSISTANT
        </Badge>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          Suggested Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedCoachQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuestionClick(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-slate-100 hover:border-purple-800/60 hover:bg-purple-950/30 transition-all text-left"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card variant="default" className="p-4 md:p-6 min-h-[400px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {coachMessages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  isAI ? 'bg-purple-950 border border-purple-800 text-purple-400' : 'bg-slate-800 border border-slate-700 text-brand'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed ${
                  isAI
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                    : 'bg-brand text-slate-950 font-medium'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1.5 ${isAI ? 'text-slate-500' : 'text-slate-900/70 font-bold'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <Input
            placeholder="Ask FITMINDS Coach a question about your routine..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="bg-slate-950"
          />
          <Button type="submit" variant="ai" leftIcon={Send} className="shrink-0">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
