"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, Star } from "lucide-react";

export const SpotlightHero = ({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-[#0c1324]">
      {/* Absolute background effects - The "Neon Observatory" */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#3c0091]/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#00668a]/20 blur-[100px]" />

        {/* Subtle grid with radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c1324_80%),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,40px_40px,40px_40px]" />
      </div>

      <div className="absolute inset-x-0 top-0 z-0 h-40 bg-linear-to-b from-[#0c1324] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="mb-6 inline-flex items-center rounded-full border border-[rgba(123,208,255,0.2)] bg-[#151b2d]/60 px-4 py-1.5 backdrop-blur-md"
        >
          <span className="mr-2 text-[10px] font-bold tracking-widest text-[#7bd0ff] uppercase">
            New Release
          </span>
          <span className="text-sm text-[#c6c6cd]">
            Welcome to the next generation of SaaS
          </span>
        </motion.div>

        <h1 className="max-w-5xl bg-linear-to-br from-[#dce1fb] via-white to-[#7bd0ff] bg-clip-text pb-2 font-['Manrope'] text-6xl font-extrabold tracking-tight text-transparent md:text-8xl">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed font-medium text-[#c6c6cd] md:text-xl">
          {subtitle}
        </p>

        {/* Action Buttons Container */}
        <div className="mt-12 flex w-full flex-col items-center justify-center gap-6 sm:flex-row">
          {children}
        </div>

        {/* Floating Mockup/Dashboard Glass Frame */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-20 h-[300px] w-full max-w-5xl overflow-hidden rounded-t-3xl border border-[rgba(123,208,255,0.15)] bg-linear-to-b from-[#151b2d]/80 to-[#0c1324] shadow-[0_20px_60px_rgba(123,208,255,0.05)] backdrop-blur-xl sm:h-[400px] md:h-[500px]"
        >
          <div className="absolute top-0 flex h-12 w-full items-center border-b border-[rgba(255,255,255,0.05)] px-6">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ffb4ab]/80"></div>
              <div className="h-3 w-3 rounded-full bg-[#d0bcff]/80"></div>
              <div className="h-3 w-3 rounded-full bg-[#7bd0ff]/80"></div>
            </div>
          </div>

          {/* Abstract Inner Layout */}
          <div className="flex h-full gap-6 px-8 pt-20">
            <div className="h-full w-1/4 rounded-tr-xl border border-[rgba(255,255,255,0.03)] bg-[#191f31]/50" />
            <div className="flex w-3/4 flex-col gap-6">
              <div className="flex h-32 w-full items-center justify-center rounded-xl border border-[rgba(255,255,255,0.03)] bg-[#191f31]/50">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#7bd0ff] to-[#3c0091] opacity-30 blur-xl" />
              </div>
              <div className="flex h-full gap-6">
                <div className="h-full w-1/2 rounded-t-xl border border-[rgba(255,255,255,0.03)] bg-[#191f31]/50" />
                <div className="h-full w-1/2 rounded-t-xl border border-[rgba(255,255,255,0.03)] bg-[#191f31]/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* The Glow */}
      <div className="absolute bottom-[-20%] left-1/2 z-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-[#7bd0ff]/10 blur-[150px]" />
    </div>
  );
};

export const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="border-border/60 bg-border/40 group hover:border-primary/40 relative flex h-full flex-col justify-between rounded-2xl border p-8 shadow-xl backdrop-blur-xl transition-all"
    >
      <div className="border-primary/20 absolute top-0 left-0 h-8 w-8 rounded-tl-2xl border-t-2 border-l-2 opacity-0 transition-opacity group-hover:opacity-100" />

      <div>
        <div className="mb-6 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="fill-primary text-primary h-3 w-3 opacity-80"
            />
          ))}
        </div>
        <p className="text-foreground/90 mb-4 font-mono text-sm leading-relaxed">
          <span className="text-primary italic opacity-60">"</span>
          {quote}
          <span className="text-primary italic opacity-60">"</span>
        </p>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <div className="bg-primary/10 text-primary border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold">
          {avatar}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-foreground truncate font-mono text-sm font-bold">
            {author}
          </h4>
          <p className="text-muted-foreground truncate font-mono text-[10px] tracking-wider uppercase opacity-70">
            {role}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="group overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-card/30 relative flex min-h-[70px] w-full items-center justify-between bg-transparent p-6 text-left transition-colors md:p-7"
      >
        <span className="text-foreground group-hover:text-primary pr-12 font-mono text-base font-bold tracking-tight transition-colors select-none md:text-lg">
          {question}
        </span>
        <div className="absolute top-1/2 right-8 -translate-y-1/2">
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-all duration-500",
              isOpen && "text-primary rotate-180"
            )}
          />
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-muted/5 overflow-hidden"
      >
        <div className="px-6 pt-0 pb-7 text-left md:px-7">
          <div className="bg-primary/30 mb-5 h-px w-10" />
          <p className="text-muted-foreground max-w-3xl font-mono text-xs leading-[1.8] opacity-80 md:text-[13px]">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
