/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineComponent } from 'vue';
import { getRawProps, useNamespace } from '@ibiz-template/vue3-util';
import { MobAsyncActionController } from './mob-async-action.controller';
import { AsyncActionTab } from './async-action-tab/async-action-tab';
import './mob-async-action.scss';

/**
 * 后台作业组件
 * @primary
 * @description 用于在一些需要后台异步操作（如上传导入文件）的场景下，对异步操作过程和结果进行通知。
 */
export const MobAsyncAction = defineComponent({
  name: 'MobAsyncAction',
  props: getRawProps<MobAsyncActionController>(),
  setup() {
    const ns = useNamespace('mob-async-action');
    const noticeController = ibiz.hub.notice;
    return {
      ns,
      noticeController,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <AsyncActionTab
          controller={this.noticeController.asyncAction}
        ></AsyncActionTab>
      </div>
    );
  },
});
