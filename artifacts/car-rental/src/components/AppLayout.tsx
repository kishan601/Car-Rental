import React from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Car as CarIcon, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/cars");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href={user?.role === 'agency' ? "/agency/dashboard" : "/cars"} className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <CarIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">AutoRent</span>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {!isLoading && !user && (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover-elevate">
                  <Link href="/cars">Browse Cars</Link>
                </Button>
                <div className="h-5 w-px bg-border/50 hidden sm:block mx-1"></div>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover-elevate">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90">
                  <Link href="/register/customer">Sign Up</Link>
                </Button>
              </>
            )}
            
            {!isLoading && user?.role === 'customer' && (
              <>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover-elevate">
                  <Link href="/cars">Available Cars</Link>
                </Button>
                <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden sm:block text-slate-600">Hello, {user.name}</span>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {!isLoading && user?.role === 'agency' && (
              <>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover-elevate hidden sm:inline-flex">
                  <Link href="/agency/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover-elevate">
                  <Link href="/agency/bookings">
                    <CalendarDays className="h-4 w-4 mr-2" /> Bookings
                  </Link>
                </Button>
                <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden sm:block text-slate-600 px-3 py-1 bg-secondary rounded-lg border border-border/50">{user.agencyName}</span>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </main>

      <footer className="mt-auto py-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-primary/60" />
            <span className="font-display font-semibold text-foreground">AutoRent</span>
          </div>
          <p>© {new Date().getFullYear()} AutoRent Inc. All rights reserved. Crafted with precision.</p>
        </div>
      </footer>
    </div>
  );
}
