import { CreateTodoInput, UpdateTodoInput } from '../models/todo';

/**
 * Validates the input for creating a new todo
 * @param input The input object containing todo properties
 * @returns An array of validation error messages
 */
export function validateCreateTodo(input: unknown): string[] {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object');
    return errors;
  }

  const { title, description, tags } = input as CreateTodoInput;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string if provided');
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
    } else {
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== 'string') {
          errors.push(`Tag at index ${i} must be a string`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validates the input for updating an existing todo
 * @param input The input object containing todo update properties
 * @returns An array of validation error messages
 */
export function validateUpdateTodo(input: unknown): string[] {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object');
    return errors;
  }

  const { title, description, completed, tags } = input as UpdateTodoInput;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('Title must be a non-empty string if provided');
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string if provided');
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Completed must be a boolean if provided');
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array if provided');
    } else {
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== 'string') {
          errors.push(`Tag at index ${i} must be a string`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validates a list of tags according to business rules
 * @param tags An array of tag strings
 * @returns An array of validation error messages
 */
export function validateTagList(tags: string[]): string[] {
  const errors: string[] = [];
  
  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed per todo');
  }

  for (const tag of tags) {
    if (tag.length === 0) {
      errors.push('Tags cannot be empty strings');
    }
    
    if (tag.length > 50) {
      errors.push(`Tag '${tag}' exceeds maximum length of 50 characters`);
    }
    
    if (/[^a-zA-Z0-9-_ ]/.test(tag)) {
      errors.push(`Tag '${tag}' contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed.`);
    }
  }

  return errors;
}
