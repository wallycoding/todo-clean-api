import { plainToClass } from 'class-transformer';
import { TodoWriteDTO, TodoUpdateDTO } from './todo.dto';
import { validate } from 'class-validator';

describe('Todo DTO', () => {
  describe('TodoWriteDTO', () => {
    it('should pass without errors when provided with the correct data', async () => {
      const dto = plainToClass(TodoWriteDTO, {
        content: 'any',
        done: false,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
    it('should fail when not provided correct data', async () => {
      const bodies = [{ content: 'any' }, { done: false }, {}];
      const expectedNumberOfErrors = [1, 1, 2];
      for (const i in bodies) {
        const totalErrors = expectedNumberOfErrors[i];
        const dto = plainToClass(TodoWriteDTO, bodies[i]);
        const errors = await validate(dto);
        expect(errors).toHaveLength(totalErrors);
      }
    });
  });
  describe('TodoUpdateDTO', () => {
    it('should pass without errors when provided with the correct data', async () => {
      const bodies = [{ content: 'any' }, { done: false }];

      for (const body of bodies) {
        const dto = plainToClass(TodoUpdateDTO, body);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
    it('should fail when not provided correct data', async () => {
      const dto = plainToClass(TodoUpdateDTO, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
    });
  });
});
