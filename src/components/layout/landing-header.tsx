"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Navigation Items
const navItems = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-4 md:px-8",
        scrolled ? "pt-2" : "pt-6"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* --- LEFT: Logo --- */}
        <div className="flex items-center gap-2 z-50">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl">
            {/* Using your uploaded logo image */}
            <Image 
              src="/icon.jpg" 
              alt="MarketVision Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-white hidden sm:block">
            MarketVision
          </span>
        </div>

        {/* --- CENTER: Floating Pill Navigation (Desktop) --- */}
        <nav className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-lg shadow-cyan-500/5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: CTA Button --- */}
        <div className="hidden md:flex items-center gap-4 z-50">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button 
              className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] font-semibold px-6"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* --- MOBILE: Toggle --- */}
        <button 
          className="md:hidden z-50 p-2 text-zinc-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- MOBILE: Menu Overlay --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-4 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden flex flex-col gap-4 pt-20 pb-8 shadow-2xl"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-center text-zinc-300 hover:text-cyan-400"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px w-full bg-white/10 my-2" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-zinc-300">Log In</Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-pink-600">
                Get Started
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}