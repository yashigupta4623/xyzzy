import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, User } from "lucide-react";
import ConnectRepositoryDialog from "@/components/connect-repository-dialog";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-gh-surface border-b border-gh-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden animate-float animate-glow">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-shift"></div>
              <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                {/* Creative BugOtter logo - floating tech otter */}
                <path d="M12 2c-1.8 0-3.2 1-4 2.3-.5.8-.4 1.7.1 2.5.4.6.9 1.1 1.6 1.4-.1.3-.4.7-.7 1.1-.9 1.1-2.2 2.5-3.5 3.2-1.1.6-2.3.7-3.5.4v7c0 .9.8 1.6 1.6 1.6h1.8v2.8c0 .3.3.6.6.6s.6-.3.6-.6V20h6.8v2.8c0 .3.3.6.6.6s.6-.3.6-.6V20h1.8c.9 0 1.6-.7 1.6-1.6v-7c-1.2.3-2.4.2-3.5-.4-1.3-.7-2.6-2.1-3.5-3.2-.3-.4-.6-.8-.7-1.1.7-.3 1.2-.8 1.6-1.4.5-.8.6-1.7.1-2.5C15.2 3 13.8 2 12 2z"/>
                {/* Floating particles/debug symbols */}
                <circle cx="8.5" cy="10.5" r="1.2" opacity="0.9"/>
                <circle cx="15.5" cy="10.5" r="1.2" opacity="0.9"/>
                <path d="M6 7l2 1M16 7l2 1" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.7"/>
                <rect x="6.5" y="22.5" width="1.2" height="1.2" rx="0.6" opacity="0.8"/>
                <rect x="16.3" y="22.5" width="1.2" height="1.2" rx="0.6" opacity="0.8"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gh-text tracking-tight">BugOtter</span>
              <span className="text-xs text-purple-400 font-medium tracking-wider">AI REVIEW</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            <Link href="/" className="text-gh-text hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">
              Dashboard
            </Link>
            <Link href="/repositories" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">
              Repositories
            </Link>
            <Link href="/reviews" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">
              Reviews
            </Link>
            <Link href="/analytics" className="text-gh-text-secondary hover:text-purple-400 transition-all duration-200 font-medium hover:scale-105">
              Analytics
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gh-dark border-gh-border w-64 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 pr-10 transition-all duration-200"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gh-text-secondary w-4 h-4" />
          </div>
          
          <ConnectRepositoryDialog />
          
          <Avatar className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 border border-purple-500/30">
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
