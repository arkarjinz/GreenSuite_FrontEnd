"use client"
import { useState, useEffect } from 'react';
import { SparklesIcon, HeartIcon, AcademicCapIcon, GlobeAltIcon, StarIcon, BoltIcon, ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import RinImage from './RinImage';

interface RinCharacterCardProps {
    personality?: any;
    className?: string;
}

export default function RinCharacterCard({ personality, className = "" }: RinCharacterCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);
    const [showSparkles, setShowSparkles] = useState(false);

    const quotes = [
        "The rain reminds me of nature's gentle wisdom... What meaningful environmental question shall we explore together?",
        "How lovely to contemplate the intricate beauty of our planet's ecosystems... What aspect of sustainability interests you?",
        "I find myself drawn to thoughts of environmental harmony today... Perhaps you'd like to learn about protecting our beautiful earth?",
        "There's something quite profound about understanding our role in nature's balance... What environmental topic would you find meaningful?"
    ];

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'elegantly_contemplative': return 'text-emerald-600';
            case 'sophisticatedly_professional': return 'text-blue-600';
            case 'gently_encouraging': return 'text-green-600';
            case 'warmly_invested': return 'text-teal-600';
            case 'deeply_connected': return 'text-purple-600';
            default: return 'text-emerald-500';
        }
    };

    const getMoodText = (mood: string) => {
        switch (mood) {
            case 'elegantly_contemplative': return 'Elegantly Contemplative';
            case 'sophisticatedly_professional': return 'Sophisticated & Professional';
            case 'gently_encouraging': return 'Gently Encouraging';
            case 'warmly_invested': return 'Warmly Invested';
            case 'deeply_connected': return 'Deeply Connected';
            default: return 'Gracefully Serene';
        }
    };

    const getMoodGradient = (mood: string) => {
        switch (mood) {
            case 'elegantly_contemplative': return 'from-emerald-400 to-green-500';
            case 'sophisticatedly_professional': return 'from-blue-400 to-indigo-500';
            case 'gently_encouraging': return 'from-green-400 to-emerald-500';
            case 'warmly_invested': return 'from-teal-400 to-emerald-500';
            case 'deeply_connected': return 'from-purple-400 to-indigo-500';
            default: return 'from-emerald-400 to-teal-500';
        }
    };

    // Rotate quotes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Trigger sparkles on hover
    useEffect(() => {
        if (isHovered) {
            setShowSparkles(true);
            const timer = setTimeout(() => setShowSparkles(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isHovered]);

    return (
        <div 
            className={`relative group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden transition-all duration-700 hover:shadow-3xl hover:scale-105">
                
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-teal-200/20"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%)]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.1),transparent_50%)]"></div>
                </div>

                {/* Floating Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Large orbs */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-xl animate-float"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-full blur-lg animate-float-delayed"></div>
                    <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-br from-teal-200/40 to-blue-200/40 rounded-full blur-xl animate-float-slow"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-emerald-300/40 to-green-300/40 rounded-full blur-lg animate-float"></div>
                    
                    {/* Geometric shapes */}
                    <div className="absolute top-1/4 left-1/4 w-6 h-6 border-2 border-emerald-300/30 rotate-45 animate-spin-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-4 h-4 border-2 border-teal-300/25 -rotate-45 animate-spin-slow"></div>
                    
                    {/* Sparkles */}
                    <div className="absolute top-6 left-6 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-12 left-12 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Character Image Section */}
                <div className="relative h-96 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 flex items-center justify-center overflow-hidden">
                    {/* Animated border glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
                    
                    {/* Rin's Character Image */}
                    <div className="relative z-10 text-center">
                        <div className="w-56 h-72 mx-auto relative group">
                            {/* Image container with glow effect */}
                            <div className="relative w-full h-full">
                                <RinImage size="xl" className="mx-auto drop-shadow-2xl" />
                                
                                {/* Glow effect behind image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-lg blur-2xl scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                            </div>
                            
                            {/* Enhanced floating sparkles */}
                            <div className="absolute -top-4 -left-4 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"></div>
                            <div className="absolute -top-3 -right-3 w-4 h-4 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute -bottom-3 -left-3 w-4.5 h-4.5 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1.5s' }}></div>
                            
                            {/* Hover sparkles */}
                            {showSparkles && (
                                <>
                                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                                    <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                                    <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Additional floating elements */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                        <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-20 left-20 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-10 right-10 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                </div>

                {/* Character Info */}
                <div className="relative z-10 p-8">
                    {/* Header with name and title */}
                    <div className="text-center mb-6">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Rin Kazuki
                        </h4>
                        <div className="flex items-center justify-center space-x-2">
                            <AcademicCapIcon className="w-5 h-5 text-emerald-500" />
                            <span className="text-lg font-semibold text-gray-700">Environmental Expert</span>
                            <SparklesIcon className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mt-3">
                            A sophisticated 27-year-old environmental sustainability teacher with an elegant, contemplative personality. 
                            Graceful and thoughtful, she guides students with refined wisdom and poetic insights about our planet.
                        </p>
                    </div>

                    {/* Personality Stats */}
                    {personality && (
                        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700 flex items-center">
                                    <HeartIcon className="w-4 h-4 mr-2 text-red-500" />
                                    Relationship Level
                                </span>
                                <span className={`text-sm font-bold ${getMoodColor(personality.mood)}`}>
                                    {personality.relationship_level}/100
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                                <div 
                                    className={`h-3 bg-gradient-to-r ${getMoodGradient(personality.mood)} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                    style={{ width: `${personality.relationship_level}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Mood</span>
                                <span className={`text-sm font-semibold ${getMoodColor(personality.mood)} flex items-center`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${getMoodColor(personality.mood).replace('text-', 'bg-')}`}></div>
                                    {getMoodText(personality.mood)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Character Traits Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-emerald-100 hover:bg-white/80 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                <AcademicCapIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">Expert Knowledge</div>
                                <div className="text-xs text-gray-500">PhD in Environmental Science</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-emerald-100 hover:bg-white/80 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                <HeartIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">Elegant</div>
                                <div className="text-xs text-gray-500">Refined & sophisticated</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-emerald-100 hover:bg-white/80 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                <GlobeAltIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">Environmental</div>
                                <div className="text-xs text-gray-500">Sustainability focus</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-emerald-100 hover:bg-white/80 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">Passionate</div>
                                <div className="text-xs text-gray-500">Deeply caring</div>
                            </div>
                        </div>
                    </div>

                    {/* Animated Quote */}
                    <div className="relative p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-l-4 border-emerald-400 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-start space-x-2">
                                <SparklesSolid className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                    "{quotes[currentQuote]}"
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex space-x-1">
                                    {quotes.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                index === currentQuote 
                                                    ? 'bg-emerald-400 scale-125' 
                                                    : 'bg-emerald-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-emerald-600 font-medium">💚 Rin</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-3xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-200/30 to-transparent rounded-tr-3xl"></div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-5deg); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(3deg); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
            `}</style>
        </div>
    );
} 