import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fade out the pre-bundle boot frame once React has painted.
const boot = document.getElementById('boot');
if (boot) {
  requestAnimationFrame(() => {
    boot.classList.add('is-done');
    setTimeout(() => boot.remove(), 500);
  });
}
