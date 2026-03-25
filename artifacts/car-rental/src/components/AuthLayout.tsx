import React from "react";
import { Link } from "wouter";
import { Car as CarIcon } from "lucide-react";
import { motion } from "framer-motion";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-slate-900/90 mix-blend-multiply z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          className="absolute inset-0 w-full h-full object-cover scale-105"
          alt="Background"
        />
        <div className="relative z-20 flex flex-col justify-center h-full p-20 text-white max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl inline-block mb-8 border border-white/20 shadow-2xl">
              <CarIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-sm">
              Drive your dreams <span className="text-blue-300">today.</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-md leading-relaxed">
              Join the premium car rental platform designed for a seamless, professional experience from booking to return.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right form panel — scrollable only if content overflows */}
      <div className="w-full lg:w-1/2 flex-shrink-0 overflow-y-auto flex items-center justify-center relative">
        <div className="w-full max-w-md px-6 sm:px-12 lg:px-16 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center lg:text-left">
              <Link href="/cars" className="inline-flex items-center justify-center lg:justify-start gap-2 text-primary font-display font-bold text-2xl mb-8 lg:hidden cursor-pointer">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <CarIcon className="w-6 h-6" />
                </div>
                AutoRent
              </Link>
              <h2 className="text-3xl font-bold font-display text-foreground">{title}</h2>
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            </div>

            <div className="mt-8 bg-card p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/5 border border-border/50">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      </div>
    </div>
  );
}
