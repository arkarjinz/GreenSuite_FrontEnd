"use client"
import RinImage from './RinImage';

interface TypingIndicatorProps {
    isTyping?: boolean;
    mode?: 'streaming' | 'sync';
}

export default function TypingIndicator({ isTyping = false, mode = 'streaming' }: TypingIndicatorProps) {
    if (!isTyping) return null;

    return (
        <div className="flex space-x-4">
            <div className="flex-shrink-0">
                <RinImage size="sm" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">
                        {mode === 'streaming' ? 'Rin is typing...' : 'Rin is thinking...'}
                    </span>
                </div>
            </div>
        </div>
    );
} 