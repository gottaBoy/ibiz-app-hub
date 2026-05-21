import { defineComponent, PropType } from 'vue';
import { IAppDEUIActionGroupDetail, IDETBGroupItem } from '@ibiz/model-core';
import { IApiButtonContainerState, IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { useToolbarModalItemRender } from '../toolbar-render-util';
import './toolbar-group-list.scss';

/**
 * @description 工具栏分组列表，用于在工具栏分组以弹框打开时，绘制分组数据
 */
export const ToolbarGroupList = defineComponent({
  name: 'IBizToolbarGroupList',
  props: {
    modal: {
      type: Object as PropType<IModal>,
    },
    groupItems: {
      type: Array as PropType<
        Array<IDETBGroupItem | IAppDEUIActionGroupDetail>
      >,
      required: true,
    },
    buttonsState: {
      type: Object as PropType<IApiButtonContainerState>,
      required: true,
    },
    groupShowMode: {
      type: String as PropType<'DEFAULT' | 'ACTIONSHEET'>,
      required: true,
    },
    counterData: {
      type: Object as PropType<IData>,
    },
    isGroupExtractMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('toolbar-group-list');

    const { handleModalClose, renderToolbarItem } = useToolbarModalItemRender(
      ns,
      {
        modal: props.modal,
        counterData: props.counterData,
        buttonsState: props.buttonsState,
        groupShowMode: props.groupShowMode,
        direction: 'horizontal',
      },
    );

    return {
      ns,
      handleModalClose,
      renderToolbarItem,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is(this.groupShowMode?.toLocaleLowerCase(), true),
        ]}
      >
        {this.groupShowMode === 'DEFAULT' ? (
          <div class={this.ns.e('modal')} onClick={this.handleModalClose}></div>
        ) : null}
        <div class={this.ns.e('wrapper')}>
          {this.groupItems?.map(
            (_item: IDETBGroupItem | IAppDEUIActionGroupDetail) =>
              this.renderToolbarItem(_item),
          )}
        </div>
      </div>
    );
  },
});
