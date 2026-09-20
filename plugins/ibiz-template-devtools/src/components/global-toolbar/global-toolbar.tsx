import { PropType, Ref, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './global-toolbar.scss';
import { LogLevelDesc } from 'loglevel';
import { IDevToolConfig } from '@ibiz-template/core';
import { CenterController } from '../../controller/center.controller';
import { DevtoolSelect, DevtoolSelectOption } from '../select/index';
import DevtoolButton from '../devtool-button/devtool-button';
import MessageBox from '../message-box/message-box';
import UserConfigEdit from '../user-config-edit/user-config-edit';
import { devtoolT } from '../../locale/helper';

export const GlobalToolbar = defineComponent({
  name: 'DevToolGlobalToolbar',
  component: [
    DevtoolSelect,
    DevtoolSelectOption,
    DevtoolButton,
    MessageBox,
    UserConfigEdit,
  ],
  props: {
    center: {
      type: Object as PropType<CenterController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('global-toolbar');

    const dialog1 = ref<boolean>(false);

    const result = ref<string>('');

    const changeData = ref<Partial<IDevToolConfig> | undefined>(undefined);
    const onConfigEditClick = (): void => {
      changeData.value = undefined;
      result.value = '';
      dialog1.value = true;
    };

    watch(
      () => dialog1.value,
      (newVal, oldVal) => {
        if (newVal === false && oldVal === true) {
          if (result.value === 'confirm' && changeData.value) {
            props.center.updateUserConfig(changeData.value);
          }
        }
      },
    );

    const close = (): void => {
      props.center.triggerVisible(false);
    };

    const logLevels: Ref<LogLevelDesc[]> = ref([
      'TRACE',
      'DEBUG',
      'INFO',
      'WARN',
      'ERROR',
      'SILENT',
    ]);

    const logLevel = ref(props.center.config.logLevel);

    const handleLevelChange = (value: LogLevelDesc): void => {
      if (value === logLevel.value) {
        return;
      }
      ibiz.log.setLevel(value);
      const tempConfig = { logLevel: value };
      props.center.updateUserConfig(tempConfig);
    };

    watch(
      () => props.center.config.logLevel,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          ibiz.log.setLevel(newVal);
        }
      },
      { immediate: true },
    );

    const hasClosed = (type: string): void => {
      result.value = type;
    };

    return {
      ns,
      onConfigEditClick,
      close,
      logLevels,
      logLevel,
      handleLevelChange,
      dialog1,
      hasClosed,
      changeData,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <div class={this.ns.b('left')}>
          {devtoolT('logLevel')}
          <DevtoolSelect
            value={this.logLevel as string}
            onChange={value => this.handleLevelChange(value)}
            options={this.logLevels as string[]}
          >
            {this.logLevels.map((level: LogLevelDesc) => {
              return (
                <DevtoolSelectOption
                  key={level}
                  label={level as string}
                  value={level as string}
                ></DevtoolSelectOption>
              );
            })}
          </DevtoolSelect>
        </div>
        <div class={this.ns.b('right')}>
          <DevtoolButton
            title={devtoolT('settings')}
            onClick={this.onConfigEditClick}
          >
            <ion-icon name='settings-outline'></ion-icon>
          </DevtoolButton>
          <DevtoolButton title={devtoolT('close')} onClick={this.close}>
            <ion-icon name='close-outline'></ion-icon>
          </DevtoolButton>
        </div>
        <MessageBox
          isShowDialog={this.dialog1}
          onHasClosed={(type: string) => this.hasClosed(type)}
          mask={true}
          title={devtoolT('editConfig')}
          onChangeDialog={value => {
            this.dialog1 = value;
          }}
          showCloseIcon={true}
        >
          {{
            default: () => {
              return (
                <UserConfigEdit
                  userConfig={this.center.userConfig || {}}
                  onChange={data => {
                    this.changeData = data;
                  }}
                ></UserConfigEdit>
              );
            },
          }}
        </MessageBox>
      </div>
    );
  },
});
