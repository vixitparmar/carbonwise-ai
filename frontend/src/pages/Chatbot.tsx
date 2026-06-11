import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Send, Trash2, User, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';


const SUGGESTIONS = [
  'How can I reduce my emissions?',
  'How much carbon does my car produce?',
  'Is cycling better than metro?',
  'What is the best sustainable lifestyle?'
];

export const Chatbot: React.FC = () => {
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch history
  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const res = await api.get('/ai/chat/history');
      return res.data;
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const res = await api.post('/ai/chat', { message: messageText });
      return res.data;
    },
    onMutate: async (newMessageText) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['chatHistory'] });
      // Snapshot previous
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chatHistory']) || [];
      // Optimistically append user message
      const optimisticMsg: ChatMessage = {
        _id: 'optimistic_' + Math.random().toString(),
        userId: 'temp',
        role: 'user',
        content: newMessageText,
        createdAt: new Date().toISOString()
      };
      queryClient.setQueryData<ChatMessage[]>(['chatHistory'], [...previousMessages, optimisticMsg]);
      return { previousMessages };
    },
    onError: (_err, _newMsg, context) => {
      if (context) {
        queryClient.setQueryData(['chatHistory'], context.previousMessages);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    }
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/ai/chat/history');
    },
    onSuccess: () => {
      queryClient.setQueryData(['chatHistory'], []);
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(text);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="h-5.5 w-5.5 text-blue-600 dark:text-blue-500" />
            AI Sustainability Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask any questions regarding environmental impact and sustainable living.
          </p>
        </div>
        
        {messages && messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => clearHistoryMutation.mutate()}
            disabled={clearHistoryMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-500 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </motion.button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-4 space-y-4 mb-4 min-h-0">
        
        {/* Welcome message if empty */}
        {(!messages || messages.length === 0) && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-full text-blue-600">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Chat with CarbonWise AI</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                I can explain carbon calculations, evaluate shopping habits, help select sustainable transit modes, or suggest energy mitigation ideas.
              </p>
            </div>
          </motion.div>
        )}

        {/* Message Feeds */}
        <AnimatePresence initial={false}>
          {messages?.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div 
                key={msg._id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Balloon */}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`block text-[9px] mt-1.5 text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading stubs */}
        {sendMessageMutation.isPending && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
              <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
              <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-300"></div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {(!messages || messages.length === 0) && (
        <div className="flex flex-wrap gap-2.5 mb-4 shrink-0 justify-center">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendMessage(s)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-sm cursor-pointer"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input Form Box */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3 shrink-0">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question about carbon reduction..."
          className="flex-1 bg-transparent resize-none border-none focus:outline-none focus:ring-0 text-sm h-10 py-2.5 pl-2"
        />
        
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || sendMessageMutation.isPending}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-lg shadow-sm transition shrink-0 cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </motion.button>
      </div>

    </div>
  );
};
export default Chatbot;
