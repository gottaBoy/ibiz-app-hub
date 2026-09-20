import { PropType, defineComponent, reactive, ref, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './user-config-edit.scss';
import { DevToolConfig } from '../../controller/dev-tool-config';
import { devtoolT } from '../../locale/helper';

export const UserConfigEdit = defineComponent({
  name: 'DevToolUserConfigEdit',
  props: {
    userConfig: {
      type: Object as PropType<Partial<DevToolConfig>>,
      required: true,
    },
  },
  emits: {
    change: (_data: Partial<DevToolConfig>) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('user-config-edit');

    const formData = reactive({ ...props.userConfig });

    watch(
      () => formData,
      () => {
        emit('change', formData);
      },
      {
        deep: true,
      },
    );

    const changeValue = (event: Event): void => {
      const { value } = event.target as HTMLInputElement;
      formData.studioBaseUrl = value;
    };
    const isFocus = ref<boolean>(false);

    const changeMode = (event: Event): void => {
      const value = (event.target as HTMLInputElement).checked;
      formData.v9Mode = value;
    };

    return { ns, formData, changeValue, changeMode, isFocus };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <div class={this.ns.e('wrapper')}>
          <span class={this.ns.e('wrapper-title')}>
            {devtoolT('platformUrl')}
          </span>
          <input
            class={[this.ns.e('wrapper-input'), this.isFocus ? 'focus' : '']}
            type='text'
            value={this.formData.studioBaseUrl}
            onInput={(event: Event) => this.changeValue(event)}
            onBlur={() => {
              this.isFocus = false;
            }}
            onFocus={() => {
              this.isFocus = true;
            }}
          />
        </div>
        <div class={this.ns.e('wrapper')}>
          <span class={this.ns.e('wrapper-title')}>{devtoolT('v9Mode')}</span>
          <label class={[this.ns.e('wrapper-switch')]}>
            <input
              type='checkbox'
              value={this.formData.v9Mode}
              checked={this.formData.v9Mode === true}
              onChange={(event: Event) => this.changeMode(event)}
            />
            <span class='slider'></span>
          </label>
        </div>
      </div>
    );
  },
});

export default UserConfigEdit;
