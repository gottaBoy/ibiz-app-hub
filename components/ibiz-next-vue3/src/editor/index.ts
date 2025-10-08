import { registerEditorProvider } from '@ibiz-template/runtime';
import { App, defineAsyncComponent } from 'vue';
import { NotSupportedEditor } from './not-supported-editor/not-supported-editor';
import { IBizSpan, IBizSpanLink, SpanEditorProvider } from './span';
import {
  IBizInput,
  IBizInputNumber,
  IBizInputIP,
  IBizSignature,
  TextBoxEditorProvider,
} from './text-box';
import {
  IBizDropdown,
  IBizEmojiPicker,
  DropDownListEditorProvider,
  IBizVirtualizedList,
  IBizTreePicker,
} from './dropdown-list';
import { IBizCheckbox, CheckBoxEditorProvider } from './check-box';
import { IBizCheckboxList, CheckBoxListEditorProvider } from './check-box-list';
import { IBizRadio, RadioButtonListEditorProvider } from './radio-button-list';
import { IBizDatePicker, DatePickerEditorProvider } from './date-picker';
import { IBizRaw, RawEditorProvider } from './raw';
import { IBizStepper, StepperEditorProvider } from './stepper';
import { IBizRate, RateEditorProvider } from './rate';
import { IBizSwitch, IBizSwitchTriState, SwitchEditorProvider } from './switch';
import { IBizSlider, SliderEditorProvider } from './slider';
import { IBizListBox, ListBoxEditorProvider } from './list-box';
import { IBizAutoComplete, AutoCompleteEditorProvider } from './autocomplete';
import {
  IBizFileUpload,
  IBizImagePreview,
  IBizImageUpload,
  FileUploaderEditorProvider,
  IBizImageCropping,
} from './upload';
import {
  IBizPicker,
  IBizMPicker,
  IBizPickerDropDown,
  IBizPickerLink,
  IBizPickerEmbedView,
  IBizPickerSelectView,
  DataPickerEditorProvider,
  IBizTransferPicker,
} from './data-picker';
import {
  IBizNumberRangePicker,
  NumberRangeEditorProvider,
} from './number-range';
import { IBizDateRangePicker, DateRangeEditorProvider } from './date-range';
import { CodeEditorProvider, IBizCode } from './code';
import { HtmlEditorProvider } from './html';
import { MarkDownEditorProvider } from './markdown';
import { IBizArray, ArrayEditorProvider } from './array';
import { IBizCascader, CascaderEditorProvider } from './cascader';
import { IBizColorPicker, ColorPickerEditorProvider } from './color-picker';
import { IBizPresetRawitem } from './preset';
import { IBizCarousel, CarouselEditorProvider } from './carousel';
import {
  IBizSearchCondEdit,
  SearchCondEditEditorProvider,
} from './user/ibiz-searchcond-edit';
import {
  DateRangeSelectProvider,
  IBizDateRangeSelect,
} from './date-range-select';
import { IBizMapPicker, MapPickerEditorProvider } from './map-picker';

export const IBizEditor = {
  install: (v: App): void => {
    // 组件注册
    v.component(IBizImageCropping.name, IBizImageCropping);
    v.component(NotSupportedEditor.name, NotSupportedEditor);
    v.component(IBizSpan.name, IBizSpan);
    v.component(IBizSpanLink.name, IBizSpanLink);
    v.component(IBizInput.name, IBizInput);
    v.component(IBizInputNumber.name, IBizInputNumber);
    v.component(IBizInputIP.name, IBizInputIP);
    v.component(IBizSignature.name, IBizSignature);
    v.component(IBizDropdown.name, IBizDropdown);
    v.component(IBizEmojiPicker.name, IBizEmojiPicker);
    v.component(IBizTreePicker.name, IBizTreePicker);
    v.component(IBizCheckbox.name, IBizCheckbox);
    v.component(IBizCheckboxList.name, IBizCheckboxList);
    v.component(IBizRadio.name, IBizRadio);
    v.component(IBizDatePicker.name, IBizDatePicker);
    v.component(IBizRaw.name, IBizRaw);
    v.component(IBizStepper.name, IBizStepper);
    v.component(IBizRate.name, IBizRate);
    v.component(IBizSwitch.name, IBizSwitch);
    v.component(IBizSwitchTriState.name, IBizSwitchTriState);
    v.component(IBizSlider.name, IBizSlider);
    v.component(IBizListBox.name, IBizListBox);
    v.component(IBizAutoComplete.name, IBizAutoComplete);
    v.component(IBizFileUpload.name, IBizFileUpload);
    v.component(IBizImagePreview.name, IBizImagePreview);
    v.component(IBizImageUpload.name, IBizImageUpload);
    v.component(IBizPicker.name, IBizPicker);
    v.component(IBizMPicker.name, IBizMPicker);
    v.component(IBizPickerDropDown.name, IBizPickerDropDown);
    v.component(IBizPickerLink.name, IBizPickerLink);
    v.component(IBizPickerEmbedView.name, IBizPickerEmbedView);
    v.component(IBizPickerSelectView.name, IBizPickerSelectView);
    v.component(IBizTransferPicker.name, IBizTransferPicker);
    v.component(IBizNumberRangePicker.name, IBizNumberRangePicker);
    v.component(IBizDateRangePicker.name, IBizDateRangePicker);
    v.component(IBizCode.name, IBizCode);
    v.component(IBizArray.name, IBizArray);
    v.component(IBizCascader.name, IBizCascader);
    v.component(IBizColorPicker.name, IBizColorPicker);
    v.component(IBizPresetRawitem.name, IBizPresetRawitem);
    v.component(IBizSearchCondEdit.name, IBizSearchCondEdit);
    v.component(IBizCarousel.name, IBizCarousel);
    v.component(IBizMapPicker.name, IBizMapPicker);
    v.component(
      'IBizHtml',
      defineAsyncComponent(() => import('./html/wang-editor/wang-editor')),
    );
    v.component(
      'IBizMarkDown',
      defineAsyncComponent(
        () => import('./markdown/ibiz-markdown-editor/ibiz-markdown-editor'),
      ),
    );
    v.component(IBizDateRangeSelect.name, IBizDateRangeSelect);
    v.component(IBizVirtualizedList.name, IBizVirtualizedList);

    // 标签
    registerEditorProvider('SPAN', () => new SpanEditorProvider());
    registerEditorProvider(
      'SPAN_ADDRESSPICKUP',
      () => new SpanEditorProvider(),
    );
    registerEditorProvider(
      'SPAN_LINK',
      () => new SpanEditorProvider('SPAN_LINK'),
    );
    // 文本框
    const textBoxEditorProvider = new TextBoxEditorProvider();
    registerEditorProvider('TEXTBOX', () => textBoxEditorProvider);
    registerEditorProvider('TEXTAREA', () => textBoxEditorProvider);
    registerEditorProvider('TEXTAREA_10', () => textBoxEditorProvider);
    registerEditorProvider('PASSWORD', () => textBoxEditorProvider);
    registerEditorProvider('NUMBER', () => new TextBoxEditorProvider('NUMBER'));
    registerEditorProvider(
      'IPADDRESSTEXTBOX',
      () => new TextBoxEditorProvider('IPADDRESSTEXTBOX'),
    );
    registerEditorProvider('MOBTEXT', () => textBoxEditorProvider);
    registerEditorProvider(
      'MOBNUMBER',
      () => new TextBoxEditorProvider('NUMBER'),
    );
    registerEditorProvider('MOBTEXTAREA', () => textBoxEditorProvider);
    registerEditorProvider('MOBPASSWORD', () => textBoxEditorProvider);
    // 电子签名
    registerEditorProvider(
      'TEXTBOX_SIGNATURE',
      () => new TextBoxEditorProvider('SIGNATURE'),
    );
    // 下拉列表框
    registerEditorProvider(
      'DROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );
    registerEditorProvider(
      'MOBDROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );
    registerEditorProvider(
      'MOBCHECKLIST',
      () => new DropDownListEditorProvider(),
    );
    // 下拉列表框(宽度100)
    registerEditorProvider(
      'DROPDOWNLIST_100',
      () => new DropDownListEditorProvider(),
    );
    registerEditorProvider(
      'MDROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );
    // 表情选择
    registerEditorProvider(
      'DROPDOWNLIST_EMOJI_PICKER',
      () => new DropDownListEditorProvider('EMOJI_PICKER'),
    );
    // 树选择
    registerEditorProvider(
      'MDROPDOWNLIST_TREE_PICKER',
      () => new DropDownListEditorProvider('TREE_PICKER'),
    );
    // 大数据虚拟下拉选择列表-单选
    registerEditorProvider(
      'DROPDOWNLIST_VIRTUALIZED_LIST',
      () => new DropDownListEditorProvider('VIRTUALIZED_LIST'),
    );
    // 大数据虚拟下拉选择列表-多选
    registerEditorProvider(
      'MDROPDOWNLIST_VIRTUALIZED_LIST',
      () => new DropDownListEditorProvider('VIRTUALIZED_LIST'),
    );
    // 选项框
    registerEditorProvider('CHECKBOX', () => new CheckBoxEditorProvider());
    // 选项框列表
    registerEditorProvider(
      'CHECKBOXLIST',
      () => new CheckBoxListEditorProvider(),
    );
    // 单选框列表
    registerEditorProvider(
      'RADIOBUTTONLIST',
      () => new RadioButtonListEditorProvider(),
    );
    registerEditorProvider(
      'MOBRADIOLIST',
      () => new RadioButtonListEditorProvider(),
    );

    // 日期选择器
    const datePickerProvider = new DatePickerEditorProvider();
    registerEditorProvider('DATEPICKER', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_NOTIME', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_HOUR', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_MINUTE', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_SECOND', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_NODAY', () => datePickerProvider);
    registerEditorProvider(
      'DATEPICKEREX_NODAY_NOSECOND',
      () => datePickerProvider,
    );
    registerEditorProvider('MOBDATE', () => datePickerProvider);
    registerEditorProvider('MOBDATE_HOUR', () => datePickerProvider);
    registerEditorProvider('MOBDATE_MINUTE', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NODAY', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NODAY_NOSECOND', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NOTIME', () => datePickerProvider);
    registerEditorProvider('MOBDATE_SECOND', () => datePickerProvider);
    // 可选单位 时间范围选择器
    registerEditorProvider(
      'DATERANGE_SWITCHUNIT',
      () => new DateRangeSelectProvider(),
    );
    // 文件上传
    registerEditorProvider(
      'FILEUPLOADER',
      () => new FileUploaderEditorProvider('FILEUPLOADER'),
    );
    registerEditorProvider(
      'FILEUPLOADER_ONE',
      () => new FileUploaderEditorProvider('FILEUPLOADER_ONE'),
    );
    registerEditorProvider(
      'MOBSINGLEFILEUPLOAD',
      () => new FileUploaderEditorProvider('MOBSINGLEFILEUPLOAD'),
    );
    registerEditorProvider(
      'MOBMULTIFILEUPLOAD',
      () => new FileUploaderEditorProvider('MOBMULTIFILEUPLOAD'),
    );
    // 图片上传
    registerEditorProvider(
      'PICTURE',
      () => new FileUploaderEditorProvider('PICTURE'),
    );
    registerEditorProvider(
      'PICTURE_ONE',
      () => new FileUploaderEditorProvider('PICTURE_ONE'),
    );
    registerEditorProvider(
      'PICTURE_ONE_RAW',
      () => new FileUploaderEditorProvider('PICTURE_ONE_RAW'),
    );
    registerEditorProvider(
      'MOBPICTURE',
      () => new FileUploaderEditorProvider('MOBPICTURE'),
    );
    registerEditorProvider(
      'MOBPICTURE_RAW',
      () => new FileUploaderEditorProvider('MOBPICTURE_RAW'),
    );
    registerEditorProvider(
      'MOBPICTURELIST',
      () => new FileUploaderEditorProvider('MOBPICTURELIST'),
    );
    // 图片裁剪上传
    registerEditorProvider(
      'PICTURE_CROPPING',
      () => new FileUploaderEditorProvider('PICTURE_CROPPING'),
    );
    // 直接内容
    registerEditorProvider('RAW', () => new RawEditorProvider());
    // 步进器
    registerEditorProvider('STEPPER', () => new StepperEditorProvider());
    registerEditorProvider('MOBSTEPPER', () => new StepperEditorProvider());
    // 评分器
    registerEditorProvider('RATING', () => new RateEditorProvider());
    registerEditorProvider('MOBRATING', () => new RateEditorProvider());
    // 滑动输入条
    registerEditorProvider('SLIDER', () => new SliderEditorProvider());
    registerEditorProvider('MOBSLIDER', () => new SliderEditorProvider());
    // 开关
    registerEditorProvider('SWITCH', () => new SwitchEditorProvider());
    registerEditorProvider(
      'SWITCH_TRISTATE',
      () => new SwitchEditorProvider('TRISTATE'),
    );
    registerEditorProvider('MOBSWITCH', () => new SwitchEditorProvider());
    // 列表框
    registerEditorProvider('LISTBOX', () => new ListBoxEditorProvider());
    // 列表框（选择）
    registerEditorProvider('LISTBOXPICKUP', () => new ListBoxEditorProvider());
    // 自动完成
    const AutoCompleteProvider = new AutoCompleteEditorProvider();
    registerEditorProvider('AC', () => AutoCompleteProvider);
    registerEditorProvider('AC_FS', () => AutoCompleteProvider);
    registerEditorProvider('AC_NOBUTTON', () => AutoCompleteProvider);
    registerEditorProvider('AC_FS_NOBUTTON', () => AutoCompleteProvider);
    // 数据选择类
    registerEditorProvider(
      'PICKER',
      () => new DataPickerEditorProvider('PICKER'),
    );
    // 穿梭框选择
    registerEditorProvider(
      'PICKER_TRANSFER_PICKER',
      () => new DataPickerEditorProvider('TRANSFER_PICKER'),
    );
    registerEditorProvider(
      'PICKEREX_NOAC',
      () => new DataPickerEditorProvider('PICKEREX_NOAC'),
    );
    registerEditorProvider(
      'PICKEREX_NOAC_LINK',
      () => new DataPickerEditorProvider('PICKEREX_NOAC_LINK'),
    );
    registerEditorProvider(
      'PICKEREX_TRIGGER_LINK',
      () => new DataPickerEditorProvider('PICKEREX_TRIGGER_LINK'),
    );
    registerEditorProvider(
      'PICKEREX_TRIGGER',
      () => new DataPickerEditorProvider('PICKEREX_TRIGGER'),
    );
    registerEditorProvider(
      'PICKEREX_LINK',
      () => new DataPickerEditorProvider('PICKEREX_LINK'),
    );
    registerEditorProvider(
      'ADDRESSPICKUP',
      () => new DataPickerEditorProvider('ADDRESSPICKUP'),
    );
    registerEditorProvider(
      'ADDRESSPICKUP_AC',
      () => new DataPickerEditorProvider('ADDRESSPICKUP_AC'),
    );
    registerEditorProvider(
      'PICKEREX_LINKONLY',
      () => new DataPickerEditorProvider('PICKEREX_LINKONLY'),
    );
    registerEditorProvider(
      'PICKEREX_NOBUTTON',
      () => new DataPickerEditorProvider('PICKEREX_NOBUTTON'),
    );
    registerEditorProvider(
      'PICKEREX_DROPDOWNVIEW',
      () => new DataPickerEditorProvider('PICKEREX_DROPDOWNVIEW'),
    );
    registerEditorProvider(
      'PICKEREX_DROPDOWNVIEW_LINK',
      () => new DataPickerEditorProvider('PICKEREX_DROPDOWNVIEW_LINK'),
    );
    registerEditorProvider(
      'PICKUPVIEW',
      () => new DataPickerEditorProvider('PICKUPVIEW'),
    );
    registerEditorProvider(
      'MOBPICKER',
      () => new DataPickerEditorProvider('MOBPICKER'),
    );
    registerEditorProvider(
      'MOBPICKER_DROPDOWNVIEW',
      () => new DataPickerEditorProvider('MOBPICKER_DROPDOWNVIEW'),
    );
    registerEditorProvider(
      'MOBMPICKER',
      () => new DataPickerEditorProvider('MOBMPICKER'),
    );
    // 数值范围
    registerEditorProvider(
      'NUMBERRANGE',
      () => new NumberRangeEditorProvider(),
    );
    registerEditorProvider(
      'MOBNUMBERRANGE',
      () => new NumberRangeEditorProvider(),
    );
    // 时间范围
    registerEditorProvider('DATERANGE', () => new DateRangeEditorProvider());
    registerEditorProvider(
      'DATERANGE_NOTIME',
      () => new DateRangeEditorProvider(),
    );
    registerEditorProvider('MOBDATERANGE', () => new DateRangeEditorProvider());
    registerEditorProvider(
      'MOBDATERANGE_NOTIME',
      () => new DateRangeEditorProvider(),
    );
    // 代码编辑框
    registerEditorProvider('CODE', () => new CodeEditorProvider());
    registerEditorProvider('MOBCODE', () => new CodeEditorProvider());
    // 富文本HTML编辑框
    registerEditorProvider('HTMLEDITOR', () => new HtmlEditorProvider());
    registerEditorProvider('MOBHTMLTEXT', () => new HtmlEditorProvider());
    // MARKDOWN编辑框
    registerEditorProvider('MARKDOWN', () => new MarkDownEditorProvider());
    registerEditorProvider('MOBMARKDOWN', () => new MarkDownEditorProvider());
    // 数组编辑器
    registerEditorProvider('ARRAY', () => new ArrayEditorProvider());
    registerEditorProvider('MOBARRAY', () => new ArrayEditorProvider());
    // 级联选择器
    registerEditorProvider('CASCADER', () => new CascaderEditorProvider());
    registerEditorProvider('MOBCASCADER', () => new CascaderEditorProvider());
    // 颜色选择器
    registerEditorProvider(
      'COLORPICKER',
      () => new ColorPickerEditorProvider(),
    );
    registerEditorProvider(
      'MOBCOLORPICKER',
      () => new ColorPickerEditorProvider(),
    );
    // 搜索栏搜索条件编辑器
    registerEditorProvider(
      'PICKER_searchCondEdit',
      () => new SearchCondEditEditorProvider(),
    );
    // 地图选择器
    registerEditorProvider('MAPPICKER', () => new MapPickerEditorProvider());

    // 预置类型编辑器 `${predefinedType}_${editorType}`;
    registerEditorProvider(
      'FIELD_IMAGE_PICTURE_ONE',
      () => new FileUploaderEditorProvider('PICTURE_ONE'),
    );
    registerEditorProvider(
      'FIELD_IMAGE_PICTURE',
      () => new FileUploaderEditorProvider('PICTURE'),
    );
    registerEditorProvider(
      'FIELD_TEXT_DYNAMIC_SPAN',
      () => new SpanEditorProvider(),
    );
    registerEditorProvider(
      'VIEW_PAGECAPTION_SPAN',
      () => new SpanEditorProvider(),
    );
    registerEditorProvider('STATIC_LABEL_RAW', () => new RawEditorProvider());
    registerEditorProvider(
      'FIELD_TEXTBOX_TEXTBOX',
      () => textBoxEditorProvider,
    );
    registerEditorProvider(
      'FIELD_TEXTAREA_TEXTAREA',
      () => textBoxEditorProvider,
    );
    registerEditorProvider(
      'FIELD_RADIOBUTTONLIST_RADIOBUTTONLIST',
      () => new RadioButtonListEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_CHECKBOXLIST_CHECKBOXLIST',
      () => new CheckBoxListEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_DROPDOWNLIST_DROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_RATING_RATING',
      () => new RateEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_SWITCH_SWITCH',
      () => new SwitchEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_SLIDER_SLIDER',
      () => new SliderEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_DATEPICKER_DATEPICKER',
      () => new DatePickerEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_DATERANGE_DATERANGE',
      () => new DateRangeEditorProvider(),
    );
    registerEditorProvider(
      'FIELD_PICKER_PICKER',
      () => new DataPickerEditorProvider('PICKER'),
    );
    registerEditorProvider(
      'FIELD_ARRAY_ARRAY',
      () => new ArrayEditorProvider(),
    );
    registerEditorProvider('AUTH_USERID_TEXTBOX', () => textBoxEditorProvider);
    registerEditorProvider(
      'AUTH_PASSWORD_PASSWORD',
      () => textBoxEditorProvider,
    );
    registerEditorProvider(
      'FIELD_CAROUSEL_PICTURE',
      () => new CarouselEditorProvider(),
    );
  },
};

export default IBizEditor;
