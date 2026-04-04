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
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden bg-background">
      {}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--background)_70%),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_100%,40px_40px,40px_40px]" />
      
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center px-4 text-center"
      >
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {children}
        </div>
      </motion.div>

      {}
      <div className="absolute bottom-[-10%] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-[100%] bg-primary/20 blur-[120px]" />
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
      className="relative flex h-full flex-col justify-between rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-primary/5"
    >
      <div>
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>
        <p className="text-lg leading-relaxed text-card-foreground/80 italic">"{quote}"</p>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{author}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-primary"
      >
        <span className="text-xl font-medium">{question}</span>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-lg text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};
