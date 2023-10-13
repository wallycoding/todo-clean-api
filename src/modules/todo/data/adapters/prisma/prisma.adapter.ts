import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TodoEntity } from 'src/modules/todo/domain/entities/todo.entity';
import { TodoRepository } from 'src/modules/todo/domain/repositories/todo.repository';
import { TodoWriteDTO, TodoUpdateDTO } from 'src/modules/todo/dto/todo.dto';

@Injectable()
export class PrismaAdapter implements TodoRepository {
  constructor(private prisma: PrismaService) {}
  getMany(page: number = 0, limit: number = 50): Promise<TodoEntity[]> {
    const skip = page < 1 ? 0 : page - 1;
    return this.prisma.todo.findMany({
      skip: skip * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
  getById(id: string): Promise<TodoEntity> {
    return this.prisma.todo.findUnique({
      where: {
        id,
      },
    });
  }
  add(data: TodoWriteDTO): Promise<TodoEntity> {
    return this.prisma.todo.create({ data });
  }
  update(id: string, data: TodoUpdateDTO): Promise<TodoEntity> {
    const todo = this.getById(id);
    if (!todo) return;
    return this.prisma.todo.update({
      where: { id },
      data,
    });
  }
  remove(id: string): Promise<TodoEntity> {
    const todo = this.getById(id);
    if (!todo) return;
    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
