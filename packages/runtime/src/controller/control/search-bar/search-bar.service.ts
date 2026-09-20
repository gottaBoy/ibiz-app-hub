import { IHttpResponse } from '@ibiz-template/core';
import { ISearchBar } from '@ibiz/model-core';
import { IAppService, IBackendSearchBarGroup } from '../../../interface';

/**
 * 搜索栏服务
 * @return {*}
 * @author: zhujiamin
 * @Date: 2023-12-22 10:28:32
 */
export class SearchBarService {
  /**
   * 应用
   *
   */
  app!: IAppService;

  /**
   * 视图标识
   *
   */
  viewTag!: string;

  /**
   * 部件模型
   *
   */
  readonly model: ISearchBar;

  /**
   * Creates an instance of ControlService.
   *
   */
  constructor(model: ISearchBar, viewTag: string) {
    this.model = model;
    this.viewTag = viewTag;
  }

  async init(_context?: IContext): Promise<void> {
    this.app = ibiz.hub.getApp(this.model.appId);
  }

  /**
   * 主题管理URL
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-22 10:51:49
   */
  /**
   * 主题配置实体的服务路径。
   *
   * PLM 使用 view_theme_setting 作为运行时主题配置实体；旧的
   * /extension/app_view_themes 路径属于另一套平台扩展服务，在 PLM
   * 部署中会被转发为 404。
   */
  themeUrl = '/view_theme_settings';

  /**
   * 执行查询多条数据的方法
   *
   */
  async fetch(): Promise<IHttpResponse> {
    const searchconds = [
      {
        condop: 'EQ',
        condtype: 'DEFIELD',
        fieldname: 'app_view_tag',
        value: this.viewTag,
      },
    ];
    const res = await this.app.net.post(`${this.themeUrl}/fetch_cur_user_all`, {
      searchconds,
      sort: 'create_time,asc',
    });
    if (res.ok) {
      res.data = this.convertBackDataToFront(res.data as IData[]);
    }
    return res;
  }

  /**
   * 执行获取单条数据方法
   *
   */
  async get(id: string): Promise<IHttpResponse> {
    const res = await this.app.net.get(`${this.themeUrl}/${id}`);
    if (res.ok) {
      [res.data] = this.convertBackDataToFront([res.data] as IData[]);
    }
    return res;
  }

  /**
   * 删除单条数据
   *
   */
  async remove(id: string): Promise<IHttpResponse> {
    const res = await this.app.net.delete(`${this.themeUrl}/${id}`);
    return res;
  }

  /**
   * 新建数据（只有一个标题）
   *
   */
  async create(caption: string): Promise<IHttpResponse> {
    const res = await this.app.net.post(`${this.themeUrl}`, {
      name: `${this.viewTag}___${caption}`,
      caption,
      app_tag: this.model.appId,
      app_view_tag: this.viewTag,
    });
    return res;
  }

  /**
   * 新建数据（带参数，给平台配置建立的分组用，分组项名称就是id）
   *
   */
  async createWithParams(
    group: IBackendSearchBarGroup,
    data: IData,
  ): Promise<IHttpResponse> {
    const res = await this.app.net.post(`${this.themeUrl}`, {
      name: group.name,
      caption: group.caption,
      app_tag: this.model.appId,
      app_view_tag: this.viewTag,
      theme_model: JSON.stringify(data),
      valid_flag: group.show ? 1 : 0,
    });
    return res;
  }

  /**
   * 批量新建
   * @param {IData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-26 15:49:00
   */
  async createBatch(data: IData[]): Promise<IHttpResponse> {
    const createParams = this.convertFrontDataToBack(data);
    const res = await this.app.net.post(`${this.themeUrl}`, createParams);
    return res;
  }

  /**
   * 更新数据
   *
   */
  async update(id: string, data: IData): Promise<IHttpResponse> {
    const [updateParams] = this.convertFrontDataToBack([data]);
    const res = await this.app.net.put(`${this.themeUrl}/${id}`, updateParams);
    return res;
  }

  /**
   * 批量更新数据
   * @param {IData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-26 11:11:34
   */
  async updateBatch(data: IData[]): Promise<IHttpResponse> {
    const updateParams = this.convertFrontDataToBack(data);
    const idUrl = updateParams.map(item => item.id).join(';');
    const res = await this.app.net.put(
      `${this.themeUrl}/${idUrl}`,
      updateParams,
    );
    return res;
  }

  /**
   * 转换后台数据成前端需要的格式
   * @param {IData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-22 11:19:50
   */
  convertBackDataToFront(data: IData[]): IData[] {
    return data.map(item => {
      const tempItem = { ...item };
      if (item.id) {
        tempItem.id = item.id;
      }
      if (item.name) {
        tempItem.name = item.name;
      }
      if (item.caption) {
        tempItem.caption = item.caption;
      }
      if (item.theme_model) {
        tempItem.searchGroupData = JSON.parse(item.theme_model);
      }
      if (typeof item.valid_flag === 'number') {
        tempItem.show = item.valid_flag === 1;
      }
      if (item.order_value) {
        tempItem.order = item.order_value;
      }
      if (item.owner_type) {
        tempItem.ownerType = item.owner_type;
      }
      return tempItem;
    });
  }

  /**
   * 转换前端数据成后台需要的格式
   * @param {IData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-22 11:19:50
   */
  convertFrontDataToBack(data: IData[]): IData[] {
    return data.map(item => {
      const tempItem: IData = {
        app_tag: this.model.appId,
        app_view_tag: this.viewTag,
      };
      if (item.id) {
        tempItem.id = item.id;
      }
      if (item.name) {
        tempItem.name = item.name;
      }
      if (item.caption) {
        tempItem.caption = item.caption;
      }
      if (
        item.searchGroupData &&
        Object.keys(item.searchGroupData).length > 0
      ) {
        tempItem.theme_model = JSON.stringify(item.searchGroupData);
      }
      if (typeof item.show === 'boolean') {
        tempItem.valid_flag = item.show ? 1 : 0;
      }
      if (item.order) {
        tempItem.order_value = item.order;
      }
      if (item.ownerType) {
        tempItem.owner_type = item.ownerType;
      }
      return tempItem;
    });
  }
}
