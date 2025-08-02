import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import Repositories from "./pages/repositories";
import Reviews from "./pages/reviews";
import Analytics from "./pages/analytics";
import ReviewHistory from "./pages/review-history";
import Settings from "./pages/settings";
import Repository from "./pages/repository";
import PullRequest from "./pages/pull-request";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/repositories" component={Repositories} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/review-history" component={ReviewHistory} />
      <Route path="/settings" component={Settings} />
      <Route path="/repositories/:id" component={Repository} />
      <Route path="/pull-requests/:id" component={PullRequest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gh-dark text-gh-text font-inter">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
