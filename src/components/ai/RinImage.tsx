"use client"
import Image from 'next/image';
import { useState } from 'react';

interface RinImageProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function RinImage({ size = 'md', className = "" }: RinImageProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16', 
        lg: 'w-24 h-24',
        xl: 'w-48 h-64'
    };

    const imageClasses = {
        sm: 'w-8 h-8 rounded-full',
        md: 'w-16 h-16 rounded-full',
        lg: 'w-24 h-24 rounded-full', 
        xl: 'w-48 h-64 rounded-lg'
    };

    return (
        <div className={`${sizeClasses[size]} ${className} flex-shrink-0`}>
            <Image
                src="/images/rin1.png"
                alt="Rin Kazuki"
                width={size === 'xl' ? 192 : size === 'lg' ? 96 : size === 'md' ? 64 : 32}
                height={size === 'xl' ? 256 : size === 'lg' ? 96 : size === 'md' ? 64 : 32}
                className={`${imageClasses[size]} object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                priority={size === 'xl'}
            />
            
            {/* Simple loading fallback */}
            {!imageLoaded && (
                <div className={`${imageClasses[size]} bg-gray-200 flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
} 