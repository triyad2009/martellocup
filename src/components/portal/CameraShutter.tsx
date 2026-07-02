import { motion, AnimatePresence } from "framer-motion";
import { useSiteLogo } from "@/lib/settings";

/**
 * Camera lens iris opening animation.
 * 8 blades pivot outward from center, then fade out, revealing content behind.
 */
export function CameraShutter({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const LOGO = useSiteLogo();
  const BLADES = 10;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onAnimationComplete={(def: any) => {
            if (def === "exit" || def?.opacity === 0) onDone?.();
          }}
        >
          {/* outer ring glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.95) 45%, #000 100%)",
            }}
          />

          {/* Blades */}
          <div className="relative w-[220vmax] h-[220vmax]">
            {Array.from({ length: BLADES }).map((_, i) => {
              const angle = (360 / BLADES) * i;
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-bottom"
                  style={{
                    width: "60vmax",
                    height: "110vmax",
                    background: "linear-gradient(180deg, #0b0b0b 0%, #1a1a1a 60%, #262626 100%)",
                    borderLeft: "1px solid rgba(255,255,255,0.06)",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    transformOrigin: "50% 100%",
                    clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                  }}
                  initial={{ rotate: angle, x: "-50%", y: "-100%", scale: 1 }}
                  animate={{ rotate: angle + 45, scale: 0.05 }}
                  transition={{ duration: 1.1, delay: 0.15, ease: [0.7, 0, 0.3, 1] }}
                />
              );
            })}
          </div>

          {/* Center logo pulse */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.05, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.35, 1] }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/40 blur-3xl scale-150" />
              <img
                src={LOGO}
                alt=""
                className="relative h-24 w-24 rounded-full ring-4 ring-primary/60 shadow-2xl object-cover"
              />
            </div>
          </motion.div>

          {/* Aperture number ticker */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-primary/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4 }}
          >
            f/1.4 · MARTELLO · UNLOCKED
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
