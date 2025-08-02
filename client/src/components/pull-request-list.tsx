import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSkeleton from "@/components/ui/loading-skeleton";
import { 
  User, 
  Clock, 
  Plus, 
  Minus, 
  MessageSquare, 
  Bot,
  CheckCircle,
  AlertTriangle,
  TriangleAlert,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PullRequestListProps {
  repositoryId?: string;
}

export default function PullRequestList({ repositoryId }: PullRequestListProps) {
  const { data: pullRequests, isLoading } = useQuery({
    queryKey: ['/api/pull-requests', repositoryId].filter(Boolean),
  });

  if (isLoading) {
    return (
      <Card className="bg-gh-surface border-gh-border">
        <CardContent className="p-6">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (reviewStatus: string) => {
    const badges = {
      approved: { icon: CheckCircle, color: "bg-success", text: "Approved" },
      changes_requested: { icon: TriangleAlert, color: "bg-error", text: "Changes Requested" },
      in_review: { icon: AlertTriangle, color: "bg-warning", text: "In Review" },
      pending: { icon: Clock, color: "bg-gh-text-secondary", text: "Pending" },
    };
    
    const badge = badges[reviewStatus as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <Badge className={cn(badge.color, "text-white text-xs")}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </Badge>
    );
  };

  const getReviewIcon = (reviewStatus: string) => {
    if (reviewStatus === "approved") {
      return <CheckCircle className="w-6 h-6 bg-success rounded-full p-1 text-white" />;
    } else if (reviewStatus === "changes_requested") {
      return <TriangleAlert className="w-6 h-6 bg-error rounded-full p-1 text-white" />;
    }
    return <Bot className="w-6 h-6 bg-rabbit-primary rounded-full p-1 text-white" />;
  };

  return (
    <Card className="bg-gh-surface border-gh-border">
      <div className="p-6 border-b border-gh-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gh-text">Pull Requests</h2>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="bg-gh-dark border-gh-border text-gh-text w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="merged">Merged</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="text-gh-text-secondary hover:text-gh-text">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gh-border">
        {pullRequests && Array.isArray(pullRequests) && pullRequests.map((pr: any) => (
          <Link 
            key={pr.id} 
            href={`/pull-requests/${pr.id}`}
            className="block hover:bg-gh-border/20 transition-colors cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className="bg-success text-white text-xs">
                      #{pr.number}
                    </Badge>
                    <h3 className="font-medium text-gh-text">{pr.title}</h3>
                    {getStatusBadge(pr.reviewStatus)}
                  </div>
                  
                  <p className="text-sm text-gh-text-secondary mb-3 line-clamp-2">
                    {pr.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gh-text-secondary">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {pr.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center text-success">
                      <Plus className="w-3 h-3 mr-1" />
                      +{pr.additions}
                    </span>
                    <span className="flex items-center text-error">
                      <Minus className="w-3 h-3 mr-1" />
                      -{pr.deletions}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {pr.changedFiles} files
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {getReviewIcon(pr.reviewStatus)}
                  <Button 
                    size="sm"
                    className={cn(
                      "text-xs",
                      pr.reviewStatus === "approved" 
                        ? "bg-success hover:bg-green-700 text-white"
                        : pr.reviewStatus === "changes_requested"
                        ? "bg-gh-border text-gh-text hover:bg-gh-border/70"
                        : "bg-rabbit-primary hover:bg-indigo-600 text-white"
                    )}
                  >
                    {pr.reviewStatus === "approved" 
                      ? "Merge"
                      : pr.reviewStatus === "changes_requested"
                      ? "Address Issues"
                      : "View Review"
                    }
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {(!pullRequests || !Array.isArray(pullRequests) || pullRequests.length === 0) && (
          <div className="p-12 text-center">
            <p className="text-gh-text-secondary">No pull requests found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
