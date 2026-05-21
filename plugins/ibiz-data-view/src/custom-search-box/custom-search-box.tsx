/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, ref } from 'vue';
import {
  getEditorEmits,
  getRawProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './custom-search-box.scss';
import { CustomSearchBoxEditorController } from './custom-search-box.controller';

export const CustomSearchBox = defineComponent({
  name: 'CustomSearchBox',
  props: getRawProps<CustomSearchBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props) {
    const ns = useNamespace('custom-search-box');
    const c = props.controller;

    const searchValue = ref<string>('');

    const onSearch = (): void => {
      if (props.controller.dashboard) {
        const Dc = props.controller.dashboard;
        if (Dc) {
          (Dc as any).refresh({ query: searchValue.value });
        }
      }
    };

    // 处理键盘事件
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        onSearch();
      }
    };

    return {
      c,
      ns,
      searchValue,
      onSearch,
      handleKeyUp,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        <el-input
          class={[this.ns.e('input')]}
          v-model={this.searchValue}
          placeholder={this.c.placeholder}
          clearable={false}
          suffix-icon={
            <ion-icon
              onClick={this.onSearch}
              class={this.ns.e('search-icon')}
              name='search'
            />
          }
          onKeyup={this.handleKeyUp}
        ></el-input>
      </div>
    );
  },
});
