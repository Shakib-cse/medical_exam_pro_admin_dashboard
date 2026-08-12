"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10, scale: 0.998 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full h-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
