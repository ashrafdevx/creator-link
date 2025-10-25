import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Aperture,
  Radar,
  Waves,
  Sigma,
  Layers,
  CircleDashed,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  // Mock auth state - replace with your actual auth hook
  const user = null;
  const isClient = user?.user?.role === "client";

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        {/* Background image from public folder */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: "url('/bg.svg')",
            backgroundPosition: "center 52%",
          }}
        />

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f26]/60 to-[#060b1a]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-24 sm:py-32 text-center relative z-10">
        {/* Tagline pill */}
        {/* Content */}
        <div className="mx-auto max-w-5xl px-6 lg:px-8  text-center"></div>
        <div className="inline-flex items-center justify-center px-5 py-2 mb-8 rounded-full gap-2 text-sm font-medium text-slate-200 bg-white/5 backdrop-blur-[12px] border border-white/20 shadow-[inset_0_-4px_24px_0px_#194FFF21]">
          CreatorLink connects talented specialists with content creators
          <div className=" [background:linear-gradient(270deg,#3232FF_0%,#3C56FF_50%,#3232FF_100%)] w-[38px] rounded-full flex items-center justify-center h-[26px]">
            <ArrowRight className="ml-1 w-[28px] h-[18px]" />
          </div>
        </div>

        {/* Content */}
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white mb-6">
          The Marketplace for <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent">
            Content Creators
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl mx-auto">
          CreatorLink connects talented specialists with content creators to
          produce amazing content, faster. Find an editor, designer, or writer
          for your next project.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-4 flex-wrap">
          <Link to="/find-freelancers">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/50 transition-all duration-300 hover:scale-105"
            >
              Find a Specialist
            </Button>
          </Link>

          {isClient && (
            <Link to="/post-job">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full text-white font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/50 transition-all duration-300 hover:scale-105"
              >
                Post a Job
              </Button>
            </Link>
          )}

          {!isClient && (
            <Link to="/find-jobs">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                Browse Jobs
              </Button>
            </Link>
          )}
        </div>

        <RatingAndMarquee />
      </div>
    </div>
  );
}

/* --- Rating + Marquee ---------------------------------------------------- */

const BRAND_ITEMS = [
  { name: "Lumina", Icon: Aperture },
  { name: "Vortex", Icon: Radar },
  { name: "Velocity", Icon: Waves },
  { name: "Synergy", Icon: Sigma },
  { name: "Enigma", Icon: Layers },
  { name: "Spectrum", Icon: CircleDashed },
];

function RatingAndMarquee() {
  const trackRef = useRef(null);
  const firstSetRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const first = firstSetRef.current;
    if (!track || !first) return;

    let rafId;
    let last = performance.now();
    let x = 0;
    const speed = 18;
    const width = first.getBoundingClientRect().width;

    x = -width;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      x += speed * dt;
      if (x >= 0) x = -width;

      track.style.transform = `translateX(${x}px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="mt-16 flex flex-col items-center">
      {/* Stars */}
      <div className="flex justify-center mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFD43B"
            className="w-5 h-5 mx-0.5"
          >
            <path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.786 1.402 8.178L12 18.896l-7.336 3.877 1.402-8.178L.132 9.209l8.2-1.193z" />
          </svg>
        ))}
      </div>

      {/* Score text */}
      <p className="text-sm text-slate-300">
        <span className="text-white font-semibold">4.9/5</span> From 3,602
        Customers
      </p>

      {/* Marquee */}
      <div className="mt-8 w-full flex justify-center">
        <div className="relative w-full max-w-[1180px] h-[48px] overflow-hidden opacity-40">
          <span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0e1f] to-transparent z-10" />
          <span className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0e1f] to-transparent z-10" />

          <div
            ref={trackRef}
            className="will-change-transform absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-[14px]"
          >
            <ul ref={firstSetRef} className="flex items-center gap-[14px]">
              {BRAND_ITEMS.map(({ name, Icon }) => (
                <MarqueeItem key={`a_${name}`} Icon={Icon} label={name} />
              ))}
            </ul>
            <ul aria-hidden className="flex items-center gap-[14px]">
              {BRAND_ITEMS.map(({ name, Icon }) => (
                <MarqueeItem key={`b_${name}`} Icon={Icon} label={name} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeItem({ Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4">
      <Icon className="w-6 h-6 text-slate-300" />
      <span className="text-slate-300 text-base font-medium">{label}</span>
    </div>
  );
}
