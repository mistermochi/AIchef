
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * @component ErrorBoundary
 * @description Catches Javascript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-danger-container/20 rounded-full flex items-center justify-center text-danger">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-content dark:text-content-dark">Something went wrong</h2>
            <p className="text-sm text-content-secondary dark:text-content-secondary-dark leading-relaxed">
              An unexpected error occurred in the application. We've been notified and are looking into it.
            </p>
            {this.state.error && (
              <div className="mt-4 p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark text-left overflow-auto max-h-32">
                <code className="text-xs font-mono text-danger dark:text-danger-dark whitespace-pre-wrap">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
          </div>
          <Button
            onClick={this.handleReset}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
