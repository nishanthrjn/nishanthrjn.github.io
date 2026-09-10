// Native lazy loading may fetch an off-screen chat early. Load only when visible
// so an embedded app's autofocus cannot pull the initial view away from the hero.
export function loadChatFrames(root) {
  root.querySelectorAll('iframe[data-chat-src]').forEach(frame => {
    frame.loading = 'eager';
    frame.src = frame.dataset.chatSrc;
    delete frame.dataset.chatSrc;
  });
}

export function initChatEmbeds() {
  const chat = document.querySelector('#chatbot .hf-embed');
  if (!chat) return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      loadChatFrames(chat);
      observer.disconnect();
    }
  }, {threshold: 0});
  observer.observe(chat);
}
