import { useRef, useEffect } from "react";

export function useEnterToFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement !== ref.current) {
        e.preventDefault();
        ref.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return ref;
}
