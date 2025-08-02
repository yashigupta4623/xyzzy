import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AiReviewPanel from "@/components/ai-review-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Clock, 
  Plus, 
  Minus, 
  MessageSquare,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  TriangleAlert
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function PullRequestDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: pullRequest, isLoading } = useQuery({
    queryKey: ['/api/pull-requests', id],
  });

  const { data: files } = useQuery({
    queryKey: ['/api/pull-requests', id, 'files'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gh-dark text-gh-text">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 flex">
            <div className="flex-1 p-6">
              <Card className="bg-gh-surface border-gh-border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4 bg-gh-border" />
                    <Skeleton className="h-4 w-full bg-gh-border" />
                    <Skeleton className="h-4 w-1/2 bg-gh-border" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <div className="min-h-screen bg-gh-dark text-gh-text">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gh-text mb-2">Pull Request Not Found</h2>
              <p className="text-gh-text-secondary">The requested pull request could not be found.</p>
            </div>
          </main>
        </div>
      </div>
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

  return (
    <div className="min-h-screen bg-gh-dark text-gh-text">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 flex">
          <div className="flex-1 p-6 space-y-6">
            {/* PR Header */}
            <Card className="bg-gh-surface border-gh-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className="bg-success text-white text-sm">
                        #{pullRequest.number}
                      </Badge>
                      <h1 className="text-2xl font-semibold text-gh-text">{pullRequest.title}</h1>
                      {getStatusBadge(pullRequest.reviewStatus || 'pending')}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gh-text-secondary mb-4">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {pullRequest.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(pullRequest.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center">
                        <GitBranch className="w-4 h-4 mr-1" />
                        {pullRequest.headBranch} → {pullRequest.baseBranch}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-success">
                        <Plus className="w-4 h-4 mr-1" />
                        +{pullRequest.additions}
                      </span>
                      <span className="flex items-center text-error">
                        <Minus className="w-4 h-4 mr-1" />
                        -{pullRequest.deletions}
                      </span>
                      <span className="flex items-center text-gh-text-secondary">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {pullRequest.changedFiles} files changed
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      className={cn(
                        "text-sm",
                        pullRequest.reviewStatus === "approved" 
                          ? "bg-success hover:bg-green-700 text-white"
                          : "bg-rabbit-primary hover:bg-indigo-600 text-white"
                      )}
                    >
                      {pullRequest.reviewStatus === "approved" ? "Merge" : "Review"}
                    </Button>
                  </div>
                </div>
                
                {pullRequest.description && (
                  <div className="border-t border-gh-border pt-4">
                    <h3 className="text-sm font-medium text-gh-text mb-2">Description</h3>
                    <p className="text-sm text-gh-text-secondary whitespace-pre-wrap">
                      {pullRequest.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files Changed */}
            <Card className="bg-gh-surface border-gh-border">
              <div className="p-6 border-b border-gh-border">
                <h2 className="text-lg font-semibold text-gh-text">Files Changed</h2>
              </div>
              
              <div className="divide-y divide-gh-border">
                {files && Array.isArray(files) && files.map((file: any) => (
                  <div key={file.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-gh-text">{file.filename}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            file.status === 'added' && "border-success text-success",
                            file.status === 'modified' && "border-warning text-warning",
                            file.status === 'deleted' && "border-error text-error"
                          )}
                        >
                          {file.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-success">+{file.additions}</span>
                        <span className="text-error">-{file.deletions}</span>
                      </div>
                    </div>
                    
                    {file.patch && (
                      <div className="bg-gh-dark border border-gh-border rounded p-2 font-mono text-xs overflow-x-auto">
                        <pre className="text-gh-text-secondary whitespace-pre-wrap">
                          {file.patch}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!files || !Array.isArray(files) || files.length === 0) && (
                  <div className="p-8 text-center">
                    <p className="text-gh-text-secondary">No file changes available.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <AiReviewPanel pullRequestId={id!} />
        </main>
      </div>
    </div>
  );
}
