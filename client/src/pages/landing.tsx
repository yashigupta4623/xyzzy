import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  GitBranch, 
  Shield, 
  Zap, 
  Github,
  Star,
  CheckCircle,
  Users,
  Brain,
  Target
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gh-dark text-gh-text">
      {/* Header */}
      <header className="bg-gh-surface border-b border-gh-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden animate-float animate-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-shift"></div>
              <Bot className="text-white text-lg relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gh-text tracking-tight">CodeRabbit Clone</span>
              <span className="text-xs text-purple-400 font-medium tracking-wider">AI REVIEW</span>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            <Github className="w-4 h-4 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 animate-float animate-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-shift"></div>
              <Bot className="text-white text-3xl relative z-10" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Advanced AI Code Review
          </h1>
          
          <p className="text-xl text-gh-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience CodeRabbit-level intelligence with deep contextual understanding. 
            Get senior developer insights, educational feedback, and adaptive learning 
            that grows with your team's coding patterns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg shadow-lg hover:shadow-purple-500/25 font-medium"
            >
              <Github className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-gh-border text-gh-text hover:bg-gh-surface px-8 py-4 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gh-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gh-text">
              CodeRabbit-Style Intelligence
            </h2>
            <p className="text-xl text-gh-text-secondary max-w-2xl mx-auto">
              Advanced contextual understanding with senior developer-level insights and adaptive learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Security Analysis</h3>
                <p className="text-gh-text-secondary">
                  Advanced vulnerability detection and security best practice enforcement
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Performance Insights</h3>
                <p className="text-gh-text-secondary">
                  Identify performance bottlenecks and optimization opportunities
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Code Quality</h3>
                <p className="text-gh-text-secondary">
                  Comprehensive quality scoring and maintainability assessment
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">AI Chat Assistant</h3>
                <p className="text-gh-text-secondary">
                  Interactive discussions about code changes and improvement suggestions
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Smart Recommendations</h3>
                <p className="text-gh-text-secondary">
                  Actionable suggestions for code improvements and best practices
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Adaptive Learning</h3>
                <p className="text-gh-text-secondary">
                  Learns your team's coding patterns and adapts to your architectural preferences
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Context Analysis</h3>
                <p className="text-gh-text-secondary">
                  Multi-file understanding with dependency mapping and complexity analysis
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gh-dark border-gh-border hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gh-text mb-2">Educational Insights</h3>
                <p className="text-gh-text-secondary">
                  Senior developer-level explanations that help teams learn and improve
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gh-text">
            Trusted by Development Teams
          </h2>
          
          <div className="flex justify-center items-center space-x-8 text-gh-text-secondary">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold text-gh-text">4.9</span>
              <span>Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-bold text-gh-text">10K+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5" />
              <span className="text-2xl font-bold text-gh-text">1M+</span>
              <span>Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-t border-gh-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-gh-text">
            Ready to Transform Your Code Reviews?
          </h2>
          <p className="text-xl text-gh-text-secondary mb-8">
            Join thousands of developers who have revolutionized their workflow with AI-powered insights.
          </p>
          
          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            <Github className="w-5 h-5 mr-2" />
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gh-surface border-t border-gh-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gh-text-secondary">
          <p>&copy; 2024 BugOtter. Powered by AI for smarter code reviews.</p>
        </div>
      </footer>
    </div>
  );
}
