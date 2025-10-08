import { HttpResponse } from '@ibiz-template/core';
import { Method, IDataEntity } from '@ibiz-template/runtime';
import { IAppDEDataSet } from '@ibiz/model-core';

export class FetchPlugin extends Method {
  declare method: IAppDEDataSet;

  async exec(
    context: IContext,
    _params?: IData | IData[],
    _params2?: IParams,
    _header?: IData,
  ): Promise<HttpResponse<IDataEntity[]>> {
    const items: IData[] = [
      {
        id: 'item1',
        name: '动态代码表项1',
        begin: 1,
        end: 25,
        bgcolor: '#c6e2ff',
        color: '#409eff',
        imagepath: 'user-avatar.png',
        textclass: 'codelist-custom-item',
        disableselect: false,
      },
      {
        id: 'item2',
        name: '动态代码表项2',
        begin: 26,
        end: 50,
        bgcolor: '#d1edc4',
        color: '#67c23a',
        iconclass: 'cafe-outline',
        textclass: 'codelist-custom-item',
        disableselect: false,
      },
      {
        id: 'item3',
        name: '动态代码表项3',
        begin: 51,
        end: 75,
        bgcolor: '#f8e3c5',
        color: '#e6a23c',
        iconclass: 'mail-outline',
        textclass: 'codelist-custom-item',
        disableselect: false,
      },
      {
        id: 'item4',
        name: '动态代码表项4',
        begin: 76,
        end: 100,
        bgcolor: '#fcd3d3',
        color: '#f56c6c',
        iconclass: 'snow-outline',
        textclass: 'codelist-custom-item',
        disableselect: true,
      },
    ];
    for (let i = 0; i < items.length; i++) {
      items[i] = await this.result.format(context, items[i]);
    }
    return new HttpResponse(items.map(item => this.createEntity(item)));
  }
}
