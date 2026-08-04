import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
  className = "",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const yOffset = direction === "up" ? 24 : direction === "down" ? -24 : 0;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
