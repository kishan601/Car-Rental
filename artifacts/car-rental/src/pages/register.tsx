import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterCustomer, useRegisterAgency, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { User, Building2 } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

const agencySchema = z.object({
  name: z.string().min(2, "Full name is required"),
  agencyName: z.string().min(2, "Agency name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

type Tab = "customer" | "agency";

function TabToggle({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex rounded-2xl bg-secondary/60 p-1 mb-6 border border-border/40">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          active === "customer"
            ? "bg-card shadow-md text-primary border border-border/50"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="w-4 h-4" />
        Customer
      </button>
      <button
        type="button"
        onClick={() => onChange("agency")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          active === "agency"
            ? "bg-card shadow-md text-primary border border-border/50"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Building2 className="w-4 h-4" />
        Agency
      </button>
    </div>
  );
}

function CustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: register, isPending } = useRegisterCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = (data: z.infer<typeof customerSchema>) => {
    register({ data }, {
      onSuccess: (res) => {
        queryClient.setQueryData(getGetMeQueryKey(), res.user);
        toast({ title: "Account created!", description: "Welcome to AutoRent." });
        setLocation("/cars");
      },
      onError: (err: any) => {
        toast({ title: "Registration Failed", description: err.error || "An error occurred.", variant: "destructive" });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input placeholder="John Doe" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl><Input placeholder="name@example.com" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" placeholder="Create a strong password" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number <span className="text-muted-foreground">(optional)</span></FormLabel>
            <FormControl><Input placeholder="+91 98765 43210" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90" disabled={isPending}>
          {isPending ? "Creating account..." : "Create Customer Account"}
        </Button>
      </form>
    </Form>
  );
}

function AgencyForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: register, isPending } = useRegisterAgency();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof agencySchema>>({
    resolver: zodResolver(agencySchema),
    defaultValues: { name: "", agencyName: "", email: "", password: "", phone: "" },
  });

  const onSubmit = (data: z.infer<typeof agencySchema>) => {
    register({ data }, {
      onSuccess: (res) => {
        queryClient.setQueryData(getGetMeQueryKey(), res.user);
        toast({ title: "Agency registered!", description: "Welcome to the partner network." });
        setLocation("/agency/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Registration Failed", description: err.error || "An error occurred.", variant: "destructive" });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl><Input placeholder="Jane Doe" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="agencyName" render={({ field }) => (
            <FormItem>
              <FormLabel>Agency Name</FormLabel>
              <FormControl><Input placeholder="Premium Rentals" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Business Email</FormLabel>
            <FormControl><Input placeholder="contact@agency.com" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" placeholder="Create a strong password" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Business Phone <span className="text-muted-foreground">(optional)</span></FormLabel>
            <FormControl><Input placeholder="+91 98765 43210" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90" disabled={isPending}>
          {isPending ? "Registering..." : "Register Agency"}
        </Button>
      </form>
    </Form>
  );
}

export default function RegisterPage({ defaultTab = "customer" }: { defaultTab?: Tab }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation(user.role === "agency" ? "/agency/dashboard" : "/cars");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || user) return null;

  const subtitle =
    activeTab === "customer"
      ? "Start booking premium vehicles today"
      : "List your fleet and manage bookings";

  return (
    <AuthLayout title="Create an account" subtitle={subtitle}>
      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === "customer" ? (
        <CustomerForm onSuccess={() => {}} />
      ) : (
        <AgencyForm onSuccess={() => {}} />
      )}

      <div className="mt-6 pt-5 border-t border-border/50 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
