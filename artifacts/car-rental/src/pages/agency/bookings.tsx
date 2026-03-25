import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, useGetAgencyBookings } from "@workspace/api-client-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CalendarDays, Car, Mail, Phone, Clock } from "lucide-react";

export default function AgencyBookingsPage() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  const { data: bookings, isLoading: isBookingsLoading } = useGetAgencyBookings();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isUserLoading && (!user || user.role !== 'agency')) {
      setLocation('/login');
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading || !user || user.role !== 'agency') return null;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Customer Bookings</h1>
        <p className="text-muted-foreground text-lg">Track and manage all reservations for your fleet.</p>
      </div>

      <Card className="rounded-[2rem] border-border/60 shadow-lg shadow-black/5 overflow-hidden">
        {isBookingsLoading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading bookings...</div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-20 bg-card">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-primary opacity-80" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">When customers rent your cars, the reservations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 pl-6 font-semibold">Vehicle</TableHead>
                  <TableHead className="py-5 font-semibold">Customer Details</TableHead>
                  <TableHead className="py-5 font-semibold">Reservation Dates</TableHead>
                  <TableHead className="py-5 font-semibold">Duration</TableHead>
                  <TableHead className="py-5 pr-6 text-right font-semibold">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map(booking => (
                  <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg hidden sm:block">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-display font-bold text-base text-foreground">{booking.vehicleModel}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 px-2 py-0.5 bg-secondary inline-block rounded border border-border/50">{booking.vehicleNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-medium text-foreground mb-1">{booking.customerName}</div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {booking.customerEmail}</span>
                        {booking.customerPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {booking.customerPhone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {format(new Date(booking.startDate), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {booking.numberOfDays} {booking.numberOfDays === 1 ? 'Day' : 'Days'}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="inline-block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/50 text-lg">
                        ${booking.totalCost}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
