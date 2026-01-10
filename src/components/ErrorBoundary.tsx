import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mobile-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-xl font-semibold mb-2">문제가 발생했습니다</h1>
          <p className="text-primary-500 mb-4">
            죄송합니다. 예상치 못한 오류가 발생했습니다.
          </p>
          <button onClick={this.handleRetry} className="btn btn-primary">
            다시 시도
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 p-4 bg-red-50 rounded text-left text-xs text-red-600 overflow-auto max-w-full">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
