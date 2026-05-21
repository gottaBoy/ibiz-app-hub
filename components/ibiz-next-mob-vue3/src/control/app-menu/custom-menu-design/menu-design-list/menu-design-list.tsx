import { useNamespace } from '@ibiz-template/vue3-util';
import { IAppMenuItem, ISysImage } from '@ibiz/model-core';
import { defineComponent, PropType, ref } from 'vue';
import draggable from 'vuedraggable';
import { getDefaultIconVal } from '../../menu-render-util';
import './menu-design-list.scss';

/**
 * 菜单自定义配置列表绘制
 */
export const MenuDesignList = defineComponent({
  name: 'IBizMenuDesignList',
  components: {
    draggable,
  },
  props: {
    curVisibleMenuItems: {
      type: Array as PropType<IAppMenuItem[]>,
      required: true,
    },
    allVisibleMenuItems: {
      type: Array as PropType<IAppMenuItem[]>,
      required: true,
    },
  },
  emits: {
    storageItemsChange: (
      _items: Array<{ id: string; order: number; hidden: boolean }>,
    ) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('menu-design-list');

    // 底部导航菜单
    const curMenuItems = ref<IAppMenuItem[]>([]);
    // 更多导航菜单
    const moreMenuItems = ref<IAppMenuItem[]>([]);

    // 初始化数据
    const initData = () => {
      curMenuItems.value = [...props.curVisibleMenuItems];
      moreMenuItems.value = props.allVisibleMenuItems.filter(
        menu => !props.curVisibleMenuItems.find(_item => menu.id === _item.id),
      );
    };

    initData();

    // 转为存储项
    const transformToStorageItems = (
      menuItems: IAppMenuItem[],
      hidden: boolean = false,
    ): Array<{ id: string; order: number; hidden: boolean }> => {
      return menuItems.map((item: IAppMenuItem, index: number) => ({
        id: item.id!,
        order: index,
        hidden,
      }));
    };

    // 获取树节点项显示图标
    const getItemIcon = (item: IAppMenuItem): ISysImage | void => {
      return item.sysImage || getDefaultIconVal();
    };

    const emitChange = () => {
      emit('storageItemsChange', [
        ...transformToStorageItems(curMenuItems.value),
        ...transformToStorageItems(moreMenuItems.value, true),
      ]);
    };

    /**
     * 处理添加或删除
     *
     * @param {('nav' | 'more')} type
     * @param {number} index
     */
    const handleRemoveOrAdd = (type: 'nav' | 'more', index: number) => {
      if (type === 'nav') {
        const item = curMenuItems.value[index];
        curMenuItems.value.splice(index, 1);
        moreMenuItems.value.push(item);
      } else {
        const item = moreMenuItems.value[index];
        moreMenuItems.value.splice(index, 1);
        curMenuItems.value.push(item);
      }
      emitChange();
    };

    /**
     * 绘制拖拽区
     *
     * @param {IAppMenuItem[]} menuItems
     */
    const renderDraggable = (
      type: 'nav' | 'more',
      menuItems: IAppMenuItem[],
    ) => {
      return (
        <draggable
          itemKey='id'
          group='menu-design'
          handle='.draggable-icon'
          list={menuItems}
          class={ns.e('draggable')}
          onEnd={emitChange}
        >
          {{
            item: ({
              element,
              index,
            }: {
              element: IAppMenuItem;
              index: number;
            }) => {
              return (
                <div class={ns.em('draggable', 'item')}>
                  <ion-icon
                    name={type === 'nav' ? 'remove-circle' : 'add-circle'}
                    class={[
                      ns.em('draggable', 'icon'),
                      ns.em(
                        'draggable',
                        type === 'nav' ? 'remove-icon' : 'add-icon',
                      ),
                      ns.em('draggable', 'prefix-icon'),
                    ]}
                    onClick={() => handleRemoveOrAdd(type, index)}
                  ></ion-icon>
                  <div class={ns.em('draggable', 'item-content')}>
                    <div class={ns.em('draggable', 'item-caption')}>
                      <iBizIcon
                        icon={getItemIcon(element)}
                        class={ns.em('draggable', 'item-icon')}
                      ></iBizIcon>
                      <div>{element.caption}</div>
                    </div>
                    <ion-icon
                      name='menu-outline'
                      class={[
                        'draggable-icon',
                        ns.em('draggable', 'icon'),
                        ns.em('draggable', 'suffix-icon'),
                      ]}
                    ></ion-icon>
                  </div>
                </div>
              );
            },
          }}
        </draggable>
      );
    };

    // 绘制菜单列表
    const renderMenuList = (type: 'nav' | 'more') => {
      const menuItems =
        type === 'nav' ? curMenuItems.value : moreMenuItems.value;
      return (
        <div class={[ns.e('group'), ns.is('no-data', !menuItems.length)]}>
          <div class={ns.em('group', 'caption')}>
            {type === 'nav'
              ? ibiz.i18n.t('control.appmenu.bottomNav')
              : ibiz.i18n.t('control.appmenu.more')}
          </div>
          <div class={ns.em('group', 'content')}>
            {renderDraggable(type, menuItems)}
            {!menuItems.length ? <iBizNoData class={ns.e('no-data')} /> : null}
          </div>
        </div>
      );
    };

    return {
      ns,
      renderMenuList,
    };
  },

  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('wrapper')}>
          {[this.renderMenuList('nav'), this.renderMenuList('more')]}
        </div>
      </div>
    );
  },
});
