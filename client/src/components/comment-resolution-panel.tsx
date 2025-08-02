import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Check, X, Lock, Unlock, MessageSquare } from "lucide-react";

interface ReviewComment {
  id: string;
  message: string;
  suggestion?: string;
  commentType: string;
  severity: string;
  status: string;
  lineNumber?: number;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

interface MergeStatus {
  canMerge: boolean;
  blockedReason?: string;
  totalComments: number;
  resolvedComments: number;
  criticalIssues: number;
}

interface CommentResolutionPanelProps {
  pullRequestId: string;
}

export default function CommentResolutionPanel({ pullRequestId }: CommentResolutionPanelProps) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unresolvedComments = [], isLoading: commentsLoading } = useQuery<ReviewComment[]>({
    queryKey: ['/api/pull-requests', pullRequestId, 'unresolved-comments'],
  });

  const { data: mergeStatus, isLoading: statusLoading } = useQuery<MergeStatus>({
    queryKey: ['/api/pull-requests', pullRequestId, 'merge-status'],
  });

  const resolveCommentMutation = useMutation({
    mutationFn: async ({ commentId, note }: { commentId: string; note?: string }) => {
      await apiRequest(`/api/comments/${commentId}/resolve`, 'POST', { resolutionNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests', pullRequestId] });
      toast({
        title: "Comment resolved",
        description: "The comment has been marked as resolved.",
      });
      setIsResolveDialogOpen(false);
      setResolutionNote("");
      setSelectedComment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const dismissCommentMutation = useMutation({
    mutationFn: async ({ commentId, note }: { commentId: string; note?: string }) => {
      await apiRequest(`/api/comments/${commentId}/dismiss`, 'POST', { resolutionNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests', pullRequestId] });
      toast({
        title: "Comment dismissed",
        description: "The comment has been dismissed.",
      });
      setIsDismissDialogOpen(false);
      setResolutionNote("");
      setSelectedComment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'bug': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'enhancement': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'style': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleResolveClick = (commentId: string) => {
    setSelectedComment(commentId);
    setIsResolveDialogOpen(true);
  };

  const handleDismissClick = (commentId: string) => {
    setSelectedComment(commentId);
    setIsDismissDialogOpen(true);
  };

  const handleResolveSubmit = () => {
    if (selectedComment) {
      resolveCommentMutation.mutate({
        commentId: selectedComment,
        note: resolutionNote.trim() || undefined,
      });
    }
  };

  const handleDismissSubmit = () => {
    if (selectedComment) {
      dismissCommentMutation.mutate({
        commentId: selectedComment,
        note: resolutionNote.trim() || undefined,
      });
    }
  };

  if (commentsLoading || statusLoading) {
    return (
      <Card className="bg-gh-surface border-gh-border">
        <CardHeader>
          <CardTitle className="text-gh-text">Loading review status...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Merge Status Card */}
      <Card className="bg-gh-surface border-gh-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gh-text">
            {mergeStatus?.canMerge ? (
              <>
                <Unlock className="w-5 h-5 text-green-500" />
                Ready to Merge
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-red-500" />
                Merge Blocked
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mergeStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gh-text">{mergeStatus.totalComments}</div>
                <div className="text-sm text-gh-text-secondary">Total Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{mergeStatus.resolvedComments}</div>
                <div className="text-sm text-gh-text-secondary">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{mergeStatus.criticalIssues}</div>
                <div className="text-sm text-gh-text-secondary">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{unresolvedComments.length}</div>
                <div className="text-sm text-gh-text-secondary">Unresolved</div>
              </div>
            </div>
          )}
          
          {!mergeStatus?.canMerge && mergeStatus?.blockedReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 dark:text-red-400 font-medium">Merge Blocked</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-1">{mergeStatus.blockedReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unresolved Comments */}
      <Card className="bg-gh-surface border-gh-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gh-text">
            <MessageSquare className="w-5 h-5" />
            Unresolved Comments ({unresolvedComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unresolvedComments.length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gh-text mb-2">All Comments Resolved!</h3>
              <p className="text-gh-text-secondary">Great job! All review comments have been addressed.</p>
            </div>
          ) : (
            unresolvedComments.map((comment) => (
              <div key={comment.id} className="border border-gh-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(comment.severity)}>
                      {comment.severity?.toUpperCase()}
                    </Badge>
                    <Badge className={getTypeColor(comment.commentType)}>
                      {comment.commentType?.toUpperCase()}
                    </Badge>
                    {comment.lineNumber && (
                      <span className="text-sm text-gh-text-secondary">Line {comment.lineNumber}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isResolveDialogOpen && selectedComment === comment.id} onOpenChange={(open) => {
                      setIsResolveDialogOpen(open);
                      if (!open) {
                        setSelectedComment(null);
                        setResolutionNote("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveClick(comment.id)}
                          className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Comment</DialogTitle>
                          <DialogDescription>
                            Mark this comment as resolved. Optionally add a note explaining how it was addressed.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Optional: Add a note about how this was resolved..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleResolveSubmit}
                            disabled={resolveCommentMutation.isPending}
                          >
                            Resolve Comment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDismissDialogOpen && selectedComment === comment.id} onOpenChange={(open) => {
                      setIsDismissDialogOpen(open);
                      if (!open) {
                        setSelectedComment(null);
                        setResolutionNote("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissClick(comment.id)}
                          className="border-gray-500 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dismiss Comment</DialogTitle>
                          <DialogDescription>
                            Dismiss this comment as not applicable. Please provide a reason for dismissing.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Reason for dismissing this comment..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDismissDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleDismissSubmit}
                            disabled={dismissCommentMutation.isPending || !resolutionNote.trim()}
                            variant="destructive"
                          >
                            Dismiss Comment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gh-text">{comment.message}</p>
                  {comment.suggestion && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                      <div className="font-medium text-blue-700 dark:text-blue-400 mb-1">Suggestion:</div>
                      <p className="text-blue-600 dark:text-blue-300">{comment.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}