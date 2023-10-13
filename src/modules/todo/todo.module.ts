import { Module } from '@nestjs/common';
import { TodoService } from './services/todo.service';
import { TodoController } from './controllers/todo.controller';
import { TodoRepository } from './domain/repositories/todo.repository';
import { PrismaAdapter } from './data/adapters/prisma/prisma.adapter';

@Module({
  controllers: [TodoController],
  providers: [
    TodoService,
    {
      provide: TodoRepository,
      useClass: PrismaAdapter,
    },
  ],
})
export class TodoModule {}
