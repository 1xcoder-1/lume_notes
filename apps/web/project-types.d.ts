declare module "nextjs-toploader/app" {
  import { useRouter } from "next/navigation";
  export const useRouter: typeof useRouter;
}

declare module "nextjs-toploader/pages" {
  import { useRouter } from "next/router";
  export const useRouter: typeof useRouter;
}

// Existing ScrollTrigger resolution
declare module "gsap/ScrollTrigger" {
  export * from "gsap/types/scroll-trigger";
}

// Help GSAP core resolution
declare module "gsap" {
  export * from "gsap/types/index";
}

// Explicit resolution for lenis smooth scroll
declare module "lenis" {
  import Lenis from "lenis/dist/lenis";
  export default Lenis;
}
