import { HttpResponse, IHttpResponse, RuntimeError } from '@ibiz-template/core';
import { IDataEntity, Method } from '@ibiz-template/runtime';
import { IAppDEAction } from '@ibiz/model-core';
import dayjs from 'dayjs';
import { createUUID } from 'qx-util';

export class DeActionPlugin extends Method {
  declare method: IAppDEAction;

  async exec(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
  ): Promise<HttpResponse<IData>> {
    let result: IHttpResponse<IData>;
    switch (this.method.codeName) {
      case 'Create':
        result = await this.create(context, data!, params || {});
        break;
      case 'Get':
        result = await this.get(context, params);
        break;
      case 'GetDraft':
        result = await this.getDraft(context, params);
        break;
      case 'Remove':
        result = await this.remove(context, params);
        break;
      case 'Update':
        result = await this.update(context, data!, params);
        break;
      default:
        result = await this.getDraft(context, params);
        break;
    }

    return result;
  }

  async create(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    if (!data) {
      throw new RuntimeError('create行为没有传data');
    }
    const path = this.calcPath(context);
    const res = await this.app.net.post(path, data, params);
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  async remove(
    context: IContext,
    params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    const path = this.calcPath(context);
    const res = await this.app.net.delete(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      params,
    );
    return res as IHttpResponse<IDataEntity>;
  }

  async update(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    if (!data) {
      throw new RuntimeError('update行为没有传data');
    }
    const path = this.calcPath(context);
    const res = await this.app.net.put(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      data,
      params,
    );
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  async get(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<IDataEntity>> {
    const path = this.calcPath(context);
    const res = await this.app.net.get(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      params,
    );
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  async getDraft(
    context: IContext,
    params?: IParams,
  ): Promise<IHttpResponse<IData>> {
    const path = this.calcPath(context);
    const res = await this.app.net.get(`${path}/get_draft`, params);
    res.data = await this.result.handle(context, res.data);
    if (res.data) {
      res.data.srfkey = createUUID();
      if (context.plugin_type === 'de_action') {
        res.data.name = context.srfusername;
        res.data.start_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
    }
    return res;
  }
}
