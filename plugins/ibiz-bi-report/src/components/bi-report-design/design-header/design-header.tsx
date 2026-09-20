import { PropType, computed, defineComponent } from 'vue';
import { BIReportDesignController } from '../../../controller';
import { useNamespace } from '../../../use';
import './design.header.scss';
import { biReportT } from '../../../locale';

export default defineComponent({
  name: 'BIDesignHeader',
  props: {
    controller: {
      type: Object as PropType<BIReportDesignController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('design-header');

    // 属性数据
    const propertyData = computed(() => {
      return props.controller.state.propertyData;
    });

    // 标题
    const caption = computed(() => {
      return propertyData.value?.caption;
    });

    // 保存
    const onSave = () => {
      props.controller.save();
    };

    // 关闭
    const onClose = async () => {
      props.controller.close();
    };

    // 取消保存，效果为重置
    const onReset = async () => {
      if (props.controller && !props.controller.state.dataChangeState) {
        return;
      }
      // 重置为默认值
      const target = await (ibiz as IData).confirm.warning({
        title: biReportT('confirmCancelSave'),
        desc: (
          <div class={ns.b('report-caption')}>
            <div class={ns.be('report-caption', 'name')}>
              {biReportT('cancelReportQuestion', {
                caption: caption.value || biReportT('unnamed'),
              })}
            </div>
            <div class={ns.be('report-caption', 'desc')}>
              {biReportT('cancelSaveDesc')}
            </div>
          </div>
        ),
      });
      if (target) {
        props.controller.cancel();
      }
    };

    return { ns, caption, onSave, onClose, onReset };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('caption')}>
          <span class={this.ns.em('caption', 'text')}>{this.caption}</span>
        </div>
        <div class={this.ns.e('actions')}>
          <div class={this.ns.em('actions', 'close')} onClick={this.onClose}>
            {biReportT('back')}
          </div>
          <div class={this.ns.em('actions', 'save')}>
            <el-dropdown
              split-button
              type='primary'
              onClick={this.onSave}
              onCommand={this.onReset}
              popper-class={this.ns.b('save-popper')}
            >
              {{
                default: () => {
                  return <span>{biReportT('save')}</span>;
                },
                dropdown: () => {
                  return (
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        {biReportT('cancelSave')}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  );
                },
              }}
            </el-dropdown>
          </div>
        </div>
      </div>
    );
  },
});
