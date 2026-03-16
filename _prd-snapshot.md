# PRD — Todo List CRUD App

## Overview
A simple TypeScript todo list application with full CRUD operations, local storage persistence, filtering capabilities, tag management, and a REST API.

## Features

### 1. Todo Management
- Create new todos with title, optional description, and optional tags
- Read/list all todos with pagination
- Update todo title, description, completion status, and tags
- Delete todos (soft delete with archive)

### 2. Filtering & Search
- Filter by status: all, active, completed
- Search todos by title keyword
- Filter todos by one or multiple tags
- Sort by creation date, completion date, or alphabetical

### 3. Persistence
- Save todos to local JSON file storage
- Load todos on startup
- Auto-save on every mutation

### 4. Statistics
- Count of total, active, completed todos
- Completion percentage
- Count of todos per tag

### 5. REST API
- Expose CRUD operations via HTTP endpoints
- Return and accept JSON payloads
- Support query parameters for filtering, search, sorting, pagination, and tags
- Expose statistics through a dedicated endpoint
- Expose tag listing through a dedicated endpoint
- Standard HTTP status codes and error responses (400, 404, 500)

### 6. Tag System
- Assign multiple tags to a todo
- Remove one or more tags from a todo
- Normalize tags (trim, lowercase, deduplicate)
- List all existing tags used across non-archived todos

## Technical Requirements
- Pure TypeScript, no frameworks
- Node.js runtime
- File-based JSON storage (no database)
- Exported as ES modules
- Type-safe interfaces for all models
- Todo model must include a `tags: string[]` field
- Built-in HTTP server for REST API
- JSON request parsing and response serialization
- Basic input validation for API payloads, including tag format and maximum tag count per todo

## File Structure
- `src/models/todo.ts` — Todo interface and types
- `src/storage/json-store.ts` — File-based persistence
- `src/services/todo-service.ts` — Business logic (CRUD + tag assignment/removal)
- `src/services/filter-service.ts` — Filtering, search, and tag filtering
- `src/services/stats-service.ts` — Statistics calculations (including per-tag counts)
- `src/services/tag-service.ts` — Tag normalization, deduplication, and tag listing
- `src/api/routes.ts` — REST route definitions and handlers
- `src/api/server.ts` — HTTP server setup and routing
- `src/api/validators.ts` — Request payload validation (including tags)
- `src/index.ts` — Main entry point and exports

## Complexity
- LOC estimate: ~760
- Files: 10
- Dependencies: 0 (pure Node.js)
- Complexity: MEDIUM