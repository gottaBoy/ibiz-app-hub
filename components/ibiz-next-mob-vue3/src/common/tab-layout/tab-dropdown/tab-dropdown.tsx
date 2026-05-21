import { computed, defineComponent, h, ref } from 'vue';
import { IModal, IOverlayPopoverContainer } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { layoutEmits, layoutProps, useLayoutRender } from '../tab-layout-util';
import { TabDropdownListContent } from './tab-dropdown-list-content';
import './tab-dropdown.scss';

export const TabDropdown = defineComponent({
  name: 'IBizTabDropdown',
  props: layoutProps,
  emits: layoutEmits,
  setup(props, { emit }) {
    const ns = useNamespace('tab-dropdown');

    const tabDropdownRef = ref();

    const activeTab = computed(() => {
      return props.tabPages.find(tab => tab.id === props.activeName);
    });

    const { onTabChange } = useLayoutRender(emit);

    let floatOverlay: IOverlayPopoverContainer | void;
    const onFloatBtnClick = async (
      _event: MouseEvent,
      _currentTarget: HTMLElement,
    ) => {
      if (floatOverlay) {
        floatOverlay.dismiss();
        floatOverlay = undefined;
        return;
      }

      floatOverlay = ibiz.overlay.createPopover(
        (modal: IModal) => {
          return h(TabDropdownListContent, {
            modal,
            tabPages: props.tabPages,
            activeName: props.activeName,
            layoutMode: props.layoutMode,
          });
        },
        {},
        {
          width: 'auto',
          height: 'auto',
          noArrow: true,
          autoClose: true,
          placement: 'bottom-end',
          modalClass: `${ns.e('list-modal')}`,
          appendTo: tabDropdownRef.value?.$el,
        } as IData,
      );
      floatOverlay.present(_currentTarget);

      const res: IData = await floatOverlay.onWillDismiss();
      const activeKey = res?.data[0]?.activeName;
      if (activeKey) {
        onTabChange(activeKey);
      }
      floatOverlay = undefined;
    };

    return { ns, tabDropdownRef, activeTab, onFloatBtnClick };
  },
  render() {
    return (
      <iBizFloatButton
        ref='tabDropdownRef'
        class={this.ns.b()}
        align='RIGHTSTART'
        onClick={this.onFloatBtnClick}
      >
        <iBizInfoItem
          label={this.activeTab?.text}
          icon={this.activeTab?.icon}
        />
      </iBizFloatButton>
    );
  },
});
