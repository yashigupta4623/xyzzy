import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSkeleton from "@/components/ui/loading-skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  CheckCircle, 
  TriangleAlert, 
  Lightbulb,
  Send,
  X,
  ThumbsUp,
  Shield,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AiReviewPanelProps {
  pullRequestId: string;
}

export default function AiReviewPanel({ pullRequestId }: AiReviewPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const { toast } = useToast();

  const { data: pullRequest } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId],
  });

  const { data: review, isLoading: isReviewLoading } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId, 'review'],
  });

  const { data: chatMessages, isLoading: isChatLoading } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId, 'chat'],
  });

  const generateReviewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/pull-requests/${pullRequestId}/review`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests', pullRequestId, 'review'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests', pullRequestId] });
      toast({
        title: "Review Generated",
        description: "AI review has been completed successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendChatMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/pull-requests/${pullRequestId}/chat`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests', pullRequestId, 'chat'] });
      setChatInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMutation.mutate(chatInput);
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="w-4 h-4 text-error" />;
      case 'enhancement':
        return <Lightbulb className="w-4 h-4 text-rabbit-primary" />;
      case 'bug':
        return <TriangleAlert className="w-4 h-4 text-warning" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gh-text-secondary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      critical: "bg-error text-white",
      high: "bg-error/80 text-white",
      medium: "bg-warning text-white",
      low: "bg-gh-text-secondary text-white",
    };
    return badges[severity as keyof typeof badges] || badges.low;
  };

  if (!pullRequest) return null;

  return (
    <aside className="w-96 bg-gh-surface border-l border-gh-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gh-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gh-text">PR #{pullRequest.number} Review</h3>
          <Button variant="ghost" size="sm" className="text-gh-text-secondary hover:text-gh-text">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-rabbit-primary rounded-full flex items-center justify-center">
            <Bot className="text-white w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gh-text">BugOtter AI</p>
            <p className="text-xs text-gh-text-secondary">
              {review ? "Review complete" : "Ready to review"}
            </p>
          </div>
        </div>

        {!review && !isReviewLoading && (
          <Button
            onClick={() => generateReviewMutation.mutate()}
            disabled={generateReviewMutation.isPending}
            className="w-full bg-rabbit-primary hover:bg-indigo-600 text-white"
          >
            {generateReviewMutation.isPending ? "Analyzing..." : "Generate AI Review"}
          </Button>
        )}
      </div>

      {/* AI Summary */}
      {review && (
        <div className="p-6 border-b border-gh-border">
          <h4 className="font-medium text-gh-text mb-3 flex items-center">
            <Brain className="text-rabbit-primary mr-2 w-4 h-4" />
            AI Review Summary
          </h4>
          
          <div className="bg-gh-dark border border-gh-border rounded-lg p-4">
            <p className="text-sm text-gh-text mb-2">
              <strong>Overall Assessment:</strong> {review.summary}
            </p>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-gh-text-secondary">Code Quality Score: {review.codeQualityScore}/100</span>
              </div>
              {review.testCoverage && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-gh-text-secondary">Test Coverage: {review.testCoverage}%</span>
                </div>
              )}
              {review.securityIssues > 0 && (
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-warning" />
                  <span className="text-gh-text-secondary">{review.securityIssues} security considerations found</span>
                </div>
              )}
              {review.performanceIssues > 0 && (
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-warning" />
                  <span className="text-gh-text-secondary">{review.performanceIssues} performance issues found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isReviewLoading && (
        <div className="p-6 border-b border-gh-border">
          <LoadingSkeleton />
        </div>
      )}

      {/* AI Comments */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h4 className="font-medium text-gh-text mb-3 flex items-center">
            <MessageSquare className="text-rabbit-primary mr-2 w-4 h-4" />
            AI Comments
          </h4>
          
          {review?.comments && review.comments.length > 0 ? (
            <div className="space-y-4">
              {review.comments.map((comment: any, index: number) => (
                <div key={index} className={cn(
                  "bg-gh-dark border rounded-lg p-4",
                  comment.severity === 'critical' && "border-error",
                  comment.severity === 'high' && "border-error/60",
                  comment.severity === 'medium' && "border-warning",
                  comment.severity === 'low' && "border-gh-border",
                  !comment.severity && "border-rabbit-primary"
                )}>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="text-white text-xs" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCommentTypeIcon(comment.commentType)}
                        <Badge className={cn("text-xs", getSeverityBadge(comment.severity))}>
                          {comment.commentType}
                        </Badge>
                        {comment.lineNumber && (
                          <span className="text-xs text-gh-text-secondary">Line {comment.lineNumber}</span>
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
                        <Button variant="ghost" size="sm" className="text-xs text-rabbit-primary hover:underline p-0 h-auto">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-gh-text-secondary hover:text-gh-text p-0 h-auto">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          2
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : review && !isReviewLoading ? (
            <div className="text-center py-8">
              <p className="text-gh-text-secondary">No specific comments. Overall review looks good!</p>
            </div>
          ) : !review && !isReviewLoading ? (
            <div className="text-center py-8">
              <p className="text-gh-text-secondary">Generate an AI review to see detailed comments.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Chat Section */}
      <div className="border-t border-gh-border">
        <div className="p-6">
          <h4 className="font-medium text-gh-text mb-3 flex items-center">
            <MessageSquare className="text-rabbit-primary mr-2 w-4 h-4" />
            Chat with AI
          </h4>
          
          <ScrollArea className="bg-gh-dark border border-gh-border rounded-lg p-4 mb-4 h-32">
            {isChatLoading ? (
              <LoadingSkeleton />
            ) : chatMessages && Array.isArray(chatMessages) && chatMessages.length > 0 ? (
              <div className="space-y-3 text-sm">
                {chatMessages.map((message: any) => (
                  <div key={message.id} className="flex items-start space-x-2">
                    {message.role === 'assistant' ? (
                      <>
                        <div className="w-5 h-5 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="text-white text-xs" />
                        </div>
                        <div className="bg-rabbit-primary/10 rounded-lg p-2 max-w-xs">
                          <p className="text-gh-text">{message.content}</p>
                          <span className="text-xs text-gh-text-secondary">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 bg-gh-border rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-gh-text text-xs">U</span>
                        </div>
                        <div className="bg-gh-surface rounded-lg p-2 max-w-xs">
                          <p className="text-gh-text">{message.content}</p>
                          <span className="text-xs text-gh-text-secondary">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gh-text-secondary">
                  Hello! I'm here to help you with this pull request. Feel free to ask me any questions about the code changes or security concerns.
                </p>
              </div>
            )}
          </ScrollArea>
          
          <div className="flex space-x-2">
            <Input 
              type="text" 
              placeholder="Ask BugOtter anything..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-gh-dark border-gh-border text-sm focus:border-rabbit-primary focus:ring-2 focus:ring-rabbit-primary/20"
              disabled={sendChatMutation.isPending}
            />
            <Button 
              onClick={handleSendChat}
              disabled={sendChatMutation.isPending || !chatInput.trim()}
              className="bg-rabbit-primary hover:bg-indigo-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
