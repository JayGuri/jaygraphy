"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CameraLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 1400);
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
            initial={{ scale: 1.6, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-52 h-52 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-blue-400/10 border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.25)]"
          >
            <div className="absolute inset-6 rounded-full bg-black/70 border border-white/10" />
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/20 blur-2xl" />
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "linear", delay: i * 0.1 }}
                className="absolute inset-7 border-t border-white/10 rounded-full"
              />
            ))}
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: [1.2, 0.9, 1.05, 1] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-14 rounded-full bg-[#0a0e17] border border-white/10 shadow-inner"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute inset-20 rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-teal-400/30 backdrop-blur-xl flex items-center justify-center text-white text-xs tracking-[0.3em]"
            >
              F/1.8
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CameraLoader;
