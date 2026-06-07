"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp } from "./config";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeIn({
  delay = 0,
  children,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={fadeUp}
      {...props}
    >
      {children}
    </motion.div>
  );
}
