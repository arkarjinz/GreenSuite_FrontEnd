"use client"

import React from 'react';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}>
            <div className={`animate-spin rounded-full border-t-2 border-b-2 border-green-600 ${sizeClasses[size]}`}></div>
            {size !== 'sm' && <p className="mt-4 text-gray-600">Loading...</p>}
        </div>
    );
};

export default LoadingSpinner;