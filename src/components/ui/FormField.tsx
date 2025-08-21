"use client"

import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FormFieldProps {
    label: string;
    id?: string;
    name?: string;
    type: string;
    value: string;
    onChange: ((value: string) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void);
    required?: boolean;
    autoComplete?: string;
    description?: string;
    error?: string;
    placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    name,
    type,
    value,
    onChange,
    required = false,
    autoComplete = '',
    description = '',
    error = '',
    placeholder = ''
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Support both patterns: (value: string) => void and (e: ChangeEvent) => void
        const firstParam = e.target.value;
        try {
            // Try calling with just the value
            (onChange as (value: string) => void)(firstParam);
        } catch {
            // Fallback to event-based onChange
            (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
        }
    };

    const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {error && (
                    <span className="text-xs text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {error}
                    </span>
                )}
            </div>

            <input
                id={fieldId}
                name={name || fieldId}
                type={type}
                autoComplete={autoComplete}
                required={required}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`block w-full px-3 py-2 border ${
                    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                        'border-gray-300 focus:ring-green-500 focus:border-green-500'
                } rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors`}
            />

            {description && !error && (
                <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
        </div>
    );
};

export default FormField;