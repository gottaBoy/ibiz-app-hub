import { computed, defineComponent, PropType, Ref, ref, VNode } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { CoopPosController } from './coop-pos.controller';
import './coop-pos.scss';

/**
 * 消息协同占位
 * @primary
 * @description 该组件有两种呈现模式，默认是Alert呈现，当视图配置【标记数据打开模式】勾选【显示操作人员】时以用户头像呈现
 *  1. 该组件会根据【标记数据打开模式】的配置计算需要呈现的用户消息，默认显示当前用户
 *  2. 只勾选了【显示操作人员】时，所有的操作类型的用户都会呈现
 *  3. 勾选其他的【标记数据打开模式】时，会根据勾选项过滤操作用户:
 *      - 勾选【登记打开数据】 -> 显示浏览用户
 *      - 勾选【登记更新数据】 -> 显示编辑用户
 *      - 勾选【提示刷新数据】 -> 显示更新用户
 * @panelitemparams {name:showmode,parameterType:'avatar' | 'default',defaultvalue:'default',description:当值为avatar时会绘制头像}
 *
 */

export const CoopPos = defineComponent({
  name: 'IBizCoopPos',
  props: {
    /**
     * @description 协同占位控件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 协同占位控件控制器
     */
    controller: {
      type: CoopPosController,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('coop-pos');

    // 错误图标，防止出现空白图片
    const errorIcons: Ref<string[]> = ref([]);

    /**
     * 根据消息模式数组过滤出可见数组
     */
    const messages = computed(() => {
      const values = [...c.state.messageMap.values()];
      return values.filter(
        value =>
          !value.action || (c.state.messageModes || []).includes(value.action),
      );
    });

    const handleError = (url: string) => {
      errorIcons.value.push(url);
    };

    const renderItem = (message: IData) => {
      let content: string | null | VNode =
        ibiz.util.text.abbreviation(message.username) || message.username;
      if (c.showMode === 'avatar') {
        const iconurl = c.getIconUrlByName(message.username);
        const url = c.getDownloadUrl(iconurl);
        if (url && !errorIcons.value.includes(url)) {
          content = (
            <img
              class={ns.e('img')}
              src={url}
              onError={() => handleError(url)}
            />
          );
        }
      }
      return content;
    };

    return { ns, c, messages, renderItem };
  },
  render() {
    return (
      <div class={[this.ns.b(), ...this.controller.containerClass]}>
        {this.c.state.messageModes ? (
          <div class={this.ns.e('on-line-editing')}>
            {this.messages.map(message => {
              return (
                <div
                  class={this.ns.em('on-line-editing', 'person')}
                  title={
                    message.action
                      ? ibiz.i18n.t(
                          `panelComponent.coopPos.${message.action.toLowerCase()}`,
                          { username: message.username },
                        )
                      : ''
                  }
                  style={`background-color: ${ibiz.util.text.stringToHexColor(
                    message.username,
                  )}`}
                >
                  {this.renderItem(message)}
                </div>
              );
            })}
          </div>
        ) : (
          <iBizCoopAlert key={this.c.state.key} {...this.c.state.alertParams} />
        )}
      </div>
    );
  },
});
