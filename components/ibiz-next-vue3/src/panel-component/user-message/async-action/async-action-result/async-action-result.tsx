import { IPortalAsyncAction } from '@ibiz-template/core';
import { IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, reactive } from 'vue';
import './async-action-result.scss';
import { isObject } from 'lodash-es';

export const AsyncActionResult = defineComponent({
  name: 'IBizAsyncActionResult',
  props: {
    asyncAction: {
      type: Object as PropType<IPortalAsyncAction>,
      required: true,
    },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  setup(props) {
    const ns = useNamespace('async-action-result');

    // 结束的状态值集合
    const finishedStates = [30, 40];

    // 呈现ui信息
    const info = reactive({
      title: props.asyncAction.asyncacitonname,
      beginTime: props.asyncAction.begintime,
      endTime: props.asyncAction.endtime,
      actionState: finishedStates.includes(props.asyncAction.actionstate),
      message: ibiz.i18n.t(
        'panelComponent.userMessage.asyncActionResult.noMessage',
      ),
      isJSON: false,
    });

    // 关闭弹窗
    const onClose = () => {
      props.modal.dismiss();
    };

    // 处理结果内容
    if (isObject(props.asyncAction.actionresult)) {
      info.message = JSON.stringify(props.asyncAction.actionresult, null, 2);
      info.isJSON = true;
    } else if (props.asyncAction.actionresult) {
      info.message = `${props.asyncAction.actionresult}`;
    }

    // 递归渲染JSON对象
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderJSONObject = (obj: any, depth: number) => {
      if (obj === null) {
        return <span class={ns.be('content', 'json-null')}>null</span>;
      }

      if (typeof obj === 'boolean') {
        return (
          <span class={ns.be('content', 'json-boolean')}>{obj.toString()}</span>
        );
      }

      if (typeof obj === 'number') {
        return (
          <span class={ns.be('content', 'json-number')}>{obj.toString()}</span>
        );
      }

      if (typeof obj === 'string') {
        return <span class={ns.be('content', 'json-string')}>"{obj}"</span>;
      }

      if (Array.isArray(obj)) {
        if (obj.length === 0) {
          return <span>[]</span>;
        }

        const items = obj.map((item, index) => (
          <div
            key={index}
            class={ns.be('content', 'json-indent')}
            style={{ paddingLeft: `${(depth + 1) * 20}px` }}
          >
            {renderJSONObject(item, depth + 1)}
            {index < obj.length - 1 ? ',' : ''}
          </div>
        ));

        return (
          <div class={ns.be('content', 'json-array')}>
            <span>[</span>
            {items}
            <div style={{ paddingLeft: `${depth * 20}px` }}></div>
            <span style={{ paddingLeft: `${depth * 20}px` }}>]</span>
          </div>
        );
      }

      // 处理普通对象
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return <span>{'{}'}</span>;
      }

      const items = keys.map((key, index) => (
        <div
          key={key}
          class={ns.be('content', 'json-indent')}
          style={{ paddingLeft: `${(depth + 1) * 20}px` }}
        >
          <span class={ns.be('content', 'json-key')}>"{key}"</span>:{' '}
          {renderJSONObject(obj[key], depth + 1)}
          {index < keys.length - 1 ? ',' : ''}
        </div>
      ));

      return (
        <div class={ns.be('content', 'json-object')}>
          <span>{'{'}</span>
          {items}
          <div style={{ paddingLeft: `${depth * 20}px` }}></div>
          <span style={{ paddingLeft: `${depth * 20}px` }}>{'}'}</span>
        </div>
      );
    };

    // JSON高亮渲染函数
    const renderJSON = (jsonStr: string) => {
      try {
        const obj = JSON.parse(jsonStr);
        return renderJSONObject(obj, 0);
      } catch (e) {
        return <span>{jsonStr}</span>;
      }
    };

    return { ns, info, onClose, renderJSON };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <div class={this.ns.b('header')}>
          <div class={this.ns.e('title')}>{this.info.title}</div>
          <div class={this.ns.b('toolbar')}>
            <el-button onClick={this.onClose}>
              {ibiz.i18n.t('app.close')}
            </el-button>
          </div>
        </div>
        <div class={this.ns.b('content')}>
          <el-row>
            <el-col span={12}>
              <el-form-item
                label={ibiz.i18n.t(
                  'panelComponent.userMessage.asyncActionResult.taskName',
                )}
              >
                {this.info.title}
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item
                label={ibiz.i18n.t(
                  'panelComponent.userMessage.asyncActionResult.taskState',
                )}
              >
                {this.info.actionState
                  ? ibiz.i18n.t(
                      'panelComponent.userMessage.asyncActionResult.finished',
                    )
                  : ibiz.i18n.t(
                      'panelComponent.userMessage.asyncActionResult.processing',
                    )}
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item
                label={ibiz.i18n.t(
                  'panelComponent.userMessage.asyncActionResult.beginTime',
                )}
              >
                {this.info.beginTime}
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item
                label={ibiz.i18n.t(
                  'panelComponent.userMessage.asyncActionResult.endTime',
                )}
              >
                {this.info.endTime}
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item
                label={ibiz.i18n.t(
                  'panelComponent.userMessage.asyncActionResult.exeResult',
                )}
              >
                <div class={this.ns.be('content', 'json-container')}>
                  {this.renderJSON(this.info.message)}
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    );
  },
});
