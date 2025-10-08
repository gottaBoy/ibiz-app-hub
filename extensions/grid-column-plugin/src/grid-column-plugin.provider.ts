import {
  GridColumnController,
  GridController,
  GridFieldEditColumnController,
  GridUAColumnController,
  IGridColumnProvider,
} from '@ibiz-template/runtime';
import { IDEGridFieldColumn } from '@ibiz/model-core';
import { GridColumnPluginController } from './grid-column-plugin.controller';

function newController(
  columnModel: IDEGridFieldColumn,
  grid: GridController,
): GridColumnController {
  if (columnModel.columnType === 'UAGRIDCOLUMN') {
    return new GridUAColumnController(columnModel, grid);
  }
  if (columnModel.enableRowEdit) {
    return new GridFieldEditColumnController(columnModel, grid);
  }
  return new GridColumnPluginController(columnModel, grid);
}

export class GridColumnPluginProvider implements IGridColumnProvider {
  component: string = 'IBizGridColumnPlugin';

  async createController(
    columnModel: IDEGridFieldColumn,
    grid: GridController,
  ): Promise<GridColumnController> {
    const c = newController(columnModel, grid);
    await c.init();
    return c;
  }
}
