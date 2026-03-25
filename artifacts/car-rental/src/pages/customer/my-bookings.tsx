import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, useGetMyBookings, useCancelBooking, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car as CarIcon, Calendar, Clock, Users, CreditCard, X, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MyBookingsPage() {
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { data: bookings, isLoading: bookingsLoading } = useGetMyBookings({ query: { enabled: !!user && user.role === "customer" } });
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!userLoading && !user) setLocation("/login");
    if (!userLoading && user && user.role === "agency") setLocation("/agency/dashboard");
  }, [user, userLoading, setLocation]);

  const handleCancel = (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    cancelBooking({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
        toast({ title: "Booking cancelled", description: "Your booking has been successfully cancelled." });
      },
      onError: (err: any) => {
        toast({ title: "Cancellation failed", description: err.error || "Could not cancel booking.", variant: "destructive" });
      },
    });
  };

  const isLoading = userLoading || bookingsLoading;

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-0.5">Track and manage your car rental reservations</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-secondary/60 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-card rounded-[2.5rem] border border-dashed border-border/80 shadow-sm"
        >
          <div className="bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-3">No bookings yet</h3>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            You haven't booked any cars. Browse our fleet and find your perfect ride.
          </p>
          <Button
            onClick={() => setLocation("/cars")}
            className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Browse Cars
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, idx) => {
            const endDate = (() => {
              try {
                const start = new Date(booking.startDate);
                const end = new Date(start);
                end.setDate(start.getDate() + booking.numberOfDays - 1);
                return format(end, "MMM d, yyyy");
              } catch {
                return "—";
              }
            })();

            const startFormatted = (() => {
              try {
                return format(new Date(booking.startDate), "MMM d, yyyy");
              } catch {
                return booking.startDate;
              }
            })();

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-border/60 shadow-md shadow-black/5 rounded-3xl bg-card">
                  <div className="flex flex-col sm:flex-row">
                    {/* Left color strip */}
                    <div className="sm:w-2 bg-gradient-to-b from-primary to-primary/60 flex-shrink-0 min-h-[8px]" />

                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Car icon + details */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                            <CarIcon className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-xl font-display font-bold text-foreground">{booking.vehicleModel}</h3>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground tracking-wide">
                                {booking.vehicleNumber}
                              </span>
                            </div>
                            <p className="text-sm text-primary font-semibold mb-4">{booking.agencyName}</p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 border border-border/40">
                                <Calendar className="w-4 h-4 text-primary/70 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Start</p>
                                  <p className="text-xs font-bold text-foreground">{startFormatted}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 border border-border/40">
                                <Calendar className="w-4 h-4 text-primary/70 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">End</p>
                                  <p className="text-xs font-bold text-foreground">{endDate}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 border border-border/40">
                                <Clock className="w-4 h-4 text-primary/70 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Duration</p>
                                  <p className="text-xs font-bold text-foreground">{booking.numberOfDays} {booking.numberOfDays === 1 ? "day" : "days"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 border border-primary/20">
                                <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">Total</p>
                                  <p className="text-xs font-bold text-primary">₹{booking.totalCost.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cancel button */}
                        <div className="flex-shrink-0 sm:self-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling}
                            className="h-9 px-4 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all font-semibold gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
