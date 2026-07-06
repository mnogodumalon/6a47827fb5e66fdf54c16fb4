/// <reference types="react" />

// React 18+ moved JSX out of the global namespace into React.JSX.
// `declare global { namespace JSX { ... } }` silently no-ops on this version,
// so the ambient declaration lives under the React namespace instead.
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        challengeurl?: string;
        auto?: string;
        hidelogo?: boolean;
        hidefooter?: boolean;
      }, HTMLElement>;
    }
  }
}
