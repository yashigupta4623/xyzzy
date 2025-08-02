import { CodeBlock } from "@/components/ui/code-block";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FilePlus, 
  FileX, 
  FileEdit 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeDiffProps {
  files: Array<{
    id: string;
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
    content?: string;
  }>;
}

export default function CodeDiff({ files }: CodeDiffProps) {
  const getFileIcon = (status: string) => {
    switch (status) {
      case "added":
        return <FilePlus className="w-4 h-4 text-success" />;
      case "deleted":
        return <FileX className="w-4 h-4 text-error" />;
      case "modified":
        return <FileEdit className="w-4 h-4 text-warning" />;
      default:
        return <FileText className="w-4 h-4 text-gh-text-secondary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      added: { color: "bg-success", text: "Added" },
      deleted: { color: "bg-error", text: "Deleted" },
      modified: { color: "bg-warning", text: "Modified" },
      renamed: { color: "bg-rabbit-primary", text: "Renamed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge className={cn(config.color, "text-white text-xs")}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gh-surface border border-gh-border rounded-lg p-4">
        <h4 className="font-medium text-gh-text mb-3">
          Changed Files ({files.length})
        </h4>
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center justify-between p-2 bg-gh-dark rounded border border-gh-border"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file.status)}
                <span className="text-sm font-mono text-gh-text">{file.filename}</span>
                {getStatusBadge(file.status)}
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-success">+{file.additions}</span>
                <span className="text-error">-{file.deletions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {files.map((file) => (
        <Card key={file.id} className="bg-gh-surface border-gh-border">
          <CardContent className="p-0">
            {file.patch && (
              <CodeBlock 
                code={file.patch}
                filename={file.filename}
                language="diff"
                showLineNumbers={true}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
