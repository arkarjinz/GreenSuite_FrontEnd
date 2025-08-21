"use client"
import { useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, ChatBubbleLeftRightIcon, LightBulbIcon, AcademicCapIcon, HeartIcon, GlobeAltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import RinCharacterCard from '@/components/ai/RinCharacterCard';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AIChatLandingPage() {
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
    const { isLoading } = useAuth();

    // Show loading spinner during auth transitions (like logout)
    if (isLoading) {
        return <LoadingSpinner />;
    }

    const features = [
        {
            icon: ChatBubbleLeftRightIcon,
            title: "Real-time Streaming",
            description: "Experience conversations that flow naturally with Rin's responses appearing in real-time",
            color: "text-green-500",
            bgColor: "bg-green-50"
        },
        {
            icon: AcademicCapIcon,
            title: "Expert Knowledge",
            description: "Access world-class environmental expertise on sustainability, carbon footprints, and green practices",
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            icon: HeartIcon,
            title: "Tsundere Personality",
            description: "Interact with Rin's unique tsundere character - caring but reluctant to show it",
            color: "text-red-500",
            bgColor: "bg-red-50"
        },
        {
            icon: GlobeAltIcon,
            title: "Environmental Focus",
            description: "Get specialized advice on environmental sustainability and green business practices",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: LightBulbIcon,
            title: "Smart Tips",
            description: "Receive personalized environmental tips and recommendations for your business",
            color: "text-yellow-500",
            bgColor: "bg-yellow-50"
        },
        {
            icon: SparklesIcon,
            title: "Interactive Experience",
            description: "Build a relationship with Rin as she remembers your conversations and adapts her responses",
            color: "text-purple-500",
            bgColor: "bg-purple-50"
        }
    ];

    const testimonials = [
        {
            text: "Rin helped us calculate our carbon footprint and suggested renewable energy solutions. Her elegant and thoughtful approach made complex environmental concepts truly meaningful.",
            author: "Sarah Chen",
            role: "Sustainability Manager"
        },
        {
            text: "The streaming chat feature is amazing! It feels like talking to a wise environmental mentor who genuinely cares about our planet's future.",
            author: "Michael Rodriguez",
            role: "CEO, GreenTech Solutions"
        },
        {
            text: "Rin's expertise in environmental calculations is incredible. Her sophisticated and contemplative nature made learning about sustainability both profound and accessible.",
            author: "Emma Thompson",
            role: "Environmental Consultant"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-32 left-32 w-28 h-28 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-3 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Meet Rin Kazuki
                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                            Your environmental sustainability teacher with a tsundere personality inspired by Mai Sakurajima. 
                            Get expert advice on carbon footprints, renewable energy, and sustainable practices through 
                            an engaging, interactive chat experience.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link href="/ai-chat">
                                <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex items-center space-x-2">
                                    <span>Start Chatting</span>
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link href="/ai-chat/test">
                                <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl border border-green-200">
                                    Test API
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Character Showcase */}
                    <div className="flex justify-center mb-20">
                        <RinCharacterCard className="max-w-md" />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Rin?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Experience the future of environmental consulting with our AI-powered sustainability expert
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                                    hoveredFeature === index ? 'shadow-xl scale-105' : 'shadow-lg'
                                } ${feature.bgColor}`}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Users Say</h2>
                        <p className="text-lg text-gray-600">Discover how Rin is helping businesses become more sustainable</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {testimonial.author.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to Meet Rin?</h2>
                    <p className="text-xl text-green-100 mb-8">
                        Start your journey towards environmental sustainability with your new AI companion
                    </p>
                    <Link href="/ai-chat">
                        <button className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex items-center space-x-2 mx-auto">
                            <span>Begin Your Conversation</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 