declare module 'aos' {
  const AOS: {
    init: (config?: unknown) => void;
    refresh: () => void;
    refreshHard: () => void;
  };

  export default AOS;
}