import { TodoEntity } from '../entities/todo.entity';

export abstract class TodoRepository {
  abstract getMany(page?: number, limit?: number): Promise<TodoEntity[]>;
  abstract getById(id: string): Promise<TodoEntity>;
  abstract add(data: TodoWriteDTO): Promise<TodoEntity>;
  abstract update(id: string, data: TodoUpdateDTO): Promise<TodoEntity>;
  abstract remove(id: string): Promise<TodoEntity>;
}
