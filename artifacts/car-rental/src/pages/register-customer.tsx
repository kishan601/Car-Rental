import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterCustomer, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";

const formSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export default function RegisterCustomerPage() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const [, setLocation] = useLocation();
  const { mutate: register, isPending } = useRegisterCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  useEffect(() => {
    if (!isLoading && user) {
      setLocation(user.role === 'agency' ? '/agency/dashboard' : '/cars');
    }
  }, [user, isLoading, setLocation]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    register({ data }, {
      onSuccess: (res) => {
        queryClient.setQueryData(getGetMeQueryKey(), res.user);
        toast({ title: "Account created!", description: "Welcome to AutoRent." });
        setLocation('/cars');
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration Failed", 
          description: err.error || "An error occurred during registration.", 
          variant: "destructive" 
        });
      }
    });
  };

  if (isLoading || user) return null;

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Join as a customer to start booking premium vehicles"
    >
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
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl><Input placeholder="+1 (555) 000-0000" className="h-11 rounded-xl bg-secondary/30" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl font-bold mt-6 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90" 
            disabled={isPending}
          >
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
