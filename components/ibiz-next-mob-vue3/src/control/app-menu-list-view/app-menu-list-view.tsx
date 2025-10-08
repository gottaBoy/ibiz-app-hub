import { defineComponent, PropType } from 'vue';
import { IAppMenu, IAppMenuItem } from '@ibiz/model-core';
import { AppMenuController, IControlProvider } from '@ibiz-template/runtime';
import { prepareControl, useControlController } from '@ibiz-template/vue3-util';
import './app-menu-list-view.scss';

export const AppMenuListViewControl = defineComponent({
  name: 'IBizAppMenuListViewControl',
  props: {
    modelData: { type: Object as PropType<IAppMenu>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController((...args) => new AppMenuController(...args));
    const { controlClass, ns } = prepareControl(c);
    return {
      controlClass,
      c,
      ns,
    };
  },

  render() {
    const { model } = this.c;
    const { controlStyle } = model;
    const renderMenuItem = (item: IAppMenuItem) => {
      if (item.hidden === true) {
        return null;
      }
      let renderItem = null;
      switch (item.itemType) {
        case 'MENUITEM':
          if (item.appMenuItems?.length) {
            renderItem = (
              <van-cell-group class={this.ns.b('group')} title={item.caption}>
                {item.appMenuItems.map(child => {
                  return renderMenuItem(child);
                })}
              </van-cell-group>
            );
          } else {
            renderItem = (
              <van-cell
                class={[this.ns.b('item')]}
                is-link
                center
                clickable
                title={item.caption}
                onClick={async (event: MouseEvent) => {
                  try {
                    await this.c.onClickMenuItem(item.id!, event, false);
                  } catch (error) {
                    ibiz.log.error(error);
                  }
                }}
              >
                {{
                  icon: () => {
                    return (
                      item.sysImage && (
                        <div class={this.ns.b('icon')}>
                          <iBizIcon icon={item.sysImage}></iBizIcon>
                        </div>
                      )
                    );
                  },
                }}
              </van-cell>
            );
          }
          break;
        case 'SEPERATOR':
          renderItem = <van-divider />;
          break;
        default:
          break;
      }
      return renderItem;
    };
    return (
      <van-list
        class={[
          this.ns.b(),
          this.ns.b(controlStyle?.toLowerCase()),
          this.ns.m(this.modelData.id),
        ]}
      >
        {model?.appMenuItems?.map(item => {
          return renderMenuItem(item);
        })}
      </van-list>
    );
  },
});
