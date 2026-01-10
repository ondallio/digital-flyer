import { useState, useCallback } from 'react';

export function useToast(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, showToast, hideToast };
}
