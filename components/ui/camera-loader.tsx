"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CameraLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-gradient-to-br from-black via-[#05050b] to-[#0a0e17] pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0,_rgba(0,0,0,0.7)_45%)]" />
          <motion.div
            initial={{ scale: 1.5, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative w-56 h-56 rounded-full bg-gradient-to-br from-indigo-500/24 via-purple-500/18 to-blue-400/14 border border-white/15 shadow-[0_0_70px_rgba(59,130,246,0.35)]"
          >
            <div className="absolute inset-6 rounded-full bg-black/80 border border-white/15" />
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/30 blur-3xl" />
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: 0, opacity: 0.6 }}
                animate={{ rotate: 360, opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear", delay: i * 0.08 }}
                className="absolute inset-9 origin-center"
              >
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: "polygon(50% 0%, 90% 35%, 65% 100%, 35% 100%, 10% 35%)",
                    background:
                      "linear-gradient(140deg, rgba(59,130,246,0.45) 0%, rgba(124,58,237,0.45) 50%, rgba(45,212,191,0.35) 100%)",
                    filter: "drop-shadow(0 0 18px rgba(99,102,241,0.4))",
                  }}
                />
              </motion.div>
            ))}
            <motion.div
              initial={{ scale: 1.15 }}
              animate={{ scale: [1.15, 0.9, 1.02, 1] }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-16 rounded-full bg-[#05070f] border border-white/10 shadow-inner"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              className="absolute inset-22 rounded-full bg-gradient-to-br from-blue-500/45 via-purple-500/35 to-teal-400/35 backdrop-blur-xl flex items-center justify-center text-white text-[11px] tracking-[0.28em]"
            >
              FOCUS
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CameraLoader;
