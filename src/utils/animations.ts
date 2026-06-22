export const tearAnimation = `
@keyframes tearOut {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.95) rotate(2deg); opacity: 0.7; }
  100% { transform: scale(0.8) rotate(-3deg) translateY(20px); opacity: 0; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-tear-out {
  animation: tearOut 0.3s ease-out forwards;
}

.animate-slide-in {
  animation: slideIn 0.2s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

.animate-pulse-once {
  animation: pulse 0.3s ease-out;
}
`;

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getAnimationClass = (animation: string): string => {
  return prefersReducedMotion() ? '' : animation;
};
