import {
  BadRequestException,
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
  page?: string | number;
};

type ParamId = {
  id: string;
};

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get('list')
  async getMany(@Query() query: QueryByPage): Promise<TodoEntity[]> {
    const page = typeof query.page === 'undefined' ? 0 : +query.page;
    if (isNaN(page)) throw new BadRequestException('Invalid page argument');
    return await this.todoService.getMany(page);
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
