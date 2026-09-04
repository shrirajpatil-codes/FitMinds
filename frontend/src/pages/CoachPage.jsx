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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Bot className="w-6 h-6 text-[#00f2ff]" />
            FitMirror AI Coach
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ask questions about workout adjustments, weight goals, recovery, or exam schedules.
          </p>
        </div>

        <Badge variant="ai" icon={Sparkles}>
          ACTIVE AI CHATBOT
        </Badge>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#00f2ff]" />
          Suggested Intelligence Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedCoachQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => handleQuestionClick(q)}
              className="px-3 py-2 rounded-xl bg-[#101221]/70 border border-slate-800/80 text-xs text-slate-300 hover:text-slate-100 hover:border-[#00f2ff]/40 hover:bg-[#00f2ff]/10 transition-all text-left disabled:opacity-50 font-medium shadow-sm"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card variant="default" className="p-4 md:p-6 min-h-[440px] flex flex-col justify-between space-y-4">
        <div ref={chatContainerRef} className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
          {coachMessages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  isAI ? 'bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-[#0a0c1a] border border-[#00f2ff]/40 text-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line ${
                  isAI
                    ? 'bg-[#0a0c1a]/90 border border-slate-800/80 text-slate-200 shadow-md'
                    : 'bg-[#00f2ff] text-slate-950 font-bold shadow-[0_0_20px_rgba(0,242,255,0.25)]'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1.5 ${isAI ? 'text-slate-500 font-semibold' : 'text-slate-900/70 font-bold'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0a0c1a]/90 border border-slate-800/80 text-purple-300 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>AI Coach is analyzing your request...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
          <Input
            placeholder="Ask AI Coach anything (e.g. Weight gain tips, exam workout schedule, soreness)..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isTyping}
            className="bg-[#0a0c1a]/80"
          />
          <Button type="submit" variant="ai" leftIcon={Send} disabled={isTyping || !inputText.trim()} className="shrink-0">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
