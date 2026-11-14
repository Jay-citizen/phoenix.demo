// Chapter voice-over: each page's LISTEN button plays its own chapterN.mp3
// (the file name comes from the button's data-audio attribute in index.html).
(() => {
  const audio = new Audio();
  audio.preload = 'none';

  const LABELS = { idle: 'LISTEN', playing: 'PAUSE', paused: 'RESUME', error: 'NO AUDIO' };
  let activeButton = null;

  function render(btn, state) {
    btn.dataset.state = state;
    btn.setAttribute('aria-pressed', String(state === 'playing'));
    btn.querySelector('.listen-text').textContent = LABELS[state];
    if (state === 'idle') btn.style.setProperty('--progress', '0%');
  }

  // Stop whatever is playing and reset its button.
  function stop() {
    audio.pause();
    if (activeButton) render(activeButton, 'idle');
    activeButton = null;
  }

  document.querySelectorAll('.listen-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Same chapter: toggle pause / resume.
      if (activeButton === btn && btn.dataset.state !== 'error') {
        if (audio.paused) audio.play(); else audio.pause();
        return;
      }
      // Different chapter (or retry after an error): start fresh.
      stop();
      activeButton = btn;
      audio.src = btn.dataset.audio;
      audio.play().catch((err) => {
        if (err.name !== 'AbortError' && activeButton === btn) render(btn, 'error');
      });
    });
  });

  audio.addEventListener('play', () => { if (activeButton) render(activeButton, 'playing'); });
  audio.addEventListener('pause', () => {
    if (activeButton && audio.paused && !audio.ended) render(activeButton, 'paused');
  });
  audio.addEventListener('timeupdate', () => {
    if (activeButton && audio.duration) {
      activeButton.style.setProperty('--progress', (audio.currentTime / audio.duration) * 100 + '%');
    }
  });
  audio.addEventListener('ended', stop);
  audio.addEventListener('error', () => { if (activeButton) render(activeButton, 'error'); });

  // Turning to another page stops the voice.
  document.querySelectorAll('.page-toggle').forEach((radio) => radio.addEventListener('change', stop));
})();
