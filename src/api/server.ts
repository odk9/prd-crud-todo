import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { Routes } from './routes';
import { TodoService } from '../services/todo-service';
import { FilterService } from '../services/filter-service';
import { StatsService } from '../services/stats-service';
import { TagService } from '../services/tag-service';

export class TodoServer {
  private server: Server;

  constructor(
    private port: number,
    private todoService: TodoService,
    private filterService: FilterService,
    private statsService: StatsService,
    private tagService: TagService
  ) {
    this.server = createServer(this.handleRequest.bind(this));
  }

  private routes: Routes | null = null;

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    if (!this.routes) {
      this.routes = new Routes(
        this.todoService,
        this.filterService,
        this.statsService,
        this.tagService
      );
    }
    
    this.routes.handleRequest(req, res);
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        resolve();
      });

      this.server.on('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
