import { Module } from '@nestjs/common';
import { TodoService } from './services/todo/todo.service';

@Module({
  providers: [TodoService]
})
export class TodoModule {}
