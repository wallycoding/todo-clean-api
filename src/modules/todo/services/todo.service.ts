import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../domain/repositories/todo.repository';
import { TodoEntity } from '../domain/entities/todo.entity';
import { TodoWriteDTO, TodoUpdateDTO } from '../dto/todo.dto';

@Injectable()
export class TodoService {
  constructor(private todoRepository: TodoRepository) {}
  getMany(page?: number, limit?: number): Promise<TodoEntity[]> {
    return this.todoRepository.getMany(page, limit);
  }
  getById(id: string): Promise<TodoEntity> {
    return this.todoRepository.getById(id);
  }
  add(data: TodoWriteDTO): Promise<TodoEntity> {
    return this.todoRepository.add(data);
  }
  update(id: string, data: TodoUpdateDTO): Promise<TodoEntity> {
    return this.todoRepository.update(id, data);
  }
  remove(id: string): Promise<TodoEntity> {
    return this.todoRepository.remove(id);
  }
}
