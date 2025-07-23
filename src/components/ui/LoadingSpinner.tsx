import React from 'react';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;