// Enhanced error.tsx
'use client';

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="error-container">
      <h2>⚠️ Oops! Something went wrong</h2>
      <p>{error.digest ? `Error ID: ${error.digest}` : error.message}</p>
      <div className="error-actions">
        <button onClick={reset}>Try again</button>
        <button onClick={() => (window.location.href = '/')}>
          Go to homepage
        </button>
      </div>
    </div>
  );
}