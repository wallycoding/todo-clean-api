import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from '../services/todo.service';
import { createFakeTodo } from '../test-utils/todo.utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const createMockTodoService = () => ({
  getMany: jest.fn(),
  getById: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('TodoController', () => {
  let controller: TodoController;
  const mockTodoRepository = createMockTodoService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [TodoService],
    })
      .overrideProvider(TodoService)
      .useValue(mockTodoRepository)
      .compile();

    controller = module.get<TodoController>(TodoController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMany', () => {
    it('should return an empty array when there are no todos', async () => {
      mockTodoRepository.getMany.mockResolvedValue([]);
      const data = await controller.getMany({});
      expect(Array.isArray(data)).toBeTruthy();
      expect(data).toHaveLength(0);
      expect(mockTodoRepository.getMany).toBeCalledTimes(1);
    });
    it('should return a todo from the when todos exist', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockTodoRepository.getMany.mockResolvedValue([fakeTodo]);
      const data = await controller.getMany({});
      expect(Array.isArray(data)).toBeTruthy();
      expect(data).toHaveLength(1);
      expect(data).toEqual([fakeTodo]);
      expect(mockTodoRepository.getMany).toBeCalledTimes(1);
    });
    it("should return a 'bad request' when passing invalid page", async () => {
      const errorData = await controller
        .getMany({ page: 'invalid_data' })
        .catch((err) => err);
      expect(errorData instanceof BadRequestException).toBeTruthy();
      expect(mockTodoRepository.getMany).toBeCalledTimes(0);
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
        mockTodoRepository.getMany.mockResolvedValue(itemsPerPage);
        const data = await controller.getMany({ page: i + 1 });
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toHaveLength(3);
        expect(data).toEqual(itemsPerPage);
        expect(mockTodoRepository.getMany).toBeCalledWith(i + 1);
        expect(mockTodoRepository.getMany).toBeCalledTimes(i + 1);
      }
    });
  });
  describe('getById', () => {
    it('should return an existing todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockTodoRepository.getById.mockResolvedValue(fakeTodo);

      const data = await controller.getById({ id: fakeTodo.id });

      expect(data).toEqual(fakeTodo);
      expect(mockTodoRepository.getById).toBeCalledWith(fakeTodo.id);
      expect(mockTodoRepository.getById).toBeCalledTimes(1);
    });
    it('should return undefined when attempting to access a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const errorData = await controller
        .getById({ id: invalidId })
        .catch((err) => err);

      expect(errorData instanceof NotFoundException);
      expect(mockTodoRepository.getById).toBeCalledWith(invalidId);
      expect(mockTodoRepository.getById).toBeCalledTimes(1);
    });
  });
  describe('add', () => {
    it('should return a successfully created todo when valid data is provided', async () => {
      const todoBody = { content: 'any', done: false };
      const fakeTodo = createFakeTodo(todoBody);
      mockTodoRepository.add.mockResolvedValue(fakeTodo);
      const data = await controller.add(todoBody);

      expect(data).toEqual(fakeTodo);
      expect(mockTodoRepository.add).toBeCalledWith(todoBody);
      expect(mockTodoRepository.add).toBeCalledTimes(1);
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

      for (const body of validBodies) {
        const fakeTodoUpdated = { ...fakeTodo, ...validBodies };
        mockTodoRepository.update.mockResolvedValue(fakeTodoUpdated);
        const data = await controller.update({ id: fakeTodo.id }, body);

        expect(data).toEqual(fakeTodoUpdated);
        expect(mockTodoRepository.update).toBeCalledWith(fakeTodo.id, body);
      }

      expect(mockTodoRepository.update).toBeCalledTimes(3);
    });
    it('should return undefined when attempting to update a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const body = { content: 'valid' };
      const errorData = await controller
        .update({ id: invalidId }, body)
        .catch((err) => err);

      expect(errorData instanceof NotFoundException);
      expect(mockTodoRepository.update).toBeCalledTimes(1);
      expect(mockTodoRepository.update).toBeCalledWith(invalidId, body);
    });
  });
  describe('remove', () => {
    it('should return the deleted todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false });
      mockTodoRepository.remove.mockResolvedValue(fakeTodo);
      const data = await controller.remove({ id: fakeTodo.id });

      expect(data).toEqual(fakeTodo);
      expect(mockTodoRepository.remove).toBeCalledWith(fakeTodo.id);
      expect(mockTodoRepository.remove).toBeCalledTimes(1);
    });
    it('should return undefined when attempting to delete a non-existent todo by id', async () => {
      const invalidId = 'invalid_id';
      const errorData = await controller
        .remove({ id: invalidId })
        .catch((err) => err);
      expect(errorData instanceof NotFoundException);
      expect(mockTodoRepository.remove).toBeCalledTimes(1);
      expect(mockTodoRepository.remove).toBeCalledWith(invalidId);
    });
  });
});
