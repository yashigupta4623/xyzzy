import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TriangleAlert,
  Bot,
  RefreshCw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiReviewPanelProps {
  pullRequestId: string;
  onClose?: () => void;
}

export default function AiReviewPanel({ pullRequestId, onClose }: AiReviewPanelProps) {
  const { toast } = useToast();

  const { data: pullRequest } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId],
  });

  const { data: comments } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId, 'comments'],
  });

  const generateReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/pull-requests/${pullRequestId}/review`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/pull-requests', pullRequestId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/pull-requests', pullRequestId, 'comments'] 
      });
      toast({
        title: "AI Review Generated",
        description: "The AI has completed its review of this pull request.",
      });
    },
    onError: () => {
      toast({
        title: "Review Failed",
        description: "Failed to generate AI review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return <TriangleAlert className="w-4 h-4 text-error" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return "border-error";
      case "warning":
        return "border-warning";
      default:
        return "border-rabbit-primary";
    }
  };

  if (!pullRequest) {
    return (
      <div className="w-96 bg-gh-surface border-l border-gh-border p-6">
        <Skeleton className="h-8 w-full bg-gh-border mb-4" />
        <Skeleton className="h-20 w-full bg-gh-border" />
      </div>
    );
  }

  return (
    <aside className="w-96 bg-gh-surface border-l border-gh-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gh-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gh-text">PR #{pullRequest.number} Review</h3>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gh-text-secondary hover:text-gh-text"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-rabbit-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gh-text">CodeRabbit AI</p>
            <p className="text-xs text-gh-text-secondary">
              {pullRequest.aiReview ? "Review complete" : "Ready to review"}
            </p>
          </div>
        </div>

        {!pullRequest.aiReview && (
          <Button
            onClick={() => generateReviewMutation.mutate()}
            disabled={generateReviewMutation.isPending}
            className="w-full bg-rabbit-primary hover:bg-indigo-600 text-white"
          >
            {generateReviewMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Review...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Review
              </>
            )}
          </Button>
        )}
      </div>

      {/* AI Summary */}
      {pullRequest.aiReview && (
        <div className="p-6 border-b border-gh-border">
          <h4 className="font-medium text-gh-text mb-3 flex items-center">
            <Brain className="w-4 h-4 text-rabbit-primary mr-2" />
            AI Review Summary
          </h4>
          
          <Card className="bg-gh-dark border-gh-border">
            <CardContent className="p-4">
              <p className="text-sm text-gh-text mb-2">
                <strong>Overall Assessment:</strong> {pullRequest.aiReview.summary}
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-gh-text-secondary">
                    Code Quality Score: {pullRequest.aiReview.codeQualityScore}/100
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-gh-text-secondary">
                    Test Coverage: {pullRequest.aiReview.testCoverage}%
                  </span>
                </div>
                {pullRequest.aiReview.securityIssues > 0 && (
                  <div className="flex items-center space-x-2">
                    <TriangleAlert className="w-3 h-3 text-error" />
                    <span className="text-gh-text-secondary">
                      {pullRequest.aiReview.securityIssues} security issues found
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Comments */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h4 className="font-medium text-gh-text mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 text-rabbit-primary mr-2" />
            AI Comments
          </h4>
          
          <div className="space-y-4">
            {comments?.map((comment: any) => (
              <Card 
                key={comment.id} 
                className={cn("bg-gh-dark border", getSeverityColor(comment.severity))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityIcon(comment.severity)}
                        <Badge variant="outline" className="text-xs">
                          {comment.type}
                        </Badge>
                        {comment.lineNumber && (
                          <span className="text-xs text-gh-text-secondary">
                            Line {comment.lineNumber}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gh-text mb-2">{comment.message}</p>
                      
                      {comment.suggestion && (
                        <div className="bg-gh-surface border border-gh-border rounded p-2 mt-2">
                          <p className="text-xs font-medium text-gh-text mb-1">Suggestion:</p>
                          <p className="text-xs text-gh-text-secondary">{comment.suggestion}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="link" size="sm" className="text-xs text-rabbit-primary p-0 h-auto">
                          Reply
                        </Button>
                        <Button variant="link" size="sm" className="text-xs text-gh-text-secondary p-0 h-auto hover:text-gh-text">
                          👍 2
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!comments || comments.length === 0) && pullRequest.aiReview && (
              <p className="text-sm text-gh-text-secondary text-center py-8">
                No issues found. Great job! 🎉
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
