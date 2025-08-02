import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CodeReviewAnalysis {
  overallRating: "approved" | "changes_requested" | "commented";
  codeQualityScore: number;
  testCoverage: number;
  securityIssues: number;
  performanceIssues: number;
  summary: string;
  comments: Array<{
    filename?: string;
    lineNumber?: number;
    commentType: "security" | "enhancement" | "bug" | "style";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    suggestion?: string;
  }>;
  // CodeRabbit-style advanced features
  insights: {
    category: "new_features" | "bug_fixes" | "tests" | "chores" | "refactor";
    riskLevel: "low" | "medium" | "high" | "critical";
    changeType: "feature" | "bugfix" | "refactor" | "docs" | "test";
    impactScore: number; // 0-1 scale
    reviewTime: number; // Estimated review time in minutes
    educationalValue: number; // 0-1 scale
  };
  contextAnalysis: Array<{
    filename: string;
    dependencies: string[];
    complexity: number;
    maintainabilityIndex: number;
    techDebtScore: number;
  }>;
  learningPatterns: Array<{
    patternType: "coding_style" | "architecture" | "testing" | "security";
    pattern: any;
    confidence: number;
  }>;
}

export async function analyzeCodeReview(
  title: string,
  description: string,
  files: Array<{
    filename: string;
    status: string;
    patch: string;
    additions: number;
    deletions: number;
  }>
): Promise<CodeReviewAnalysis> {
  try {
    const prompt = `You are CodeRabbit, an advanced AI code reviewer providing senior developer-level insights. Analyze this pull request with deep contextual understanding and provide comprehensive feedback in JSON format.

Pull Request Details:
Title: ${title}
Description: ${description}

Files Changed:
${files.map(f => `
File: ${f.filename} (${f.status})
Additions: +${f.additions}, Deletions: -${f.deletions}
Changes:
${f.patch}
`).join('\n')}

Provide a CodeRabbit-style analysis with the following JSON structure:
{
  "overallRating": "approved" | "changes_requested" | "commented",
  "codeQualityScore": number (1-100),
  "testCoverage": number (0-100, estimate percentage),
  "securityIssues": number (count of security issues found),
  "performanceIssues": number (count of performance issues found),
  "summary": "string (educational 2-3 sentences with context)",
  "comments": [
    {
      "filename": "string",
      "lineNumber": number (if applicable),
      "commentType": "security" | "enhancement" | "bug" | "style",
      "severity": "low" | "medium" | "high" | "critical",
      "message": "string (educational explanation with reasoning)",
      "suggestion": "string (specific actionable improvement)"
    }
  ],
  "insights": {
    "category": "new_features" | "bug_fixes" | "tests" | "chores" | "refactor",
    "riskLevel": "low" | "medium" | "high" | "critical",
    "changeType": "feature" | "bugfix" | "refactor" | "docs" | "test",
    "impactScore": number (0-1, impact on codebase),
    "reviewTime": number (estimated minutes for human review),
    "educationalValue": number (0-1, learning opportunities)
  },
  "contextAnalysis": [
    {
      "filename": "string",
      "dependencies": ["array of related files/modules"],
      "complexity": number (1-10 cyclomatic complexity estimate),
      "maintainabilityIndex": number (0-100),
      "techDebtScore": number (0-100, higher = more debt)
    }
  ],
  "learningPatterns": [
    {
      "patternType": "coding_style" | "architecture" | "testing" | "security",
      "pattern": object (learned pattern data),
      "confidence": number (0-1, confidence in pattern)
    }
  ]
}

Focus on:
- Multi-file contextual understanding and dependencies
- Educational feedback that helps developers learn
- Security vulnerabilities with explanations
- Performance bottlenecks and optimizations
- Code architecture and maintainability
- Testing strategies and coverage
- Learning patterns in the codebase
- Estimation of review complexity and impact`;

    const systemPrompt = "You are an expert code reviewer. Analyze the provided pull request and respond with JSON only. Be thorough but constructive in your feedback.";

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallRating: { type: "string", enum: ["approved", "changes_requested", "commented"] },
            codeQualityScore: { type: "number" },
            testCoverage: { type: "number" },
            securityIssues: { type: "number" },
            performanceIssues: { type: "number" },
            summary: { type: "string" },
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  lineNumber: { type: "number" },
                  commentType: { type: "string", enum: ["security", "enhancement", "bug", "style"] },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  message: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            insights: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["new_features", "bug_fixes", "tests", "chores", "refactor"] },
                riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
                changeType: { type: "string", enum: ["feature", "bugfix", "refactor", "docs", "test"] },
                impactScore: { type: "number" },
                reviewTime: { type: "number" },
                educationalValue: { type: "number" }
              },
              required: ["category", "riskLevel", "changeType", "impactScore", "reviewTime", "educationalValue"]
            },
            contextAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } },
                  complexity: { type: "number" },
                  maintainabilityIndex: { type: "number" },
                  techDebtScore: { type: "number" }
                }
              }
            },
            learningPatterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  patternType: { type: "string", enum: ["coding_style", "architecture", "testing", "security"] },
                  pattern: { type: "object" },
                  confidence: { type: "number" }
                }
              }
            }
          },
          required: ["overallRating", "codeQualityScore", "testCoverage", "securityIssues", "performanceIssues", "summary", "comments", "insights", "contextAnalysis", "learningPatterns"]
        }
      },
      contents: prompt,
    });

    const analysis = JSON.parse(response.text || "{}");
    
    // Validate and sanitize the response
    return {
      overallRating: analysis.overallRating || "commented",
      codeQualityScore: Math.max(1, Math.min(100, analysis.codeQualityScore || 75)),
      testCoverage: Math.max(0, Math.min(100, analysis.testCoverage || 80)),
      securityIssues: Math.max(0, analysis.securityIssues || 0),
      performanceIssues: Math.max(0, analysis.performanceIssues || 0),
      summary: analysis.summary || "Code review completed with CodeRabbit-style analysis.",
      comments: Array.isArray(analysis.comments) ? analysis.comments.map((comment: any) => ({
        filename: comment.filename,
        lineNumber: comment.lineNumber,
        commentType: comment.commentType || "enhancement",
        severity: comment.severity || "low",
        message: comment.message || "No specific comment",
        suggestion: comment.suggestion
      })) : [],
      insights: {
        category: analysis.insights?.category || "chores",
        riskLevel: analysis.insights?.riskLevel || "low",
        changeType: analysis.insights?.changeType || "refactor",
        impactScore: Math.max(0, Math.min(1, analysis.insights?.impactScore || 0.3)),
        reviewTime: Math.max(1, analysis.insights?.reviewTime || 10),
        educationalValue: Math.max(0, Math.min(1, analysis.insights?.educationalValue || 0.3))
      },
      contextAnalysis: Array.isArray(analysis.contextAnalysis) ? analysis.contextAnalysis.map((ctx: any) => ({
        filename: ctx.filename || "unknown",
        dependencies: Array.isArray(ctx.dependencies) ? ctx.dependencies : [],
        complexity: Math.max(1, Math.min(10, ctx.complexity || 5)),
        maintainabilityIndex: Math.max(0, Math.min(100, ctx.maintainabilityIndex || 70)),
        techDebtScore: Math.max(0, Math.min(100, ctx.techDebtScore || 20))
      })) : [],
      learningPatterns: Array.isArray(analysis.learningPatterns) ? analysis.learningPatterns.map((pattern: any) => ({
        patternType: pattern.patternType || "coding_style",
        pattern: pattern.pattern || {},
        confidence: Math.max(0, Math.min(1, pattern.confidence || 0.5))
      })) : []
    };
  } catch (error) {
    console.error("Error analyzing code review:", error);
    throw new Error("Failed to analyze code review: " + (error as Error).message);
  }
}

export async function generateChatResponse(
  message: string,
  context: {
    pullRequestTitle: string;
    pullRequestDescription: string;
    reviewSummary?: string;
    chatHistory: Array<{ role: string; content: string }>;
  }
): Promise<string> {
  try {
    const systemPrompt = `You are CodeRabbit, an advanced AI code review assistant providing senior developer-level insights. You are helping with a pull request titled "${context.pullRequestTitle}".

Pull Request Description: ${context.pullRequestDescription}

${context.reviewSummary ? `Your previous analysis summary: ${context.reviewSummary}` : ''}

Provide educational, contextual responses that help developers understand the code better. Focus on:
- Deep code understanding and multi-file context
- Educational explanations with reasoning
- Security best practices and vulnerability prevention
- Performance optimizations with measurable impact
- Architectural insights and maintainability
- Learning opportunities and knowledge sharing

Be helpful, detailed, and educational while maintaining a professional tone.`;

    const chatHistory = context.chatHistory.slice(-10); // Keep last 10 messages for context
    const conversationContext = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationContext}

User: ${message}

Please provide a helpful response:`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: fullPrompt,
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response: " + (error as Error).message);
  }
}
