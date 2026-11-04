'use client';

// import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { ExtractedProduct, UserProfile, AssistantChatMessage } from '@/types/nutrition';


// Turns **bold**, *italic* and "* bullets" from the answer text into clean formatting
function renderInline(text: string): React.ReactNode[] {
  const cleaned = text.replace(/^\s*[*-]\s+/gm, '• ');
  const parts = cleaned.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const QUICK_PROMPTS = [
  'Can I eat this product based on my preferences?',
  'What does INS 621 (MSG) mean on an ingredient list?',
  'What are the daily limits for added sugar under ICMR-NIN 2024?',
  'How do I convert sodium to salt on a label?',
  'What is the difference between per 100g and per serving?',
  'Why is palm oil flagged in packaged foods?',
  'What do the FSSAI green and brown dot symbols mean?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProduct, setActiveProduct] = useState<ExtractedProduct | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedProfile = UserRepository.getProfile();
    const loadedProduct = UserRepository.getActiveProduct();
    setProfile(loadedProfile);
    setActiveProduct(loadedProduct);

    // Initial greeting message
    const initialGreeting: AssistantChatMessage = {
      id: 'greeting',
      sender: 'assistant',
      text: `Hello! I am your **NutriAgent Nutrition Assistant**.\n\nI can help you decode food labels, explain complex chemical additives (INS numbers), calculate nutritional targets under **ICMR-NIN 2024 Dietary Guidelines**, and evaluate whether a packaged product fits your dietary restrictions.\n\n${
        loadedProduct
          ? `👉 I see you currently have **${loadedProduct.name}** active from your recent scan. You can ask *"Can I eat this?"* or inquire about any of its ingredients.`
          : 'You can select a quick prompt below or ask any food-label question.'
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          source: 'ICMR-NIN Dietary Guidelines for Indians (2024)',
          guideline: 'National Institute of Nutrition, Hyderabad',
        },
        {
          source: 'FSSAI Food Labelling & Display Regulations (2022)',
          guideline: 'Food Safety and Standards Authority of India',
        },
      ],
      suggestedFollowUps: QUICK_PROMPTS.slice(0, 3),
      productContext: loadedProduct
        ? {
            name: loadedProduct.name,
            status: 'review_carefully',
          }
        : undefined,
    };

    setMessages([initialGreeting]);
  }, []);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          activeProduct: activeProduct || undefined,
          userProfile: profile || undefined,
        }),
      });

      const data = await response.json();

      const assistantMsg: AssistantChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I could not generate an answer for that inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      const fallbackMsg: AssistantChatMessage = {
        id: `assist-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the nutrition service. Please try again or check your local connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length > 1) {
      setMessages([messages[0]]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-beige-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#254F75]" />
            <span>Interactive Food Knowledge Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
            NutriAgent Nutrition Assistant
          </h1>
          <p className="text-xs sm:text-sm text-coffee-600 mt-1">
            Evidence-based answers on ingredients, additives, label metrics, and dietary guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeProduct && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-beige-300 text-xs text-coffee-800 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-pencil-sage-500 animate-pulse" />
              <span className="font-medium truncate max-w-[160px]">{activeProduct.name}</span>
            </div>
          )}
          <button
            onClick={handleClearChat}
            className="btn-pencil-peach text-xs py-1.5 px-3"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="card-warm flex flex-col h-[650px] p-0 overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.sender !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-coffee-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 text-pencil-sage-300" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-subtle ${
                  msg.sender === 'user'
                    ? 'bg-coffee-800 text-[#FAF7F2] rounded-tr-none'
                    : 'bg-beige-100 text-coffee-900 border border-beige-300 rounded-tl-none'
                }`}
              >
                {/* Product Context Banner */}
                {msg.productContext && (
                  <div className="mb-2.5 pb-2 border-b border-beige-300/80 flex items-center justify-between text-xs text-coffee-700">
                    <span className="font-medium">Active product context: {msg.productContext.name}</span>
                    <Link
                      href="/results/active"
                      className="text-pencil-terracotta-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Message Body with markdown paragraphs */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {renderInline(paragraph)}
                    </p>
                  ))}
                </div>

                {/* Official Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-coffee-200/50 space-y-1">
                    <span className="text-[11px] font-semibold text-coffee-700 block">
                      Authority Citations:
                    </span>
                    {msg.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="text-[10px] sm:text-xs text-coffee-600 flex items-start gap-1.5"
                      >
                        <BookOpen className="w-3 h-3 text-pencil-sage-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{c.source}:</strong> {c.guideline}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-up Prompts */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-coffee-200/50 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-white text-coffee-800 border border-beige-300 hover:bg-beige-200 transition-colors shadow-subtle"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-coffee-300' : 'text-coffee-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-pencil-sage-200 text-pencil-sage-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5 border border-pencil-sage-300">
                  <User className="w-4 h-4 text-pencil-sage-700" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto">
              <div className="w-8 h-8 rounded-full bg-coffee-800 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-pencil-sage-300" />
              </div>
              <div className="bg-beige-100 border border-beige-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-coffee-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-coffee-500 ml-1">Consulting nutrition guidelines...</span>
              </div>
            </div>
          )}

          {/* <div ref={messagesEndRef} /> */}
        </div>

        {/* Quick Prompt Carousel */}
        <div className="px-4 py-2.5 bg-beige-50 border-t border-beige-200/80 overflow-x-auto flex gap-2 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium bg-white text-coffee-800 border border-beige-300 hover:bg-beige-100 hover:border-beige-400 transition-colors shadow-subtle shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-beige-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about ingredients, additives, sugar caps, or 'Can I eat this?'..."
              className="flex-1 bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-coffee-950 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="btn-pencil-brown px-4 py-2.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-coffee-500 mt-2 px-1">
            <span>Evidence-based decision support (ICMR-NIN 2024 & FSSAI 2022)</span>
            <span>Does not replace clinical consultation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

