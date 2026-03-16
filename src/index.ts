// Main entry point and exports for Todo List CRUD App

export { Todo, TodoStatus, TodoFilterOptions, SortOrder } from './models/todo';
export { JsonStore } from './storage/json-store';
export { TodoService } from './services/todo-service';
export { FilterService } from './services/filter-service';
export { StatsService } from './services/stats-service';
export { TagService } from './services/tag-service';
export { Routes } from './api/routes';
export { TodoServer } from './api/server';
export { 
  validateCreateTodo, 
  validateUpdateTodo, 
  validateTagList 
} from './api/validators';

// Start the server if this file is run directly
if (require.main === module) {
  const server = new TodoServer();
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}


/** Module metadata */
export interface indexConfig {
  enabled: boolean;
  name: string;
}
