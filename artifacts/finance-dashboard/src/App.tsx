import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setupApiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Records from "@/pages/records";
import Users from "@/pages/users";
import Profile from "@/pages/profile";

setupApiClient();

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, roles }: { component: any, roles?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role)) return <Redirect to="/dashboard" />;
  
  return <Component />;
}

function PublicRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Redirect to="/dashboard" />;
  
  return <Component />;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/login" component={() => <PublicRoute component={Login} />} />
        <Route path="/signup" component={() => <PublicRoute component={Signup} />} />
        
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} roles={["viewer", "analyst", "admin"]} />} />
        <Route path="/records" component={() => <ProtectedRoute component={Records} roles={["analyst", "admin"]} />} />
        <Route path="/users" component={() => <ProtectedRoute component={Users} roles={["admin"]} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} roles={["viewer", "analyst", "admin"]} />} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
