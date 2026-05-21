import { App } from 'vue';
import { registerFormDetailProvider } from '@ibiz-template/runtime';
import { CompositeFormItemExProvider } from './composite-form-item-ex.provider';
import CompositeFormItemEx from './composite-form-item-ex';

export default {
  install: (v: App): void => {
    // 复合表单项扩展，用于组合多个编辑器用于切换
    // defaulttype参数用于指定默认显示的编辑器类型
    // includes参数用于指定组件内部自己绘制切换菜单，而非外部绘制的编辑器类型。默认html编辑器和markdown编辑器内部自己绘制切换菜单
    // codelistid参数用于指定代码表的id
    v.component(CompositeFormItemEx.name, CompositeFormItemEx);
    registerFormDetailProvider(
      'FORM_USERCONTROL_COMPOSITE_FORM_ITEM_EX',
      () => new CompositeFormItemExProvider(),
    );
  },
};
