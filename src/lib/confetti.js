// src/lib/confetti.js
// Confettis dorés pour célébrer un code promo ou une commande (clin d'œil au site de référence).
// Implémentation autonome sur <canvas> : aucune dépendance, aucun état React.
//
// Accessibilité : le canvas est décoratif (aria-hidden, pointer-events: none) et l'animation
// n'est PAS lancée si l'utilisateur a demandé de réduire les animations (prefers-reduced-motion).

const COLORS = ['#d4a017', '#e6b422', '#f3e9d7', '#9b6bd1', '#2aa6a6'];

export function launchConfetti({ count = 140, duration = 2600 } = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // ne bloque aucun clic
    zIndex: '100',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Chaque particule part du haut de l'écran avec une vitesse et une rotation aléatoires
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    size: 6 + Math.random() * 6,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3.5,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fondu de fin : les confettis disparaissent doucement pendant la dernière demi-seconde
    ctx.globalAlpha = Math.max(0, Math.min(1, (duration - elapsed) / 500));

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    if (elapsed < duration) requestAnimationFrame(frame);
    else canvas.remove(); // nettoyage : on retire le canvas du DOM
  }
  requestAnimationFrame(frame);
}
