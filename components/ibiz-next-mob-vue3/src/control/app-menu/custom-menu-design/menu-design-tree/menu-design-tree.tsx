import { useNamespace } from '@ibiz-template/vue3-util';
import { IAppMenuItem, ISysImage } from '@ibiz/model-core';
import { defineComponent, onUnmounted, PropType, ref, VNode } from 'vue';
import { recursiveIterate } from '@ibiz-template/core';
import { getDefaultIconVal } from '../../menu-render-util';
import './menu-design-tree.scss';

/**
 * 菜单自定义配置树绘制
 */
export const MenuDesignTree = defineComponent({
  name: 'IBizMenuDesignTree',
  props: {
    curVisibleMenuItems: {
      type: Array as PropType<IAppMenuItem[]>,
      required: true,
    },
    allVisibleMenuItems: {
      type: Array as PropType<IAppMenuItem[]>,
      required: true,
    },
    appMenuStyle: {
      type: String,
    },
  },
  emits: {
    storageItemsChange: (
      _items: Array<{ id: string; order: number; hidden: boolean }>,
    ) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('menu-design-tree');

    const menuMap = ref(new Map<string, IData>());
    const allMenuMap = new Map<string, IAppMenuItem>();

    // 初始化数据
    const initData = () => {
      recursiveIterate(
        { appMenuItems: props.curVisibleMenuItems },
        (item: IAppMenuItem) => {
          if (item.id) {
            menuMap.value.set(item.id, item);
          }
        },
        {
          childrenFields: ['appMenuItems'],
        },
      );

      recursiveIterate(
        { appMenuItems: props.allVisibleMenuItems },
        (item: IAppMenuItem) => {
          if (item.id) {
            allMenuMap.set(item.id, item);
          }
        },
        {
          childrenFields: ['appMenuItems'],
        },
      );
    };

    initData();

    // 计算存储项
    const calcStorageItems = (
      items: IAppMenuItem[],
      visibleMenuMap: Map<string, IData>,
    ): Array<{ id: string; order: number; hidden: boolean }> => {
      const customItems: Array<{ id: string; order: number; hidden: boolean }> =
        [];

      items.forEach((item: IAppMenuItem, _index: number) => {
        if (item.appMenuItems?.length) {
          const childItems = calcStorageItems(
            item.appMenuItems,
            visibleMenuMap,
          );
          customItems.push(...childItems);
        }
        customItems.push({
          id: item.id!,
          order: _index,
          hidden: !visibleMenuMap.has(item.id!),
        });
      });

      return customItems;
    };

    onUnmounted(() => {
      menuMap.value.clear();
      allMenuMap.clear();
    });

    // 获取树节点项显示图标
    const getItemIcon = (
      item: IAppMenuItem,
      isGroup?: boolean,
    ): ISysImage | void => {
      if (item.sysImage) return item.sysImage;

      switch (props.appMenuStyle) {
        case 'ICONVIEW':
          // 图标视图只有项有默认图标
          return !isGroup ? getDefaultIconVal() : undefined;
        case 'LISTVIEW':
          // 列表视图没有默认图标
          return;
        default:
          return getDefaultIconVal();
      }
    };

    // 处理节点项点击
    const handleItemClick = (item: IAppMenuItem, checked: boolean) => {
      if (!item.id) return;

      // 处理选中状态
      if (checked) {
        menuMap.value.delete(item.id);
      } else {
        menuMap.value.set(item.id, item);
      }

      emit(
        'storageItemsChange',
        calcStorageItems(props.allVisibleMenuItems, menuMap.value),
      );
    };

    // 绘制树节点项内容
    const renderNodeItem = (
      _item: IAppMenuItem,
      _level: number,
      isGroup?: boolean,
    ): VNode => {
      const marginLeft = `calc(${_level} * var(${ns.cssVarBlockName(
        'spacing-node-item-margin-left',
      )}))`;
      // eslint-disable-next-line prefer-const
      let checked = menuMap.value.has(_item.id || '');
      return (
        <div
          class={[ns.e('item'), ns.is('group-item', !!isGroup)]}
          style={{ marginLeft }}
          onClick={() => handleItemClick(_item, checked)}
        >
          <iBizIcon
            class={ns.em('item', 'icon')}
            icon={getItemIcon(_item, isGroup)}
          ></iBizIcon>
          <div class={ns.em('item', 'caption')}>{_item.caption}</div>
          <van-checkbox
            v-model={checked}
            class={ns.em('item', 'checkbox')}
          ></van-checkbox>
        </div>
      );
    };

    // 绘制树节点
    const renderNode = (
      _item: IAppMenuItem,
      _level: number,
    ): VNode | Array<VNode> => {
      if (_item.appMenuItems && _item.appMenuItems.length > 0) {
        return [
          renderNodeItem(_item, _level, true),
          ...(_item.appMenuItems?.map(item => {
            return renderNode(item, _level + 1);
          }) as Array<VNode>),
        ] as Array<VNode>;
      }
      return renderNodeItem(_item, _level);
    };

    return {
      ns,
      renderNode,
    };
  },

  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('wrapper')}>
          {this.allVisibleMenuItems.length ? (
            this.allVisibleMenuItems.map(item => this.renderNode(item, 0))
          ) : (
            <iBizNoData class={this.ns.e('no-data')} />
          )}
        </div>
      </div>
    );
  },
});
