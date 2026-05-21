/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CoreConst, getAppCookie, IChatMessage } from '@ibiz-template/core';
import { MarkDownEditorController } from '../markdown-editor.controller';
import './ibiz-markdown-editor.scss';

/**
 * 移动端Markdown编辑框
 * @primary
 * @description 基于cherry-markdown深度定制可扩展的Markdown编辑器，用于Markdown文档编辑。支持编辑器类型包含：`移动端Markdown编辑框`
 * @editorparams {name:uploadparams,parameterType:string,description:上传参数，图片或文件上传时，用于计算上传路径}
 * @editorparams {name:exportparams,parameterType:string,description:下载参数，图片或文件下载时，用于计算下载路径}
 * @editorparams {name:osscat,parameterType:string,description:用于计算上传和下载路径的OSS参数}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
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
          const editorParams: IData = {
            ...c.editorParams,
            enableNoAccess: c.enableNoAccess,
            globalDownloadPrifix: c.globalDownloadPrifix,
          };
          if (editorParams.uploadparams) {
            editorParams.uploadParams = JSON.parse(editorParams.uploadparams);
          }
          if (editorParams.exportparams) {
            editorParams.exportParams = JSON.parse(editorParams.exportparams);
          }
          const urls = ibiz.util.file.calcFileUpDownUrl(
            c.context,
            c.params,
            newVal,
            editorParams,
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
      let url = downloadUrl.value.replace('%fileId%', data.fileid);
      if (ibiz.config.common.enableDownloadTicket && !c.enableNoAccess) {
        const downloadTicket = await ibiz.util.file.getDownloadTicket(
          c.context,
          c.params,
          props.data || {},
          { fileId: data.fileid },
          c.downloadTicketParams,
        );
        if (downloadTicket && downloadTicket.ticket)
          url = downloadUrl.value.replace('%fileId%', downloadTicket.ticket);
      }
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
      // 修复ios中光标错位
      editor.value?.refreshPreviewer();
      editorPreview.value?.refreshPreviewer();
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

    // AI 聊天实例
    let chatInstance: any;

    const handleAIClick = async () => {
      const appDataEntityId = c.model.appDataEntityId;
      if (!appDataEntityId || !c.deACMode) return;
      const { zIndex } = useUIStore();
      const containerZIndex = zIndex.increment();
      chatInstance = await ibiz.aiChatUtil.getAIChat();
      const { containerOptions, chatOptions } =
        await ibiz.aiChatUtil.getEditorExAIChatParams(
          c.editorParams,
          c.context,
          c.params,
          props.data || {},
          c.deACMode,
          { chatInstance, view: c.view, ctrl: c.ctrl },
        );
      const resourceOptions = await ibiz.aiChatUtil.getAIResourceOptions(
        c.context,
        c.params,
      );
      chatInstance.create({
        resourceOptions,
        containerOptions: {
          // vant组件层级为2000+，此处需添加2000
          zIndex: containerZIndex + 2000,
          ...containerOptions,
        },
        chatOptions: {
          caption: c.deACMode.logicName,
          context: { ...c.context },
          params: { ...c.params, srfactag: c.deACMode.codeName },
          appDataEntityId,
          ...chatOptions,
          action: (action: string, message: IChatMessage) => {
            if (action === 'backfill') {
              emit('change', message.realcontent);
            }
          },
        },
      });
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
        customMenu: {
          ai: Cherry.createMenuHook('AI聊天', {
            icon: {
              type: 'svg',
              content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" height="1em" width="1em" preserveAspectRatio="xMidYMid meet" focusable="false" class="cherry-menu-AIChart">
                <g id="aae1.Base基础/1.icon图标/2.normal/ai-star" stroke-width="1" fill-rule="evenodd">
                  <path d="M5.817 1.53l3.158 8.797h.054v.152l1.443 4.021-1.402.001-1.041-2.982H2.495l-1.03 2.982L0 14.5 4.671 1.533l1.146-.003zm7.86 5.424V14.5h-1.213V6.954h1.212zM5.248 3.549l-2.342 6.778h4.706L5.249 3.55zM13.046 0c.075 0 .147.02.204.071a.318.318 0 01.094.181l.064.273c.097.417.17.727.255.968.084.24.177.4.31.523.134.124.318.218.599.306.281.088.65.166 1.15.265a.358.358 0 01.195.095c.056.057.083.13.083.213a.289.289 0 01-.083.21.362.362 0 01-.197.094c-.528.093-.918.167-1.214.255-.295.088-.485.187-.621.324-.137.138-.23.324-.31.606-.08.283-.145.651-.23 1.147a.329.329 0 01-.093.184.293.293 0 01-.206.075.308.308 0 01-.207-.072.322.322 0 01-.1-.188l-.006-.033c-.085-.486-.149-.845-.228-1.12-.079-.274-.17-.452-.305-.585-.135-.133-.323-.23-.618-.32s-.683-.168-1.21-.273a.353.353 0 01-.2-.096.29.29 0 01-.08-.208c0-.079.023-.153.079-.211a.35.35 0 01.2-.097c.5-.098.869-.176 1.15-.263.282-.087.465-.18.597-.302.132-.12.224-.278.306-.511.082-.236.151-.539.244-.947l.071-.312a.312.312 0 01.102-.183.311.311 0 01.205-.069z" id="aae形状结合"></path>
                </g>
              </svg>`,
            },
            onClick: () => {
              handleAIClick();
              return null;
            },
          }),
        },
      },
    };

    if (c.chatCompletion) {
      editorOpts.toolbars.toolbar.unshift('ai');
    }

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
        editorPreview.value?.setTheme(theme.value);
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
