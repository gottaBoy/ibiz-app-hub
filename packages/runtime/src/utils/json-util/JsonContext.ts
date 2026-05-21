/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class JsonContext {
  contextStack: any[];

  constructor() {
    this.contextStack = [];
  }

  get current() {
    return this.contextStack[this.contextStack.length - 1];
  }

  get context() {
    return [...this.contextStack];
  }

  get empty() {
    return this.contextStack.length === 0;
  }

  set(value: any) {
    this.contextStack.push(value);
  }

  reset() {
    this.contextStack = [];
  }

  remove(value: any) {
    const index = this.contextStack.lastIndexOf(value);
    if (index !== -1) {
      this.contextStack.splice(index, 1);
    }
  }
}

export const ContextValues = {
  OBJECT_KEY: 'OBJECT_KEY',
  OBJECT_VALUE: 'OBJECT_VALUE',
  ARRAY: 'ARRAY',
};
