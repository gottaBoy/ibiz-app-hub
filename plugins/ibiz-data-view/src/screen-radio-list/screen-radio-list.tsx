import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  getEditorEmits,
  getRadioProps,
  useFocusAndBlur,
  useNamespace,
  useCodeListListen,
  useAutoFocusBlur,
} from '@ibiz-template/vue3-util';
import './screen-radio-list.scss';
import { notNilEmpty } from 'qx-util';
import { CodeListItem } from '@ibiz-template/runtime';
import { ScreenRadioListEditorController } from './screen-radio-list.controller';

export const ScreenRadioList = defineComponent({
  name: 'ScreenRadioList',
  props: getRadioProps<ScreenRadioListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('screen-radio-list');

    const c = props.controller;

    const editorModel = c.model;

    let timer: NodeJS.Timeout | null = null;

    const { useInFocusAndBlur, useInValueChange } = useAutoFocusBlur(
      props,
      emit,
    );

    const onSelectValueChange = (value: string | number) => {
      emit('change', value);
      useInValueChange();
    };

    // 代码表
    const items = ref<readonly IData[]>([]);

    const loopSelect = () => {
      const index = items.value.findIndex((item: IData) => {
        return item.value === props.value;
      });
      if (items.value && items.value.length > 0) {
        if (index < items.value.length - 1) {
          emit('change', items.value[index + 1].value);
        } else {
          emit('change', items.value[0].value);
        }
      }
    };

    onMounted(() => {
      timer = setInterval(() => {
        loopSelect();
      }, c.speed);
      loopSelect();
    });

    onBeforeMount(() => {
      if (timer) {
        clearInterval(timer);
      }
    });

    watch(
      () => props.data,
      newVal => {
        c.loadCodeList(newVal).then(_codeList => {
          items.value = _codeList;
        });
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const fn = (data: CodeListItem[] | undefined) => {
      if (data) {
        items.value = data;
      }
    };

    useCodeListListen(c.model.appCodeListId, c.context.srfappid, fn);

    const valueText = computed(() => {
      // eslint-disable-next-line eqeqeq
      return items.value.find(item => item.value == props.value)?.text || '';
    });

    // 是否显示表单默认内容
    const showFormDefaultContent = computed(() => {
      if (
        props.controlParams &&
        props.controlParams.editmode === 'hover' &&
        !props.readonly
      ) {
        return true;
      }
      return false;
    });

    watch(
      valueText,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          emit('infoTextChange', newVal);
        }
      },
      { immediate: true },
    );

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => useInFocusAndBlur(),
    );

    return {
      timer,
      ns,
      c,
      editorModel,
      items,
      valueText,
      onSelectValueChange,
      editorRef,
      showFormDefaultContent,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
        ref='editorRef'
      >
        {this.readonly ? (
          this.valueText
        ) : (
          <el-radio-group
            class={this.ns.e('group')}
            model-value={notNilEmpty(this.value) ? String(this.value) : ''}
            onChange={this.onSelectValueChange}
            {...this.$attrs}
          >
            {this.items.map((item, index: number) =>
              this.controller.renderMode === 'radio' ? (
                <el-radio
                  key={index}
                  label={notNilEmpty(item.value) ? String(item.value) : ''}
                  disabled={this.disabled || item.disableSelect === true}
                >
                  <span class={this.ns.e('text')}>{item.text}</span>
                </el-radio>
              ) : (
                <el-radio-button
                  key={index}
                  border
                  class={[
                    this.ns.e('button'),
                    this.ns.is('space', this.c.btnSpace !== 0),
                  ]}
                  style={{
                    [this.ns.cssVarBlockName('button-space')]:
                      `${this.c.btnSpace}px`,
                  }}
                  label={notNilEmpty(item.value) ? String(item.value) : ''}
                  disabled={this.disabled || item.disableSelect === true}
                >
                  <span class={this.ns.em('button', 'text')}>{item.text}</span>
                </el-radio-button>
              ),
            )}
          </el-radio-group>
        )}
      </div>
    );
  },
});
