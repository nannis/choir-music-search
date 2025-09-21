interface ErrorAlertProps {
  error: string;
}

/**
 * ErrorAlert component displays error messages with proper ARIA attributes
 * Provides accessible error reporting for screen readers
 */
export const ErrorAlert = ({ error }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <div role="alert" aria-live="assertive" className="alert-error mb-5 animate-slide-up">
      <strong>Error:</strong> {error}
    </div>
  );
};
