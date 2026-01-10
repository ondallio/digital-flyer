import { useRef, useCallback } from 'react';

interface UseImageUploadOptions {
  onUpload: (dataUrl: string) => void;
  accept?: string;
}

export function useImageUpload({ onUpload, accept = 'image/*' }: UseImageUploadOptions) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input for same file re-selection
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onUpload]);

  return { inputRef, openPicker, handleChange, accept };
}
