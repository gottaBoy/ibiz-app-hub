import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from 'vue';
import {
  getMarkDownProps,
  getEditorEmits,
  useUIStore,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import Cherry from 'cherry-markdown';
import { CoreConst, getAppCookie } from '@ibiz-template/core';
import { MarkDownEditorController } from '../markdown-editor.controller';
import './ibiz-markdown-editor.scss';

/**
 * 移动端Markdown编辑框
 * @primary
 * @description 基于cherry-markdown深度定制可扩展的Markdown编辑器，用于Markdown文档编辑。支持编辑器类型包含：`移动端Markdown编辑框`
 * @editorparams {name:uploadparams,parameterType:IData,defaultvalue:{},description:上传参数}
 * @editorparams {name:exportparams,parameterType:IData,defaultvalue:{},description:下载参数}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IBizMarkDown: any = defineComponent({
  name: 'IBizMarkDown',
  props: getMarkDownProps<MarkDownEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('markdown');

    const c = props.controller!;

    const currentVal = ref<string>('');

    const editor = ref<Cherry | null>(null);
    const editorPreview = ref<Cherry | null>(null);

    const id = createUUID();
    const previewId = createUUID();

    // 请求头
    const headers: Ref<IData> = ref({
      [`${ibiz.env.tokenHeader}Authorization`]: `${
        ibiz.env.tokenPrefix
      }Bearer ${getAppCookie(CoreConst.TOKEN)}`,
    });

    // 上传文件路径
    const uploadUrl: Ref<string> = ref('');

    // 下载文件路径
    const downloadUrl: Ref<string> = ref('');

    // 编辑器主题
    const { UIStore } = useUIStore();
    const theme = ref(UIStore.theme);

    // 编辑器模式
    const defaultModel = ref('editOnly');

    // 预览态预览图片地址
    const previewImage: Ref<string> = ref('');

    // 样式变量
    const cssVars = ref({});

    // data响应式变更基础路径
    watch(
      () => props.data,
      newVal => {
        if (newVal) {
          const urls = ibiz.util.file.calcFileUpDownUrl(
            c.context,
            c.params,
            newVal,
            c.editorParams,
          );
          uploadUrl.value = urls.uploadUrl;
          downloadUrl.value = urls.downloadUrl;
        }
      },
      { immediate: true, deep: true },
    );

    // // 自定义图片上传
    const fileUpload = async (file: Blob, callback: (_url: string) => void) => {
      const data = await ibiz.util.file.fileUpload(
        uploadUrl.value,
        file,
        headers.value,
      );
      const url = downloadUrl.value.replace('%fileId%', data.fileid);
      callback(url);
    };

    // 获取渲染后html内容
    const getCherryHtml = () => {
      const result = editor.value?.getHtml();
      return result;
    };

    // 获取markdown内容
    const getCherryContent = () => {
      const result = editor.value?.getMarkdown();
      return result;
    };

    // 设置markdown内容
    const setCherryContent = (val: string) => {
      editor.value?.setMarkdown(val, false);
      editorPreview.value?.setMarkdown(val, false);
    };
    const setCherryContent2 = (val: string) => {
      editorPreview.value?.setMarkdown(val, true);
    };
    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = '';
          } else {
            currentVal.value = newVal;
          }
        }
      },
      { immediate: true },
    );

    watch(currentVal, (newVal, oldVal) => {
      const content = getCherryContent();
      if (newVal !== oldVal && content !== newVal) {
        setCherryContent(newVal);
      }
    });

    // 变更事件回调
    const afterChange = (_e: IData) => {
      setCherryContent2(getCherryContent()!);
      emit('change', getCherryContent());
    };

    // 图片加载回调
    const beforeImageMounted = (e: string, src: string) => {
      return { [e]: src };
    };

    const editorOpts = {
      value: currentVal.value,
      theme: theme.value,
      fileUpload,
      emoji: {
        useUnicode: true,
      },
      header: {
        anchorStyle: 'autonumber',
      },
      editor: {
        // 编辑器的高度，默认100%，如果挂载点存在内联设置的height则以内联样式为主
        height: '100%',
        // defaultModel 编辑器初始化后的默认模式，一共有三种模式：1、双栏编辑预览模式；2、纯编辑模式；3、预览模式
        // edit&preview: 双栏编辑预览模式
        // editOnly: 纯编辑模式（没有预览，可通过toolbar切换成双栏或预览模式）
        // previewOnly: 预览模式（没有编辑框，toolbar只显示“返回编辑”按钮，可通过toolbar切换成编辑模式）
        defaultModel: defaultModel.value,
        codemirror: {
          // 是否自动focus 默认为true
          autofocus: false,
        },
      },
      toolbars: {
        theme: theme.value,
        toolbar: [
          'switchModel',
          'bold',
          'italic',
          'strikethrough',
          'header',
          // 'list',
          {
            insert: [
              'image',
              'audio',
              'video',
              'link',
              'hr',
              'br',
              'code',
              'formula',
              'toc',
              'table',
              'pdf',
              'word',
            ],
          },
          'settings',
        ],
      },
    };

    // 默认编辑态
    const editorInit = () => {
      const cherryOptions = {
        id,
        ...editorOpts,
        callback: {
          afterChange,
          beforeImageMounted,
        },
        value: currentVal.value,
      };
      nextTick(() => {
        editor.value = new Cherry(cherryOptions as IData);
      });
    };

    // 初始界面预览态
    const editorPreviewInit = () => {
      const cherryOptions = {
        id: previewId,
        ...editorOpts,
        editor: { defaultModel: 'previewOnly' },
      };
      nextTick(() => {
        editorPreview.value = new Cherry(cherryOptions as IData);
      });
    };

    onMounted(() => {
      editorPreviewInit();
    });

    watch(
      () => UIStore.theme,
      newVal => {
        theme.value = newVal;
        editor.value?.setTheme(theme.value);
      },
    );

    onUnmounted(() => {
      editor.value = null;
      editorPreview.value = null;
    });
    const isOpen = ref(false);

    // 计算触发元素类型
    const calcTargetType = (
      target: HTMLElement,
    ): {
      type: string;
      url: string;
    } => {
      const result = {
        type: '',
        url: '',
      };
      if (target.nodeName === 'A') {
        result.type = 'A';
        result.url = (target as HTMLAnchorElement).hash;
      } else if (target.parentNode && target.parentNode.nodeName === 'A') {
        result.type = 'A';
        result.url = (target.parentNode as HTMLAnchorElement).hash;
      } else if (target.nodeName === 'IMG') {
        result.type = 'IMG';
        result.url = (target as HTMLImageElement).src;
      }
      return result;
    };

    const openPicker = async (event: TouchEvent) => {
      // 如果点击项是a标签,并且有href,值为#开头,且后续值为页面内的元素的id,就走页面滚动导航
      // 如果是图片，则进行放大预览
      // 其他情况，就走打开编辑界面
      const { target } = event;
      if (target) {
        const result = calcTargetType(target as HTMLElement);
        if (result.type === 'A' && result.url.startsWith('#')) {
          // 点击a标签，本页面内滑动，阻止其他变化
          event.preventDefault();
          event.stopPropagation();
          const targetid = result.url.slice(1);
          if (targetid) {
            const preview = document.getElementById(previewId);
            if (preview) {
              const anchor = document.getElementById(targetid);
              if (anchor) {
                anchor.scrollIntoView({ behavior: 'smooth' });
              }
            }
            return;
          }
        }
        if (result.type === 'IMG' && result.url) {
          // 点击图片，展开预览
          previewImage.value = result.url;
          return;
        }
      }
      if (props.disabled || props.readonly) {
        return;
      }
      // 其他情况打开编辑态
      isOpen.value = true;
      if (!editor.value) {
        editorInit();
      }
    };

    // 关闭图片预览时清除预览图片地址
    const handlePreviewClose = () => {
      previewImage.value = '';
    };

    return {
      ns,
      currentVal,
      id,
      previewId,
      editor,
      headers,
      theme,
      defaultModel,
      cssVars,
      getCherryHtml,
      getCherryContent,
      setCherryContent,
      openPicker,
      isOpen,
      previewImage,
      handlePreviewClose,
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
        <van-field readonly disabled={this.disabled} onClick={this.openPicker}>
          {{
            input: (
              <div
                id={this.previewId}
                style={this.cssVars}
                class={this.ns.b('cherry')}
              ></div>
            ),
          }}
        </van-field>

        <van-popup
          class={this.ns.b('image-popup')}
          show={!!this.previewImage}
          close-on-popstate={true}
          onClose={this.handlePreviewClose}
        >
          <iBizPreviewImage url={this.previewImage}></iBizPreviewImage>
        </van-popup>
        <van-dialog
          v-model:show={this.isOpen}
          className={this.ns.b('dialog')}
          close-on-popstate={true}
        >
          {{
            default: () => {
              return (
                <div
                  id={this.id}
                  style={this.cssVars}
                  class={[
                    this.ns.b('cherry'),
                    this.ns.is('hidden', !this.isOpen),
                  ]}
                ></div>
              );
            },
          }}
        </van-dialog>
      </div>
    );
  },
});

export default IBizMarkDown;
