"use client";

import React from "react";
import { useRouter } from "nextjs-toploader/app";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SpotlightHero,
  TestimonialCard,
  FAQItem,
} from "@/components/landing-components";

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Teams" },
  { value: "1M+", label: "Notes Created" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  {
    quote:
      "lume notes has revolutionized how our team collaborates. The real-time editing is so smooth.",
    author: "Sarah Johnson",
    role: "Product Manager, TechCorp",
    avatar: "SJ",
  },
  {
    quote:
      "The security features give us peace of mind. Our sensitive project notes are finally safe.",
    author: "Mike Rodriguez",
    role: "CTO, StartupXYZ",
    avatar: "MR",
  },
  {
    quote:
      "Productivity increased by 40% since we switched. The interface is just intuitive.",
    author: "Anna Liu",
    role: "Team Lead, DesignStudio",
    avatar: "AL",
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
      "Absolutely! multiple people can edit the same note simultaneously with live cursors and history tracking.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen antialiased">
      {}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" />

      {}
      <header className="border-border/40 bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">lume notes</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/auth/login")}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/auth/register")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCTA}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  {user?.tenantId ? "Dashboard" : "Setup Workspace"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0"
                    >
                      <div className="bg-primary/10 border-primary/20 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border">
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt={user.email || ""}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="text-primary h-5 w-5" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-2 w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm leading-none font-medium">
                            {user?.name || "User"}
                          </p>
                          {user?.role && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 py-0 text-[10px] capitalize"
                            >
                              {user.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs leading-none">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCTA}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      {}
      <SpotlightHero
        title={
          <span className="block">
            Organize Thoughts.{" "}
            <span className="text-primary from-primary bg-gradient-to-r via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Collaborate.
            </span>
          </span>
        }
        subtitle="The modern notebook for high-velocity teams. Write, plan, and share without the friction."
      >
        <Button
          size="lg"
          className="bg-primary text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-2xl transition-all hover:scale-105"
          onClick={handleCTA}
        >
          {isAuthenticated
            ? user?.tenantId
              ? "Resume Working"
              : "Complete Setup"
            : "Start Coding for Free"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="hover:bg-muted rounded-full border-2 px-8 py-6 text-lg transition-all"
          onClick={() => router.push("/auth/login")}
        >
          Watch Demo
        </Button>
      </SpotlightHero>

      {}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <h3 className="text-foreground text-4xl font-extrabold md:text-5xl">
                {stat.value}
              </h3>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-16 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary mb-4 rounded-full px-4 py-1"
          >
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Everything you need to scale
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureItem
            icon={<FileText className="h-6 w-6" />}
            title="Advanced Editor"
            description="Tiptap powered rich text experience with full markdown support."
            delay={0.1}
          />
          <FeatureItem
            icon={<Users className="h-6 w-6" />}
            title="Team Hub"
            description="Real-time collaboration across roles and teams. Sync effortlessly."
            delay={0.2}
          />
          <FeatureItem
            icon={<Shield className="h-6 w-6" />}
            title="Safe Storage"
            description="End-to-end encryption and daily backups. Your data, your rules."
            delay={0.3}
          />
        </div>
      </section>

      {}
      <section className="container mx-auto overflow-hidden px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">
            Trusted by Creators
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </section>

      {}
      <section className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl leading-tight font-bold md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {faqs.map((f, i) => (
            <FAQItem key={i} {...f} />
          ))}
        </div>
      </section>

      {}
      <section className="container mx-auto px-4 py-32">
        <div className="bg-foreground text-background relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center md:px-16">
          <div className="from-primary/20 pointer-events-none absolute inset-0 bg-gradient-to-tr via-transparent to-purple-500/20" />
          <h2 className="relative z-10 text-4xl font-bold md:text-6xl">
            Start organizing your <br /> ideas today.
          </h2>
          <p className="relative z-10 mx-auto mt-8 max-w-2xl text-lg opacity-80">
            Join the elite teams of product designers, developers, and writers
            who use Lume Notes every day to ship faster.
          </p>
          <div className="relative z-10 mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 rounded-full px-12 py-8 text-xl font-bold"
              onClick={handleCTA}
            >
              {isAuthenticated ? "Go to Workspace" : "Get Started Now"}
            </Button>
          </div>
        </div>
      </section>

      {}
      <footer className="border-border/50 border-t py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">lume notes</span>
            </div>
            <div className="text-muted-foreground flex gap-8 text-sm">
              <a href="#" className="hover:text-foreground">
                Product
              </a>
              <a href="#" className="hover:text-foreground">
                Pricing
              </a>
              <a href="#" className="hover:text-foreground">
                Blog
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Lume Notes Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/20 rounded-3xl border p-8 transition-all duration-300"
    >
      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-6 text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
