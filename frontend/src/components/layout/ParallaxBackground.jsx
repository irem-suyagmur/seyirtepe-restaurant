import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ParallaxBackground = memo(() => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableImage, setEnableImage] = useState(false);

  const saveData =
    typeof navigator !== 'undefined' &&
    navigator.connection &&
    navigator.connection.saveData;

  const enableAnimations = !prefersReducedMotion && !saveData;

  // Parallax effect based on scroll
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  // Defer background image loading until the browser is idle / after first paint.
  useEffect(() => {
    if (!enableAnimations) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setEnableImage(true);
    };

    // requestIdleCallback isn't supported everywhere (e.g. older Safari)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enable, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timeoutId = window.setTimeout(enable, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enableAnimations]);

  // Mouse parallax effect with throttling (only on fine pointer devices)
  useEffect(() => {
    if (!enableAnimations) return;

    const hasFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer:fine)').matches;
    if (!hasFinePointer) return;

    let rafId = null;
    let lastTime = 0;
    const throttleMs = 100; // Throttle to 10fps for mouse movement

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        setMousePosition({
          x: (clientX - centerX) / 50,
          y: (clientY - centerY) / 50,
        });
        lastTime = now;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enableAnimations]);

  const particles = useMemo(() => {
    if (!enableAnimations) return [];

    const count = 10;
    return [...Array(count)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, [enableAnimations]);

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=60";

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/30 to-red-900/20"
        animate={
          enableAnimations
            ? {
                background: [
                  'linear-gradient(to bottom right, rgba(120, 53, 15, 0.2), rgba(154, 52, 18, 0.3), rgba(127, 29, 29, 0.2))',
                  'linear-gradient(to bottom right, rgba(154, 52, 18, 0.3), rgba(127, 29, 29, 0.2), rgba(120, 53, 15, 0.2))',
                  'linear-gradient(to bottom right, rgba(120, 53, 15, 0.2), rgba(154, 52, 18, 0.3), rgba(127, 29, 29, 0.2))',
                ],
              }
            : undefined
        }
        transition={
          enableAnimations
            ? {
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />

      {/* Main Background Image - Amik Ovası */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={enableAnimations ? { type: 'spring', stiffness: 50 } : undefined}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: enableImage ? `url('${backgroundImageUrl}')` : 'none',
            filter: 'brightness(0.4) contrast(1.1)',
            backgroundColor: '#0b0b0b',
          }}
        />
        
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full blur-sm"
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';

export default ParallaxBackground;
