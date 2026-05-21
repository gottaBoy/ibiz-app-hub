import { DashboardController, IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { PropType, defineComponent, ref } from 'vue';
import './custom-dashboard-design.scss';

export const CustomDashboardDesign = defineComponent({
  name: 'IBizCustomDashboardDesign',
  props: {
    controller: {
      type: Object as PropType<DashboardController>,
      required: true,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-dashboard-design');

    // 自定义看板控制器
    const customDashboard = props.controller.getMobCustomDashboard()!;

    // 门户部件
    const portlets = Object.values(props.controller.portlets).filter(
      item => !customDashboard.ignoreType.includes(item.model.portletType!),
    );

    // 门户部件列表
    const items = ref(
      portlets.map(item => {
        const id = item.model.id!;
        const visible = !Array.isArray(customDashboard.portlets)
          ? true
          : customDashboard.portlets.includes(id);
        return {
          id,
          title: item.model.title,
          visible,
        };
      }),
    );

    // 处理选择
    const handleItemClick = (item: { id: string; visible: boolean }) => {
      item.visible = !item.visible;
    };

    // 处理关闭
    const handleClose = () => {
      props.modal.dismiss();
    };

    // 处理保存
    const handleSave = async () => {
      await customDashboard.save(
        items.value.filter(item => item.visible).map(item => item.id),
      );
      handleClose();
    };

    return {
      ns,
      items,
      handleClose,
      handleSave,
      handleItemClick,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <ion-icon
            class={this.ns.be('header', 'close-btn')}
            name='close-outline'
            onClick={this.handleClose}
          ></ion-icon>
          <div class={this.ns.be('header', 'title')}>
            {ibiz.i18n.t('control.dashboard.customLayout')}
          </div>
          <div
            class={this.ns.be('header', 'save-btn')}
            onClick={this.handleSave}
          >
            {ibiz.i18n.t('control.dashboard.save')}
          </div>
        </div>
        <div class={this.ns.b('content')}>
          {this.items.map(item => {
            // eslint-disable-next-line prefer-const
            let visible = item.visible;
            return (
              <div
                class={this.ns.b('item')}
                onClick={() => this.handleItemClick(item)}
              >
                <iBizIcon
                  class={this.ns.be('item', 'icon')}
                  icon={{ cssClass: 'fa fa-th-large' }}
                ></iBizIcon>
                <div class={this.ns.be('item', 'text')}>
                  {item.title || item.id}
                </div>
                <van-checkbox
                  class={this.ns.be('item', 'checkbox')}
                  v-model={visible}
                ></van-checkbox>
              </div>
            );
          })}
          {this.items.length === 0 ? <iBizNoData /> : null}
        </div>
      </div>
    );
  },
});
