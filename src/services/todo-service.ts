import { Todo, CreateTodoData, UpdateTodoData } from '../models/todo';
import { JsonStore } from '../storage/json-store';

export class TodoService {
  private store: JsonStore<Todo>;

  constructor(store: JsonStore<Todo>) {
    this.store = store;
  }

  async create(todoData: CreateTodoData): Promise<Todo> {
    const newTodo: Todo = {
      id: this.generateId(),
      title: todoData.title,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: todoData.tags || []
    };
    await this.store.save(newTodo);
    return newTodo;
  }

  async findById(id: string): Promise<Todo | null> {
    return await this.store.findById(id);
  }

  async findAll(): Promise<Todo[]> {
    return await this.store.findAll();
  }

  async update(id: string, updateData: UpdateTodoData): Promise<Todo | null> {
    const existingTodo = await this.store.findById(id);
    if (!existingTodo) {
      return null;
    }

    const updatedTodo: Todo = {
      ...existingTodo,
      ...updateData,
      updatedAt: new Date().toISOString(),
      tags: updateData.tags !== undefined ? updateData.tags : existingTodo.tags
    };

    await this.store.update(id, updatedTodo);
    return updatedTodo;
  }

  async delete(id: string): Promise<boolean> {
    return await this.store.delete(id);
  }

  async addTag(todoId: string, tag: string): Promise<Todo | null> {
    const existingTodo = await this.store.findById(todoId);
    if (!existingTodo) {
      return null;
    }

    // Avoid duplicate tags
    if (!existingTodo.tags.includes(tag)) {
      existingTodo.tags.push(tag);
      existingTodo.updatedAt = new Date().toISOString();
      await this.store.update(todoId, existingTodo);
    }

    return existingTodo;
  }

  async removeTag(todoId: string, tag: string): Promise<Todo | null> {
    const existingTodo = await this.store.findById(todoId);
    if (!existingTodo) {
      return null;
    }

    const updatedTags = existingTodo.tags.filter(t => t !== tag);
    if (updatedTags.length !== existingTodo.tags.length) {
      existingTodo.tags = updatedTags;
      existingTodo.updatedAt = new Date().toISOString();
      await this.store.update(todoId, existingTodo);
    }

    return existingTodo;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
