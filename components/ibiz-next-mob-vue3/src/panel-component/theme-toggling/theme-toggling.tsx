import { PropType, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { ThemeTogglingController } from './theme-toggling.controller';
import './theme-toggling.scss';

export const ThemeToggling = defineComponent({
  name: 'IBizThemeToggling',
  props: {
    /**
     * @description 首页导航占位模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 首页导航占位控制器
     */
    controller: {
      type: Object as PropType<ThemeTogglingController>,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('theme-toggling');

    const themeList = [
      {
        title: ibiz.i18n.t('panelComponent.themeToggling.auto'),
        value: 'auto',
      },
      {
        title: ibiz.i18n.t('panelComponent.themeToggling.light'),
        value: 'light',
      },
      {
        title: ibiz.i18n.t('panelComponent.themeToggling.dark'),
        value: 'dark',
      },
    ];

    return { ns, c, themeList };
  },
  render() {
    return (
      <van-cell-group
        inset
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          ...this.controller.containerClass,
        ]}
      >
        {this.themeList.map(theme => {
          return (
            <van-cell
              center
              clickable
              title={theme.title}
              class={this.ns.e('item')}
              onClick={() => this.c.switchTheme(theme.value)}
            >
              {{
                'right-icon': () => {
                  return this.c.state.theme === theme.value ? (
                    <van-icon class={this.ns.e('icon')} name='success' />
                  ) : null;
                },
              }}
            </van-cell>
          );
        })}
      </van-cell-group>
    );
  },
});
