import { useRef, useEffect } from "react";

export function useEnterToFocus<T extends HTMLElement>(onClear?: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement !== ref.current) {
        e.preventDefault();
        ref.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === ref.current) {
        ref.current?.blur();
      } else if ((e.key === 'c' || e.key === 'C') && !(document.activeElement instanceof HTMLInputElement) && onClear) {
        e.preventDefault();
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  return ref;
}
