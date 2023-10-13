import { randomUUID } from 'node:crypto';
import { TodoEntity } from '../domain/entities/todo.entity';
import { TodoUpdateDTO } from '../dto/todo.dto';

interface CustomTodoEntity extends Omit<TodoEntity, 'updatedAt' | 'createdAt'> {
  updatedAt: Date | string;
  createdAt: Date | string;
}

export const createFakeTodo = (
  { content, done }: TodoUpdateDTO,
  isIsoString = false,
): CustomTodoEntity => {
  const timestamp = isIsoString ? new Date().toISOString() : new Date();
  return {
    id: randomUUID(),
    content,
    done,
    updatedAt: timestamp,
    createdAt: timestamp,
  };
};
