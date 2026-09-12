import { Suspense, lazy, useEffect, useState } from "react";

const Hero3D = lazy(() => import("@/components/Hero3D"));

/**
 * Client-only mount for the decorative hero 3D layer.
 * Skipped on small screens and when the user prefers reduced motion.
 */
export function Hero3DMount() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setShow(!reduced && wide);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  );
}
