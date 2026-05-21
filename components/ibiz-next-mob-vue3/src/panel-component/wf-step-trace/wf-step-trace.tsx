import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent } from 'vue';
import { WFStepTraceController } from './wf-step-trace.controller';
import './wf-step-trace.scss';

/**
 * 流程跟踪组件
 * @primary
 * @description 根据流程跟踪数据循环绘制步骤条，每一条提供了4个步骤信息展示，包括处理完成时间(time)，处理环节(type)，处理人(authorNames)，提交路径(taskName)。
 */
export const WFStepTrace = defineComponent({
  name: 'IBizWFStepTrace',
  props: {
    /**
     * @description 流程跟踪组件控制器
     */
    controller: {
      type: WFStepTraceController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('wf-step-trace');
    const data = computed(() => {
      return props.controller.getData();
    });
    return {
      ns,
      data,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.data && (
          <van-steps direction='vertical'>
            {this.data.map((task: IData) => {
              return (
                <van-step>
                  <div class={[this.ns.b('task')]}>
                    <div class={this.ns.b('task-item')}>
                      <van-field
                        readonly
                        v-model={task.time}
                        label={ibiz.i18n.t(
                          'panelComponent.wfStepTrace.processingComplete',
                        )}
                      />
                    </div>
                    <div class={this.ns.b('task-item')}>
                      <van-field
                        readonly
                        v-model={task.taskName}
                        label={ibiz.i18n.t(
                          'panelComponent.wfStepTrace.processingSteps',
                        )}
                      />
                    </div>
                    <div class={this.ns.b('task-item')}>
                      <van-field
                        readonly
                        v-model={task.authorName}
                        label={ibiz.i18n.t(
                          'panelComponent.wfStepTrace.processingPersonnel',
                        )}
                      />
                    </div>
                    <div class={this.ns.b('task-item')}>
                      <van-field
                        v-model={task.type}
                        readonly
                        label={ibiz.i18n.t(
                          'panelComponent.wfStepTrace.submissionPath',
                        )}
                      />
                    </div>
                    {task.fullmessage && (
                      <div class={this.ns.b('task-item')}>
                        <van-field
                          v-model={task.fullmessage}
                          readonly
                          label={ibiz.i18n.t(
                            'panelComponent.wfStepTrace.processInformation',
                          )}
                        />
                      </div>
                    )}
                  </div>
                </van-step>
              );
            })}
          </van-steps>
        )}
      </div>
    );
  },
});
export default WFStepTrace;
