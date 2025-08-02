# BugOtter - AI-Powered Code Review Platform

## Overview

BugOtter is a full-stack AI-powered code review platform that provides intelligent analysis of GitHub pull requests. The application connects to GitHub repositories, imports pull requests, and uses OpenAI's API to generate comprehensive code reviews with AI-powered insights. Users can interact with an AI chat system to discuss code changes and receive automated feedback on code quality, security, and performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool and hot module replacement for development. The frontend uses a modern component-based architecture with functional components and hooks.

**Routing**: Wouter for lightweight client-side routing, providing simple declarative routing without the overhead of React Router.

**State Management**: TanStack Query (React Query) for server state management, caching, and synchronization. No global state management library is used, keeping the architecture simple and focused on server state.

**UI Framework**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component system built on top of Radix UI
- Tailwind CSS for styling with custom CSS variables for theming
- Custom GitHub-inspired dark theme with purple accent colors

**Component Structure**:
- Layout components (Header, Sidebar) for consistent navigation across pages
- Page components for different routes (Dashboard, Landing, Pull Request Detail)
- Reusable UI components following the shadcn/ui design system
- Specialized components for AI review panels and pull request lists

### Backend Architecture

**Framework**: Express.js with TypeScript for the REST API server. The server integrates Vite middleware in development for seamless full-stack development.

**Authentication**: Replit Auth integration using OpenID Connect with session-based authentication. Sessions are stored in PostgreSQL using connect-pg-simple.

**API Design**: RESTful endpoints following conventional patterns:
- `/api/repositories` - Repository management
- `/api/pull-requests` - Pull request operations
- `/api/pull-requests/:id/review` - AI review generation
- `/api/pull-requests/:id/chat` - AI chat interactions

**Storage Pattern**: Interface-based storage abstraction (`IStorage`) with database implementation using Drizzle ORM. This pattern allows for easy testing and potential storage backend changes.

### Data Layer

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations and schema management.

**Schema Design**: Relational model with the following key entities:
- `users` - User profiles from Replit Auth
- `repositories` - GitHub repository metadata
- `pullRequests` - Pull request information with status tracking
- `prFiles` - Individual file changes with diffs and patches
- `aiReviews` - Generated AI review summaries with ratings
- `reviewComments` - Line-specific AI feedback and suggestions
- `chatMessages` - AI chat conversation history
- `sessions` - Session storage for authentication

**Migration Strategy**: Drizzle Kit for schema migrations with version control and automated deployment.

**Type Safety**: Full TypeScript integration with Zod schemas for runtime validation and type inference.

### AI Integration

**Gemini AI Integration**: Uses Google's Gemini API for generating code reviews and chat responses. The system analyzes pull request diffs, file changes, and user queries to provide intelligent feedback.

**Review Analysis**: AI reviews include:
- Overall rating (approved/changes_requested/commented)
- Code quality scores and metrics
- Security and performance issue detection
- Line-specific comments with suggestions

**Chat System**: Interactive AI chat allows users to ask questions about code changes and receive contextual responses based on the pull request content.

## External Dependencies

**Database**: PostgreSQL database with connection pooling via Neon serverless driver for production deployments.

**Authentication Provider**: Replit Auth service using OpenID Connect protocol for secure user authentication and session management.

**GitHub Integration**: GitHub REST API for repository and pull request data fetching. The application connects to public and private repositories with appropriate permissions.

**AI Services**: Google Gemini API for natural language processing and code analysis. Requires GEMINI_API_KEY configuration for AI-powered features.

**Development Tools**:
- Vite for build tooling and development server
- TypeScript for type safety across the entire stack
- Tailwind CSS for utility-first styling
- ESBuild for production bundling

**UI Libraries**:
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- React Hook Form for form handling
- date-fns for date formatting and manipulation

**Deployment**: Designed for Replit deployment with environment variable configuration for database URL, Gemini API key, and session secrets.