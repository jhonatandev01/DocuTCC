import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
  useEffect(() => {
    // A animação leva cerca de 2.8 segundos no total
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[150] bg-slate-900 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Background ambient glow */}
      <motion.div 
        className="absolute w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: 0.2 
          }}
          className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl shadow-amber-500/40 mb-6"
        >
          <BookOpen className="w-12 h-12 text-white" strokeWidth={2.5} />
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -10, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -top-3 -right-3 bg-slate-900 rounded-full p-1.5 border-2 border-slate-900 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </motion.div>
        </motion.div>

        <motion.h1 
          className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          Docu<span className="text-amber-400">TCC</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
          className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-4 max-w-[200px]"
        />

        <motion.p
          className="text-slate-400 text-sm sm:text-base font-medium tracking-[0.2em] uppercase text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Plataforma Acadêmica
        </motion.p>
      </div>
    </motion.div>
  );
}
