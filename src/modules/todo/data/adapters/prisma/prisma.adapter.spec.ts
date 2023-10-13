import { Test, TestingModule } from '@nestjs/testing';
import { PrismaAdapter } from './prisma.adapter';
import { createFakeTodo } from 'src/modules/todo/test-utils/todo.utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';

const createMockPrismaService = () => ({
  todo: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('PrismaService', () => {
  let service: PrismaAdapter;
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaAdapter, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<PrismaAdapter>(PrismaAdapter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMany', () => {
    it('should return an empty array when there are no todos', async () => {
      mockPrismaService.todo.findMany.mockResolvedValue([]);
      const data = await service.getMany();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data).toHaveLength(0);
      expect(mockPrismaService.todo.findMany).toBeCalledTimes(1);
    });
    it('should return a todo from the when todos exist', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockPrismaService.todo.findMany.mockResolvedValue([fakeTodo]);
      const data = await service.getMany();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data).toHaveLength(1);
      expect(data).toEqual([fakeTodo]);
      expect(mockPrismaService.todo.findMany).toBeCalledTimes(1);
    });
    it('should return 3 items per pagination in descending order', async () => {
      const ITEMS_PER_PAGE = 3;
      const allFakeTodos = Array.from({ length: 9 }, (_, i) =>
        createFakeTodo({ content: `Item(${i + 1})`, done: false }),
      );
      for (let i = 0; i < 3; i++) {
        const itemsPerPage = allFakeTodos.slice(
          i * ITEMS_PER_PAGE,
          i * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
        );
        mockPrismaService.todo.findMany.mockResolvedValue(itemsPerPage);
        const data = await service.getMany(i + 1, ITEMS_PER_PAGE);
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toHaveLength(3);
        expect(data).toEqual(itemsPerPage);
        expect(mockPrismaService.todo.findMany).toBeCalledWith({
          skip: i * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: {
            updatedAt: 'desc',
          },
        });
        expect(mockPrismaService.todo.findMany).toBeCalledTimes(i + 1);
      }
    });
  });
  describe('getById', () => {
    it('should return an existing todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockPrismaService.todo.findUnique.mockResolvedValue(fakeTodo);

      const data = await service.getById(fakeTodo.id);

      expect(data).toEqual(fakeTodo);
      expect(mockPrismaService.todo.findUnique).toBeCalledWith({
        where: { id: fakeTodo.id },
      });
      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(1);
    });
    it('should return undefined when attempting to access a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const data = await service.getById(invalidId);
      expect(data).toBeUndefined();
      expect(mockPrismaService.todo.findUnique).toBeCalledWith({
        where: { id: invalidId },
      });
      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(1);
    });
  });
  describe('add', () => {
    it('should return a successfully created todo when valid data is provided', async () => {
      const todoBody = { content: 'any', done: false };
      const fakeTodo = createFakeTodo(todoBody);
      mockPrismaService.todo.create.mockResolvedValue(fakeTodo);
      const data = await service.add(todoBody);

      expect(data).toEqual(fakeTodo);
      expect(mockPrismaService.todo.create).toBeCalledWith({
        data: todoBody,
      });
      expect(mockPrismaService.todo.create).toBeCalledTimes(1);
    });
  });
  describe('update', () => {
    it('should return an updated todo when a valid id and data are provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      const validBodies = [
        { content: 'any_updated' },
        { done: true },
        { content: 'final', done: false },
      ];

      mockPrismaService.todo.findUnique.mockResolvedValue(fakeTodo);

      for (const body of validBodies) {
        const fakeTodoUpdated = { ...fakeTodo, ...validBodies };
        mockPrismaService.todo.update.mockResolvedValue(fakeTodoUpdated);
        const data = await service.update(fakeTodo.id, body);

        expect(data).toEqual(fakeTodoUpdated);
        expect(mockPrismaService.todo.findUnique).toBeCalledWith({
          where: { id: fakeTodo.id },
        });
        expect(mockPrismaService.todo.update).toBeCalledWith({
          where: { id: fakeTodo.id },
          data: body,
        });
      }

      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(3);
      expect(mockPrismaService.todo.update).toBeCalledTimes(3);
    });
    it('should return undefined when attempting to update a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const data = await service.update(invalidId, { content: 'valid' });

      expect(data).toBeUndefined();
      expect(mockPrismaService.todo.findUnique).toBeCalledWith({
        where: { id: invalidId },
      });
      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(1);
      expect(mockPrismaService.todo.update).toBeCalledTimes(0);
    });
  });
  describe('remove', () => {
    it('should return the deleted todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockPrismaService.todo.findUnique.mockResolvedValue(fakeTodo);
      mockPrismaService.todo.delete.mockResolvedValue(fakeTodo);
      const data = await service.remove(fakeTodo.id);
      expect(data).toEqual(fakeTodo);
      expect(mockPrismaService.todo.findUnique).toBeCalledWith({
        where: { id: fakeTodo.id },
      });
      expect(mockPrismaService.todo.delete).toBeCalledWith({
        where: { id: fakeTodo.id },
      });
      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(1);
      expect(mockPrismaService.todo.delete).toBeCalledTimes(1);
    });
    it('should return undefined when attempting to delete a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const data = await service.remove(invalidId);

      expect(data).toBeUndefined();
      expect(mockPrismaService.todo.findUnique).toBeCalledWith({
        where: { id: invalidId },
      });
      expect(mockPrismaService.todo.findUnique).toBeCalledTimes(1);
      expect(mockPrismaService.todo.delete).toBeCalledTimes(0);
    });
  });
});
