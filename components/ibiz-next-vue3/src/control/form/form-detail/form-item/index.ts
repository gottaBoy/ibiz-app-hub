import { registerFormDetailProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import FormItem from './form-item';
import { IBizFormItemContainer } from './form-item-container/form-item-container';
import { FormItemProvider } from './form-item.provider';
import CompositeFormItemEX from './composite-form-item-ex';

export * from './form-item-container/form-item-container';

export const IBizFormItem = withInstall(FormItem, function (v: App) {
  v.component(FormItem.name, FormItem);
  v.component(IBizFormItemContainer.name, IBizFormItemContainer);
  // 表单项
  registerFormDetailProvider('FORMITEM', () => new FormItemProvider());

  v.use(CompositeFormItemEX);
});

export default IBizFormItem;
