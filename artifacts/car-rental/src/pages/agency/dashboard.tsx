import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMe, useGetAgencyCars, useAddCar, useUpdateCar, getGetAgencyCarsQueryKey, type Car } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Edit2, Users, CreditCard, Car as CarIcon, Key } from "lucide-react";

const carSchema = z.object({
  vehicleModel: z.string().min(2, "Model is required"),
  vehicleNumber: z.string().min(2, "Number is required"),
  seatingCapacity: z.coerce.number().min(1, "Must have at least 1 seat"),
  rentPerDay: z.coerce.number().min(0, "Rent cannot be negative"),
});

function AddEditCarDialog({ car, open, onOpenChange }: { car?: Car | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { mutate: addCar, isPending: isAdding } = useAddCar();
  const { mutate: updateCar, isPending: isUpdating } = useUpdateCar();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof carSchema>>({
    resolver: zodResolver(carSchema),
    defaultValues: { vehicleModel: "", vehicleNumber: "", seatingCapacity: 4, rentPerDay: 50 },
  });

  useEffect(() => {
    if (open) {
      if (car) {
        form.reset({
          vehicleModel: car.vehicleModel,
          vehicleNumber: car.vehicleNumber,
          seatingCapacity: car.seatingCapacity,
          rentPerDay: car.rentPerDay
        });
      } else {
        form.reset({ vehicleModel: "", vehicleNumber: "", seatingCapacity: 4, rentPerDay: 50 });
      }
    }
  }, [car, open, form]);

  const onSubmit = (data: z.infer<typeof carSchema>) => {
    if (car) {
      updateCar({ id: car.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAgencyCarsQueryKey() });
          toast({ title: "Success", description: "Car updated successfully" });
          onOpenChange(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e.error || "Failed to update", variant: "destructive" })
      });
    } else {
      addCar({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAgencyCarsQueryKey() });
          toast({ title: "Success", description: "Car added successfully" });
          onOpenChange(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e.error || "Failed to add", variant: "destructive" })
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{car ? 'Edit Vehicle' : 'List New Vehicle'}</DialogTitle>
          <DialogDescription>
            {car ? "Update the details of your listing." : "Add a new car to your fleet to start earning."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="vehicleModel" render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Model</FormLabel>
                <FormControl><Input placeholder="e.g. Toyota Camry" className="h-11 rounded-xl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vehicleNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate / Registration</FormLabel>
                <FormControl><Input placeholder="ABC-1234" className="h-11 rounded-xl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="seatingCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats</FormLabel>
                  <FormControl><Input type="number" min="1" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="rentPerDay" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent per Day ($)</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-primary shadow-md" disabled={isAdding || isUpdating}>
                {isAdding || isUpdating ? "Saving..." : "Save Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AgencyDashboardPage() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  const { data: cars, isLoading: isCarsLoading } = useGetAgencyCars();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!isUserLoading && (!user || user.role !== 'agency')) {
      setLocation('/login');
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading || !user || user.role !== 'agency') return null;

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCar(null);
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Fleet Management</h1>
          <p className="text-muted-foreground text-lg">Manage your vehicles and availability.</p>
        </div>
        <Button onClick={handleAddNew} className="rounded-xl h-12 px-6 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5 mr-2" /> Add New Vehicle
        </Button>
      </div>

      {isCarsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-[250px] bg-secondary/50 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : cars?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-[2rem] border border-dashed border-border shadow-sm">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No vehicles listed</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg">Start building your fleet by adding your first vehicle to accept bookings.</p>
          <Button onClick={handleAddNew} variant="outline" className="rounded-xl h-12 px-8 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary">
            List your first car
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars?.map(car => (
            <Card key={car.id} className="rounded-2xl border-border/60 shadow-md shadow-black/5 hover:shadow-xl transition-shadow bg-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-foreground mb-1">{car.vehicleModel}</h3>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary/50 inline-flex px-2 py-1 rounded-md border border-border/50">
                      <Key className="w-3.5 h-3.5" /> {car.vehicleNumber}
                    </div>
                  </div>
                  <Badge variant={car.available ? "default" : "secondary"} className={`rounded-full px-3 py-1 font-semibold ${car.available ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' : ''}`}>
                    {car.available ? "Available" : "Booked"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-border/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Capacity</span>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Users className="w-4 h-4 text-primary/70" /> {car.seatingCapacity} Seats
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rate</span>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CreditCard className="w-4 h-4 text-primary/70" /> ${car.rentPerDay}/day
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full rounded-xl h-11 border-border/80 hover:bg-secondary/80 font-semibold" onClick={() => handleEdit(car)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddEditCarDialog car={editingCar} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </AppLayout>
  );
}
