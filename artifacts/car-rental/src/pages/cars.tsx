import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useListCars, useCreateBooking, getListCarsQueryKey, type Car } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, CreditCard, Key, Car as CarIcon, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";

function CarCard({ car, user }: { car: Car, user: any }) {
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState("1");
  const { mutate: bookCar, isPending } = useCreateBooking();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const handleBook = () => {
    if (!startDate) {
      toast({ title: "Select a date", description: "Please choose a start date for your rental.", variant: "destructive" });
      return;
    }
    bookCar({ data: { carId: car.id, startDate, numberOfDays: parseInt(days) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() });
        toast({ title: "Booking successful!", description: "Your car has been reserved. Enjoy your trip!" });
        setStartDate("");
        setDays("1");
      },
      onError: (err: any) => {
        toast({ title: "Booking failed", description: err.error || "An error occurred during booking.", variant: "destructive" });
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <Card className="overflow-hidden flex flex-col h-full border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-3xl bg-card">
        <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <CarIcon className="w-28 h-28 text-slate-300 dark:text-slate-700 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700 drop-shadow-md" />
          <div className="absolute top-4 right-4">
            <span className="px-4 py-1.5 bg-background/95 backdrop-blur text-primary text-sm font-bold rounded-full shadow-sm border border-border/50 flex items-center gap-1">
              ${car.rentPerDay} <span className="text-xs font-normal text-muted-foreground">/day</span>
            </span>
          </div>
          {!car.available && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="px-6 py-2 bg-destructive text-destructive-foreground font-bold rounded-full shadow-lg tracking-wide uppercase text-sm">Currently Booked</span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              {car.agencyName}
            </p>
            <h3 className="text-2xl font-display font-bold text-foreground leading-tight">{car.vehicleModel}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-lg border border-border/50">
              <Key className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{car.vehicleNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-lg border border-border/50">
              <Users className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{car.seatingCapacity} Seats</span>
            </div>
          </div>
          
          <div className="mt-auto">
            {user?.role === 'customer' ? (
              <div className="pt-6 border-t border-border/60">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</Label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        disabled={!car.available || isPending}
                        min={new Date().toISOString().split('T')[0]} 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="h-11 text-sm bg-secondary/30 rounded-xl focus-visible:ring-primary/20" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</Label>
                    <Select disabled={!car.available || isPending} value={days} onValueChange={setDays}>
                      <SelectTrigger className="h-11 text-sm bg-secondary/30 rounded-xl focus-visible:ring-primary/20">
                        <SelectValue placeholder="Days" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-48 overflow-y-auto">
                        {Array.from({length: 30}, (_, i) => (
                          <SelectItem key={i+1} value={String(i+1)} className="rounded-lg">{i+1} {i === 0 ? 'Day' : 'Days'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90 text-primary-foreground" 
                  onClick={handleBook} 
                  disabled={!car.available || isPending}
                >
                  {isPending ? "Processing..." : `Book for $${car.rentPerDay * parseInt(days)}`}
                </Button>
              </div>
            ) : user?.role === 'agency' ? (
              <div className="pt-4 border-t border-border/60 text-center">
                <p className="text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  Agencies cannot book cars. Switch to a customer account.
                </p>
              </div>
            ) : (
              <div className="pt-6 border-t border-border/60">
                <Button variant="outline" className="w-full h-12 rounded-xl font-semibold hover-elevate border-primary/20 hover:bg-primary/5 hover:text-primary" onClick={() => setLocation('/login')}>
                  Sign in to rent this car <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function CarsPage() {
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: cars, isLoading } = useListCars();

  return (
    <AppLayout>
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white mb-16 shadow-2xl border border-white/10">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" 
          alt="Hero background" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        <div className="relative z-10 p-8 sm:p-16 lg:p-24 max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-bold tracking-widest uppercase mb-6">
              Premium Fleet
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-[1.1] mb-6 drop-shadow-md text-[#1649ba]"
          >
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Perfect Drive.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10"
          >
            Explore our meticulously maintained selection of vehicles. Transparent pricing, professional service, and no hidden fees.
          </motion.p>
          
          {!user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <Link href="/register/customer">
                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-white text-slate-900 hover:bg-blue-50 shadow-xl shadow-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Join as Customer
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Available Vehicles</h2>
          <p className="text-muted-foreground mt-2 text-lg">Choose from our wide variety of reliable cars.</p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[500px] rounded-3xl bg-secondary/60 animate-pulse border border-border/50"></div>
          ))}
        </div>
      ) : cars?.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-[2.5rem] border border-dashed border-border/80 shadow-sm">
          <div className="bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-3">No cars available right now</h3>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Agencies are currently adding new vehicles. Check back later for our updated fleet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars?.map(car => (
            <CarCard key={car.id} car={car} user={user} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
