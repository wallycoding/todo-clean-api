import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be instance of prisma client', () => {
    expect(service instanceof PrismaClient).toBeTruthy();
  });

  it('should call $connect', async () => {
    const spyConnect = jest.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(spyConnect).toBeCalledTimes(1);
  });
});
