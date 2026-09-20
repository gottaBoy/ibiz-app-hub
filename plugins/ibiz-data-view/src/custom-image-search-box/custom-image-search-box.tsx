/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, ref } from 'vue';
import {
  getEditorEmits,
  getRawProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './custom-image-search-box.scss';
import { CustomImageSearchBoxEditorController } from './custom-image-search-box.controller';

export const CustomImageSearchBox = defineComponent({
  name: 'CustomImageSearchBox',
  props: getRawProps<CustomImageSearchBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props) {
    const ns = useNamespace('custom-image-search-box');
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
    const data = this.c.model.sysImage?.rawContent;

    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {data ? <img class={this.ns.e('image')} src={data}></img> : null}
        <el-input
          class={[this.ns.e('input'), data ? 'has-image' : '']}
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
