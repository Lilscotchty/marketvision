// src/components/ui/odometer.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function Odometer({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (current) => current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{displayValue}</motion.span>;
}