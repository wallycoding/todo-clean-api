import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TodoRepository } from 'src/modules/todo/domain/repositories/todo.repository';
import { createFakeTodo } from 'src/modules/todo/test-utils/todo.utils';

const createMockTodoRepository = () => ({
  getMany: jest.fn(),
  getById: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockTodoRepository = createMockTodoRepository();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(null)
      .overrideProvider(TodoRepository)
      .useValue(mockTodoRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /todo/list', () => {
    it('should return an empty array when there are no todos', () => {
      mockTodoRepository.getMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/todo/list')
        .expect(200)
        .expect('[]');
    });
    it('should return a todo from the list when todos exist', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false }, true);
      mockTodoRepository.getMany.mockResolvedValue([fakeTodo]);
      const response = await request(app.getHttpServer()).get('/todo/list');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([fakeTodo]);
    });

    it("should return a 'bad request' when passing invalid page", () => {
      return request(app.getHttpServer())
        .get('/todo/list?page=invalid_query')
        .expect(400);
    });

    it('should return 3 items per pagination in descending order', async () => {
      const ITEMS_PER_PAGE = 3;
      const allFakeTodos = Array.from({ length: 9 }, (_, i) =>
        createFakeTodo({ content: `Item(${i + 1})`, done: false }, true),
      );
      for (let i = 0; i < 3; i++) {
        const itemsPerPage = allFakeTodos.slice(
          i * ITEMS_PER_PAGE,
          i * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
        );
        mockTodoRepository.getMany.mockResolvedValue(itemsPerPage);
        const response = await request(app.getHttpServer()).get(
          `/todo/list?page=${i + 1}`,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(3);
        expect(response.body).toEqual(itemsPerPage);
        expect(mockTodoRepository.getMany).toBeCalledWith(i + 1, undefined);
        expect(mockTodoRepository.getMany).toBeCalledTimes(i + 1);
      }
    });
  });

  describe('GET /todo/:id', () => {
    it('should return an existing todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false }, true);
      mockTodoRepository.getById.mockResolvedValue(fakeTodo);
      const response = await request(app.getHttpServer()).get(
        `/todo/${fakeTodo.id}`,
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(fakeTodo);
    });
    it("should return 'not found' when attempting to access a non-existent todo by id", () => {
      return request(app.getHttpServer()).get('/todo/invalid_id').expect(404);
    });
  });

  describe('POST /todo/add', () => {
    it('should return a successfully created todo when valid data is provided', async () => {
      const todoBody = { content: 'any', done: false };
      const fakeTodo = createFakeTodo(todoBody, true);
      mockTodoRepository.add.mockResolvedValue(fakeTodo);
      const response = await request(app.getHttpServer())
        .post('/todo/add')
        .send(todoBody);
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(fakeTodo);
    });
    it('should fail to create a todo when incorrect data is passed', async () => {
      const failBodies = [{ content: 'any' }, { done: false }, {}];
      for (const body of failBodies) {
        const response = await request(app.getHttpServer())
          .post('/todo/add')
          .send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe('PATCH /todo/:id', () => {
    it('should return an updated todo when a valid id and data are provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false }, true);
      const validBodies = [
        { content: 'any_updated' },
        { done: true },
        { content: 'final', done: false },
      ];

      for (const body of validBodies) {
        const fakeTodoUpdated = { ...fakeTodo, ...validBodies };
        mockTodoRepository.update.mockResolvedValue(fakeTodoUpdated);
        const response = await request(app.getHttpServer())
          .patch('/todo/valid_id')
          .send(body);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(fakeTodoUpdated);
      }
    });
    it("should return 'not found' when attempting to update a non-existent todo by id", async () => {
      return request(app.getHttpServer())
        .patch('/todo/invalid_id')
        .send({ content: 'valid' })
        .expect(404);
    });
    it('should fail to update a todo when incorrect data is passed', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false }, true);
      mockTodoRepository.update.mockResolvedValue(fakeTodo);
      return request(app.getHttpServer())
        .patch(`/todo/${fakeTodo.id}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /todo/:id', () => {
    it('should return the deleted todo when a valid id is provided', async () => {
      const fakeTodo = createFakeTodo({ content: 'any', done: false }, true);
      mockTodoRepository.remove.mockResolvedValue(fakeTodo);
      const response = await request(app.getHttpServer()).delete(
        `/todo/${fakeTodo.id}`,
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(fakeTodo);
    });
    it("should return 'not found' when attempting to delete a non-existent todo by id", async () => {
      return request(app.getHttpServer())
        .delete('/todo/invalid_id')
        .expect(404);
    });
  });
});
