import { IAppMenu, IAppMenuItem } from '@ibiz/model-core';
import { defineComponent, PropType, VNode } from 'vue';
import { AppMenuController, IControlProvider } from '@ibiz-template/runtime';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { isArray } from 'lodash-es';
import { getDefaultIconVal, useMenuRender } from '../app-menu/menu-render-util';
import './app-menu-icon-view.scss';

export const AppMenuIconViewControl = defineComponent({
  name: 'IBizAppMenuIconViewControl',
  props: {
    modelData: { type: Object as PropType<IAppMenu>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController((...args) => new AppMenuController(...args));
    const ns = useNamespace(
      `control-${c.model.controlType!.toLowerCase()}-${c.model.controlStyle?.toLowerCase()}`,
    );

    const { onCustomizedClick } = useMenuRender(c);

    // 绘制菜单项
    const renderMenuItem = (
      menuItem: IAppMenuItem,
    ): Array<VNode | null> | VNode | null => {
      if (menuItem.hidden === true) {
        return null;
      }
      const counterNum = menuItem.counterId
        ? c.state.counterData[menuItem.counterId]
        : null;
      let renderItem: Array<VNode | null> | VNode | null = null;
      switch (menuItem.itemType) {
        case 'MENUITEM':
          if (isArray(menuItem.appMenuItems)) {
            renderItem = (
              <van-grid-item class={ns.e('group-item')} text={menuItem.caption}>
                {{
                  default: () => {
                    return (
                      <div class={ns.em('group-item', 'container')}>
                        <div class={ns.em('group-item', 'header')}>
                          {[
                            menuItem.sysImage ? (
                              <iBizIcon icon={menuItem.sysImage}></iBizIcon>
                            ) : null,
                            <span class={ns.em('group-item', 'caption')}>
                              {menuItem.caption}
                            </span>,
                            !isNil(counterNum) && (
                              <iBizBadge
                                class={ns.em('group-item', 'counter')}
                                value={counterNum}
                              />
                            ),
                          ]}
                        </div>
                        <van-grid
                          clickable
                          column-num={c.columnNum}
                          border={false}
                          class={ns.em('group-item', 'content')}
                        >
                          {menuItem.appMenuItems?.length ? (
                            menuItem.appMenuItems?.map(_item =>
                              renderMenuItem(_item),
                            )
                          ) : (
                            <div class={[ns.b('no-data')]}>
                              {ibiz.i18n.t('control.appmenu.noData')}
                            </div>
                          )}
                        </van-grid>
                      </div>
                    );
                  },
                }}
              </van-grid-item>
            );
          } else {
            renderItem = (
              <van-grid-item
                class={ns.e('item')}
                onClick={(event: MouseEvent) =>
                  c.onClickMenuItem(menuItem.id!, event, false)
                }
              >
                {{
                  default: () => {
                    const content = [
                      <div class={ns.em('item', 'icon')}>
                        {
                          <iBizIcon
                            icon={menuItem.sysImage || getDefaultIconVal()}
                          ></iBizIcon>
                        }
                        {!isNil(counterNum) && (
                          <iBizBadge
                            class={ns.em('item', 'counter')}
                            value={counterNum}
                          />
                        )}
                      </div>,
                      <span class={ns.em('item', 'caption')}>
                        {menuItem.caption}
                      </span>,
                    ];
                    return (
                      <div class={ns.em('item', 'content')}>{content}</div>
                    );
                  },
                }}
              </van-grid-item>
            );
          }
          break;
        default:
          break;
      }
      return renderItem;
    };
    return {
      c,
      ns,
      renderMenuItem,
      onCustomizedClick,
    };
  },
  render() {
    const { model, state } = this.c;
    if (!state.isCreated) return;

    return (
      <div
        class={[this.ns.b(), this.ns.m(this.modelData.id?.toLocaleLowerCase())]}
      >
        <van-grid clickable column-num={this.c.columnNum} border={false}>
          {state.mobMenuItems.map(item => this.renderMenuItem(item))}
        </van-grid>
        {model.enableCustomized && (
          <iBizFloatButton
            class={this.ns.e('icon-container')}
            align={this.c.customizedAlign}
            onClick={this.onCustomizedClick}
          />
        )}
      </div>
    );
  },
});
