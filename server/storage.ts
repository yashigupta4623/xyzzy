import {
  users,
  repositories,
  pullRequests,
  prFiles,
  aiReviews,
  reviewComments,
  chatMessages,
  learningPatterns,
  codeContext,
  reviewInsights,
  prMergeStatus,
  type User,
  type UpsertUser,
  type Repository,
  type InsertRepository,
  type PullRequest,
  type InsertPullRequest,
  type PrFile,
  type InsertPrFile,
  type AiReview,
  type InsertAiReview,
  type ReviewComment,
  type InsertReviewComment,
  type ChatMessage,
  type InsertChatMessage,
  type LearningPattern,
  type InsertLearningPattern,
  type CodeContext,
  type InsertCodeContext,
  type ReviewInsight,
  type InsertReviewInsight,
  type PrMergeStatus,
  type InsertPrMergeStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Repository operations
  getRepositories(): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  
  // Pull request operations
  getPullRequests(repositoryId?: string): Promise<PullRequest[]>;
  getPullRequest(id: string): Promise<PullRequest | undefined>;
  createPullRequest(pullRequest: InsertPullRequest): Promise<PullRequest>;
  updatePullRequestStatus(id: string, status: string, reviewStatus?: string): Promise<void>;
  
  // PR file operations
  getPrFiles(pullRequestId: string): Promise<PrFile[]>;
  createPrFile(file: InsertPrFile): Promise<PrFile>;
  
  // AI review operations
  getAiReview(pullRequestId: string): Promise<AiReview | undefined>;
  createAiReview(review: InsertAiReview): Promise<AiReview>;
  
  // Review comment operations
  getReviewComments(aiReviewId: string): Promise<ReviewComment[]>;
  createReviewComment(comment: InsertReviewComment): Promise<ReviewComment>;
  
  // Chat message operations
  getChatMessages(pullRequestId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Learning pattern operations (CodeRabbit-style)
  getLearningPatterns(repositoryId: string): Promise<LearningPattern[]>;
  createLearningPattern(pattern: InsertLearningPattern): Promise<LearningPattern>;
  updateLearningPattern(id: string, occurrences: number, confidence: number): Promise<void>;
  
  // Code context operations
  getCodeContext(pullRequestId: string): Promise<CodeContext[]>;
  createCodeContext(context: InsertCodeContext): Promise<CodeContext>;
  
  // Review insights operations
  getReviewInsights(pullRequestId: string): Promise<ReviewInsight[]>;
  createReviewInsight(insight: InsertReviewInsight): Promise<ReviewInsight>;
  
  // Comment resolution operations
  resolveComment(commentId: string, resolvedBy: string, resolutionNote?: string): Promise<void>;
  dismissComment(commentId: string, resolvedBy: string, resolutionNote?: string): Promise<void>;
  getUnresolvedComments(pullRequestId: string): Promise<ReviewComment[]>;
  
  // Merge status operations
  getPrMergeStatus(pullRequestId: string): Promise<PrMergeStatus | undefined>;
  createPrMergeStatus(status: InsertPrMergeStatus): Promise<PrMergeStatus>;
  updatePrMergeStatus(pullRequestId: string, canMerge: boolean, blockedReason?: string): Promise<void>;
  checkMergeEligibility(pullRequestId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Repository operations
  async getRepositories(): Promise<Repository[]> {
    return await db.select().from(repositories).orderBy(desc(repositories.updatedAt));
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repository] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repository;
  }

  async createRepository(repository: InsertRepository): Promise<Repository> {
    const [newRepo] = await db.insert(repositories).values(repository).returning();
    return newRepo;
  }

  // Pull request operations
  async getPullRequests(repositoryId?: string): Promise<PullRequest[]> {
    const query = db.select().from(pullRequests);
    
    if (repositoryId) {
      return await query.where(eq(pullRequests.repositoryId, repositoryId)).orderBy(desc(pullRequests.createdAt));
    }
    
    return await query.orderBy(desc(pullRequests.createdAt));
  }

  async getPullRequest(id: string): Promise<PullRequest | undefined> {
    const [pr] = await db.select().from(pullRequests).where(eq(pullRequests.id, id));
    return pr;
  }

  async createPullRequest(pullRequest: InsertPullRequest): Promise<PullRequest> {
    const [newPr] = await db.insert(pullRequests).values(pullRequest).returning();
    return newPr;
  }

  async updatePullRequestStatus(id: string, status: string, reviewStatus?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (reviewStatus) {
      updateData.reviewStatus = reviewStatus;
    }
    
    await db.update(pullRequests)
      .set(updateData)
      .where(eq(pullRequests.id, id));
  }

  // PR file operations
  async getPrFiles(pullRequestId: string): Promise<PrFile[]> {
    return await db.select().from(prFiles).where(eq(prFiles.pullRequestId, pullRequestId));
  }

  async createPrFile(file: InsertPrFile): Promise<PrFile> {
    const [newFile] = await db.insert(prFiles).values(file).returning();
    return newFile;
  }

  // AI review operations
  async getAiReview(pullRequestId: string): Promise<AiReview | undefined> {
    const [review] = await db.select().from(aiReviews)
      .where(eq(aiReviews.pullRequestId, pullRequestId))
      .orderBy(desc(aiReviews.createdAt));
    return review;
  }

  async createAiReview(review: InsertAiReview): Promise<AiReview> {
    const [newReview] = await db.insert(aiReviews).values(review).returning();
    return newReview;
  }

  // Review comment operations
  async getReviewComments(aiReviewId: string): Promise<ReviewComment[]> {
    return await db.select().from(reviewComments)
      .where(eq(reviewComments.aiReviewId, aiReviewId))
      .orderBy(reviewComments.lineNumber);
  }

  async createReviewComment(comment: InsertReviewComment): Promise<ReviewComment> {
    const [newComment] = await db.insert(reviewComments).values(comment).returning();
    return newComment;
  }

  // Chat message operations
  async getChatMessages(pullRequestId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.pullRequestId, pullRequestId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Learning pattern operations (CodeRabbit-style)
  async getLearningPatterns(repositoryId: string): Promise<LearningPattern[]> {
    return await db.select().from(learningPatterns)
      .where(eq(learningPatterns.repositoryId, repositoryId))
      .orderBy(desc(learningPatterns.confidence));
  }

  async createLearningPattern(pattern: InsertLearningPattern): Promise<LearningPattern> {
    const [newPattern] = await db.insert(learningPatterns).values(pattern).returning();
    return newPattern;
  }

  async updateLearningPattern(id: string, occurrences: number, confidence: number): Promise<void> {
    await db.update(learningPatterns)
      .set({ 
        occurrences, 
        confidence, 
        lastSeen: new Date() 
      })
      .where(eq(learningPatterns.id, id));
  }

  // Code context operations
  async getCodeContext(pullRequestId: string): Promise<CodeContext[]> {
    return await db.select().from(codeContext)
      .where(eq(codeContext.pullRequestId, pullRequestId));
  }

  async createCodeContext(context: InsertCodeContext): Promise<CodeContext> {
    const [newContext] = await db.insert(codeContext).values(context).returning();
    return newContext;
  }

  // Review insights operations
  async getReviewInsights(pullRequestId: string): Promise<ReviewInsight[]> {
    return await db.select().from(reviewInsights)
      .where(eq(reviewInsights.pullRequestId, pullRequestId));
  }

  async createReviewInsight(insight: InsertReviewInsight): Promise<ReviewInsight> {
    const [newInsight] = await db.insert(reviewInsights).values(insight).returning();
    return newInsight;
  }

  // Comment resolution operations
  async resolveComment(commentId: string, resolvedBy: string, resolutionNote?: string): Promise<void> {
    await db
      .update(reviewComments)
      .set({
        status: "resolved",
        resolvedBy,
        resolvedAt: new Date(),
        resolutionNote,
      })
      .where(eq(reviewComments.id, commentId));
    
    // Update merge status for the related PR
    const comment = await db.select().from(reviewComments).where(eq(reviewComments.id, commentId)).limit(1);
    if (comment.length > 0) {
      const review = await db.select().from(aiReviews).where(eq(aiReviews.id, comment[0].aiReviewId)).limit(1);
      if (review.length > 0) {
        await this.updateMergeStatusForPr(review[0].pullRequestId);
      }
    }
  }

  async dismissComment(commentId: string, resolvedBy: string, resolutionNote?: string): Promise<void> {
    await db
      .update(reviewComments)
      .set({
        status: "dismissed",
        resolvedBy,
        resolvedAt: new Date(),
        resolutionNote,
      })
      .where(eq(reviewComments.id, commentId));
    
    // Update merge status for the related PR
    const comment = await db.select().from(reviewComments).where(eq(reviewComments.id, commentId)).limit(1);
    if (comment.length > 0) {
      const review = await db.select().from(aiReviews).where(eq(aiReviews.id, comment[0].aiReviewId)).limit(1);
      if (review.length > 0) {
        await this.updateMergeStatusForPr(review[0].pullRequestId);
      }
    }
  }

  async getUnresolvedComments(pullRequestId: string): Promise<ReviewComment[]> {
    const reviews = await db.select().from(aiReviews).where(eq(aiReviews.pullRequestId, pullRequestId));
    const reviewIds = reviews.map(r => r.id);
    
    if (reviewIds.length === 0) return [];
    
    return await db
      .select()
      .from(reviewComments)
      .where(
        and(
          inArray(reviewComments.aiReviewId, reviewIds),
          eq(reviewComments.status, "open")
        )
      );
  }

  // Merge status operations
  async getPrMergeStatus(pullRequestId: string): Promise<PrMergeStatus | undefined> {
    const [status] = await db
      .select()
      .from(prMergeStatus)
      .where(eq(prMergeStatus.pullRequestId, pullRequestId));
    return status;
  }

  async createPrMergeStatus(status: InsertPrMergeStatus): Promise<PrMergeStatus> {
    const [newStatus] = await db
      .insert(prMergeStatus)
      .values(status)
      .returning();
    return newStatus;
  }

  async updatePrMergeStatus(pullRequestId: string, canMerge: boolean, blockedReason?: string): Promise<void> {
    await db
      .update(prMergeStatus)
      .set({
        canMerge,
        blockedReason,
        updatedAt: new Date(),
      })
      .where(eq(prMergeStatus.pullRequestId, pullRequestId));
  }

  async checkMergeEligibility(pullRequestId: string): Promise<boolean> {
    const unresolvedComments = await this.getUnresolvedComments(pullRequestId);
    const criticalIssues = unresolvedComments.filter(c => c.severity === "critical" || c.severity === "high");
    
    return unresolvedComments.length === 0 || criticalIssues.length === 0;
  }

  private async updateMergeStatusForPr(pullRequestId: string): Promise<void> {
    const unresolvedComments = await this.getUnresolvedComments(pullRequestId);
    const totalComments = await this.getTotalComments(pullRequestId);
    const resolvedComments = totalComments - unresolvedComments.length;
    const criticalIssues = unresolvedComments.filter(c => c.severity === "critical" || c.severity === "high").length;
    
    const canMerge = await this.checkMergeEligibility(pullRequestId);
    const blockedReason = canMerge ? null : 
      criticalIssues > 0 ? `${criticalIssues} critical/high severity issues must be resolved` :
      `${unresolvedComments.length} unresolved comments`;

    // Update or create merge status
    const existingStatus = await this.getPrMergeStatus(pullRequestId);
    if (existingStatus) {
      await db
        .update(prMergeStatus)
        .set({
          canMerge,
          blockedReason,
          totalComments,
          resolvedComments,
          criticalIssues,
          lastChecked: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(prMergeStatus.pullRequestId, pullRequestId));
    } else {
      await this.createPrMergeStatus({
        pullRequestId,
        canMerge,
        blockedReason,
        totalComments,
        resolvedComments,
        criticalIssues,
      });
    }
  }

  private async getTotalComments(pullRequestId: string): Promise<number> {
    const reviews = await db.select().from(aiReviews).where(eq(aiReviews.pullRequestId, pullRequestId));
    const reviewIds = reviews.map(r => r.id);
    
    if (reviewIds.length === 0) return 0;
    
    const comments = await db
      .select()
      .from(reviewComments)
      .where(inArray(reviewComments.aiReviewId, reviewIds));
    
    return comments.length;
  }
}

export const storage = new DatabaseStorage();
