import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeCodeReview, generateChatResponse } from "./gemini";
import {
  insertRepositorySchema,
  insertPullRequestSchema,
  insertChatMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Repository routes
  app.get('/api/repositories', async (req, res) => {
    try {
      const repositories = await storage.getRepositories();
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.post('/api/repositories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRepositorySchema.parse(req.body);
      const repository = await storage.createRepository(validatedData);
      res.status(201).json(repository);
    } catch (error) {
      console.error("Error creating repository:", error);
      res.status(400).json({ message: "Invalid repository data" });
    }
  });

  app.get('/api/repositories/:id', async (req, res) => {
    try {
      const repository = await storage.getRepository(req.params.id);
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }
      res.json(repository);
    } catch (error) {
      console.error("Error fetching repository:", error);
      res.status(500).json({ message: "Failed to fetch repository" });
    }
  });

  // Pull request routes
  app.get('/api/pull-requests', async (req, res) => {
    try {
      const repositoryId = req.query.repositoryId as string;
      const pullRequests = await storage.getPullRequests(repositoryId);
      res.json(pullRequests);
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      res.status(500).json({ message: "Failed to fetch pull requests" });
    }
  });

  app.post('/api/pull-requests', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPullRequestSchema.parse(req.body);
      const pullRequest = await storage.createPullRequest(validatedData);
      res.status(201).json(pullRequest);
    } catch (error) {
      console.error("Error creating pull request:", error);
      res.status(400).json({ message: "Invalid pull request data" });
    }
  });

  app.get('/api/pull-requests/:id', async (req, res) => {
    try {
      const pullRequest = await storage.getPullRequest(req.params.id);
      if (!pullRequest) {
        return res.status(404).json({ message: "Pull request not found" });
      }
      res.json(pullRequest);
    } catch (error) {
      console.error("Error fetching pull request:", error);
      res.status(500).json({ message: "Failed to fetch pull request" });
    }
  });

  // AI Review routes
  app.get('/api/pull-requests/:id/review', async (req, res) => {
    try {
      const review = await storage.getAiReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      const comments = await storage.getReviewComments(review.id);
      res.json({ ...review, comments });
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  app.post('/api/pull-requests/:id/review', isAuthenticated, async (req, res) => {
    try {
      const pullRequest = await storage.getPullRequest(req.params.id);
      if (!pullRequest) {
        return res.status(404).json({ message: "Pull request not found" });
      }

      const files = await storage.getPrFiles(req.params.id);
      
      // Analyze with AI
      const analysis = await analyzeCodeReview(
        pullRequest.title,
        pullRequest.description || "",
        files.map(f => ({
          filename: f.filename,
          status: f.status,
          patch: f.patch || "",
          additions: f.additions || 0,
          deletions: f.deletions || 0
        }))
      );

      // Save AI review
      const review = await storage.createAiReview({
        pullRequestId: req.params.id,
        overallRating: analysis.overallRating,
        codeQualityScore: analysis.codeQualityScore,
        testCoverage: analysis.testCoverage,
        securityIssues: analysis.securityIssues,
        performanceIssues: analysis.performanceIssues,
        summary: analysis.summary,
      });

      // Save comments
      const comments = [];
      for (const comment of analysis.comments) {
        const savedComment = await storage.createReviewComment({
          aiReviewId: review.id,
          commentType: comment.commentType,
          severity: comment.severity,
          message: comment.message,
          suggestion: comment.suggestion,
          lineNumber: comment.lineNumber,
        });
        comments.push(savedComment);
      }

      // Save CodeRabbit-style insights
      await storage.createReviewInsight({
        pullRequestId: req.params.id,
        category: analysis.insights.category,
        riskLevel: analysis.insights.riskLevel,
        changeType: analysis.insights.changeType,
        impactScore: analysis.insights.impactScore,
        reviewTime: analysis.insights.reviewTime,
        educationalValue: analysis.insights.educationalValue,
      });

      // Save context analysis for each file
      for (const context of analysis.contextAnalysis) {
        const file = files.find(f => f.filename === context.filename);
        if (file) {
          await storage.createCodeContext({
            pullRequestId: req.params.id,
            fileId: file.id,
            dependencies: context.dependencies,
            complexity: context.complexity,
            maintainabilityIndex: context.maintainabilityIndex,
            techDebt: context.techDebtScore,
          });
        }
      }

      // Save learning patterns
      const repository = await storage.getRepository(pullRequest.repositoryId);
      if (repository) {
        for (const pattern of analysis.learningPatterns) {
          await storage.createLearningPattern({
            repositoryId: repository.id,
            patternType: pattern.patternType,
            pattern: pattern.pattern,
            confidence: pattern.confidence,
          });
        }
      }

      // Update PR review status
      await storage.updatePullRequestStatus(req.params.id, pullRequest.status, analysis.overallRating);

      res.json({ 
        ...review, 
        comments,
        insights: analysis.insights,
        contextAnalysis: analysis.contextAnalysis,
        learningPatterns: analysis.learningPatterns
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Chat routes
  app.get('/api/pull-requests/:id/chat', async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/pull-requests/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.claims.sub;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      const pullRequest = await storage.getPullRequest(req.params.id);
      if (!pullRequest) {
        return res.status(404).json({ message: "Pull request not found" });
      }

      // Save user message
      await storage.createChatMessage({
        pullRequestId: req.params.id,
        userId,
        role: "user",
        content,
      });

      // Get chat history and review context
      const chatHistory = await storage.getChatMessages(req.params.id);
      const review = await storage.getAiReview(req.params.id);

      // Generate AI response
      const aiResponse = await generateChatResponse(content, {
        pullRequestTitle: pullRequest.title,
        pullRequestDescription: pullRequest.description || "",
        reviewSummary: review?.summary || undefined,
        chatHistory: chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        pullRequestId: req.params.id,
        role: "assistant",
        content: aiResponse,
      });

      res.json(aiMessage);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // PR Files routes
  app.get('/api/pull-requests/:id/files', async (req, res) => {
    try {
      const files = await storage.getPrFiles(req.params.id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching PR files:", error);
      res.status(500).json({ message: "Failed to fetch PR files" });
    }
  });

  // CodeRabbit-style feature routes
  app.get('/api/pull-requests/:id/insights', async (req, res) => {
    try {
      const insights = await storage.getReviewInsights(req.params.id);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching review insights:", error);
      res.status(500).json({ message: "Failed to fetch review insights" });
    }
  });

  app.get('/api/pull-requests/:id/context', async (req, res) => {
    try {
      const context = await storage.getCodeContext(req.params.id);
      res.json(context);
    } catch (error) {
      console.error("Error fetching code context:", error);
      res.status(500).json({ message: "Failed to fetch code context" });
    }
  });

  app.get('/api/repositories/:id/patterns', async (req, res) => {
    try {
      const patterns = await storage.getLearningPatterns(req.params.id);
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching learning patterns:", error);
      res.status(500).json({ message: "Failed to fetch learning patterns" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
