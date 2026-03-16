import { Todo } from '../models/todo';

/**
 * Service for handling tag normalization, deduplication, and listing
 */
export class TagService {
  /**
   * Normalizes a single tag by trimming whitespace and converting to lowercase
   * @param tag - The tag to normalize
   * @returns The normalized tag
   */
  static normalizeTag(tag: string): string {
    return tag.trim().toLowerCase();
  }

  /**
   * Normalizes and deduplicates an array of tags
   * @param tags - Array of tags to process
   * @returns Array of unique, normalized tags
   */
  static normalizeAndDeduplicate(tags: string[]): string[] {
    const normalizedTags = tags.map(tag => this.normalizeTag(tag));
    return Array.from(new Set(normalizedTags)).filter(tag => tag.length > 0);
  }

  /**
   * Validates tags according to business rules
   * @param tags - Array of tags to validate
   * @param maxTagsPerTodo - Maximum allowed tags per todo (default: 10)
   * @returns True if tags are valid, false otherwise
   */
  static validateTags(tags: string[], maxTagsPerTodo: number = 10): boolean {
    if (tags.length > maxTagsPerTodo) {
      return false;
    }

    for (const tag of tags) {
      // Check if tag is empty after normalization
      if (this.normalizeTag(tag).length === 0) {
        return false;
      }
      
      // Check for invalid characters (only alphanumeric, spaces, hyphens, underscores allowed)
      if (!/^[a-z0-9 _\-]+$/.test(this.normalizeTag(tag))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets all unique tags used across non-archived todos
   * @param todos - Array of todos to extract tags from
   * @returns Array of unique tags
   */
  static getAllTags(todos: Todo[]): string[] {
    const allTags = new Set<string>();
    
    // Only consider non-archived todos
    const nonArchivedTodos = todos.filter(todo => !todo.archived);
    
    for (const todo of nonArchivedTodos) {
      for (const tag of todo.tags) {
        allTags.add(tag);
      }
    }
    
    return Array.from(allTags).sort();
  }

  /**
   * Adds tags to a todo, normalizing and deduplicating them
   * @param todo - The todo to add tags to
   * @param newTags - Tags to add
   * @returns Updated todo with new tags
   */
  static addTagsToTodo(todo: Todo, newTags: string[]): Todo {
    const normalizedNewTags = this.normalizeAndDeduplicate(newTags);
    const combinedTags = [...todo.tags, ...normalizedNewTags];
    const uniqueTags = this.normalizeAndDeduplicate(combinedTags);
    
    return {
      ...todo,
      tags: uniqueTags
    };
  }

  /**
   * Removes tags from a todo
   * @param todo - The todo to remove tags from
   * @param tagsToRemove - Tags to remove
   * @returns Updated todo without specified tags
   */
  static removeTagsFromTodo(todo: Todo, tagsToRemove: string[]): Todo {
    const normalizedTagsToRemove = this.normalizeAndDeduplicate(tagsToRemove);
    const updatedTags = todo.tags.filter(tag => !normalizedTagsToRemove.includes(tag));
    
    return {
      ...todo,
      tags: updatedTags
    };
  }
}
