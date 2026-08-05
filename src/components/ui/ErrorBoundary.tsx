// src/components/ui/ErrorBoundary.tsx
// React error boundary — catches render errors and shows a diagnostic panel.
// Without this, any unhandled component error unmounts the entire React tree,
// leaving users staring at a blank page with no clue what went wrong.

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-bone p-8"
          role="alert"
        >
          <div className="max-w-lg w-full bg-white border border-clay/30 rounded-lg p-6">
            <h1 className="font-serif text-xl font-semibold text-clay mb-3">
              Something went wrong
            </h1>
            <div className="bg-clay/5 border border-clay/20 rounded p-4 mb-4 overflow-auto max-h-48">
              <pre className="font-mono text-xs text-charcoal/80 whitespace-pre-wrap break-words">
                {this.state.error?.message ?? 'Unknown error'}
              </pre>
            </div>
            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="font-mono text-xs text-charcoal/50 cursor-pointer hover:text-ink">
                  Component stack trace
                </summary>
                <pre className="mt-2 font-mono text-[10px] text-charcoal/40 whitespace-pre-wrap max-h-48 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-charcoal text-white font-mono text-sm rounded
                hover:bg-charcoal/90 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
