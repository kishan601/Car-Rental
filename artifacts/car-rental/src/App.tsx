import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import CarsPage from "@/pages/cars";
import LoginPage from "@/pages/login";
import RegisterCustomerPage from "@/pages/register-customer";
import RegisterAgencyPage from "@/pages/register-agency";
import AgencyDashboardPage from "@/pages/agency/dashboard";
import AgencyBookingsPage from "@/pages/agency/bookings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/cars" />} />
      <Route path="/cars" component={CarsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register/customer" component={RegisterCustomerPage} />
      <Route path="/register/agency" component={RegisterAgencyPage} />
      <Route path="/agency/dashboard" component={AgencyDashboardPage} />
      <Route path="/agency/bookings" component={AgencyBookingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
