"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  FileText,
  Users,
  Shield,
  ArrowRight,
  Zap,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  Sparkles,
  Database,
  Download,
  Search,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { TestimonialCard, FAQItem } from "@/components/landing-components";
import { AdvancedHero } from "@/components/advanced-hero";
import { SmoothScroll } from "@/components/smooth-scroll";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    quote:
      "lume notes has revolutionized how our team collaborates. The real-time editing is so smooth, it feels like magic.",
    author: "Sarah Johnson",
    role: "Product Manager, TechCorp",
    avatar: "SJ",
  },
  {
    quote:
      "The security features give us peace of mind. Our sensitive project notes are finally safe and fully encrypted.",
    author: "Mike Rodriguez",
    role: "CTO, StartupXYZ",
    avatar: "MR",
  },
  {
    quote:
      "Productivity increased by 40% since we switched. The interface is just intuitive and stays completely out of the way.",
    author: "Anna Liu",
    role: "Team Lead, DesignStudio",
    avatar: "AL",
  },
  {
    quote:
      "I've tried every knowledge base. This is the only one that truly masters keyboard-first navigation and extreme speed.",
    author: "David Chen",
    role: "Senior Engineer",
    avatar: "DC",
  },
  {
    quote:
      "Hosting it ourselves was an absolute breeze. Docker deployment took literally two minutes. Incredible architecture.",
    author: "Elena Rostova",
    role: "DevOps Engineer",
    avatar: "ER",
  },
  {
    quote:
      "The slash commands are so well thought out. I never touch my mouse anymore while writing complex documentation.",
    author: "Marcus Webb",
    role: "Technical Writer",
    avatar: "MW",
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial for all new users. No credit card required to start.",
  },
  {
    question: "How secure are my notes?",
    answer:
      "We use enterprise-grade encryption for all your notes. Only you and authorized team members can access them.",
  },
  {
    question: "Can I collaborate in real-time?",
    answer:
      "Absolutely. Multiple people can edit the same document simultaneously with live cursors and version history tracking.",
  },
  {
    question: "Is self-hosting supported?",
    answer:
      "Yes. Lume is open-source. You can deploy it using Docker on your own cloud infrastructure for complete data sovereignty.",
  },
  {
    question: "Does it support AI integration?",
    answer:
      "Lume includes native AI blocks for summarization, deep search across your workspace, and automated document relations.",
  },
  {
    question: "Who owns my data?",
    answer:
      "You do. We use end-to-end encryption by default. Your documents are your own, and we have zero access to your private key.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Refs for GSAP
  const headerRef = React.useRef<HTMLElement>(null);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);

  // Section Refs
  const featuresRef = React.useRef<HTMLElement>(null);
  const workflowRef = React.useRef<HTMLElement>(null);
  const reviewsRef = React.useRef<HTMLElement>(null);
  const faqRef = React.useRef<HTMLElement>(null);
  const ctaSectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    setMounted(true);

    const ctx = gsap.context(() => {
      // Navbar Animation
      const navTl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1.2 },
      });

      gsap.set(headerRef.current, { y: -30, opacity: 0 });
      gsap.set(logoRef.current, { x: -30, opacity: 0 });
      gsap.set(actionsRef.current, { x: 30, opacity: 0 });
      gsap.set(lineRef.current, { width: "0%", opacity: 0 });

      if (navRef.current) {
        gsap.set(navRef.current.children, { y: 15, opacity: 0 });
      }

      navTl
        .to(headerRef.current, { y: 0, opacity: 1, duration: 1.5 }, 0.3)
        .to(
          lineRef.current,
          { width: "80%", opacity: 1, duration: 1.2 },
          "-=1.0"
        )
        .to(logoRef.current, { x: 0, opacity: 1, duration: 1 }, "-=0.8")
        .to(actionsRef.current, { x: 0, opacity: 1, duration: 1 }, "-=1.0");

      if (navRef.current) {
        navTl.to(
          navRef.current.children,
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
          },
          "-=0.7"
        );
      }

      // --- SECTION ANIMATIONS ---

      // Features Section
      if (featuresRef.current) {
        const title = featuresRef.current.querySelector(".section-header");
        const cards = featuresRef.current.querySelector(".features-grid");

        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });

        if (cards) {
          gsap.from(cards.children, {
            scrollTrigger: {
              trigger: cards,
              start: "top 85%",
            },
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
          });
        }
      }

      // Workflow Section
      if (workflowRef.current) {
        const title = workflowRef.current.querySelector(".section-header");
        const content = workflowRef.current.querySelector(".workflow-card");

        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });

        if (content) {
          gsap.from(content, {
            scrollTrigger: {
              trigger: content,
              start: "top 85%",
            },
            scale: 0.95,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          });
        }
      }

      // Reviews Section
      if (reviewsRef.current) {
        const title = reviewsRef.current.querySelector(".section-header");
        const marquee = reviewsRef.current.querySelector(".reviews-marquee");

        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });

        if (marquee) {
          gsap.from(marquee, {
            scrollTrigger: {
              trigger: marquee,
              start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          });
        }
      }

      // FAQ Section
      if (faqRef.current) {
        const title = faqRef.current.querySelector(".section-header");
        const list = faqRef.current.querySelector(".faq-list");

        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });

        if (list) {
          gsap.from(list.children, {
            scrollTrigger: {
              trigger: list,
              start: "top 85%",
            },
            y: 20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power3.out",
          });
        }
      }

      // CTA Section
      if (ctaSectionRef.current) {
        gsap.from(ctaSectionRef.current.children, {
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top 85%",
          },
          scale: 0.9,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const isAuthenticated = status === "authenticated";
  const user = session?.user as any;

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

  return (
    <SmoothScroll>
      <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen overflow-x-hidden antialiased">
        {/* Background Noise Texture */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" />

        {/* Updated Header - Floating Pill Nav */}
        <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
          <header
            ref={headerRef}
            style={{ opacity: 0 }}
            className="border-border/40 bg-background/80 relative flex h-14 w-full max-w-5xl items-center justify-between rounded-full border px-5 shadow-sm backdrop-blur-md"
          >
            {/* Decorative bottom line */}
            <div
              ref={lineRef}
              className="bg-primary/20 absolute bottom-2 left-1/2 h-[1px] -translate-x-1/2 rounded-full"
              style={{ width: "0%" }}
            />
            {/* Logo Group */}
            <div
              ref={logoRef}
              style={{ opacity: 0 }}
              className="z-10 flex w-[160px] cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
              onClick={() => router.push("/")}
            >
              <div className="relative h-6 w-6">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  fill
                  className="object-contain"
                  aria-hidden="true"
                />
              </div>
              <span className="text-lg font-bold tracking-tight">lume</span>
            </div>

            {/* Navigation Links - Absolute Center */}
            <nav
              ref={navRef}
              className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:flex"
            >
              {["Features", "Workflow", "Reviews", "FAQ"].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-muted-foreground hover:text-foreground font-mono text-sm font-semibold transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions Group - Right */}
            <div
              ref={actionsRef}
              style={{ opacity: 0 }}
              className="z-10 flex w-[160px] items-center justify-end gap-3"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:bg-muted h-8 w-8 rounded-full"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )
                ) : (
                  <div className="h-4 w-4" />
                )}
              </Button>

              {!isAuthenticated ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => router.push("/auth/login")}
                    className="bg-foreground text-background hover:bg-foreground/90 h-8 rounded-full px-5 font-semibold"
                  >
                    Login
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Dashboard Button between Theme Toggle and Profile */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCTA}
                    className="text-foreground border-border/50 hidden h-8 gap-2 rounded-full bg-transparent px-4 font-mono text-[10px] font-bold transition-all hover:scale-105 hover:bg-blue-600 hover:text-white active:scale-95 sm:flex dark:text-white"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    DASHBOARD
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 overflow-hidden rounded-full p-0"
                      >
                        <div className="bg-primary/10 border-primary/20 relative flex h-full w-full items-center justify-center border">
                          {user?.image ? (
                            <Image
                              src={user.image}
                              alt={user.email || ""}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <User className="text-primary h-4 w-4" />
                          )}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-border bg-card mt-2 w-56 rounded-xl p-1 shadow-lg"
                    >
                      <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm leading-none font-medium">
                            {user?.name || "User"}
                          </p>
                          <p className="text-muted-foreground text-xs leading-none">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-destructive cursor-pointer rounded-lg"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </header>
        </div>

        {/* HERO SECTION - GSAP POWERED */}
        <AdvancedHero />

        {/* FEATURE SECTION - Industrial Level */}
        <section
          id="features"
          ref={featuresRef}
          className="container mx-auto max-w-[1240px] px-4 pt-32 pb-8"
        >
          <div className="section-header mb-16">
            <div className="text-primary mb-6 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
              <span className="opacity-60">//</span> FEATURES
            </div>
            <h2 className="text-foreground mb-6 font-mono text-4xl leading-[1.05] font-extrabold tracking-tight md:text-7xl">
              Built for teams who <br />
              <span className="text-primary text-[0.9em] italic">
                mean business
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl font-mono text-sm leading-[1.8] opacity-80 md:text-base">
              No fluff. No complex onboarding ceremony. Just the core tools to
              scale your knowledge base and orchestrate your entire workflow.
            </p>
          </div>

          <div className="features-grid border-border/60 bg-border/40 overflow-hidden rounded-[24px] border shadow-2xl">
            <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="absolute top-8 right-8">
                  <span className="text-primary bg-primary/10 border-primary/20 rounded border px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
                    Core
                  </span>
                </div>
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  AI Assistant
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  Contextual autocomplete and semantic suggestions that evolve
                  dynamically with your workflow in real time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="absolute top-8 right-8">
                  <span className="text-primary bg-primary/10 border-primary/20 rounded border px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
                    AI
                  </span>
                </div>
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  Chat with PDF
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  Upload documents and converse with them securely. Extract
                  insights instantly from dense literature.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  Real-Time Sync
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  Cursor syncing, multiplayer editing with absolute zero latency
                  spanning global teams.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  Deep Search
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  Fuzzy and semantic knowledge retrieval. Find that one thought
                  buried deeply in your files instantly.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  Knowledge Graph
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  Visualize connections securely with automatic backlinks
                  mapping your entire knowledge base networks.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-background hover:bg-card/40 group relative flex flex-col items-start p-10 text-left transition-colors md:p-12">
                <div className="border-primary/30 bg-primary/5 text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform duration-500 group-hover:scale-110">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  Slash Commands
                </h3>
                <p className="text-muted-foreground font-mono text-[13px] leading-[1.7] opacity-80">
                  A hyper fast rich text editor driven purely by keyboard
                  shortcuts and fast slashed commands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SPEED & COMMAND PALETTE SECTION */}
        <section
          id="workflow"
          ref={workflowRef}
          className="relative container mx-auto max-w-[1240px] overflow-hidden px-4 py-32"
        >
          <div className="section-header mb-16">
            <div className="text-primary mb-6 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
              <span className="opacity-60">//</span> WORKFLOW
            </div>
            <h2 className="text-foreground mb-6 font-mono text-4xl leading-[1.05] font-extrabold tracking-tight md:text-7xl">
              Designed for extreme <br />
              <span className="text-primary text-[0.9em] italic">
                productivity
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl font-mono text-sm leading-[1.8] opacity-80 md:text-base">
              Transform the way you process knowledge. Execute and orchestrate
              everything completely mouse-free using universal quick actions.
            </p>
          </div>

          <div className="bg-primary/10 pointer-events-none absolute top-[60%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

          <div className="workflow-card border-border/60 bg-border/40 relative flex flex-col items-stretch justify-between overflow-hidden rounded-[32px] border shadow-2xl backdrop-blur-3xl lg:flex-row">
            {/* Top decorative line */}
            <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent" />

            <div className="bg-background/80 z-10 flex flex-1 flex-col items-start p-10 text-left md:p-16">
              <div className="text-primary mb-6 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
                <span className="opacity-60">//</span> 01_SPEED
              </div>
              <h2 className="text-foreground mb-6 font-mono text-4xl leading-[1.05] font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                Move at the speed of <br />
                <span className="text-primary text-[0.9em] italic">
                  thought.
                </span>
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md font-mono text-[13px] leading-[1.8] opacity-80 md:text-[14px]">
                Never take your hands off the keyboard. Our unified command
                palette grants instant access to every action, document, and AI
                capability in milliseconds.
              </p>

              <ul className="w-full space-y-4 font-mono text-[13px] opacity-80">
                <li className="bg-card/50 border-border/40 flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex gap-1">
                    <kbd className="bg-background border-border/50 rounded border px-2 py-1 font-sans text-[11px] font-bold">
                      ⌘
                    </kbd>
                    <kbd className="bg-background border-border/50 rounded border px-2 py-1 font-sans text-[11px] font-bold">
                      K
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">
                    Universal Command Palette
                  </span>
                </li>
                <li className="bg-card/50 border-border/40 flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex gap-1">
                    <kbd className="bg-background border-border/50 rounded border px-2 py-1 font-sans text-[11px] font-bold">
                      /
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">
                    Trigger AI & Formatting Blocks
                  </span>
                </li>
                <li className="bg-card/50 border-border/40 flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex gap-1">
                    <kbd className="bg-background border-border/50 mb-1 rounded border px-2 py-1 font-sans text-[11px] font-bold">
                      [
                    </kbd>
                    <kbd className="bg-background border-border/50 mb-1 rounded border px-2 py-1 font-sans text-[11px] font-bold">
                      [
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">
                    Link internal documents instantly
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-muted/30 border-border/60 relative flex w-full flex-1 items-center justify-center self-stretch overflow-hidden p-8 md:p-16 lg:border-l dark:bg-black/40">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-[0.25] dark:opacity-[0.1]" />

              {/* Mockup Window */}
              <div className="border-border/80 bg-background relative z-20 w-full max-w-md overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl">
                {/* Header */}
                <div className="border-border/80 bg-muted/30 flex h-10 items-center gap-2 border-b px-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                {/* Search Bar */}
                <div className="border-border/80 flex items-center gap-3 border-b p-4">
                  <Search className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground/80 font-mono text-sm">
                    Draft meeting notes
                  </span>
                  <div className="bg-border ml-auto h-5 w-px animate-pulse" />
                  <span className="text-primary border-primary/30 bg-primary/10 ml-2 rounded border px-2 py-0.5 font-mono text-[10px] tracking-widest">
                    AI
                  </span>
                </div>
                {/* Results Output */}
                <div className="p-2">
                  <div className="bg-primary/10 border-primary/20 hover:bg-primary/20 mb-1 flex cursor-pointer items-center gap-3 rounded border px-3 py-3 transition-colors">
                    <Sparkles className="text-primary h-4 w-4" />
                    <span className="text-foreground/90 font-mono text-xs">
                      Generate smart templates
                    </span>
                  </div>
                  <div className="hover:bg-muted/50 text-muted-foreground flex cursor-pointer items-center gap-3 rounded px-3 py-3 transition-colors">
                    <FileText className="h-4 w-4" />
                    <span className="font-mono text-xs">
                      Search existing "meeting notes" docs
                    </span>
                  </div>
                  <div className="hover:bg-muted/50 text-muted-foreground flex cursor-pointer items-center gap-3 rounded px-3 py-3 transition-colors">
                    <Database className="h-4 w-4" />
                    <span className="font-mono text-xs">
                      Filter by database: Meetings
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS MARQUEE SECTION */}
        <section
          id="reviews"
          ref={reviewsRef}
          className="relative container mx-auto max-w-[1240px] overflow-hidden px-4 py-8"
        >
          <div className="section-header mb-16">
            <div className="text-primary mb-6 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
              <span className="opacity-60">//</span> WALL_OF_LOVE
            </div>
            <h2 className="text-foreground mb-6 font-mono text-4xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
              Trusted by high velocity <br />
              <span className="text-primary text-[0.9em] italic">
                engineering teams.
              </span>
            </h2>
          </div>

          <div className="reviews-marquee border-border/60 bg-border/20 relative h-[700px] overflow-hidden rounded-[40px] border shadow-2xl backdrop-blur-3xl">
            <div className="from-background pointer-events-none absolute inset-x-0 top-0 z-40 h-32 bg-linear-to-b to-transparent" />
            <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 bg-linear-to-t to-transparent" />

            <div className="grid h-full grid-cols-1 items-start gap-6 overflow-hidden px-6 md:grid-cols-3">
              {/* Col 1 */}
              <div className="animate-marquee-up flex flex-col gap-6">
                {[
                  ...testimonials.slice(0, 3),
                  ...testimonials.slice(0, 3),
                  ...testimonials.slice(0, 3),
                ].map((t, i) => (
                  <TestimonialCard key={`col1-${i}`} {...t} />
                ))}
              </div>
              {/* Col 2 */}
              <div className="animate-marquee-down hidden flex-col gap-6 md:flex">
                {[
                  ...testimonials.slice(3, 6),
                  ...testimonials.slice(3, 6),
                  ...testimonials.slice(3, 6),
                ].map((t, i) => (
                  <TestimonialCard key={`col2-${i}`} {...t} />
                ))}
              </div>
              {/* Col 3 */}
              <div className="animate-marquee-up hidden flex-col gap-6 md:flex">
                {[
                  ...testimonials.slice(0, 6).reverse(),
                  ...testimonials.slice(0, 6).reverse(),
                  ...testimonials.slice(0, 6).reverse(),
                ].map((t, i) => (
                  <TestimonialCard key={`col3-${i}`} {...t} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section
          id="faq"
          ref={faqRef}
          className="relative container mx-auto max-w-[1240px] overflow-hidden px-4 py-32"
        >
          <div className="section-header mb-16">
            <div className="text-primary mb-6 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
              <span className="opacity-60">//</span> FAQ
            </div>
            <h2 className="text-foreground mb-6 font-mono text-4xl leading-[1.05] font-extrabold tracking-tight md:text-7xl">
              Good questions. <br />
              <span className="text-primary text-[0.9em] italic">
                Straight answers.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl font-mono text-sm leading-[1.8] opacity-80 md:text-base">
              Everything you need to know about lume notes, security, and how to
              get the most out of your knowledge base.
            </p>
          </div>

          <div className="faq-list border-border/60 bg-border/40 overflow-hidden rounded-[24px] border shadow-2xl">
            <div className="bg-border/60 flex flex-col gap-px">
              {faqs.map((f, i) => (
                <div key={i} className="bg-background">
                  <FAQItem {...f} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL SECTION - Industrial Card Styled */}
        <section
          ref={ctaSectionRef}
          className="container mx-auto max-w-[1240px] px-4 pt-12 pb-40"
        >
          <div className="border-border/60 bg-border/20 group relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[32px] border p-12 backdrop-blur-3xl md:p-20 lg:flex-row">
            {/* Background Glow */}
            <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-0 h-96 w-96 -translate-y-1/2 rounded-full opacity-50 blur-[120px] transition-opacity duration-1000 group-hover:opacity-80" />

            <div className="relative z-10 flex-1 text-left">
              <div className="text-primary mb-8 flex items-center gap-2 font-mono text-sm font-bold tracking-widest">
                <span className="opacity-60">//</span> GET STARTED NOW
              </div>
              <h2 className="text-foreground mb-8 font-mono text-3xl leading-[1.05] font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
                <span className="inline-block whitespace-nowrap">
                  Stop wondering where
                </span>{" "}
                <br />
                <span className="text-primary inline-block text-[0.85em] whitespace-nowrap italic opacity-90">
                  your ideas went.
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl font-mono text-sm leading-[1.8] opacity-80 md:text-[15px]">
                Join thousands of creators who use Lume Notes to structure their
                thoughts, build complex knowledge bases, and orchestrate their
                entire workflow in absolute real-time.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 flex h-12 items-center gap-2 rounded-xl px-8 font-mono text-base font-black transition-all hover:scale-105 active:scale-95"
                onClick={handleCTA}
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-border/60 flex h-12 items-center gap-2 rounded-xl bg-white/5 px-8 font-mono text-base font-bold backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 active:scale-95"
              >
                <ArrowUpRight className="h-4 w-4" /> Live Demo
              </Button>
            </div>
          </div>
        </section>

        {/* UPDATED FOOTER - Column Layout */}
        <footer className="border-border/40 bg-background border-t pt-32 pb-12">
          <div className="container mx-auto max-w-[1240px] px-4">
            <div className="mb-24 grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-5">
              {/* Logo Column */}
              <div className="col-span-1 lg:col-span-2">
                <div
                  className="group mb-8 flex cursor-pointer items-center gap-3"
                  onClick={() => router.push("/")}
                >
                  <div className="relative h-8 w-8 opacity-80 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                    <Image
                      src="/logo.svg"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-2xl font-bold tracking-tighter">
                    lume notes
                  </span>
                </div>
                <p className="text-muted-foreground mb-8 max-w-sm font-mono text-sm leading-[1.8] opacity-70">
                  The real-time collaboration engine for modern engineering
                  teams. Engineered for extreme speed, security, and absolute
                  clarity.
                </p>
                <div className="flex gap-4">
                  <div className="border-border/60 bg-border/20 hover:bg-border/40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors">
                    <Zap className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="border-border/60 bg-border/20 hover:bg-border/40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors">
                    <Shield className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="border-border/60 bg-border/20 hover:bg-border/40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors">
                    <Users className="text-muted-foreground h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Link Columns */}
              <div>
                <h4 className="text-foreground/40 mb-8 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                  Product
                </h4>
                <ul className="space-y-4">
                  {[
                    "Features",
                    "Pricing",
                    "Compare",
                    "Changelog",
                    "Dashboard",
                  ].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground group flex items-center font-mono text-sm transition-colors"
                      >
                        {item}{" "}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-foreground/40 mb-8 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                  Resources
                </h4>
                <ul className="space-y-4">
                  {[
                    "GitHub",
                    "Documentation",
                    "Live Demo",
                    "Author",
                    "Discord",
                  ].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground group flex items-center font-mono text-sm transition-colors"
                      >
                        {item}{" "}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-foreground/40 mb-8 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                  Legal
                </h4>
                <ul className="space-y-4">
                  {[
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "License",
                  ].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground group flex items-center font-mono text-sm transition-colors"
                      >
                        {item}{" "}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-border/20 text-muted-foreground/50 flex flex-col items-center justify-between gap-6 border-t pt-12 font-mono text-[10px] font-bold tracking-[0.25em] uppercase md:flex-row">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
                <span>© 2026 Lume Notes</span>
                <span className="text-foreground/20">|</span>
                <span>Built by 1xcoder</span>
              </div>
              <div className="flex gap-8">
                {["GitHub", "Live App", "Privacy", "Terms"].map(item => (
                  <a
                    key={item}
                    href="#"
                    className="hover:text-foreground transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
