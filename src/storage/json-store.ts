import * as fs from 'fs';
import * as path from 'path';
import { Todo } from '../models/todo';

export class JsonStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
    this.ensureFileExists();
  }

  private ensureFileExists(): void {
    if (!fs.existsSync(this.filePath)) {
      const dirPath = path.dirname(this.filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  public read(): Todo[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    try {
      return JSON.parse(data) as Todo[];
    } catch (error) {
      throw new Error(`Failed to parse JSON from ${this.filePath}: ${(error as Error).message}`);
    }
  }

  public write(todos: Todo[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(todos, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to write to ${this.filePath}: ${(error as Error).message}`);
    }
  }
}
