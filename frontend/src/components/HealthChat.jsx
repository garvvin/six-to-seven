import React, { useState, useEffect, useRef } from 'react';
import ChatService from '../services/chatService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, Send, MessageCircle, Bot, User } from 'lucide-react';

const HealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [includeHealthContext, setIncludeHealthContext] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await ChatService.getChatHistory();
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't show error for history loading, just log it
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await ChatService.sendHealthMessage(
        userMessage,
        includeHealthContext
      );

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.response,
          timestamp: new Date().toISOString(),
          healthContextIncluded: response.health_context_included,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(
        error.response?.data?.message ||
          error.message ||
          'Failed to send message'
      );

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content:
          'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        await ChatService.clearChatHistory();
        setMessages([]);
        setError(null);
      } catch (error) {
        console.error('Error clearing chat history:', error);
        setError('Failed to clear chat history');
      }
    }
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = message => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';
    const isError = message.type === 'error';

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className="text-sm">{message.content}</div>

          {isAI && message.healthContextIncluded && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Health context included
            </div>
          )}

          <div
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-white/80 backdrop-blur-md border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <MessageCircle className="h-5 w-5" />
              Health AI Assistant
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="border-gray-200 text-gray-800 hover:bg-gray-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  Welcome to your Health AI Assistant!
                </p>
                <p className="text-sm">
                  Ask me anything about your health based on your medical
                  documents.
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  I'll use your uploaded medical documents to provide
                  personalized insights.
                </p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}

            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Health Context Toggle */}
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={includeHealthContext}
                onChange={e => setIncludeHealthContext(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              Include health context from your medical documents
            </label>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200"
          >
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask me about your health..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthChat;
