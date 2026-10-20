"use client";

// Content rises in as it scrolls into view, once. For people who ask for less motion, MotionConfig below
// drops the rise and keeps only a short fade.
import { motion, MotionConfig } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article" | "figure";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
