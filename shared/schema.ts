import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Repositories table
export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  name: varchar("name").notNull(),
  owner: varchar("owner").notNull(),
  description: text("description"),
  defaultBranch: varchar("default_branch").default("main"),
  githubId: integer("github_id").unique(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pull requests table
export const pullRequests = pgTable("pull_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull(),
  number: integer("number").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  author: varchar("author").notNull(),
  baseBranch: varchar("base_branch").notNull(),
  headBranch: varchar("head_branch").notNull(),
  status: varchar("status").notNull().default("open"), // open, closed, merged
  reviewStatus: varchar("review_status").default("pending"), // pending, in_review, approved, changes_requested
  additions: integer("additions").default(0),
  deletions: integer("deletions").default(0),
  changedFiles: integer("changed_files").default(0),
  githubId: integer("github_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PR files table
export const prFiles = pgTable("pr_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull(),
  filename: varchar("filename").notNull(),
  status: varchar("status").notNull(), // added, modified, deleted, renamed
  additions: integer("additions").default(0),
  deletions: integer("deletions").default(0),
  patch: text("patch"),
  previousFilename: varchar("previous_filename"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI reviews table
export const aiReviews = pgTable("ai_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull(),
  overallRating: varchar("overall_rating").notNull(), // approved, changes_requested, commented
  codeQualityScore: integer("code_quality_score"),
  testCoverage: real("test_coverage"),
  securityIssues: integer("security_issues").default(0),
  performanceIssues: integer("performance_issues").default(0),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Review comments table
export const reviewComments = pgTable("review_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiReviewId: varchar("ai_review_id").notNull(),
  fileId: varchar("file_id"),
  lineNumber: integer("line_number"),
  commentType: varchar("comment_type").notNull(), // security, enhancement, bug, style
  severity: varchar("severity").default("low"), // low, medium, high, critical
  message: text("message").notNull(),
  suggestion: text("suggestion"),
  status: varchar("status").default("open"), // open, resolved, dismissed
  resolvedBy: varchar("resolved_by"), // user id who resolved
  resolvedAt: timestamp("resolved_at"),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PR merge status table
export const prMergeStatus = pgTable("pr_merge_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull().unique(),
  canMerge: boolean("can_merge").default(false),
  blockedReason: text("blocked_reason"),
  totalComments: integer("total_comments").default(0),
  resolvedComments: integer("resolved_comments").default(0),
  criticalIssues: integer("critical_issues").default(0),
  lastChecked: timestamp("last_checked").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull(),
  userId: varchar("user_id"),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning patterns table (CodeRabbit-style adaptive learning)
export const learningPatterns = pgTable("learning_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull(),
  patternType: varchar("pattern_type").notNull(), // coding_style, architecture, testing, security
  pattern: jsonb("pattern").notNull(), // Stores the learned pattern data
  confidence: real("confidence").default(0.5),
  occurrences: integer("occurrences").default(1),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Code context analysis table (CodeRabbit-style multi-file understanding)
export const codeContext = pgTable("code_context", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull(),
  fileId: varchar("file_id").notNull(),
  dependencies: text("dependencies").array().default([]), // Related files/modules
  exports: jsonb("exports"), // What this file exports
  imports: jsonb("imports"), // What this file imports
  complexity: real("complexity"), // Cyclomatic complexity
  maintainabilityIndex: real("maintainability_index"),
  techDebt: real("tech_debt_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced review insights table (CodeRabbit-style detailed analysis)
export const reviewInsights = pgTable("review_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: varchar("pull_request_id").notNull(),
  category: varchar("category").notNull(), // new_features, bug_fixes, tests, chores, refactor
  riskLevel: varchar("risk_level").default("low"), // low, medium, high, critical
  changeType: varchar("change_type").notNull(), // feature, bugfix, refactor, docs, test
  impactScore: real("impact_score").default(0.0), // 0-1 scale
  reviewTime: integer("review_time"), // Estimated review time in minutes
  educationalValue: real("educational_value").default(0.0), // Learning opportunities
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const repositoriesRelations = relations(repositories, ({ many }) => ({
  pullRequests: many(pullRequests),
}));

export const pullRequestsRelations = relations(pullRequests, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [pullRequests.repositoryId],
    references: [repositories.id],
  }),
  files: many(prFiles),
  aiReviews: many(aiReviews),
  chatMessages: many(chatMessages),
}));

export const prFilesRelations = relations(prFiles, ({ one, many }) => ({
  pullRequest: one(pullRequests, {
    fields: [prFiles.pullRequestId],
    references: [pullRequests.id],
  }),
  comments: many(reviewComments),
}));

export const aiReviewsRelations = relations(aiReviews, ({ one, many }) => ({
  pullRequest: one(pullRequests, {
    fields: [aiReviews.pullRequestId],
    references: [pullRequests.id],
  }),
  comments: many(reviewComments),
}));

export const reviewCommentsRelations = relations(reviewComments, ({ one }) => ({
  aiReview: one(aiReviews, {
    fields: [reviewComments.aiReviewId],
    references: [aiReviews.id],
  }),
  file: one(prFiles, {
    fields: [reviewComments.fileId],
    references: [prFiles.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  pullRequest: one(pullRequests, {
    fields: [chatMessages.pullRequestId],
    references: [pullRequests.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const learningPatternsRelations = relations(learningPatterns, ({ one }) => ({
  repository: one(repositories, {
    fields: [learningPatterns.repositoryId],
    references: [repositories.id],
  }),
}));

export const codeContextRelations = relations(codeContext, ({ one }) => ({
  pullRequest: one(pullRequests, {
    fields: [codeContext.pullRequestId],
    references: [pullRequests.id],
  }),
  file: one(prFiles, {
    fields: [codeContext.fileId],
    references: [prFiles.id],
  }),
}));

export const reviewInsightsRelations = relations(reviewInsights, ({ one }) => ({
  pullRequest: one(pullRequests, {
    fields: [reviewInsights.pullRequestId],
    references: [pullRequests.id],
  }),
}));

export const prMergeStatusRelations = relations(prMergeStatus, ({ one }) => ({
  pullRequest: one(pullRequests, {
    fields: [prMergeStatus.pullRequestId],
    references: [pullRequests.id],
  }),
}));

// Insert schemas
export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPullRequestSchema = createInsertSchema(pullRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrFileSchema = createInsertSchema(prFiles).omit({
  id: true,
  createdAt: true,
});

export const insertAiReviewSchema = createInsertSchema(aiReviews).omit({
  id: true,
  createdAt: true,
});

export const insertReviewCommentSchema = createInsertSchema(reviewComments).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({
  id: true,
  createdAt: true,
  lastSeen: true,
});

export const insertCodeContextSchema = createInsertSchema(codeContext).omit({
  id: true,
  createdAt: true,
});

export const insertReviewInsightSchema = createInsertSchema(reviewInsights).omit({
  id: true,
  createdAt: true,
});

export const insertPrMergeStatusSchema = createInsertSchema(prMergeStatus).omit({
  id: true,
  lastChecked: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type PullRequest = typeof pullRequests.$inferSelect;
export type InsertPullRequest = z.infer<typeof insertPullRequestSchema>;
export type PrFile = typeof prFiles.$inferSelect;
export type InsertPrFile = z.infer<typeof insertPrFileSchema>;
export type AiReview = typeof aiReviews.$inferSelect;
export type InsertAiReview = z.infer<typeof insertAiReviewSchema>;
export type ReviewComment = typeof reviewComments.$inferSelect;
export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;
export type CodeContext = typeof codeContext.$inferSelect;
export type InsertCodeContext = z.infer<typeof insertCodeContextSchema>;
export type ReviewInsight = typeof reviewInsights.$inferSelect;
export type InsertReviewInsight = z.infer<typeof insertReviewInsightSchema>;
export type PrMergeStatus = typeof prMergeStatus.$inferSelect;
export type InsertPrMergeStatus = z.infer<typeof insertPrMergeStatusSchema>;
