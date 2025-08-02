import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GitMerge, Lock, AlertTriangle, Check } from "lucide-react";

interface MergeStatus {
  canMerge: boolean;
  blockedReason?: string;
  totalComments: number;
  resolvedComments: number;
  criticalIssues: number;
}

interface MergeButtonProps {
  pullRequestId: string;
  pullRequestTitle: string;
  onMerge?: () => void;
}

export default function MergeButton({ pullRequestId, pullRequestTitle, onMerge }: MergeButtonProps) {
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const { data: mergeStatus, isLoading } = useQuery<MergeStatus>({
    queryKey: ['/api/pull-requests', pullRequestId, 'merge-status'],
  });

  const handleMerge = async () => {
    if (!mergeStatus?.canMerge) {
      toast({
        title: "Cannot merge",
        description: mergeStatus?.blockedReason || "This pull request has unresolved issues.",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);
    try {
      // Simulate merge operation (in a real app, this would call GitHub API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Pull request merged!",
        description: `"${pullRequestTitle}" has been successfully merged.`,
      });
      
      onMerge?.();
    } catch (error) {
      toast({
        title: "Merge failed",
        description: "Failed to merge the pull request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gh-surface border-gh-border">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gh-border rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gh-surface border-gh-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mergeStatus?.canMerge ? (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  All checks passed
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-600 dark:text-red-400">
                  Merge blocked
                </span>
              </div>
            )}
            
            {mergeStatus && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {mergeStatus.resolvedComments}/{mergeStatus.totalComments} resolved
                </Badge>
                {mergeStatus.criticalIssues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {mergeStatus.criticalIssues} critical
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleMerge}
            disabled={!mergeStatus?.canMerge || isMerging}
            className={`${
              mergeStatus?.canMerge
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <GitMerge className="w-4 h-4 mr-2" />
            {isMerging ? "Merging..." : "Merge pull request"}
          </Button>
        </div>

        {!mergeStatus?.canMerge && mergeStatus?.blockedReason && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-red-700 dark:text-red-400 mb-1">
                Merge blocked
              </div>
              <div className="text-red-600 dark:text-red-400">
                {mergeStatus.blockedReason}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}