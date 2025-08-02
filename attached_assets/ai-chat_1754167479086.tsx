import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Bot, 
  User, 
  Send 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiChatProps {
  pullRequestId: string;
}

export default function AiChat({ pullRequestId }: AiChatProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: messages } = useQuery({
    queryKey: ['/api/pull-requests', pullRequestId, 'chat'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/pull-requests/${pullRequestId}/chat`, {
        role: 'user',
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/pull-requests', pullRequestId, 'chat'] 
      });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  return (
    <div className="p-6">
      <h4 className="font-medium text-gh-text mb-3 flex items-center">
        <MessageSquare className="w-4 h-4 text-rabbit-primary mr-2" />
        Chat with AI
      </h4>
      
      <Card className="bg-gh-dark border-gh-border mb-4">
        <CardContent className="p-4">
          <ScrollArea className="h-64">
            <div className="space-y-3 text-sm">
              {messages?.length === 0 && (
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-rabbit-primary/10 rounded-lg p-2 max-w-xs">
                    <p className="text-gh-text">
                      Hello! I'm here to help you with this pull request. 
                      Feel free to ask me any questions about the code changes, 
                      security concerns, or best practices.
                    </p>
                  </div>
                </div>
              )}
              
              {messages?.map((msg: any) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start space-x-2 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-5 h-5 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-2 max-w-xs ${
                    msg.role === 'user' 
                      ? 'bg-gh-border/50' 
                      : 'bg-rabbit-primary/10'
                  }`}>
                    <p className="text-gh-text">{msg.message}</p>
                    <p className="text-xs text-gh-text-secondary mt-1">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-5 h-5 bg-gh-text-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-gh-dark" />
                    </div>
                  )}
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-rabbit-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-rabbit-primary/10 rounded-lg p-2 max-w-xs">
                    <p className="text-gh-text">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask CodeRabbit anything..."
          disabled={sendMessageMutation.isPending}
          className="flex-1 bg-gh-dark border-gh-border focus:border-rabbit-primary"
        />
        <Button 
          type="submit"
          disabled={sendMessageMutation.isPending || !message.trim()}
          className="bg-rabbit-primary hover:bg-indigo-600 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
