import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import PullRequestList from "@/components/pull-request-list";
import AiReviewPanel from "@/components/ai-review-panel";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [location] = useLocation();
  const activePrId = location.startsWith('/pull-requests/') ? location.split('/')[2] : null;

  const { data: repositories } = useQuery({
    queryKey: ['/api/repositories'],
  });

  const activeRepo = repositories && Array.isArray(repositories) && repositories.length > 0 ? repositories[0] : null;

  return (
    <div className="min-h-screen bg-gh-dark text-gh-text">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 flex">
          <div className="flex-1 p-6">
            <PullRequestList repositoryId={activeRepo?.id} />
          </div>
          
          {activePrId && (
            <AiReviewPanel pullRequestId={activePrId} />
          )}
        </main>
      </div>
    </div>
  );
}
