import { useNamespace } from '@ibiz-template/vue3-util';
import { PropType, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IMobPlatformProvider } from '@ibiz-template/runtime';
import { useViewStack } from '../../util';
import './preset-view-back.scss';

export const IBizPresetViewBack = defineComponent({
  name: 'IBizPresetViewBack',
  props: {
    view: {
      type: Object as PropType<IData>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('preset-view-back');

    const route = useRoute();
    const { viewStack } = useViewStack();
    const backButtonVisible = ref(false);

    if (
      Object.prototype.hasOwnProperty.call(
        props.view.params,
        'srfmobshowpresetback',
      )
    ) {
      if (
        props.view.params.srfmobshowpresetback === 'true' ||
        props.view.params.srfmobshowpresetback === true
      ) {
        backButtonVisible.value = true;
      }
    } else if (
      (ibiz.platform as unknown as IMobPlatformProvider).getShowPresetBack()
    ) {
      if (
        (props.view.modal.viewUsage === 1 &&
          viewStack.cacheKeys.length > 1 &&
          route.meta.home) ||
        props.view.modal.viewUsage === 2
      ) {
        backButtonVisible.value = true;
      }
    }

    const goBack = () => {
      props.view.modal.dismiss();
    };
    return {
      ns,
      backButtonVisible,
      goBack,
    };
  },
  render() {
    return (
      this.backButtonVisible && (
        <div class={this.ns.b()} onClick={this.goBack}>
          <ion-icon name='chevron-back-outline'></ion-icon>
        </div>
      )
    );
  },
});
