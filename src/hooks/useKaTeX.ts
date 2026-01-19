import { useRef, useEffect, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { convertToKaTeX } from "../core/calculations";

export function useKaTeX(input: string): [string, React.RefObject<HTMLDivElement | null>] {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (!input) return '';
    const latex = convertToKaTeX(input);
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return '';
    }
  }, [input]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !html) return;

    const parent = container.parentElement;
    if (!parent) return;

    const adjustScale = () => {
      container.style.transform = 'scale(1)';

      requestAnimationFrame(() => {
        const parentWidth = parent.clientWidth - 16;
        const contentWidth = container.scrollWidth;

        if (contentWidth > parentWidth) {
          const scale = parentWidth / contentWidth;
          container.style.transform = `scale(${scale})`;
        }
      });
    };

    const observer = new ResizeObserver(() => {
      adjustScale();
    });
    observer.observe(container);
    adjustScale();
    
    return () => observer.disconnect();
  }, [html]);

  return [html, containerRef];
}
