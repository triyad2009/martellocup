import { motion } from "framer-motion";
import { Star } from "lucide-react";

/** Animated Season 10 badge shown across the site. */
export function Season10Badge({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 14 }}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-display font-black text-[10px] sm:text-xs tracking-widest shadow-glow-gold ${className}`}
      style={{
        backgroundSize: "200% 200%",
      }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <Star className="relative h-3 w-3 fill-current" />
      <span className="relative">SEASON 10</span>
    </motion.div>
  );
}
