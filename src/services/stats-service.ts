import { Todo } from '../models/todo';

/**
 * Service for calculating statistics about todos
 */
export class StatsService {
  /**
   * Calculates overall statistics for todos
   * @param todos - Array of todos to calculate stats for
   * @returns Object containing various statistics
   */
  static calculateStats(todos: Todo[]): {
    total: number;
    active: number;
    completed: number;
    completionPercentage: number;
  } {
    const nonArchivedTodos = todos.filter(todo => !todo.archived);
    const total = nonArchivedTodos.length;
    const completed = nonArchivedTodos.filter(todo => todo.completed).length;
    const active = total - completed;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      active,
      completed,
      completionPercentage
    };
  }

  /**
   * Calculates tag usage statistics
   * @param todos - Array of todos to analyze
   * @returns Object mapping each tag to its count
   */
  static calculateTagStats(todos: Todo[]): Record<string, number> {
    const tagCounts: Record<string, number> = {};
    
    // Only consider non-archived todos
    const nonArchivedTodos = todos.filter(todo => !todo.archived);
    
    for (const todo of nonArchivedTodos) {
      for (const tag of todo.tags) {
        if (tagCounts[tag]) {
          tagCounts[tag]++;
        } else {
          tagCounts[tag] = 1;
        }
      }
    }
    
    return tagCounts;
  }

  /**
   * Gets the most frequently used tags
   * @param todos - Array of todos to analyze
   * @param limit - Maximum number of tags to return
   * @returns Array of tag names sorted by frequency
   */
  static getTopTags(todos: Todo[], limit: number = 10): string[] {
    const tagStats = this.calculateTagStats(todos);
    
    return Object.entries(tagStats)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([tagName]) => tagName);
  }
}
