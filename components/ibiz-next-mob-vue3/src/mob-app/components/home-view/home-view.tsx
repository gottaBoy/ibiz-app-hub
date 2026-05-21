import { defineComponent, PropType } from 'vue';
import { IModal, IModalData, Modal, ViewMode } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './home-view.scss';

export const HomeView = defineComponent({
  name: 'HomeView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('home-view');
    const viewModal = new Modal({
      mode: ViewMode.ROUTE,
      viewUsage: 1,
      routeDepth: props.modal.routeDepth! + 1,
      dismiss: (data: IModalData) => {
        props.modal.dismiss(data);
      },
    });
    return { viewModal, ns };
  },
  render() {
    return (
      <>
        <iBizRouterView
          class={this.ns.b()}
          modal={this.viewModal}
        ></iBizRouterView>
        <iBizAIButton />
      </>
    );
  },
});
