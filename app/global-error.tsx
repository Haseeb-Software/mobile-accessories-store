"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
          <p className="max-w-sm text-sm text-ink-500">
            We hit an unexpected error. Please try again, or contact us if the problem continues.
          </p>
          <button onClick={reset} className="btn-primary">Try Again</button>
        </div>
      </body>
    </html>
  );
}
