/* eslint-disable import/no-extraneous-dependencies */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { calcColumnModelBySchema as calcAutoColumnModelBySchema } from '../../../../src/controller/control/grid/grid/auto-grid.util';
import { calcColumnModelBySchema } from '../../../../src/controller/control/grid/grid/entity-schema';
import { calcFilterModelBySchema } from '../../../../src/controller/control/search-bar/entity-schema';

const getAppDataEntity = vi.fn();

function schemaWithReference(): IData {
  return {
    properties: {
      title: {
        type: 'string',
        description: '标题',
      },
      estimate: {
        type: 'integer',
        description: '估算',
      },
      owner: {
        $ref: 'user.json',
        description: '负责人',
      },
    },
  };
}

function createGridController(): IData {
  return {
    model: {
      appId: 'app',
    },
    controlParams: {},
  };
}

beforeEach(() => {
  getAppDataEntity.mockResolvedValue({ appDEFields: [] });
  ibiz.hub = {
    getAppDataEntity,
  } as never;
  ibiz.util = {
    jsonSchema: {
      sortProperties: (properties: [string, IData][]) => properties,
    },
  } as never;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('JSON Schema generated grid models', () => {
  test('skips reference properties without reporting unsupported types', async () => {
    const error = vi.spyOn(ibiz.log, 'error');

    const result = await calcColumnModelBySchema(
      schemaWithReference(),
      createGridController() as never,
    );

    expect(result?.degridColumns.map(column => column.id)).toEqual([
      'title',
      'estimate',
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  test('keeps primitive dynamic grid fields and skips reference properties', async () => {
    const error = vi.spyOn(ibiz.log, 'error');
    const controller = createGridController();
    controller.controlParams = {
      propertyorder: 'order',
    };

    const result = await calcAutoColumnModelBySchema(
      {
        ...schemaWithReference(),
        order: ['title', 'estimate', 'owner'],
      },
      controller as never,
    );

    expect(result.degridColumns.map(column => column.id)).toEqual([
      'title',
      'estimate',
    ]);
    expect(result.degridDataItems.map(item => item.id)).toEqual([
      'title',
      'estimate',
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  test('still reports a genuinely unsupported schema type', async () => {
    const error = vi.spyOn(ibiz.log, 'error');

    await calcColumnModelBySchema(
      {
        properties: {
          payload: {
            type: 'object',
            description: '负载',
          },
        },
      },
      createGridController() as never,
    );

    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe('JSON Schema generated search filters', () => {
  test('skips reference properties while keeping primitive filters', async () => {
    const error = vi.spyOn(ibiz.log, 'error');

    const result = await calcFilterModelBySchema(
      schemaWithReference(),
      'entity',
      'app',
    );

    expect(result.some(filter => filter.id === 'owner')).toBe(false);
    expect(result.some(filter => filter.id === 'title')).toBe(true);
    expect(result.some(filter => filter.id === 'estimate')).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });
});
