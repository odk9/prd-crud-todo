export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface CreateTodoData {
  title: string;
  completed?: boolean;
  tags?: string[];
}

export interface UpdateTodoData {
  title?: string;
  completed?: boolean;
  tags?: string[];
}

export interface TodoFilterOptions {
  completed?: boolean | null;
  searchTerm?: string;
  tags?: string[];
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  tags: Record<string, number>;
}
