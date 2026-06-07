"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { pageEnter } from "./config";

export function PageEnter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={pageEnter}
    >
      {children}
    </motion.div>
  );
}
