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
import { initCustomMenu } from './custom-menu';
import { useImgPreviewRender } from './render-util';
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
 * @editorparams {"name":"showmode","parameterType":"'default' | 'manual'","defaultvalue":"'default'","description":"设置Markdown显示模式，当设置为manual时，默认呈现信息态和编辑按钮，点击编辑按钮进入编辑态"}
 * @editorparams {"name":"inlineaichatheight","parameterType":"number","defaultvalue":300,"description":"用于指定AI行内聊天框高度"}
 * @editorparams {"name":"srfaiappendcurdata","parameterType":"boolean","defaultvalue":false,"description":"在打开AI功能时，该参数用于判断是否传入对象参数，主要用于在请求历史记录时，附加当前参数"}
 * @editorparams {"name":"srfaiappendcurcontent","parameterType":"string","description":"在打开AI功能时，如果该参数存在值，会将其传入编辑内容作为用户消息，主要用于在请求历史记录后，附加当前编辑内容作为用户消息"}
 * @editorparams {"name":"autoquestion","parameterType":"boolean","defaultvalue":true,"description": "在打开AI功能时历史数据最后一个项是用户消息（USER）时是否自动提问，当打开AI行内聊天时是否自动提问"}
 * @editorparams {"name":"autofill","parameterType":"boolean","defaultvalue":false,"description": "用于AI聊天，AI回答完成之后是否触发回填"}
 * @editorparams {"name":"openmode","parameterType":"'default' | 'minimize' | 'autoexpand'","description": "用于AI聊天，AI窗口的打开模式，minimize：默认最小化窗口；autoexpand：默认最小化窗口，当提问完成后自动展开窗口"}
 * @editorparams {"name":"autoclose","parameterType":"{mode:'minimize' | 'close' | 'closetime',duration?:number}","description": "用于AI聊天，在提问完成后，设置AI窗口的自动关闭模式。其中 mode 设为 minimize 时窗口会最小化，设为 close 时窗口会直接关闭，设为 closetime 时窗口会根据 duration 配置的值延时关闭。duration配置单位为秒（s），默认值为 3 秒"}
 * @editorparams {"name":"enableaiminimize","parameterType":"boolean","description":"用于控制ai聊天窗口是否启用最小化，优先级大于全局参数enableAIMinimize"}
 * @editorparams {"name":"inlinecompletionmode","parameterType":"'sync' | 'async'","defaultvalue":"async", "description":"用于AI行内聊天，控制请求方式是同步还是异步"}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"disabledirectory","parameterType":"boolean","defaultvalue":"false", "description":"是否禁用markdown的目录功能"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
 * @editorparams {"name":"srfaiappendresource","parameterType":"string", "description":"AI聊天默认附加资源数据"}
 * @editorparams {"name":"srfmode","parameterType":"string", "description":"指定AI聊天自定义模式"}
 * @editorparams {"name":"srfenableaiagentchange","parameterType":"boolean","defaultvalue":true, "description":"指定AI聊天智能体是否可切换"}
 * @editorparams {"name":"srfaiagent","parameterType":"string", "description":"指定AI聊天默认智能体"}
 * @editorparams {"name":"summarymaxtokens","parameterType":"number","defaultvalue":"30", "description":"AI聊天标题摘要最大字符数,仅话题标题模式为summary时生效"}
 * @editorparams {"name":"srfenableknowledgebaseselect","parameterType":"boolean","defaultvalue":true, "description":"AI聊天是否启用知识库选择，若未启用则不显示知识库图标"}
 * @editorparams {"name":"srfenablerecallconfigsetting","parameterType":"boolean","defaultvalue":true, "description":"AI聊天是否启用自定义召回配置，若未启用则不显示召回配置图标"}
 * @editorparams {"name":"rerankdefaultvalue","parameterType":"0 | 1 | 2","defaultvalue":"2", "description":"AI聊天召回重排默认值，0:禁用;1:启用;2:自动，仅在启用自定义召回配置和当前智能体召回重排无值时生效"}
 * @editorparams {"name":"maxchunksdefaultvalue","parameterType":"number","defaultvalue":"10", "description":"AI聊天最大召回数量默认值，仅在启用自定义召回配置和当前智能体最大召回数量无值时生效"}
 * @editorparams {"name":"chunkthresholddefaultvalue","parameterType":"number","defaultvalue":"0.4", "description":"AI聊天召回相似度阈值默认值，仅在启用自定义召回配置和当前智能体召回相似度阈值无值时生效"}
 * @editorparams {"name":"srfaichunkview","parameterType":"string", "description":"知识切片视图，用于定义AI交谈打开目标知识切片视图"}
 * @editorparams {"name":"srfaichunkentity","parameterType":"string", "description":"知识切片实体，用于定义AI交谈打开知识切片视图数据主键key"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IBizMarkDown: any = defineComponent({
  name: 'IBizMarkDown',
  props: getMarkDownProps<MarkDownEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit, slots }) {
    const ns = useNamespace('markdown');

    const c = props.controller;

    const currentVal = ref<string>('');

    let editor: IData | null = null;

    const id = createUUID();

    const { isImgPreview, onMDEditorCreated, renderImgPreview } =
      useImgPreviewRender(ns);

    // 请求头
    const uploadHeaders = ibiz.util.file.getUploadHeaders();
    const headers: Ref<IData> = ref({ ...uploadHeaders });

    // 上传文件路径
    const uploadUrl: Ref<string> = ref('');

    // 自定义主题
    const customTheme =
      c?.editorParams?.customTheme || c?.editorParams?.customtheme;

    // 是否启用无权限
    const enableNoAccess = c?.editorParams?.enablenoaccess === 'true';

    // 编辑器主题
    const { UIStore } = useUIStore();
    const theme = ref(customTheme || UIStore.theme);

    // 是否正在编辑中
    const isEditing = ref(false);

    // 显示模式
    let showmode: 'default' | 'manual' = 'default';
    if (c && c.editorParams?.showmode) {
      showmode = c.editorParams.showmode;
    }
    // 是否进入全屏
    const isFullScreen = ref(false);

    // 编辑器模式
    const defaultModel = ref('editOnly');

    // 浏览器ResizeObserver对象
    let resizeObserver: ResizeObserver | null = null;

    // 工具栏ResizeObserver对象
    let toolbarResizeObserver: ResizeObserver | null = null;

    // 上次监听到的markdown外层宽度，一旦发生变化就重新计算
    let lastMarkDownWidth = 0;

    // 样式变量
    const cssVars = ref({});

    // 工具栏样式变量
    const toolbarCssVars = ref({});

    // 正常大小时目录状态
    const lastDirectoryState: Ref<'full' | 'pure'> = ref('pure');

    // 是否忽略改变
    let isIgnoreChange: boolean = false;

    // AI 聊天实例
    let chatInstance: any;

    // 禁用目录
    let disabledirectory = false;
    if (c?.editorParams?.disabledirectory) {
      disabledirectory = c.editorParams.disabledirectory === 'true';
    }

    // 目录位置
    let tocPos: 'absolute' | 'fixed' = 'absolute';
    if (c?.editorParams?.tocpos) {
      tocPos = c.editorParams.tocpos === 'fixed' ? 'fixed' : 'absolute';
    }
    const [AIMenu, AIChart] = initCustomMenu(c as MarkDownEditorController, {
      props,
      chatInstance,
      isEditing,
      currentVal,
      emit,
    });
    // data响应式变更基础路径
    watch(
      () => props.data,
      newVal => {
        if (newVal && c) {
          const editorParams = {
            ...c.editorParams,
            enableNoAccess,
          };
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
      const editorParams = {
        ...c.editorParams,
        enableNoAccess,
      };
      if (editorParams.exportparams) {
        editorParams.exportParams = JSON.parse(editorParams.exportparams);
      }
      if (editorParams.globaldownloadprifix) {
        editorParams.globalDownloadPrifix =
          editorParams.globaldownloadprifix === 'true';
      } else {
        editorParams.globalDownloadPrifix =
          ibiz.config.common.globalDownloadPrifix;
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
      if (
        ibiz.config.common.enableDownloadTicket &&
        c &&
        c.editorParams &&
        !enableNoAccess
      ) {
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
      // 第二个参数传true时，能保持当前的光标位置，默认false
      editor?.setMarkdown(val, true);
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
      if (showmode === 'manual') {
        return;
      }
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
          editor.toggleToc(lastDirectoryState.value);
          isFullScreen.value = false;
        } else {
          openFullscreen();
          lastDirectoryState.value = editor.toc.model;
          editor.toggleToc('full');
          isFullScreen.value = true;
        }
      }
    };

    // 处理监听键盘按下事件
    const handleKeyDown = (_e: KeyboardEvent) => {
      _e.stopPropagation();
      if (_e.key === 'Escape') {
        _e.preventDefault();
        // 关闭全屏
        if (isFullscreen()) {
          closeFullscreen();
          editor!.toggleToc(lastDirectoryState.value);
          isFullScreen.value = false;
        }
      }
    };

    // 主题变更
    const changeMainTheme = (_theme: string) => {
      c?.setCurrentEditorTheme(_theme);
    };

    // 选择变更，包括选区变更，光标位置变更
    const selectionChange = (event: IData) => {
      const { info } = event;
      let isForwardSelection = true;

      // 取第一个选区（默认单选区场景，多选区可扩展）
      const firstRange = info.ranges && info.ranges[0];
      if (!firstRange) {
        // 无有效选区，重置方向
        isForwardSelection = true;
      } else {
        const { anchor, head } = firstRange;
        // 判断选择方向
        isForwardSelection = c!.isPositionBefore(anchor, head);
      }
      const startPos = c!.mdeditor?.editor.editor.getCursor('start');
      const endPos = c!.mdeditor?.editor.editor.getCursor('end');
      c!.setCursorPos(startPos, endPos); // 格式化后的光标位置
      c!.setSelectionDirection(isForwardSelection);
    };

    const editorInit = () => {
      if (props.disabled || props.readonly || showmode === 'manual') {
        defaultModel.value = 'previewOnly';
      }
      nextTick(() => {
        const bubble = [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'sub',
          'sup',
          '|',
          'size',
          'color',
        ];
        const toolbar = [
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
        ];
        if (c && c.chatCompletion) {
          toolbar.unshift('AIChart');
          bubble.unshift('AI');
        }
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
            toolbar,
            bubble,
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
            customMenu: {
              AI: AIMenu,
              AIChart,
            },
            // 定义侧边栏，默认为空
            sidebar: ['theme', 'copy'],
            // 定义顶部右侧工具栏，默认为空
            toolbarRight: [],
            // 目录
            toc: !disabledirectory && {
              updateLocationHash: false, // 要不要更新URL的hash
              defaultModel: 'pure', // pure: 精简模式/缩略模式，只有一排小点； full: 完整模式，会展示所有标题
              showAutoNumber: true, // 是否显示自增序号
              position: tocPos, // 悬浮目录的悬浮方式。当滚动条在cherry内部时，用absolute；当滚动条在cherry外部时，用fixed
              cssText: '', // 自定义样式
            },
          },
          callback: {
            afterChange,
            beforeImageMounted,
          },
          event: {
            changeMainTheme,
            selectionChange,
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
        // 默认设置一次关闭目录，markdown会记录每次操作过后的状态，存在localStorage里面，不重新设置的话每次打开都会拿缓存里的状态
        editor.toggleToc('pure');
        // 初始化重置一次预览区的内容，不然目录拿不到数据
        const html = editor.engine.makeHtml(currentVal.value);
        editor.previewer.update(html);
        editor.toc?.updateTocList?.();
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
        c?.setMDEditor(editor);
        onMDEditorCreated(editor);
        if (
          slots.editorSwitchMenu &&
          window.ResizeObserver &&
          markDownBox.value
        ) {
          const cherryToolbar = markDownBox.value.querySelector(
            '.cherry-toolbar',
          ) as HTMLElement | undefined;
          if (cherryToolbar) {
            toolbarResizeObserver = new ResizeObserver(entries => {
              const height = entries[0]?.contentRect.height;
              toolbarCssVars.value = ns.cssVarBlock({
                'toolbar-height': `${height}px`,
              });
            });
            toolbarResizeObserver.observe(cherryToolbar);
          }
        }
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

    // 切换编辑
    const onEnableEdit = () => {
      isEditing.value = true;
      defaultModel.value = 'editOnly';
      editor?.switchModel(defaultModel.value);
    };

    // 重置编辑状态
    const onResetEditState = () => {
      isEditing.value = false;
      defaultModel.value = 'previewOnly';
      editor?.switchModel(defaultModel.value);
    };

    // 取消编辑
    const onEditCancel = () => {
      // 直接重置值
      setCherryContent(currentVal.value);
      onResetEditState();
    };

    // 确认编辑
    const onEditConfirm = () => {
      emit('change', getCherryContent(), c?.model.id, isIgnoreChange);
      isIgnoreChange = false;
      onResetEditState();
    };

    // 将浏览器焦点目标设置到编辑器上
    const onFocusEditor = () => {
      const target = document.getElementById(id);
      target?.focus();
    };

    // 绘制头部额外工具栏
    const renderHeader = () => {
      if (showmode === 'manual' && !isEditing.value) {
        return (
          <div
            onClick={onFocusEditor}
            class={[ns.e('header'), ns.is('fullscreen', isFullScreen.value)]}
          >
            {!props.disabled && !props.readonly && (
              <div
                class={ns.em('header', 'edit')}
                onClick={onEnableEdit}
                title={ibiz.i18n.t('editor.markdown.edit')}
              >
                <i class='fa fa-edit' aria-hidden='true'></i>
              </div>
            )}
            <div class={ns.em('header', 'full')} onClick={onSwitchFullscreen}>
              {isFullScreen.value ? (
                <i
                  class='fa fa-compress'
                  aria-hidden='true'
                  title={ibiz.i18n.t('editor.html.reduce')}
                ></i>
              ) : (
                <i
                  class='fa fa-expand'
                  aria-hidden='true'
                  title={ibiz.i18n.t('editor.common.fullscreen')}
                ></i>
              )}
            </div>
          </div>
        );
      }
    };

    // 绘制编辑态的确认取消按钮
    const renderFooter = () => {
      if (
        showmode === 'manual' &&
        isEditing.value &&
        !props.disabled &&
        !props.readonly
      ) {
        return (
          <div
            onClick={onFocusEditor}
            class={[ns.e('footer'), ns.is('fullscreen', isFullScreen.value)]}
          >
            <div class={ns.em('footer', 'cancel')} onClick={onEditCancel}>
              {ibiz.i18n.t('editor.common.cancel')}
            </div>
            <div class={ns.em('footer', 'save')} onClick={onEditConfirm}>
              {ibiz.i18n.t('editor.common.confirm')}
            </div>
          </div>
        );
      }
    };

    // 绘制编辑器切换菜单
    const renderEditorSwitchMenu = () => {
      return (
        <div
          class={[ns.b('menu'), ns.is('fullscreen', isFullScreen.value)]}
          style={toolbarCssVars.value}
        >
          {slots.editorSwitchMenu?.()}
        </div>
      );
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
      if (toolbarResizeObserver) {
        toolbarResizeObserver.disconnect();
      }
      if (chatInstance && chatInstance.close) {
        chatInstance.close();
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
      UIStore,
      defaultModel,
      cssVars,
      isEditing,
      showmode,
      isFullScreen,
      isImgPreview,
      getCherryHtml,
      getCherryContent,
      setCherryContent,
      renderHeader,
      renderFooter,
      renderImgPreview,
      renderEditorSwitchMenu,
    };
  },
  render() {
    const isShowEditorSwitchMenu = !!this.$slots.editorSwitchMenu;
    return (
      <div
        ref='markDownBox'
        class={[
          this.ns.b(),
          this.ns.is('disabled', this.disabled),
          this.ns.is('manual', this.showmode === 'manual'),
          this.ns.is('editing', this.isEditing),
          this.ns.is('show-editor-switch-menu', isShowEditorSwitchMenu),
          this.ns.is(
            'editor-content-fixed',
            this.isFullScreen || this.isImgPreview,
          ),
        ]}
      >
        {isShowEditorSwitchMenu ? this.renderEditorSwitchMenu() : null}
        {this.renderHeader()}
        {this.renderFooter()}
        {this.renderImgPreview()}
        <div
          tabindex='-1' // 0 允许聚焦，-1 允许但不参与浏览器tab切换
          id={this.id}
          style={this.cssVars}
          class={[
            this.ns.b('cherry'),
            this.ns.m(this.UIStore.theme === 'dark' ? 'dark' : 'light'),
          ]}
        ></div>
      </div>
    );
  },
});

export default IBizMarkDown;
