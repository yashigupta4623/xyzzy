import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  History, 
  BarChart3, 
  Settings, 
  Github 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: repositories } = useQuery({
    queryKey: ['/api/repositories'],
  });

  const { data: pullRequests } = useQuery({
    queryKey: ['/api/pull-requests'],
  });

  const activeRepo = repositories && Array.isArray(repositories) && repositories.length > 0 ? repositories[0] : null;
  const openPRCount = pullRequests && Array.isArray(pullRequests) 
    ? pullRequests.filter((pr: any) => pr.status === 'open').length 
    : 0;

  const navItems = [
    {
      href: "/",
      icon: GitBranch,
      label: "Pull Requests",
      badge: openPRCount,
      active: location === "/" || location.startsWith("/pull-requests")
    },
    {
      href: "/review-history",
      icon: History,
      label: "Review History",
      active: location === "/review-history"
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      active: location === "/analytics"
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      active: location === "/settings"
    }
  ];

  return (
    <aside className="w-64 bg-gh-surface border-r border-gh-border p-6 min-h-screen">
      <div className="space-y-6">
        {/* Repository Selector */}
        <div>
          <h3 className="text-sm font-medium text-gh-text mb-3">Active Repository</h3>
          <div className="bg-gh-dark border border-gh-border rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Github className="text-gh-text-secondary w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-gh-text">
                  {activeRepo?.fullName || "acme-corp/web-app"}
                </p>
                <p className="text-xs text-gh-text-secondary">
                  {openPRCount} open PRs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  item.active
                    ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-l-2 border-purple-400 shadow-lg"
                    : "text-gh-text-secondary hover:bg-gh-border/50 hover:text-gh-text"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs shadow-md">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-medium text-gh-text mb-3">Recent Reviews</h3>
          <div className="space-y-2">
            <div className="p-2 bg-gh-dark rounded border border-gh-border">
              <p className="text-xs font-medium text-gh-text">#245 User authentication</p>
              <p className="text-xs text-success">✓ Approved</p>
            </div>
            <div className="p-2 bg-gh-dark rounded border border-gh-border">
              <p className="text-xs font-medium text-gh-text">#244 Fix memory leak</p>
              <p className="text-xs text-warning">⏳ In Review</p>
            </div>
            <div className="p-2 bg-gh-dark rounded border border-gh-border">
              <p className="text-xs font-medium text-gh-text">#243 Add API tests</p>
              <p className="text-xs text-error">⚠ Changes Requested</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
