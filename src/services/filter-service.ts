import { Todo } from '../models/todo';

/**
 * Service for filtering, searching, and sorting todos
 */
export class FilterService {
  /**
   * Filters todos based on status, search term, and tags
   * @param todos - Array of todos to filter
   * @param status - Status filter ('all', 'active', 'completed')
   * @param searchTerm - Optional search term to match against title
   * @param tags - Optional array of tags to filter by
   * @returns Filtered array of todos
   */
  static filterTodos(todos: Todo[], status: 'all' | 'active' | 'completed' = 'all', searchTerm?: string, tags?: string[]): Todo[] {
    let filtered = [...todos];

    // Apply status filter
    if (status !== 'all') {
      if (status === 'active') {
        filtered = filtered.filter(todo => !todo.completed && !todo.archived);
      } else if (status === 'completed') {
        filtered = filtered.filter(todo => todo.completed && !todo.archived);
      }
    } else {
      // If status is 'all', show non-archived items only
      filtered = filtered.filter(todo => !todo.archived);
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(lowerSearchTerm) || 
        (todo.description && todo.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      filtered = filtered.filter(todo => 
        tags.every(tag => todo.tags.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Sorts todos based on the specified criteria
   * @param todos - Array of todos to sort
   * @param sortBy - Sorting criteria ('created', 'completed', 'title')
   * @param order - Sorting order ('asc', 'desc')
   * @returns Sorted array of todos
   */
  static sortTodos(todos: Todo[], sortBy: 'created' | 'completed' | 'title' = 'created', order: 'asc' | 'desc' = 'asc'): Todo[] {
    const sorted = [...todos];

    switch (sortBy) {
      case 'created':
        sorted.sort((a, b) => {
          const comparison = a.createdAt.getTime() - b.createdAt.getTime();
          return order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'completed':
        sorted.sort((a, b) => {
          // Non-completed items come first
          if (!a.completed && b.completed) return order === 'asc' ? -1 : 1;
          if (a.completed && !b.completed) return order === 'asc' ? 1 : -1;
          
          // Both completed or both not completed
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return order === 'desc' ? -1 : 1;
          if (!b.completedAt) return order === 'desc' ? 1 : -1;
          
          const comparison = a.completedAt!.getTime() - b.completedAt!.getTime();
          return order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'title':
        sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return order === 'asc' ? comparison : -comparison;
        });
        break;
    }

    return sorted;
  }

  /**
   * Paginates the todos array
   * @param todos - Array of todos to paginate
   * @param page - Page number (starting from 1)
   * @param limit - Number of items per page
   * @returns Paginated array of todos
   */
  static paginateTodos(todos: Todo[], page: number, limit: number): Todo[] {
    const startIndex = (page - 1) * limit;
    return todos.slice(startIndex, startIndex + limit);
  }
}
