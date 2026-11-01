// Content, links and navigation are server-rendered. Enhancement requests must
// wait for local fonts AND the headline's reveal to paint, not just window.load.
export function scheduleEnhancements(doc: Document = document, win: Window = window) {
  const start = async () => {
    await doc.fonts.ready;
    const reveals = Array.from(doc.querySelectorAll('.hero__title .w__in')).flatMap((word) =>
      (word.getAnimations?.() ?? []).map((animation) => animation.finished),
    );
    // Reduced-motion changes cancel animations; cancellation must not strand the loader.
    await Promise.allSettled(reveals);
    win.requestAnimationFrame(() =>
      win.requestAnimationFrame(() => {
        const script = doc.createElement('script');
        script.type = 'module';
        script.src = '/client/client.js';
        doc.body.append(script);
      }),
    );
  };
  if (doc.readyState === 'complete') void start();
  else win.addEventListener('load', () => void start(), { once: true });
}
