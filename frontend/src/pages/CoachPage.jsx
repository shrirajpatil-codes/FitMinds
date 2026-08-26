import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { suggestedCoachQuestions } from '../data/coach';
import { useApp } from '../context/AppContext';

export const CoachPage = () => {
  const { coachMessages, sendCoachMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [coachMessages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    
    const textToSend = inputText;
    setInputText('');
    setIsTyping(true);

    await sendCoachMessage(textToSend);
    setIsTyping(false);
  };

  const handleQuestionClick = async (q) => {
    if (isTyping) return;
    setIsTyping(true);
    await sendCoachMessage(q);
    setIsTyping(false);
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
            Ask any questions about weight loss/gain, workout adjustments, nutrition, or student exam schedules.
          </p>
        </div>

        <Badge variant="ai" icon={Sparkles}>
          ACTIVE AI CHATBOT
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
              disabled={isTyping}
              onClick={() => handleQuestionClick(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-slate-100 hover:border-purple-800/60 hover:bg-purple-950/30 transition-all text-left disabled:opacity-50"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card variant="default" className="p-4 md:p-6 min-h-[420px] flex flex-col justify-between space-y-4">
        <div ref={chatContainerRef} className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
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

                <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line ${
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

          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center text-xs shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-purple-300 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>AI Coach is analyzing your request...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <Input
            placeholder="Ask AI Coach anything (e.g. Weight gain tips, exam workout schedule, soreness)..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isTyping}
            className="bg-slate-950"
          />
          <Button type="submit" variant="ai" leftIcon={Send} disabled={isTyping || !inputText.trim()} className="shrink-0">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
