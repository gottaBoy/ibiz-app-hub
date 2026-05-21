import { AppMenuController, IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { MenuDesignList } from './menu-design-list/menu-design-list';
import { MenuDesignTree } from './menu-design-tree/menu-design-tree';
import './custom-menu-design.scss';

/**
 * 处理菜单自定义配置
 */
export const MenuDesign = defineComponent({
  name: 'IBizMenuDesign',
  props: {
    controller: {
      type: Object as PropType<AppMenuController>,
      required: true,
    },
    modal: {
      type: Object as PropType<IModal>,
    },
    showMode: {
      type: String,
      default: 'DEFALUT',
    },
  },
  emits: {
    close: () => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('menu-design');
    const c = props.controller;

    let storageItems: Array<{ id: string; order: number; hidden: boolean }> =
      [];

    // 关闭
    const onClose = () => {
      emit('close');
      props.modal?.dismiss();
    };

    // 保存
    const onSave = async () => {
      if (storageItems.length) c.saveMobCustomMenusModel(storageItems);
      onClose();
    };

    // 存储的菜单项改变
    const onStorageItemsChange = (
      items: Array<{ id: string; order: number; hidden: boolean }>,
    ) => {
      storageItems = items;
    };

    const renderContent = () => {
      switch (props.showMode) {
        case 'LIST':
          return (
            <MenuDesignList
              curVisibleMenuItems={c.state.mobMenuItems}
              allVisibleMenuItems={c.state.mobAuthedMenuItems}
              onStorageItemsChange={onStorageItemsChange}
            />
          );
        case 'TREE':
        default:
          return (
            <MenuDesignTree
              curVisibleMenuItems={c.state.mobMenuItems}
              allVisibleMenuItems={c.state.mobAuthedMenuItems}
              appMenuStyle={c.model.appMenuStyle}
              onStorageItemsChange={onStorageItemsChange}
            />
          );
      }
    };

    return {
      c,
      ns,
      onSave,
      onClose,
      renderContent,
    };
  },

  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is(this.showMode.toLocaleLowerCase(), true),
        ]}
      >
        <div class={this.ns.e('header')}>
          <ion-icon
            name='close-outline'
            onClick={this.onClose}
            class={this.ns.em('header', 'close-icon')}
          ></ion-icon>
          <div class={this.ns.em('header', 'caption')}>
            {ibiz.i18n.t('control.appmenu.customNav')}
          </div>
          <div class={this.ns.em('header', 'save')} onClick={this.onSave}>
            {ibiz.i18n.t('control.appmenu.save')}
          </div>
        </div>
        <div class={this.ns.e('content')}>{this.renderContent()}</div>
      </div>
    );
  },
});
