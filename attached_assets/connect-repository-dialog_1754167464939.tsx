import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Github } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConnectRepositoryDialogProps {
  children?: React.ReactNode;
}

export default function ConnectRepositoryDialog({ children }: ConnectRepositoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect repository');
      }
      
      return response.json();
    },
    onSuccess: (repository) => {
      toast({
        title: "Repository Connected",
        description: `Successfully connected ${repository.fullName} and imported pull requests.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pull-requests'] });
      setOpen(false);
      setGithubUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect repository. Please check the URL and try again.",
        variant: "destructive"
      });
    }
  });

  const handleConnect = () => {
    if (!githubUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a GitHub repository URL.",
        variant: "destructive"
      });
      return;
    }
    
    connectMutation.mutate(githubUrl.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Connect Repository
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gh-surface border-gh-border text-gh-text">
        <DialogHeader>
          <DialogTitle className="flex items-center text-gh-text">
            <Github className="w-5 h-5 mr-2 text-purple-400" />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription className="text-gh-text-secondary">
            Enter a GitHub repository URL to connect and import pull requests for AI code review
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="github-url" className="text-gh-text">
                GitHub Repository URL
              </Label>
              <Input
                id="github-url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-gh-dark border-gh-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gh-text mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
              <p className="text-xs text-gh-text-secondary mt-1">
                Supported formats: https://github.com/owner/repo or owner/repo
              </p>
            </div>
            
            <div className="bg-gh-dark/50 p-4 rounded-lg border border-gh-border">
              <h4 className="text-sm font-medium text-gh-text mb-2">What happens when you connect?</h4>
              <ul className="text-sm text-gh-text-secondary space-y-1">
                <li>• Fetches repository information from GitHub API</li>
                <li>• Imports all open pull requests with file changes</li>
                <li>• Enables AI-powered code review analysis</li>
                <li>• Automatically tracks new pull requests</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gh-border text-gh-text hover:bg-gh-border/50"
              disabled={connectMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConnect}
              disabled={connectMutation.isPending || !githubUrl.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {connectMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Connect Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}