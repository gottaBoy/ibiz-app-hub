import { defineComponent, h, PropType } from 'vue';
import { IModal, IModalData } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { SettingContainerController } from './setting-container.controller';
import { IBizMdSortSetting, IBizMdAdvanedSearchfrom } from '../../common';
import './setting-container.scss';

/**
 * 设置容器组件
 * @primary
 * @description 面板布局占位容器，用于展示快捷操作按钮。
 * @primary
 */
export const SettingContainer = defineComponent({
  name: 'IBizSettingContainer',
  props: {
    /**
     * @description 模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 设置容器控制器
     */
    controller: {
      type: SettingContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('setting-container');
    const c = props.controller;

    const handleClick = async (_event: MouseEvent): Promise<void> => {
      const { sortDelistItems, sortQuery } = c.mdctrl!.state;
      let sort: IData;
      if (sortQuery) {
        const [key, order] = sortQuery.split(',');
        sort = { key, order };
      }
      const res = (await ibiz.overlay.drawer(
        (modal: IModal) => {
          return h(IBizMdSortSetting, {
            modal,
            listItems: sortDelistItems,
            sort: sort as { key: string; order: 'asc' | 'desc' },
          });
        },
        {},
        {
          attrs: {
            position: 'bottom',
            closeable: false,
          },
        },
      )) as IModalData;
      if (res?.data && res.data.length > 0) {
        const _sort = res.data[0];
        c.mdctrl?.setSort(_sort.key, _sort.order);
        c.mdctrl?.load({ isInitialLoad: true });
      }
    };

    // 点击高级搜索按钮
    const handleAdvanedClick = async () => {
      const searchform = c.panel.view.providers.searchform;
      await ibiz.overlay.drawer(
        (modal: IModal) => {
          return h(IBizMdAdvanedSearchfrom, {
            modal,
            modelData: c.searchform.model,
            context: c.searchform.context,
            params: c.searchform.params,
            provider: searchform,
            controller: c.searchform,
          });
        },
        {},
        {
          attrs: {
            position: 'bottom',
            closeable: false,
          },
        },
      );
    };

    return { c, ns, handleClick, handleAdvanedClick };
  },
  render() {
    if (!this.c.visible) return;

    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('content')}>
          {this.c.isMDSortButton && (
            <van-button class={this.ns.e('md-sort')} onClick={this.handleClick}>
              <svg
                class={this.ns.em('md-sort', 'icon')}
                viewBox='0 0 1024 1024'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                p-id='10950'
                height='1em'
                width='1em'
              >
                <path
                  d='M83.6 263.2H590c20.8 0 37.6-16.9 37.6-37.6S610.7 188 590 188H83.6C62.8 188 46 204.9 46 225.6s16.9 37.6 37.6 37.6zM538.3 513.5c0-20.8-16.9-37.6-37.6-37.6h-417c-20.8 0-37.6 16.9-37.6 37.6s16.9 37.6 37.6 37.6h417c20.8 0.1 37.6-16.8 37.6-37.6zM381.5 729.1H83.6C62.8 729.1 46 746 46 766.7s16.9 37.6 37.6 37.6h297.9c20.8 0 37.6-16.9 37.6-37.6s-16.8-37.6-37.6-37.6zM967 582.7c-14.7-14.7-38.5-14.7-53.2 0L782.3 714.1V205.7c0-20.8-16.9-37.6-37.6-37.6S707 184.9 707 205.7v503.8L580.3 582.7c-14.7-14.7-38.5-14.7-53.2 0s-14.7 38.5 0 53.2l220 220 220-220c14.6-14.6 14.6-38.5-0.1-53.2z'
                  p-id='10951'
                ></path>
              </svg>
            </van-button>
          )}
          {this.c.isMDSearchformBtn && (
            <van-button
              class={this.ns.e('md-advaned-searchform')}
              onClick={this.handleAdvanedClick}
            >
              <svg
                class='icon'
                viewBox='0 0 1024 1024'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                p-id='6901'
                height='1em'
                width='1em'
                fill='currentColor'
              >
                <path
                  d='M777.6 243.2c12.8-22.4 12.8-48 0-70.4-12.8-19.2-32-32-54.4-32H204.8c-22.4 0-41.6 12.8-54.4 32-12.8 22.4-12.8 48 0 70.4l192 320v252.8c0 25.6 12.8 44.8 32 57.6 9.6 6.4 19.2 9.6 32 9.6 9.6 0 19.2-3.2 28.8-6.4l115.2-64c22.4-12.8 35.2-35.2 35.2-57.6v-188.8l192-323.2z m-252.8 284.8c-6.4 9.6-9.6 22.4-9.6 35.2v188.8L416 806.4v-246.4c0-12.8-3.2-25.6-9.6-35.2l-192-316.8h502.4l-192 320zM662.4 761.6l80 105.6c12.8 16 38.4 16 51.2 0l80-105.6c9.6-12.8 6.4-35.2-6.4-44.8s-35.2-6.4-44.8 6.4l-22.4 28.8v-192c0-19.2-12.8-32-32-32s-32 12.8-32 32v192l-22.4-28.8c-6.4-9.6-16-12.8-25.6-12.8-6.4 0-12.8 3.2-19.2 6.4-12.8 9.6-16 32-6.4 44.8z'
                  p-id='6902'
                  data-spm-anchor-id='a313x.search_index.0.i1.7df83a812sJGKb'
                  class='selected'
                  fill='currentColor'
                ></path>
              </svg>
            </van-button>
          )}
        </div>
      </div>
    );
  },
});
