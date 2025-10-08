import { CTX } from '@ibiz-template/runtime';
import {
  route2routePath,
  routePath2string,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { IPanelField } from '@ibiz/model-core';
import { computed, defineComponent, inject, PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PanelAppTitleController } from './panel-app-title.controller';
import './panel-app-title.scss';

/**
 * 应用标题
 * @description 用于绘制应用logo和应用标题，提供点击标题跳转首页的能力。
 * @panelitemparams {name:strictly,parameterType:boolean,defaultvalue:false,description:是否取消与首页菜单的关联，即菜单收缩时不会跟随改变，当应用标题未配置在首页左侧时应启用}
 * @primary
 */
export const PanelAppTitle = defineComponent({
  name: 'IBizPanelAppTitle',
  props: {
    /**
     *  @description 应用标题模型数据
     */
    modelData: {
      type: Object as PropType<IPanelField>,
      required: true,
    },
    /**
     * @description 应用标题控制器
     */
    controller: {
      type: PanelAppTitleController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-app-title');

    const c = props.controller;

    const route = useRoute();

    const router = useRouter();

    const ctx = inject<CTX | undefined>('ctx', undefined);

    const menuAlign = computed(() => {
      if (ctx?.view) {
        return ctx.view.model.mainMenuAlign || 'LEFT';
      }
      return 'LEFT';
    });

    const handleClick = async () => {
      // 适配登录页系统标题不提供点击链接能力
      if (c.panel.view.model.viewType === 'APPLOGINVIEW') return;
      // 跳转首页
      if (ctx?.view) {
        const routePath = route2routePath(route);
        routePath.pathNodes = routePath.pathNodes.slice(0, 1);
        const url = routePath2string(routePath);
        router.push({ path: url });
        setTimeout(() => {
          window.location.reload();
        });
      }

      props.controller.onClick();
    };

    const showImgOnly = computed(() => {
      if (menuAlign.value === 'LEFT') {
        return true;
      }
      return false;
    });

    const isCollapse = computed(() => {
      const { strictly } = c.rawItemParams;
      if (strictly && strictly === 'true') {
        return false;
      }
      return (c.panel.view.state as IData).isCollapse;
    });

    const showIcon = computed(() => {
      if (c.model.itemStyle === 'STYLE2') {
        return true;
      }
      return false;
    });

    return {
      ns,
      c,
      menuAlign,
      showImgOnly,
      handleClick,
      isCollapse,
      showIcon,
    };
  },
  render() {
    const { icon, isSvg, caption, caption2, subCaption, subCaption2 } =
      this.c.state;
    let iconVNode = null;
    let content = null;
    const captionNode = <span class={this.ns.e('title')}>{caption}</span>;
    if (this.c.panel.view.model.viewType !== 'APPINDEXVIEW') {
      content = captionNode;
    } else {
      if (this.menuAlign === 'LEFT') {
        if (this.isCollapse) {
          if (icon) {
            let tempIcon = null;
            if (isSvg) {
              tempIcon = <ion-icon class={this.ns.e('logo')} icon={icon} />;
            } else {
              tempIcon = (
                <span class={this.ns.e('logo')}>
                  <img src={icon} />
                </span>
              );
            }
            iconVNode = (
              <div class={this.ns.e('collpase-icon')}>{tempIcon}</div>
            );
          } else {
            iconVNode = (
              <div class={this.ns.e('collapse-title')}>
                <div class={this.ns.e('caption2')}>{caption2}</div>
                <div class={this.ns.e('subCaption2')}>{subCaption2}</div>
              </div>
            );
          }
        } else if (this.showIcon && icon) {
          let tempIcon = null;
          if (isSvg) {
            tempIcon = (
              <ion-icon class={this.ns.em('logo', 'expand')} icon={icon} />
            );
          } else {
            tempIcon = (
              <span class={this.ns.em('logo', 'expand')}>
                <img src={icon} />
              </span>
            );
          }
          let tempContent = (
            <g
              id='app-caption-panel'
              stroke='none'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <text
                id='app-caption'
                font-family='Poppins-Bold, Poppins'
                font-size='22'
                font-weight='bold'
              >
                <tspan x='0' y='52'>
                  {caption}
                </tspan>
              </text>
            </g>
          );
          if (subCaption) {
            tempContent = (
              <g
                id='app-caption-panel'
                stroke='none'
                stroke-width='1'
                fill-rule='evenodd'
              >
                <text
                  id='app-caption'
                  font-family='Poppins-Bold, Poppins'
                  font-size='22'
                  font-weight='bold'
                >
                  <tspan x='8' y='39'>
                    {caption}
                  </tspan>
                </text>
                <text
                  id='app-subcaption'
                  font-family='PingFangSC-Semibold, PingFang SC'
                  font-size='14'
                  font-weight='bold'
                >
                  <tspan x='8' y='66'>
                    {subCaption}
                  </tspan>
                </text>
              </g>
            );
          }
          iconVNode = (
            <span class={this.ns.e('logo')}>
              {tempIcon}
              <svg
                width='166px'
                height='80px'
                viewBox={`0 0 166 90`}
                version='1.1'
              >
                {tempContent}
              </svg>
            </span>
          );
        } else {
          iconVNode = (
            <span class={this.ns.e('logo')}>
              <svg
                width='256px'
                height='80px'
                viewBox={`0 0 256 80`}
                version='1.1'
              >
                <g
                  id='app-caption-panel'
                  stroke='none'
                  stroke-width='1'
                  fill-rule='evenodd'
                >
                  <text
                    id='app-caption'
                    font-family='Poppins-Bold, Poppins'
                    font-size='22'
                    font-weight='bold'
                  >
                    <tspan x='20.961' y='40'>
                      {caption}
                    </tspan>
                  </text>
                  <text
                    id='app-subcaption'
                    font-family='PingFangSC-Semibold, PingFang SC'
                    font-size='18'
                    font-weight='bold'
                  >
                    <tspan x='96' y='69'>
                      {subCaption}
                    </tspan>
                  </text>
                </g>
              </svg>
            </span>
          );
        }
      } else if (this.menuAlign === 'TOP') {
        if (icon) {
          if (isSvg) {
            iconVNode = <ion-icon class={this.ns.e('logo')} icon={icon} />;
          } else {
            iconVNode = (
              <span class={this.ns.e('logo')}>
                <img src={icon} />
              </span>
            );
          }
        }
      }
      // 左侧只展示图片
      if (this.menuAlign === 'LEFT') {
        content = iconVNode;
      } else {
        content = [iconVNode, captionNode];
      }
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('only-img', this.showImgOnly),
          this.ns.is('collapse', this.isCollapse),
          this.ns.is(
            'only-title',
            this.c.panel.view.model.viewType !== 'APPINDEXVIEW',
          ),
          ...this.controller.containerClass,
        ]}
        onClick={this.handleClick}
      >
        {content}
      </div>
    );
  },
});
export default PanelAppTitle;
