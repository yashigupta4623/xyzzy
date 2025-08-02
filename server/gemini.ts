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
    fileId?: string;
    lineNumber?: number;
    commentType: "security" | "enhancement" | "bug" | "style";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    suggestion?: string;
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
    const prompt = `You are an expert code reviewer analyzing a pull request. Please provide a comprehensive review in JSON format.

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

Please analyze this pull request and respond with JSON in this exact format:
{
  "overallRating": "approved" | "changes_requested" | "commented",
  "codeQualityScore": number (1-100),
  "testCoverage": number (0-100, estimate percentage),
  "securityIssues": number (count of security issues found),
  "performanceIssues": number (count of performance issues found),
  "summary": "string (2-3 sentences summarizing the review)",
  "comments": [
    {
      "filename": "string",
      "lineNumber": number (if applicable),
      "commentType": "security" | "enhancement" | "bug" | "style",
      "severity": "low" | "medium" | "high" | "critical",
      "message": "string (detailed explanation)",
      "suggestion": "string (optional improvement suggestion)"
    }
  ]
}

Focus on:
- Security vulnerabilities
- Performance issues
- Code quality and maintainability
- Best practices
- Potential bugs
- Testing coverage
- Documentation`;

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
            }
          },
          required: ["overallRating", "codeQualityScore", "testCoverage", "securityIssues", "performanceIssues", "summary", "comments"]
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
      summary: analysis.summary || "Code review completed.",
      comments: Array.isArray(analysis.comments) ? analysis.comments.map((comment: any) => ({
        filename: comment.filename,
        lineNumber: comment.lineNumber,
        commentType: comment.commentType || "enhancement",
        severity: comment.severity || "low",
        message: comment.message || "No specific comment",
        suggestion: comment.suggestion
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
    const systemPrompt = `You are BugOtter, an AI code review assistant. You are helping with a pull request titled "${context.pullRequestTitle}".

Pull Request Description: ${context.pullRequestDescription}

${context.reviewSummary ? `Your previous review summary: ${context.reviewSummary}` : ''}

Be helpful, concise, and focused on code quality, security, and best practices. Answer questions about the code changes, provide suggestions for improvements, and help resolve any issues identified in the review.`;

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
