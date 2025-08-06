"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, TrashIcon, SparklesIcon, ChatBubbleLeftRightIcon, LightBulbIcon, WifiIcon, CpuChipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { aiChatApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import TypingIndicator from './TypingIndicator';
import RinImage from './RinImage';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    isStreaming?: boolean;
}

export default function ChatInterface() {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');
    const [streamingMode, setStreamingMode] = useState<'streaming' | 'sync'>('streaming');
    const [rinPersonality, setRinPersonality] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const hasWelcomeMessageRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Debug logging for authentication state
    useEffect(() => {
        console.log('🔍 ChatInterface Auth Debug:', {
            user: user,
            userId: user?.id,
            userEmail: user?.email,
            isAuthenticated: !!user,
            accessToken: typeof window !== 'undefined' && localStorage.getItem('accessToken') ? 'Present' : 'Missing',
            refreshToken: typeof window !== 'undefined' && localStorage.getItem('refreshToken') ? 'Present' : 'Missing'
        });
    }, [user]);

    // Initialize persistent conversation ID and load chat history when user is available
    useEffect(() => {
        if (user?.id && !isInitialized) {
            initializePersistentChat();
        }
    }, [user, isInitialized]);

    // Initialize persistent conversation and load history
    const initializePersistentChat = async () => {
        if (!user?.id) return;

        try {
            setIsLoadingHistory(true);
            console.log('🔄 Initializing persistent chat for user:', user.id);

            // Get or create persistent conversation ID
            const { conversationId: persistentId, isNew } = await aiChatApi.getPersistentConversationId(user.id);
            
            console.log('✅ Got persistent conversation ID:', { persistentId, isNew });
            setConversationId(persistentId);

            // Generate session ID for this session
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            
            // Store session ID in localStorage (this can be session-specific)
            localStorage.setItem('chatSessionId', newSessionId);

            // Load chat history if conversation exists
            if (!isNew) {
                try {
                    const historyResponse = await aiChatApi.loadUserChatHistory(persistentId, user.id);
                    
                    if (historyResponse.messages && historyResponse.messages.length > 0) {
                        console.log('📚 Loaded chat history:', historyResponse.messages.length, 'messages');
                        
                        // Convert backend messages to frontend format
                        const loadedMessages = historyResponse.messages.map((msg: any) => {
                            // Extract clean content from potentially raw message objects
                            let content = msg.content || msg.message || '';
                            
                            // Handle raw Spring AI message objects
                            if (typeof content === 'object' && content.content) {
                                content = content.content;
                            }
                            
                            // Clean up raw message object strings like "UserMessage{content='text', ...}"
                            if (typeof content === 'string' && content.includes('Message{')) {
                                const contentMatch = content.match(/content='([^']*)'/) || content.match(/textContent=([^,}]*)/);
                                if (contentMatch) {
                                    content = contentMatch[1];
                                }
                            }
                            
                            return {
                                id: msg.id || `loaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                content: content.trim(),
                                isUser: msg.isUser || msg.isFromUser || false,
                                timestamp: new Date(msg.timestamp || msg.createdAt || Date.now())
                            };
                        });

                        setMessages(loadedMessages);
                        hasWelcomeMessageRef.current = true; // Prevent duplicate welcome message
                    } else {
                        console.log('📝 No chat history found, starting fresh');
                    }
                } catch (historyError) {
                    console.error('❌ Error loading chat history:', historyError);
                    // Continue without history - not a critical error
                }
            } else {
                console.log('🆕 New conversation created');
            }

            setIsInitialized(true);
            
            // Show welcome message only for completely new conversations
            if (isNew || messages.length === 0) {
                setTimeout(() => {
                    if (!hasWelcomeMessageRef.current) {
                        showWelcomeMessage();
                        hasWelcomeMessageRef.current = true;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error initializing persistent chat:', error);
            
            // Improved fallback: try to use a consistent conversation ID
            let fallbackConversationId = localStorage.getItem(`persistentChatId_${user.id}`);
            
            if (!fallbackConversationId) {
                // Create a consistent fallback ID for this user
                fallbackConversationId = `${user.id}_persistent_fallback`;
                localStorage.setItem(`persistentChatId_${user.id}`, fallbackConversationId);
                console.log('🔄 Created fallback persistent conversation ID:', fallbackConversationId);
            } else {
                console.log('🔄 Using existing fallback conversation ID:', fallbackConversationId);
            }
            
            const fallbackSessionId = generateSessionId();
            setConversationId(fallbackConversationId);
            setSessionId(fallbackSessionId);
            setIsInitialized(true);
            
            // Show welcome message for fallback
            setTimeout(() => {
                if (!hasWelcomeMessageRef.current) {
                    showWelcomeMessage();
                    hasWelcomeMessageRef.current = true;
                }
            }, 1000);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        // Auto-focus input on mount
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // showWelcomeMessage will be defined after addMessage

    // Add a function to refresh authentication
    const refreshAuth = async () => {
        // Ensure we're on the client side
        if (typeof window === 'undefined') {
            console.warn('⚠️ refreshAuth called on server side');
            return false;
        }

        console.log('🔄 Attempting to refresh authentication...');
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.error('❌ No refresh token available');
                return false;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }
                    console.log('✅ Authentication refreshed successfully');
                    
                    // Trigger a page refresh to reload user state
                    window.location.reload();
                    return true;
                }
            }
            console.error('❌ Failed to refresh authentication');
            return false;
        } catch (error) {
            console.error('❌ Error refreshing authentication:', error);
            return false;
        }
    };

    // Don't render anything until we're on the client side
    if (!isClient) {
        return (
            <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading chat interface...</p>
                    </div>
                </div>
            </div>
        );
    }

    function addMessage(message: Message) {
        setMessages(prev => {
            // Check if a message with the same ID already exists
            const existsAlready = prev.some(msg => msg.id === message.id);
            if (existsAlready) {
                console.log('Duplicate message prevented:', message.id);
                return prev;
            }
            return [...prev, message];
        });
    }

    function showWelcomeMessage() {
        const welcomeMessages = [
            "H-hmph! You're back... I wasn't waiting for you or anything! I just happened to be here working on environmental data analysis, baka!",
            "Oh, it's you again... Don't think I'm happy to see you! I was just organizing some sustainability reports. What do you want this time?",
            "Tch! You finally decided to show up! I've been processing carbon footprint calculations while you were away. Not that I missed talking to you or anything!",
            "You're here... again. Fine! I suppose I can spare some time from my important environmental research to talk with you. Don't get the wrong idea though!"
        ];
        
        const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        
        addMessage({
            id: `welcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: randomWelcome,
            isUser: false,
            timestamp: new Date()
        });
    }

    const teMessage = (messageId: string, content: string) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId 
                ? { ...msg, content: content, isStreaming: false }
                : msg
        ));
    };

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        // Check authentication before sending message
        if (!user || !user.id) {
            console.error('❌ User not authenticated - cannot send message');
            addMessage({
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: "Tch! You need to be properly logged in to chat with me! Please refresh the page and make sure you're authenticated, baka!",
                isUser: false,
                timestamp: new Date()
            });
            return;
        }

        // Check if we have valid tokens
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!accessToken) {
            console.error('❌ No access token found - cannot send message');
            addMessage({
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: "Hmph! Your authentication token is missing. Please refresh the page and log in again!",
                isUser: false,
                timestamp: new Date()
            });
            return;
        }

        const userMessage: Message = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: inputMessage,
            isUser: true,
            timestamp: new Date()
        };

        addMessage(userMessage);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            console.log('🤖 Sending message to AI:', { 
                mode: streamingMode, 
                userId: user.id, 
                sessionId,
                conversationId,
                hasToken: !!accessToken
            });
            
            if (streamingMode === 'streaming') {
                await sendStreamingMessage(currentInput);
            } else {
                await sendSyncMessage(currentInput);
            }
        } catch (error: any) {
            console.error('❌ Chat error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });
            
            // Don't let chat errors cause logout - handle gracefully
            let errorMessage = "Hmph! Something went wrong with my systems... It's not like I wanted to help you anyway! Try again later, baka!";
            
            if (error.message?.includes('Authentication')) {
                errorMessage = "Tch! My authentication got mixed up... Try refreshing the page, baka!";
            } else if (error.message?.includes('Network')) {
                errorMessage = "Hmph! The network seems to be acting up. Check your connection and try again!";
            } else if (error.response?.status === 500) {
                errorMessage = "My AI brain seems to be having a moment... The backend might be sleeping. Try again in a bit!";
            } else if (error.response?.status === 401) {
                errorMessage = "Tch! Your session expired. Please refresh the page and log in again!";
            }
            
            addMessage({
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: errorMessage,
                isUser: false,
                timestamp: new Date()
            });
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    // Normalize streamed content to fix spacing and formatting issues
    function normalizeStreamedContent(content: string): string {
        if (!content) return content;
        
        console.log('🔧 Before normalization:', JSON.stringify(content));
        
        // Fix common streaming issues with more precise patterns
        let normalized = content
            // Fix missing spaces after punctuation (more comprehensive)
            .replace(/([.!?:;,])/g, '$1 ')
            // Fix missing spaces before capital letters (but not at start of sentence)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            // Fix missing spaces around asterisks for emphasis
            .replace(/\*([^*]+)\*/g, ' *$1* ')
            // Fix specific patterns we've seen in Rin's responses
            .replace(/(\w)(is|it|we|he|she|they|you|me|us|them)(\W)/gi, '$1 $2$3')
            .replace(/(\w)(have|has|had|will|would|could|should|can|may|might)(\W)/gi, '$1 $2$3')
            .replace(/(\w)(not|n't|don't|can't|won't|isn't|aren't|wasn't|weren't)(\W)/gi, '$1 $2$3')
            // Fix specific Rin patterns
            .replace(/(\w)(Tch|Hmph|Well|Honestly|Seriously|Obviously|Actually)(\W)/gi, '$1 $2$3')
            .replace(/(\w)(acceptable|surprised|clarifying|expecting|wasting|spell)(\W)/gi, '$1 $2$3')
            // Clean up multiple spaces and trim
            .replace(/\s+/g, ' ')
            .trim();
            
        console.log('🔧 After normalization:', JSON.stringify(normalized));
        return normalized;
    }

    const updateMessage = (messageId: string, content: string) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId 
                ? { ...msg, content: content, isStreaming: false }
                : msg
        ));
    };

    const sendStreamingMessage = async (message: string) => {
        try {
            console.log('🌊 Starting streaming chat:', { conversationId, userId: user?.id, sessionId });
            const stream = await aiChatApi.streamChat(message, conversationId, user?.id, sessionId);
            const reader = stream.getReader();
            const decoder = new TextDecoder('utf-8');
    
            const assistantMessageId = `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            addMessage({
                id: assistantMessageId,
                content: '',
                isUser: false,
                timestamp: new Date(),
                isStreaming: true
            });
    
            let accumulatedContent = '';
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value, { stream: true });
                
                if (chunk) {
                    accumulatedContent += chunk;
                    // Update with raw content during streaming - no processing
                    setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId 
                            ? { ...msg, content: accumulatedContent, isStreaming: true }
                            : msg
                    ));
                }
            }
    
            console.log('✅ Streaming completed successfully');
            
            // Only apply any cleanup to the FINAL complete message if absolutely necessary
            // In most cases, the content should already be properly formatted
            const finalContent = accumulatedContent.trim() || "I couldn't generate a proper response. Please try again!";
            
            // Mark as complete
            setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                    ? { ...msg, content: finalContent, isStreaming: false }
                    : msg
            ));
    
            // Optional personality state update
            try {
                const personality = await aiChatApi.analyzeContext(conversationId, user?.id, sessionId);
                if (personality) setRinPersonality(personality);
            } catch (error) {
                console.log('⚠️ Could not fetch personality state (non-critical):', error);
            }
    
        } catch (error) {
            console.error('❌ Streaming error:', error);
            throw error;
        }
    };

    const sendSyncMessage = async (message: string) => {
        try {
            console.log('🔄 Starting sync chat:', { conversationId, userId: user?.id, sessionId });
            const response = await aiChatApi.chat(message, conversationId, user?.id, sessionId);
            
            let content = '';
            if (response?.data?.response) {
                content = response.data.response;
            } else if (response?.response) {
                content = response.response;
            } else {
                content = "Hmph! I got your message but something's not working right. Try asking me again, baka!";
            }

            addMessage({
                id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: content,
                isUser: false,
                timestamp: new Date()
            });

            console.log('✅ Sync chat completed successfully');

            // Update personality if available
            if (response?.data?.personality || response?.personality) {
                setRinPersonality(response.data?.personality || response.personality);
            }

        } catch (error) {
            console.error('❌ Sync chat error:', error);
            throw error;
        }
    };

    const clearChat = async () => {
        if (!user?.id) {
            console.warn('⚠️ Cannot clear chat - user not authenticated');
            // Still clear local state even if we can't call the API
            setMessages([]);
            setRinPersonality(null);
            hasWelcomeMessageRef.current = false;
            
            // Generate new session ID but keep conversation ID
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('chatSessionId', newSessionId);
            }
            return;
        }

        try {
            console.log('🧹 Clearing chat history:', { conversationId, userId: user.id, sessionId });
            await aiChatApi.clearChatHistory(conversationId, user.id, sessionId);
            console.log('✅ Chat history cleared successfully');
        } catch (error: any) {
            console.error('❌ Error clearing chat history (non-critical):', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Don't block the UI - clearing chat history is not critical
            // The local state will still be cleared below
            if (error.response?.status === 500) {
                console.warn('⚠️ Backend chat history API seems unavailable, clearing local state only');
            }
        }
        
        // Clear local conversation state but keep persistent conversation ID
        setMessages([]);
        setRinPersonality(null);
        
        // Generate new session ID but preserve persistent conversation ID
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('chatSessionId', newSessionId);
        }
        // Note: We DON'T change conversationId for persistent conversations
        
        // Reset welcome message flag to show fresh welcome
        hasWelcomeMessageRef.current = false;
        
        // Show new welcome message after clearing
        setTimeout(() => {
            if (!hasWelcomeMessageRef.current) {
                showWelcomeMessage();
                hasWelcomeMessageRef.current = true;
            }
        }, 500);
        
        console.log('🧹 Chat cleared with persistent conversation:', { newSessionId, conversationId });
    };

    const getEnvironmentalTip = async () => {
        setIsLoading(true);
        try {
            const response = await aiChatApi.getEnvironmentalTips();
            let tipContent = '';
            
            if (response?.data?.tip) {
                tipContent = response.data.tip;
            } else if (response?.tip) {
                tipContent = response.tip;
            } else {
                tipContent = "Hmph! Here's a basic tip: start measuring your carbon footprint properly! It's not rocket science, baka!";
            }

            addMessage({
                id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: tipContent,
                isUser: false,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error getting environmental tip:', error);
            addMessage({
                id: `tip_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: "Tch! I had trouble getting an environmental tip right now... But here's one anyway: Stop wasting energy on pointless questions and start focusing on real sustainability practices!",
                isUser: false,
                timestamp: new Date()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Show authentication helper UI if user is not authenticated
    if (!user || !user.id) {
        return (
            <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Floating orbs */}
                    <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-float"></div>
                    <div className="absolute top-20 right-20 w-24 h-24 bg-green-200/40 rounded-full blur-lg animate-float-delayed"></div>
                    <div className="absolute bottom-20 left-20 w-28 h-28 bg-teal-200/35 rounded-full blur-xl animate-float-slow"></div>
                    <div className="absolute bottom-10 right-10 w-20 h-20 bg-emerald-300/25 rounded-full blur-lg animate-float"></div>
                    
                    {/* Sparkles */}
                    <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-emerald-400/60 rounded-full animate-ping"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-500/50 rounded-full animate-bounce"></div>
                    <div className="absolute top-2/3 right-1/5 w-4 h-4 bg-teal-400/40 rounded-full animate-pulse"></div>
                    
                    {/* Geometric shapes */}
                    <div className="absolute top-1/5 left-1/5 w-8 h-8 border-2 border-emerald-300/30 rotate-45 animate-spin-slow"></div>
                    <div className="absolute bottom-1/5 right-1/5 w-6 h-6 border-2 border-green-300/25 -rotate-45 animate-spin-slow"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 border-b border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <RinImage size="md" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Rin Kazuki</h2>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-red-500 font-medium">Authentication Required</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Authentication Message */}
                <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                    <div className="max-w-lg w-full">
                        {/* Character Card */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden mb-8 transform hover:scale-105 transition-all duration-500">
                            {/* Character Image Section */}
                            <div className="relative h-96 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 flex items-center justify-center overflow-hidden">
                                {/* Animated background elements */}
                                <div className="absolute inset-0">
                                    <div className="absolute top-4 left-4 w-12 h-12 bg-emerald-200/60 rounded-full animate-pulse"></div>
                                    <div className="absolute top-8 right-8 w-8 h-8 bg-green-200/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-8 left-8 w-16 h-16 bg-teal-200/60 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                                    <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-300/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                                
                                {/* Rin's Character Image */}
                                <div className="relative z-10 text-center">
                                    <div className="w-56 h-72 mx-auto relative">
                                        <RinImage size="xl" className="mx-auto" />
                                        
                                        {/* Enhanced floating sparkles */}
                                        <div className="absolute -top-3 -left-3 w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                                        <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s' }}></div>
                                        <div className="absolute -bottom-3 -right-3 w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1.5s' }}></div>
                                    </div>
                                </div>
                                
                                {/* Additional floating elements */}
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    <div className="absolute top-8 left-8 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                                    <div className="absolute top-16 right-16 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute bottom-16 left-16 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-8 right-8 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="p-8 text-center">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        🔐 Authentication Required
                                    </h3>
                                    <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        Hmph! You need to be properly logged in to chat with me, baka! 
                                        I'm not just going to let anyone access my environmental expertise!
                                    </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    <button
                                        onClick={() => refreshAuth()}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
                                    >
                                        <div className="flex items-center justify-center space-x-3">
                                            <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>🔄 Try to Refresh Authentication</span>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
                                    >
                                        <div className="flex items-center justify-center space-x-3">
                                            <span>🔑 Go to Login Page</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>

                                {/* Tsundere Quote */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-l-4 border-emerald-400">
                                    <p className="text-sm text-gray-700 italic">
                                        "It's not like I want you to log in or anything... but I can't help you with sustainability 
                                        unless you're properly authenticated, baka! 💚"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Debug Info - Collapsible */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
                            <details className="group">
                                <summary className="px-6 py-4 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center justify-between">
                                    <span className="font-semibold text-emerald-800">🔧 Debug Information</span>
                                    <svg className="w-5 h-5 text-emerald-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="px-6 pb-4 space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                                        <span className="text-sm font-medium text-gray-600">User State:</span>
                                        <span className={`text-sm font-semibold ${user === undefined ? 'text-yellow-600' : user === null ? 'text-red-600' : 'text-green-600'}`}>
                                            {user === undefined ? 'Loading...' : user === null ? 'Not authenticated' : 'Authenticated'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                                        <span className="text-sm font-medium text-gray-600">Access Token:</span>
                                        <span className={`text-sm font-semibold ${typeof window !== 'undefined' && localStorage.getItem('accessToken') ? 'text-green-600' : 'text-red-600'}`}>
                                            {typeof window !== 'undefined' && localStorage.getItem('accessToken') ? '✓ Present' : '✗ Missing'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm font-medium text-gray-600">Refresh Token:</span>
                                        <span className={`text-sm font-semibold ${typeof window !== 'undefined' && localStorage.getItem('refreshToken') ? 'text-green-600' : 'text-red-600'}`}>
                                            {typeof window !== 'undefined' && localStorage.getItem('refreshToken') ? '✓ Present' : '✗ Missing'}
                                        </span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Custom CSS for animations */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-15px); }
                    }
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-float { animation: float 6s ease-in-out infinite; }
                    .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
                    .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
                    .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <RinImage size="md" />
                        <div>
                            <h2 className="font-semibold text-gray-900">Rin Kazuki</h2>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-500">Online</span>
                                {/* Debug: Show authentication status */}
                                {user?.id ? (
                                    <span className="text-xs text-green-600 ml-2">✓ Auth: {user.id}</span>
                                ) : (
                                    <span className="text-xs text-red-600 ml-2">✗ Not authenticated</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Mode Toggle */}
                        <button
                            onClick={() => setStreamingMode(streamingMode === 'streaming' ? 'sync' : 'streaming')}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                streamingMode === 'streaming' 
                                    ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' 
                                    : 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                            }`}
                        >
                            {streamingMode === 'streaming' ? (
                                <><WifiIcon className="w-4 h-4 inline mr-2" /> Live</>
                            ) : (
                                <><CpuChipIcon className="w-4 h-4 inline mr-2" /> Instant</>
                            )}
                        </button>
                        
                        <button
                            onClick={clearChat}
                            disabled={isLoading}
                            className="p-3 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                            title="Clear Chat"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area - Scrollable only inside this container */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto px-4 py-6 space-y-4 chat-scrollbar">
                    {/* Loading Chat History Indicator */}
                    {isLoadingHistory && (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center space-x-3 text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                <span className="text-sm">Loading your conversation history with Rin...</span>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            {/* Bot Message - Left Side */}
                            {!message.isUser && (
                                <div className="flex items-start space-x-3 max-w-2xl">
                                    <RinImage size="sm" />
                                    <div className="bg-white rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-gray-100">
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                            {message.isStreaming && (
                                                <span className="inline-block w-1 h-4 bg-green-500 ml-1 animate-pulse"></span>
                                            )}
                                        </p>
                                        <div className="text-xs text-gray-400 mt-2">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Message - Right Side */}
                            {message.isUser && (
                                <div className="flex items-start space-x-3 max-w-2xl">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl rounded-tr-md px-6 py-4 shadow-sm">
                                        <p className="text-white leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        <div className="text-xs text-green-100 mt-2 text-right">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-medium">
                                            {user?.firstName?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start space-x-3 max-w-2xl">
                                <RinImage size="sm" />
                                <div className="bg-white rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {streamingMode === 'streaming' ? 'Rin is typing...' : 'Rin is thinking...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
                {/* Quick Actions */}
                <div className="flex space-x-2 mb-3">
                    <button
                        onClick={getEnvironmentalTip}
                        disabled={isLoading}
                        className="flex items-center px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full text-sm transition-all font-medium"
                    >
                        <LightBulbIcon className="w-4 h-4 mr-1" />
                        Eco Tip
                    </button>
                    <button
                        onClick={() => {/* Add sustainability facts */}}
                        disabled={isLoading}
                        className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm transition-all font-medium"
                    >
                        <SparklesIcon className="w-4 h-4 mr-1" />
                        Fun Facts
                    </button>
                </div>

                {/* Message Input */}
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Message Rin about sustainability..."
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white resize-none transition-all text-gray-900 placeholder-gray-500"
                                style={{ minHeight: '52px', maxHeight: '120px' }}
                                disabled={isLoading}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Helpful Hints */}
                <div className="mt-2 text-xs text-gray-400 text-center">
                    Ask about carbon footprints, renewable energy, or sustainable practices
                </div>
            </div>

            <style jsx>{`
                /* Custom scrollbar only for chat area */
                .chat-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E0;
                    border-radius: 3px;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #A0AEC0;
                }
                
                /* Firefox scrollbar */
                .chat-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #CBD5E0 transparent;
                }
                
                /* Animation utilities */
                @keyframes slide-in-from-bottom {
                    from {
                        transform: translateY(10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-in {
                    animation: slide-in-from-bottom 0.3s ease-out;
                }
            `}</style>
        </div>
    );
} 