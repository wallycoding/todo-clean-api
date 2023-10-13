import { createFakeTodo } from './todo.utils';

describe('todo.utils', () => {
  it('should return a todo entity with date', () => {
    const data = createFakeTodo({ content: 'content', done: true });
    expect(data).toEqual({
      id: expect.any(String),
      content: 'content',
      done: true,
      updatedAt: expect.any(Date),
      createdAt: expect.any(Date),
    });
  });
  it('should return a todo entity with string', () => {
    const data = createFakeTodo({ content: 'content', done: true }, true);
    expect(data).toEqual({
      id: expect.any(String),
      content: 'content',
      done: true,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
