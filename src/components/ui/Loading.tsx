"use client";

import React from 'react';

export const Loading = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Calculating your carbon footprint...</h2>
        <p className="text-gray-600 mt-2">This may take a few moments</p>
      </div>
    </div>
  );
};