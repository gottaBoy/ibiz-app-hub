/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Ref,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  defineComponent,
} from 'vue';
import {
  useUIStore,
  useNamespace,
  getEditorEmits,
  getMarkDownProps,
} from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import Cherry from 'cherry-markdown';
import { MarkDownEditorController } from '../markdown-editor.controller';
import './ibiz-markdown-editor.scss';

/**
 * Markdown编辑框
 *
 * @description 使用cherryMarkdown组件封装，用于Markdown文档编辑。支持编辑器类型包含：`Markdown编辑框`
 * @primary
 * @editorparams {"name":"customtheme","parameterType":"'light' | 'dark'","description":"设置Markdown主题，未配置时跟随应用主题"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"uploadparams","parameterType":"string","description":"上传参数，图片或文件上传时，用于计算上传路径"}
 * @editorparams {"name":"exportparams","parameterType":"string","description":"下载参数，图片或文件下载时，用于计算下载路径"}
 * @editorparams {"name":"osscat","parameterType":"string","description":"用于计算上传和下载路径的OSS参数"}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：web.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IBizMarkDown: any = defineComponent({
  name: 'IBizMarkDown',
  props: getMarkDownProps<MarkDownEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('markdown');

    const c = props.controller;

    const currentVal = ref<string>('');

    let editor: IData | null = null;

    const id = createUUID();

    // 请求头
    const uploadHeaders = ibiz.util.file.getUploadHeaders();
    const headers: Ref<IData> = ref({ ...uploadHeaders });

    // 上传文件路径
    const uploadUrl: Ref<string> = ref('');

    // 自定义主题
    const customTheme =
      c?.editorParams?.customTheme || c?.editorParams?.customtheme;

    // 编辑器主题
    const { UIStore } = useUIStore();
    const theme = ref(customTheme || UIStore.theme);

    // 编辑器模式
    const defaultModel = ref('editOnly');

    // 浏览器ResizeObserver对象
    let resizeObserver: ResizeObserver | null = null;

    // 上次监听到的markdown外层宽度，一旦发生变化就重新计算
    let lastMarkDownWidth = 0;

    // 样式变量
    const cssVars = ref({});

    // 是否忽略改变
    let isIgnoreChange: boolean = false;

    // data响应式变更基础路径
    watch(
      () => props.data,
      newVal => {
        if (newVal && c) {
          const editorParams = { ...c.editorParams };
          if (editorParams.uploadparams) {
            editorParams.uploadParams = JSON.parse(editorParams.uploadparams);
          }
          const urls = ibiz.util.file.calcFileUpDownUrl(
            c.context,
            c.params,
            newVal,
            editorParams,
          );
          uploadUrl.value = urls.uploadUrl;
        }
      },
      { immediate: true, deep: true },
    );

    // markdown Ref
    const markDownBox = ref();

    /**
     * @description 获取下载路径,若业务数据中存在folder，则以业务数据中folder作为目录
     * @param {IData} data
     * @param {IData} file
     * @returns {*}  {string}
     */
    const getDownloadUrl = (data: IData, file: IData): string => {
      if (!c) {
        return '';
      }
      const editorParams = { ...c.editorParams };
      if (editorParams.exportparams) {
        editorParams.exportParams = JSON.parse(editorParams.exportparams);
      }
      if (file && file.folder) {
        editorParams.osscat = file.folder;
      }
      const urls = ibiz.util.file.calcFileUpDownUrl(
        c.context,
        c.params,
        data,
        editorParams,
      );
      return urls.downloadUrl;
    };

    // 自定义图片上传
    const fileUpload = async (file: Blob, callback: (_url: string) => void) => {
      const data = await ibiz.util.file.fileUpload(
        uploadUrl.value,
        file,
        headers.value,
      );
      const downloadUrl = getDownloadUrl(props.data || {}, data.fileid);
      let url = downloadUrl.replace('%fileId%', data.fileid);
      if (ibiz.config.common.enableDownloadTicket && c) {
        const downloadTicket = await ibiz.util.file.getDownloadTicket(
          c.context,
          c.params,
          props.data || {},
          { fileId: data.fileid },
          c.downloadTicketParams,
        );
        if (downloadTicket && downloadTicket.ticket) {
          url = downloadUrl.replace('%fileId%', downloadTicket.ticket);
          callback(url);
        }
      } else {
        callback(url);
      }
    };

    // 获取渲染后html内容
    const getCherryHtml = () => {
      const result = editor?.getHtml();
      return result;
    };

    // 获取markdown内容
    const getCherryContent = () => {
      const result = editor?.getMarkdown();
      return result;
    };

    // 设置markdown内容
    const setCherryContent = (val: string) => {
      isIgnoreChange = true;
      editor?.setMarkdown(val, false);
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
    const afterChange = (_e: string) => {
      emit('change', getCherryContent(), c?.model.id, isIgnoreChange);
      isIgnoreChange = false;
    };

    // 图片加载回调
    const beforeImageMounted = (e: string, src: string) => {
      return { [e]: src };
    };

    // 创建元素
    const createElement = (
      tagName: string,
      className: string = '',
    ): HTMLElement => {
      const element = document.createElement(tagName);
      element.className = className;
      return element;
    };

    // 创建 cherry-markdown 图标
    const createCherryIcon = (tagName: string): HTMLElement => {
      return createElement('i', `ch-icon ch-icon-${tagName}`);
    };

    // 全屏切换事件相关逻辑，参考 cherry-markdown 全屏逻辑实现
    const fullscreenClassName = ns.e('fullscreen');

    // 清空指定节点的所有子元素
    const clearNodeChildren = (node: HTMLElement) => {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    };

    // 获取全屏节点信息
    const getFullscreenNodeInfo = (): IParams => {
      if (editor && markDownBox.value) {
        const parentElement = editor.editor.options.editorDom.parentElement;
        if (!parentElement) return {};
        const cherryClass = parentElement.classList;
        const fullscreenNode = markDownBox.value.querySelector(
          `.${fullscreenClassName}`,
        );
        if (!fullscreenNode) return {};
        return { parentElement, cherryClass, fullscreenNode };
      }
      return {};
    };

    // 打开全屏
    const openFullscreen = () => {
      const { parentElement, cherryClass, fullscreenNode } =
        getFullscreenNodeInfo();
      if (parentElement && cherryClass && fullscreenNode) {
        clearNodeChildren(fullscreenNode);
        fullscreenNode.appendChild(createCherryIcon('minscreen'));
        cherryClass.add('fullscreen');
        fullscreenNode.title = ibiz.i18n.t('editor.common.minimize');
        parentElement.setAttribute('tabindex', '-1');
        nextTick(() => parentElement?.focus());
      }
    };

    // 关闭全屏
    const closeFullscreen = () => {
      const { parentElement, cherryClass, fullscreenNode } =
        getFullscreenNodeInfo();
      if (parentElement && cherryClass && fullscreenNode) {
        clearNodeChildren(fullscreenNode);
        fullscreenNode.appendChild(createCherryIcon('fullscreen'));
        fullscreenNode.title = ibiz.i18n.t('editor.common.fullscreen');
        cherryClass.remove('fullscreen');
        parentElement?.blur();
        parentElement.setAttribute('tabindex', '-1');
      }
    };

    // 是否已经全屏
    const isFullscreen = () => {
      const { cherryClass } = getFullscreenNodeInfo();
      return cherryClass?.contains('fullscreen');
    };

    // 全屏切换
    const onSwitchFullscreen = () => {
      if (editor && markDownBox.value) {
        if (isFullscreen()) {
          closeFullscreen();
        } else {
          openFullscreen();
        }
      }
    };

    // 处理监听键盘按下事件
    const handleKeyDown = (_e: KeyboardEvent) => {
      _e.stopPropagation();
      if (_e.key === 'Escape') {
        // 关闭全屏
        if (isFullscreen()) {
          closeFullscreen();
        }
      }
    };

    const editorInit = () => {
      if (props.disabled || props.readonly) {
        defaultModel.value = 'previewOnly';
      }
      nextTick(() => {
        editor = new Cherry({
          id,
          value: currentVal.value,
          previewer: {
            enablePreviewerBubble: !(props.disabled || props.readonly),
          },
          themeSettings: {
            // 目前应用的主题
            mainTheme: theme.value,
            // 目前应用的代码块主题
            codeBlockTheme: theme.value,
          },
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
            defaultModel: defaultModel.value as any,
            codemirror: {
              // 是否自动focus 默认为true
              autofocus: false,
            },
          },
          toolbars: {
            toolbar: [
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'color',
              'header',
              '|',
              'list',
              'image',
              {
                insert: [
                  'link',
                  'hr',
                  'br',
                  'code',
                  'formula',
                  'toc',
                  'table',
                  'line-table',
                  'bar-table',
                ],
              },
              'settings',
              'togglePreview',
            ],
            bubble: [
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'sub',
              'sup',
              '|',
              'size',
              'color',
            ],
            float: [
              'h1',
              'h2',
              'h3',
              '|',
              'checklist',
              'quote',
              'quickTable',
              'code',
            ],
            customMenu: [],
            sidebar: [],
          },
          callback: {
            afterChange,
            beforeImageMounted,
          },
          engine: {
            syntax: {
              table: {
                enableChart: false,
                externals: ['echarts'],
              },
            },
          },
        } as any);
        // 必须使用setTheme，否则previewer区域有样式问题
        editor.setTheme(theme.value);
        if (customTheme) {
          editor.setTheme(customTheme);
          editor.setCodeBlockTheme(customTheme);
        }

        // 初始化全屏按钮
        const span = createElement(
          'span',
          `${fullscreenClassName} cherry-toolbar-button`,
        );
        span.title = ibiz.i18n.t('editor.common.fullscreen');
        span.onclick = onSwitchFullscreen;
        span.appendChild(createCherryIcon('fullscreen'));
        // 适配按钮样式
        const parentElement = props.disabled
          ? editor.editor.options.editorDom.parentElement
          : editor.editor.options.editorDom.parentElement?.querySelector(
              '.cherry-toolbar>.toolbar-right',
            );
        parentElement?.appendChild(span);
      });
    };

    watch(
      () => UIStore.theme,
      newVal => {
        theme.value = customTheme || newVal;
        editor?.setTheme(theme.value);
        editor?.setCodeBlockTheme(theme.value);
      },
    );

    const calcMarkDownStyle = () => {
      if (window.ResizeObserver && markDownBox.value) {
        const tempCssVars = {
          width: markDownBox.value.offsetWidth
            ? `${markDownBox.value.offsetWidth}px`
            : '100%',
        };
        if (c && typeof c.parent.model.height === 'number') {
          Object.assign(tempCssVars, {
            height: `${c.parent.model.height}px`,
          });
        }
        cssVars.value = ns.cssVarBlock(tempCssVars);
        resizeObserver = new ResizeObserver(entries => {
          // 处理组件高度变化
          const width = entries[0].contentRect.width;
          if (width !== lastMarkDownWidth) {
            const tempCssVars2 = {
              width: `${entries[0].contentRect.width}px`,
            };
            if (c && typeof c.parent.model.height === 'number') {
              Object.assign(tempCssVars2, {
                height: `${c.parent.model.height}px`,
              });
            }
            cssVars.value = ns.cssVarBlock(tempCssVars2);
            lastMarkDownWidth = width;
          }
        });
        resizeObserver.observe(markDownBox.value);
      }
    };

    onMounted(() => {
      editorInit();
      calcMarkDownStyle();
      markDownBox.value?.addEventListener('keydown', handleKeyDown.bind(this));
    });

    onBeforeUnmount(() => {
      markDownBox.value?.removeEventListener(
        'keydown',
        handleKeyDown.bind(this),
      );
    });

    onUnmounted(() => {
      editor = null;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    return {
      ns,
      currentVal,
      id,
      editor,
      markDownBox,
      headers,
      theme,
      defaultModel,
      cssVars,
      getCherryHtml,
      getCherryContent,
      setCherryContent,
    };
  },
  render() {
    return (
      <div
        ref='markDownBox'
        class={[this.ns.b(), this.ns.is('disabled', this.disabled)]}
      >
        <div
          id={this.id}
          style={this.cssVars}
          class={this.ns.b('cherry')}
        ></div>
      </div>
    );
  },
});

export default IBizMarkDown;
