import { QuizSession } from '../types/adaptiveQuizTypes';

// In-memory session storage (in production, use Redis or database)
export class QuizSessionStore {
  private sessions = new Map<string, QuizSession>();

  save(session: QuizSession): void {
    this.sessions.set(session.sessionId, session);
  }

  get(sessionId: string): QuizSession | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  // Clean up completed sessions (optional utility method)
  cleanupCompletedSessions(): void {
    for (const [sessionId, session] of this.sessions) {
      if (session.isCompleted) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
