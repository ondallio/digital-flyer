interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export function LoadingSpinner({ size = 'md', message, fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div className="text-center">
      <div
        className={`${sizeClasses[size]} border-primary-300 border-t-primary-900 rounded-full animate-spin mx-auto`}
      />
      {message && <p className="text-primary-400 mt-2">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}
