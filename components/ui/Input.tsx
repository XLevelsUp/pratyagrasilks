import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, rightIcon, id, className = '', name, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const inputName = name || id;

        const base = 'w-full px-4 py-2 border rounded-md outline-none transition-colors focus:ring-2';
        const state = error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300 focus:ring-primary focus:border-primary';
        const needsWrapper = !!icon || !!rightIcon;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                {needsWrapper ? (
                    <div className="relative">
                        {icon && (
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                {icon}
                            </span>
                        )}
                        <input
                            ref={ref}
                            id={inputId}
                            name={inputName}
                            className={`${base} ${state} ${icon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
                            {...props}
                        />
                        {rightIcon && (
                            <span className="absolute inset-y-0 right-0 flex items-center">
                                {rightIcon}
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        ref={ref}
                        id={inputId}
                        name={inputName}
                        className={`${base} ${state} ${className}`}
                        {...props}
                    />
                )}
                <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">{error ?? ''}</p>
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
