import { Module } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TodoModule } from './modules/todo/todo.module';

@Module({
  imports: [PrismaModule, TodoModule],
})
export class AppModule {}
