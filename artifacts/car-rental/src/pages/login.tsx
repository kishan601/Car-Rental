import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { LogIn } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const [, setLocation] = useLocation();
  const { mutate: login, isPending } = useLogin();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && user) {
      setLocation(user.role === 'agency' ? '/agency/dashboard' : '/cars');
    }
  }, [user, isLoading, setLocation]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    login({ data }, {
      onSuccess: (res) => {
        queryClient.setQueryData(getGetMeQueryKey(), res.user);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation(res.user.role === 'agency' ? '/agency/dashboard' : '/cars');
      },
      onError: (err: any) => {
        toast({ 
          title: "Login Failed", 
          description: err.error || "Invalid credentials. Please try again.", 
          variant: "destructive" 
        });
      }
    });
  };

  if (isLoading || user) return null;

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80 font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" className="h-12 rounded-xl bg-secondary/30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80 font-medium">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" className="h-12 rounded-xl bg-secondary/30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl font-bold text-md mt-4 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/90" 
            disabled={isPending}
          >
            {isPending ? "Signing in..." : (
              <span className="flex items-center gap-2">Sign In <LogIn className="w-4 h-4" /></span>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p className="mb-2">Don't have an account?</p>
        <div className="flex justify-center gap-4">
          <Link href="/register/customer" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
            Join as Customer
          </Link>
          <span className="text-border">|</span>
          <Link href="/register/agency" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
            Register Agency
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
