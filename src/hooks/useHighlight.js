import { useCallback } from "react";

/*
  Thin wrapper around the global window.hljs loaded via CDN.
  Returns a highlight() function any component can call.
*/
export default function useHighlight() {
  const highlight = useCallback((code, language = "javascript") => {
    if (!window.hljs) return null; // CDN hasn't loaded yet

    try {
      return window.hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      }).value;
    } catch {
      return null; // unknown language — caller will use fallback
    }
  }, []);

  return { ready: !!window.hljs, highlight };
}
