"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@workspace/ui/components/button";
import { ChevronRight, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";

gsap.registerPlugin(ScrollTrigger);

export const AdvancedHero = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user as any;

  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subTitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleCTA = () => {
    if (isAuthenticated) {
      if (user?.tenantId) {
        router.push("/notes");
      } else {
        router.push("/organization/setup");
      }
    } else {
      router.push("/auth/register");
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animations to match the smooth Cap style
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1.2 },
      });

      tl.from(badgeRef.current, { opacity: 0, y: 15, duration: 0.8 }, 0.2)
        .from(titleRef.current, { opacity: 0, y: 20 }, "-=0.6")
        .from(descRef.current, { opacity: 0, y: 15 }, "-=1.0")
        .from(ctaRef.current, { opacity: 0, y: 15 }, "-=1.0");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden pt-20 pb-40"
    >
      {/* Premium Lines & Gradients Background */}
      <div className="bg-background pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Soft Blue Glowing Orbs */}
        <div className="absolute top-[10%] left-[15%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 opacity-50 mix-blend-normal blur-[120px] dark:bg-blue-500/15 dark:opacity-30" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-blue-400/20 opacity-50 mix-blend-normal blur-[130px] dark:bg-blue-500/15 dark:opacity-30" />

        {/* Beautiful Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,#000_40%,transparent_100%)] bg-size-[4rem_4rem] opacity-[0.15] dark:opacity-[0.2]" />

        {/* Diagonal Light Streaks */}
        <div className="absolute top-0 right-[-20%] bottom-0 left-[-20%] bg-[linear-gradient(135deg,var(--color-border)_1px,transparent_1px)] mask-[linear-gradient(to_bottom,transparent_0%,#000_20%,#000_80%,transparent_100%)] bg-size-[1.5rem_1.5rem] opacity-[0.05] dark:opacity-[0.05]" />
      </div>

      <div className="relative z-10 container mx-auto mt-20 flex flex-col items-center px-4 text-center md:mt-32">
        {/* Badge styled as the Cap Launch Week pill */}
        <div ref={badgeRef} className="mb-8 flex justify-center">
          <div className="border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/50 flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium shadow-sm backdrop-blur-sm transition-colors">
            Launch Week Day 5:{" "}
            <span className="text-primary cursor-pointer hover:underline">
              Self-host Lume
            </span>
            <ChevronRight className="text-muted-foreground/70 ml-1 h-3.5 w-3.5" />
          </div>
        </div>

        {/* Main Title - Dark, Bold, tracking tight */}
        <h1
          ref={titleRef}
          className="text-foreground mx-auto mb-8 max-w-5xl font-mono text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl md:text-[84px]"
        >
          Stop wasting time on <br />
          <span className="text-[0.9em] opacity-90">scattered thoughts.</span>
        </h1>

        {/* Subtitle / Description */}
        <p
          ref={descRef}
          className="text-muted-foreground mx-auto mb-10 max-w-4xl font-mono text-base leading-[1.8] opacity-80 md:text-lg lg:text-[20px]"
        >
          Lume is the open source alternative to modern note taking.
          Lightweight, powerful, and real time. Record and share securely in
          seconds with your high velocity team.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col items-center">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="border-border bg-card/60 hover:bg-muted/80 h-[52px] rounded-[12px] border px-8 text-[15px] font-semibold shadow-sm backdrop-blur-md transition-all"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Live Demo
            </Button>

            <Button
              onClick={handleCTA}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-[52px] rounded-[12px] border border-transparent px-10 text-[15px] font-semibold shadow-md transition-all"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-background/60 group hover:bg-card/80 relative flex flex-col items-center p-10 text-center transition-colors">
    <div className="relative z-10">
      <div className="text-foreground from-foreground to-foreground/70 mb-3 bg-gradient-to-b bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent md:text-5xl lg:text-6xl">
        {value}
      </div>
      <div className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase">
        {label}
      </div>
    </div>
    {/* Subtle hover overlay */}
    <div className="from-primary/10 via-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
  </div>
);
