import { registerEditorProvider } from '@ibiz-template/runtime';
import { App, defineAsyncComponent } from 'vue';
import { NotSupportedEditor } from './not-supported-editor/not-supported-editor';
import { IBizSpan, SpanEditorProvider } from './span';
import {
  IBizInput,
  IBizInputNumber,
  IBizSignature,
  TextBoxEditorProvider,
} from './text-box';
import {
  IBizDropdown,
  IBizEmojiPicker,
  DropDownListEditorProvider,
} from './dropdown-list';
import { CheckBoxListEditorProvider, IBizCheckboxList } from './check-box-list';
import { IBizSwitch, SwitchEditorProvider } from './switch';
import { IBizRadio, RadioButtonListEditorProvider } from './radio-button-list';
import { IBizSlider, SliderEditorProvider } from './slider';
import { IBizRaw, RawEditorProvider } from './raw';
import { IBizStepper, StepperEditorProvider } from './stepper';
import { IBizRate, RateEditorProvider } from './rate';
import { IBizDatePicker, DatePickerEditorProvider } from './date-picker';
import {
  IBizPicker,
  DataPickerEditorProvider,
  IBizMPicker,
  IBizPickerSelectView,
} from './data-picker';
import {
  IBizFileUpload,
  IBizImageSelect,
  IBizImageUpload,
  FileUploaderEditorProvider,
  IBizEditorCarousel,
  IBizImageCropping,
} from './upload';
import {
  IBizNumberRangePicker,
  NumberRangeEditorProvider,
} from './number-range';
import { DateRangeEditorProvider, IBizDateRangePicker } from './date-range';
import { IBizCascader, CascaderEditorProvider } from './cascader';
import { ColorPickerEditorProvider, IBizColorPicker } from './color-picker';
import { MarkDownEditorProvider } from './markdown';
import { HtmlEditorProvider } from './html';
import { IBizDropdownList } from './dropdown-list/ibiz-dropdown-list/ibiz-dropdown-list';
import { IBizQrcode, QrcodeEditorProvider } from './qrcode';

export const IBizEditor = {
  install: (v: App): void => {
    // 组件注册
    v.component(NotSupportedEditor.name, NotSupportedEditor);
    v.component(IBizInput.name, IBizInput);
    v.component(IBizInputNumber.name, IBizInputNumber);
    v.component(IBizSignature.name, IBizSignature);
    v.component(IBizSpan.name, IBizSpan);
    v.component(IBizSwitch.name, IBizSwitch);
    v.component(IBizRadio.name, IBizRadio);
    v.component(IBizDropdown.name, IBizDropdown);
    v.component(IBizDropdownList.name, IBizDropdownList);
    v.component(IBizEmojiPicker.name, IBizEmojiPicker);
    v.component(IBizCheckboxList.name, IBizCheckboxList);
    v.component(IBizSlider.name, IBizSlider);
    v.component(IBizRaw.name, IBizRaw);
    v.component(IBizStepper.name, IBizStepper);
    v.component(IBizRate.name, IBizRate);
    v.component(IBizDatePicker.name, IBizDatePicker);
    v.component(IBizPicker.name, IBizPicker);
    v.component(IBizMPicker.name, IBizMPicker);
    v.component(IBizFileUpload.name, IBizFileUpload);
    v.component(IBizImageSelect.name, IBizImageSelect);
    v.component(IBizImageUpload.name, IBizImageUpload);
    v.component(IBizNumberRangePicker.name, IBizNumberRangePicker);
    v.component(IBizDateRangePicker.name, IBizDateRangePicker);
    v.component(IBizCascader.name, IBizCascader);
    v.component(IBizColorPicker.name, IBizColorPicker);
    v.component(IBizPickerSelectView.name, IBizPickerSelectView);
    v.component(IBizEditorCarousel.name, IBizEditorCarousel);
    v.component(IBizQrcode.name, IBizQrcode);
    v.component(IBizImageCropping.name, IBizImageCropping);

    v.component(
      'IBizMarkDown',
      defineAsyncComponent(
        () => import('./markdown/ibiz-markdown-editor/ibiz-markdown-editor'),
      ),
    );

    v.component(
      'IBizQuill',
      defineAsyncComponent(() => import('./html/quill-editor/quill-editor')),
    );
    v.component(
      'IBizQuillPreview',
      defineAsyncComponent(
        () => import('./html/quill-editor-preview/quill-editor-preview'),
      ),
    );

    // 标签
    registerEditorProvider('SPAN', () => new SpanEditorProvider());
    registerEditorProvider(
      'FIELD_TEXT_DYNAMIC_SPAN',
      () => new SpanEditorProvider(),
    );

    // 文本框
    const textBoxEditorProvider = new TextBoxEditorProvider();
    registerEditorProvider('MOBTEXT', () => textBoxEditorProvider);

    registerEditorProvider('MOBPASSWORD', () => textBoxEditorProvider);
    registerEditorProvider('MOBTEXTAREA', () => textBoxEditorProvider);
    registerEditorProvider(
      'MOBNUMBER',
      () => new TextBoxEditorProvider('NUMBER'),
    );
    registerEditorProvider('TEXTBOX', () => textBoxEditorProvider);
    registerEditorProvider('PASSWORD', () => textBoxEditorProvider);
    registerEditorProvider('TEXTAREA', () => textBoxEditorProvider);
    registerEditorProvider('NUMBER', () => new TextBoxEditorProvider('NUMBER'));

    // 电子签名
    registerEditorProvider(
      'MOBTEXT_SIGNATURE',
      () => new TextBoxEditorProvider('SIGNATURE'),
    );

    // 下拉列表框
    registerEditorProvider(
      'MOBDROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );
    registerEditorProvider(
      'DROPDOWNLIST',
      () => new DropDownListEditorProvider(),
    );

    // 表情选择
    registerEditorProvider(
      'MOBDROPDOWNLIST_EMOJI_PICKER',
      () => new DropDownListEditorProvider('EMOJI_PICKER'),
    );

    // 下拉列表框多选(复选框)
    registerEditorProvider(
      'MOBCHECKLIST',
      () => new DropDownListEditorProvider('MOBCHECKLIST'),
    );
    registerEditorProvider(
      'MDROPDOWNLIST',
      () => new DropDownListEditorProvider('MDROPDOWNLIST'),
    );

    // 开关
    registerEditorProvider('MOBSWITCH', () => new SwitchEditorProvider());
    registerEditorProvider('SWITCH', () => new SwitchEditorProvider());
    registerEditorProvider('MOBCASCADER', () => new CascaderEditorProvider());
    registerEditorProvider('CASCADER', () => new CascaderEditorProvider());

    // 颜色选择器
    registerEditorProvider(
      'MOBCOLORPICKER',
      () => new ColorPickerEditorProvider(),
    );
    registerEditorProvider(
      'COLORPICKER',
      () => new ColorPickerEditorProvider(),
    );

    // 滑动输入条
    registerEditorProvider('MOBSLIDER', () => new SliderEditorProvider());
    registerEditorProvider('SLIDER', () => new SliderEditorProvider());

    // 直接内容
    registerEditorProvider('RAW', () => new RawEditorProvider());

    // 步进器
    registerEditorProvider('MOBSTEPPER', () => new StepperEditorProvider());
    registerEditorProvider('STEPPER', () => new StepperEditorProvider());

    // 评分器
    registerEditorProvider('MOBRATING', () => new RateEditorProvider());
    registerEditorProvider('RATING', () => new RateEditorProvider());
    // 评分器
    registerEditorProvider('MOBMARKDOWN', () => new MarkDownEditorProvider());
    registerEditorProvider('MARKDOWN', () => new MarkDownEditorProvider());
    // 富文本
    registerEditorProvider('MOBHTMLTEXT', () => new HtmlEditorProvider());
    registerEditorProvider('HTMLEDITOR', () => new HtmlEditorProvider());

    // 单选框列表
    registerEditorProvider(
      'MOBRADIOLIST',
      () => new RadioButtonListEditorProvider(),
    );
    registerEditorProvider(
      'RADIOBUTTONLIST',
      () => new RadioButtonListEditorProvider(),
    );

    // 日期选择器
    const datePickerProvider = new DatePickerEditorProvider();
    registerEditorProvider('MOBDATE', () => datePickerProvider);
    registerEditorProvider('MOBDATE_HOUR', () => datePickerProvider);
    registerEditorProvider('MOBDATE_MINUTE', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NODAY', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NODAY_NOSECOND', () => datePickerProvider);
    registerEditorProvider('MOBDATE_NOTIME', () => datePickerProvider);
    registerEditorProvider('MOBDATE_SECOND', () => datePickerProvider);
    registerEditorProvider('DATEPICKER', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_HOUR', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_MINUTE', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_NODAY', () => datePickerProvider);
    registerEditorProvider(
      'DATEPICKEREX_NODAY_NOSECOND',
      () => datePickerProvider,
    );
    registerEditorProvider('DATEPICKEREX_NOTIME', () => datePickerProvider);
    registerEditorProvider('DATEPICKEREX_SECOND', () => datePickerProvider);

    // 数据选择类
    registerEditorProvider(
      'MOBPICKER',
      () => new DataPickerEditorProvider('MOBPICKER'),
    );
    registerEditorProvider(
      'MOBMPICKER',
      () => new DataPickerEditorProvider('MOBMPICKER'),
    );
    registerEditorProvider(
      'MOBPICKER_DROPDOWNVIEW',
      () => new DataPickerEditorProvider('MOBPICKER_DROPDOWNVIEW'),
    );
    registerEditorProvider(
      'PICKER',
      () => new DataPickerEditorProvider('PICKER'),
    );
    registerEditorProvider(
      'ADDRESSPICKUP',
      () => new DataPickerEditorProvider('ADDRESSPICKUP'),
    );
    registerEditorProvider(
      'PICKEREX_DROPDOWNVIEW',
      () => new DataPickerEditorProvider('PICKEREX_DROPDOWNVIEW'),
    );

    // 文件上传
    registerEditorProvider(
      'MOBSINGLEFILEUPLOAD',
      () => new FileUploaderEditorProvider('MOBSINGLEFILEUPLOAD'),
    );
    registerEditorProvider(
      'MOBMULTIFILEUPLOAD',
      () => new FileUploaderEditorProvider('MOBMULTIFILEUPLOAD'),
    );
    registerEditorProvider(
      'FILEUPLOADER_ONE',
      () => new FileUploaderEditorProvider('FILEUPLOADER_ONE'),
    );
    registerEditorProvider(
      'FILEUPLOADER',
      () => new FileUploaderEditorProvider('FILEUPLOADER'),
    );
    // 图片上传
    registerEditorProvider(
      'MOBPICTURE',
      () => new FileUploaderEditorProvider('MOBPICTURE'),
    );
    registerEditorProvider(
      'MOBPICTURELIST',
      () => new FileUploaderEditorProvider('MOBPICTURELIST'),
    );
    registerEditorProvider(
      'MOBPICTURE_RAW',
      () => new FileUploaderEditorProvider('MOBPICTURE_RAW'),
    );
    registerEditorProvider(
      'MOBPICTURE_CROPPING',
      () => new FileUploaderEditorProvider('MOBPICTURE_CROPPING'),
    );
    registerEditorProvider(
      'PICTURE_ONE',
      () => new FileUploaderEditorProvider('PICTURE_ONE'),
    );
    registerEditorProvider(
      'PICTURE',
      () => new FileUploaderEditorProvider('PICTURE'),
    );
    registerEditorProvider(
      'PICTURE_ONE_RAW',
      () => new FileUploaderEditorProvider('PICTURE_ONE_RAW'),
    );
    // 数值范围
    registerEditorProvider(
      'MOBNUMBERRANGE',
      () => new NumberRangeEditorProvider(),
    );
    registerEditorProvider(
      'NUMBERRANGE',
      () => new NumberRangeEditorProvider(),
    );
    // 时间范围
    registerEditorProvider('MOBDATERANGE', () => new DateRangeEditorProvider());
    registerEditorProvider(
      'MOBDATERANGE_NOTIME',
      () => new DateRangeEditorProvider(),
    );
    registerEditorProvider('DATERANGE', () => new DateRangeEditorProvider());
    registerEditorProvider(
      'DATERANGE_NOTIME',
      () => new DateRangeEditorProvider(),
    );

    // 面板预制类型
    // 动态图片
    registerEditorProvider(
      'FIELD_IMAGE_PICTURE_ONE',
      () => new FileUploaderEditorProvider('MOBPICTURE_RAW'),
    );
    // 轮播图
    registerEditorProvider(
      'FIELD_CAROUSEL_PICTURE',
      () => new FileUploaderEditorProvider('CAROUSEL'),
    );
    // 输入框
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
    // registerEditorProvider(
    //   'FIELD_ARRAY_ARRAY',
    //   () => new ArrayEditorProvider(),
    // );
    registerEditorProvider('AUTH_USERID_TEXTBOX', () => textBoxEditorProvider);
    registerEditorProvider(
      'AUTH_PASSWORD_PASSWORD',
      () => textBoxEditorProvider,
    );
    // 二维码阅读器
    registerEditorProvider(
      'MOB2DBARCODEREADER',
      () => new QrcodeEditorProvider(),
    );
  },
};

export default IBizEditor;
export * from './cascader';
export * from './check-box';
export * from './check-box-list';
export * from './data-picker';
export * from './date-picker';
export * from './date-range';
export * from './dropdown-list';
export * from './markdown';
export * from './html';
export * from './number-range';
export * from './radio-button-list';
export * from './radio-button-list';
export * from './rate';
export * from './slider';
export * from './span';
export * from './stepper';
export * from './switch';
export * from './text-box';
export * from './upload';
export * from './color-picker';
export * from './common';
