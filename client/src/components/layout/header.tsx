import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Search, Plus, User, Github } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-gh-surface border-b border-gh-border px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden animate-float animate-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-shift"></div>
              <Bot className="text-white text-lg relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gh-text tracking-tight">BugOtter</span>
              <span className="text-xs text-purple-400 font-medium tracking-wider">AI REVIEW</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            <a href="/" className="text-gh-text hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">Dashboard</a>
            <a href="#" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">Repositories</a>
            <a href="#" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">Reviews</a>
            <a href="#" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">Analytics</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search repositories..." 
              className="bg-gh-dark border-gh-border w-64 px-4 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 pr-10 transition-all duration-200"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gh-text-secondary w-4 h-4" />
          </div>
          
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Connect Repository
          </Button>
          
          <div className="flex items-center space-x-2">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-purple-500/30"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center border border-purple-500/30">
                <User className="text-white text-sm" />
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-gh-text-secondary hover:text-gh-text"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
