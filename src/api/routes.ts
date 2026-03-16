import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { TodoService } from '../services/todo-service';
import { FilterService } from '../services/filter-service';
import { StatsService } from '../services/stats-service';
import { TagService } from '../services/tag-service';
import { validateCreateTodo, validateUpdateTodo, validateTagList } from './validators';

export class Routes {
  constructor(
    private todoService: TodoService,
    private filterService: FilterService,
    private statsService: StatsService,
    private tagService: TagService
  ) {}

  handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = parsedUrl.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (true) {
      case path === '/todos' && method === 'GET':
        this.handleGetTodos(parsedUrl, res);
        break;
      case path === '/todos' && method === 'POST':
        this.handleCreateTodo(req, res);
        break;
      case /^\/todos\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(path) && method === 'GET':
        this.handleGetTodo(path, res);
        break;
      case /^\/todos\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(path) && method === 'PUT':
        this.handleUpdateTodo(path, req, res);
        break;
      case /^\/todos\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(path) && method === 'DELETE':
        this.handleDeleteTodo(path, res);
        break;
      case path === '/stats' && method === 'GET':
        this.handleGetStats(res);
        break;
      case path === '/tags' && method === 'GET':
        this.handleGetTags(res);
        break;
      default:
        this.sendResponse(res, 404, { error: 'Route not found' });
    }
  };

  private handleGetTodos = async (parsedUrl: URL, res: ServerResponse): Promise<void> => {
    try {
      const status = parsedUrl.searchParams.get('status') || 'all';
      const search = parsedUrl.searchParams.get('search') || '';
      const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '10', 10);
      const sortBy = parsedUrl.searchParams.get('sortBy') || 'createdAt';
      const sortOrder = parsedUrl.searchParams.get('sortOrder') || 'desc';
      
      const tagParam = parsedUrl.searchParams.get('tags');
      const tags = tagParam ? tagParam.split(',') : [];

      const todos = await this.todoService.getAllTodos();
      const filteredTodos = this.filterService.filterTodos(todos, { status, search, tags });
      const sortedTodos = this.filterService.sortTodos(filteredTodos, sortBy, sortOrder);
      const paginatedTodos = this.filterService.paginateTodos(sortedTodos, page, limit);

      this.sendResponse(res, 200, {
        todos: paginatedTodos,
        pagination: {
          page,
          limit,
          total: filteredTodos.length,
          totalPages: Math.ceil(filteredTodos.length / limit)
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleCreateTodo = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const body = await this.parseRequestBody(req);
      
      const validationErrors = validateCreateTodo(body);
      if (validationErrors.length > 0) {
        this.sendResponse(res, 400, { error: 'Validation failed', details: validationErrors });
        return;
      }

      const normalizedTags = this.tagService.normalizeTags(body.tags || []);
      const tagValidationErrors = validateTagList(normalizedTags);
      if (tagValidationErrors.length > 0) {
        this.sendResponse(res, 400, { error: 'Tag validation failed', details: tagValidationErrors });
        return;
      }

      const newTodo = await this.todoService.createTodo({
        title: body.title,
        description: body.description || '',
        tags: normalizedTags
      });

      this.sendResponse(res, 201, newTodo);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleGetTodo = async (path: string, res: ServerResponse): Promise<void> => {
    try {
      const id = path.split('/')[2];
      const todo = await this.todoService.getTodoById(id);
      
      if (!todo) {
        this.sendResponse(res, 404, { error: 'Todo not found' });
        return;
      }

      this.sendResponse(res, 200, todo);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleUpdateTodo = async (path: string, req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const id = path.split('/')[2];
      const body = await this.parseRequestBody(req);
      
      const validationErrors = validateUpdateTodo(body);
      if (validationErrors.length > 0) {
        this.sendResponse(res, 400, { error: 'Validation failed', details: validationErrors });
        return;
      }

      if (body.tags) {
        const normalizedTags = this.tagService.normalizeTags(body.tags);
        const tagValidationErrors = validateTagList(normalizedTags);
        if (tagValidationErrors.length > 0) {
          this.sendResponse(res, 400, { error: 'Tag validation failed', details: tagValidationErrors });
          return;
        }
        body.tags = normalizedTags;
      }

      const updatedTodo = await this.todoService.updateTodo(id, body);
      
      if (!updatedTodo) {
        this.sendResponse(res, 404, { error: 'Todo not found' });
        return;
      }

      this.sendResponse(res, 200, updatedTodo);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleDeleteTodo = async (path: string, res: ServerResponse): Promise<void> => {
    try {
      const id = path.split('/')[2];
      const deleted = await this.todoService.deleteTodo(id);
      
      if (!deleted) {
        this.sendResponse(res, 404, { error: 'Todo not found' });
        return;
      }

      this.sendResponse(res, 200, { message: 'Todo archived successfully' });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleGetStats = async (res: ServerResponse): Promise<void> => {
    try {
      const todos = await this.todoService.getAllTodos();
      const stats = this.statsService.calculateStats(todos);
      
      this.sendResponse(res, 200, stats);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleGetTags = async (res: ServerResponse): Promise<void> => {
    try {
      const todos = await this.todoService.getAllTodos();
      const tags = this.tagService.listAllTags(todos);
      
      this.sendResponse(res, 200, { tags });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private parseRequestBody = (req: IncomingMessage): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
      
      req.on('error', (err) => {
        reject(err);
      });
    });
  };

  private sendResponse = (res: ServerResponse, statusCode: number, data: unknown): void => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  private handleError = (res: ServerResponse, error: unknown): void => {
    console.error(error);
    this.sendResponse(res, 500, { error: 'Internal server error' });
  };
}
