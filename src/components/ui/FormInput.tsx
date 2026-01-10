import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, hint, error, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="text-sm text-primary-500 mb-1 block">{label}</label>
        )}
        <input
          ref={ref}
          className={`input ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-primary-400 mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
