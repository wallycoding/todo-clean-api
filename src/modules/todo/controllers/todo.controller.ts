import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TodoEntity } from '../domain/entities/todo.entity';
import { TodoWriteDTO, TodoUpdateDTO } from '../dto/todo.dto';
import { TodoService } from '../services/todo.service';

type QueryByPage = {
  page?: number;
};

type ParamId = {
  id: string;
};

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get('list')
  getMany(@Query() query: QueryByPage): Promise<TodoEntity[]> {
    return this.todoService.getMany(query.page);
  }
  @Get(':id')
  async getById(@Param() param: ParamId): Promise<TodoEntity> {
    const todo = await this.todoService.getById(param.id);
    if (!todo) throw new NotFoundException('Not found');
    return todo;
  }

  @Post('add')
  add(@Body() data: TodoWriteDTO): Promise<TodoEntity> {
    return this.todoService.add(data);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamId,
    @Body() data: TodoUpdateDTO,
  ): Promise<TodoEntity> {
    const todo = await this.todoService.update(param.id, data);
    if (!todo) throw new NotFoundException('Not found');
    return todo;
  }

  @Delete(':id')
  async remove(@Param() param: ParamId): Promise<TodoEntity> {
    const todo = await this.todoService.remove(param.id);
    if (!todo) throw new NotFoundException('Not found');
    return todo;
  }
}
