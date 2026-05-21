/* eslint-disable no-bitwise */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable object-shorthand */
/* eslint-disable no-nested-ternary */
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  defineComponent,
} from 'vue';
import {
  useUIStore,
  useNamespace,
  getCodeProps,
  getEditorEmits,
} from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import { ElMessageBox } from 'element-plus';
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/loader';
import { MenuItem } from '@imengyu/vue3-context-menu';
import { IChatMessage } from '@ibiz-template/core';
import { CodeEditorController } from '../code-editor.controller';
import './monaco-editor.scss';

/**
 * 代码编辑
 *
 * @description 使用monacoEditor组件封装，用于编辑代码内容。支持编辑器类型包含：`代码编辑器`
 * @primary
 * @editorparams {"name":"language","parameterType":"string","defaultvalue":"'typescript'","description":"设置代码编辑器所使用的编程语言类型，比如JavaScript或TypeScript等，会影响代码的语法高亮、智能提示等功能"}
 * @editorparams {"name":"enableedit","parameterType":"boolean","defaultvalue":true,"description":"当该值为true时，会显示代码编辑器顶部的工具栏，并且只有点击编辑按钮后才能开启代码编辑功能，否则编辑框默认处于不可编辑状态，常用于需要控制编辑权限的场景"}
 * @editorparams {"name":"enablefullscreen","parameterType":"boolean","defaultvalue":false,"description":"若该值为true，会显示代码编辑器顶部的工具栏，并且点击工具栏中的全屏按钮后，编辑框将全屏显示，方便在较大的视野下进行代码编辑工作"}
 * @editorparams {"name":"srfaiappendcurdata","parameterType":"boolean","defaultvalue":false,"description":"在打开AI功能时，该参数用于判断是否传入对象参数，主要用于在请求历史记录时，附加当前参数"}
 * @editorparams {"name":"srfaiappendcurcontent","parameterType":"string","description":"在打开AI功能时，如果该参数存在值，会将其传入编辑内容作为用户消息，主要用于在请求历史记录后，附加当前编辑内容作为用户消息"}
 * @editorparams {"name":"ac","parameterType":"boolean","defaultvalue":false,"description":"是否启用ac自填模式"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"autoquestion","parameterType":"boolean","defaultvalue":true,"description": "在打开AI功能时历史数据最后一个项是用户消息（USER）时是否自动提问，当打开AI行内聊天时是否自动提问"}
 * @editorparams {"name":"autofill","parameterType":"boolean","defaultvalue":false,"description": "用于AI聊天，AI回答完成之后是否触发回填"}
 * @editorparams {"name":"openmode","parameterType":"'default' | 'minimize' | 'autoexpand'","description": "用于AI聊天，AI窗口的打开模式，minimize：默认最小化窗口；autoexpand：默认最小化窗口，当提问完成后自动展开窗口"}
 * @editorparams {"name":"autoclose","parameterType":"{mode:'minimize' | 'close' | 'closetime',duration?:number}","description": "用于AI聊天，在提问完成后，设置AI窗口的自动关闭模式。其中 mode 设为 minimize 时窗口会最小化，设为 close 时窗口会直接关闭，设为 closetime 时窗口会根据 duration 配置的值延时关闭。duration配置单位为秒（s），默认值为 3 秒"}
 * @editorparams {"name":"inlineaichatheight","parameterType":"number","defaultvalue":300,"description":"用于指定AI行内聊天框高度"}
 * @editorparams {"name":"enableaiminimize","parameterType":"boolean","description":"用于控制ai聊天窗口是否启用最小化，优先级大于全局参数enableAIMinimize"}
 * @editorparams {"name":"inlinecompletionmode","parameterType":"'sync' | 'async'","defaultvalue":"async", "description":"用于AI行内聊天，控制请求方式是同步还是异步"}
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
 * @editorparams {"name":"hidelinenumbers","parameterType":"boolean","defaultvalue":"false", "description":"在非全屏状态下隐藏行号"}
 * @editorparams {"name":"hideminimap","parameterType":"boolean","defaultvalue":"false", "description":"在非全屏状态下隐藏总览区"}
 * @editorparams {"name":"srfaichunkview","parameterType":"string", "description":"知识切片视图，用于定义AI交谈打开目标知识切片视图"}
 * @editorparams {"name":"srfaichunkentity","parameterType":"string", "description":"知识切片实体，用于定义AI交谈打开知识切片视图数据主键key"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizCode = defineComponent({
  name: 'IBizCode',
  props: getCodeProps<CodeEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const codeEditBox = ref();
    const ns = useNamespace('code');
    const c = props.controller!;
    const UUID = createUUID();
    const currentVal = ref<string>('');

    const { UIStore, zIndex } = useUIStore();

    // 允许编辑
    const enableEdit = ref(true);

    // 是否存在编辑器参数enableEdit
    const hasEnableEdit = ref(false);

    // 只读状态
    const readonlyState = ref(false);

    // 允许全屏打开
    const enableFullScreen = ref(false);

    // 是否全屏
    const isFullScreen = ref(false);

    // 是否加载中
    const isLoading = ref(false);

    // 文本编辑工具栏
    const textTBRef = ref();

    // 文本编辑工具栏直接样式
    const textTBStyle = ref<IData>({
      [ns.cssVarBlockName('text-editor-toolbar-z-index')]: zIndex.increment(),
    });

    // 文本编辑工具栏可见状态
    const textTBVisible = ref(false);

    // 当前编辑器主题
    const editorTheme = ref('');

    const editorModel = c.model;
    if (editorModel.editorParams) {
      if (editorModel.editorParams.enableEdit) {
        hasEnableEdit.value = true;
        readonlyState.value = true;
        enableEdit.value =
          c.toBoolean(editorModel.editorParams.enableEdit) &&
          !props.readonly &&
          !props.disabled;
      }
      if (editorModel.editorParams.enableedit) {
        hasEnableEdit.value = true;
        readonlyState.value = true;
        enableEdit.value =
          c.toBoolean(editorModel.editorParams.enableedit) &&
          !props.readonly &&
          !props.disabled;
      }
      if (editorModel.editorParams.enableFullScreen) {
        enableFullScreen.value = c.toBoolean(
          editorModel.editorParams.enableFullScreen,
        );
      }
      if (editorModel.editorParams.enablefullscreen) {
        enableFullScreen.value = c.toBoolean(
          editorModel.editorParams.enablefullscreen,
        );
      }
    }

    let editor: monaco.editor.IStandaloneCodeEditor | null;
    let monacoEditor: typeof monaco.editor;
    let codeLensProviderDisposable: monaco.IDisposable | null;
    let inlineCompletionsProviderDisposable: monaco.IDisposable | null;
    let decorationsCollection: monaco.editor.IEditorDecorationsCollection | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chatInstance: any;

    // 编辑器主题
    const getMonacoTheme = (name: string): string => {
      editorTheme.value =
        c?.editorParams?.customTheme || ibiz.config.codeEditorTheme || name;
      // customTheme参数已弃用，后续请使用全局参数codeEditorTheme
      const customTheme = c?.editorParams?.customTheme;
      if (customTheme) {
        return customTheme === 'dark' ? 'vs-dark' : 'vs';
      }
      if (ibiz.config.codeEditorTheme) {
        return ibiz.config.codeEditorTheme === 'dark' ? 'vs-dark' : 'vs';
      }
      return name === 'dark' ? `vs-${UIStore.theme}` : 'vs'; // 官方自带三种主题vs, hc-black, or vs-dark
    };

    watch(
      () => UIStore.theme,
      newVal => {
        monacoEditor.setTheme(getMonacoTheme(newVal));
      },
    );

    watch(
      () => props.value,
      newVal => {
        if (newVal !== currentVal.value) {
          currentVal.value = newVal || '';
          editor?.setValue(currentVal.value);
        }
      },
      { immediate: true },
    );

    // 更新编辑器配置
    const updateEditorOptions = () => {
      if (!editor) {
        return;
      }
      if (props.readonly || props.disabled) {
        hasEnableEdit.value = false;
        readonlyState.value = true;
      }
      editor.updateOptions({
        readOnly: hasEnableEdit.value
          ? readonlyState.value
          : props.readonly || props.disabled,
      });
    };

    watch(() => props.readonly, updateEditorOptions, { immediate: true });

    watch(() => props.disabled, updateEditorOptions, { immediate: true });

    /**
     * 卸载代码编辑器
     */
    const unload = () => {
      editor?.dispose();
      editor = null;
      decorationsCollection?.clear();
      decorationsCollection = null;
      codeLensProviderDisposable?.dispose();
      codeLensProviderDisposable = null;
      inlineCompletionsProviderDisposable?.dispose();
      inlineCompletionsProviderDisposable = null;
      chatInstance?.close();
    };

    /**
     * 打开AI
     *
     */
    const openAIChat = async () => {
      if (!c.deACMode || !c.model.appDataEntityId) return;
      chatInstance = await ibiz.aiChatUtil.getAIChat();
      const { containerOptions, chatOptions } =
        await ibiz.aiChatUtil.getEditorExAIChatParams(
          c.editorParams,
          c.context,
          c.params,
          props.data,
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
          zIndex: zIndex.increment(),
          ...containerOptions,
        },
        chatOptions: {
          caption: c.deACMode.logicName,
          context: { ...c.context },
          params: { ...c.params, srfactag: c.deACMode.codeName },
          appDataEntityId: c.model.appDataEntityId,
          ...chatOptions,
          action: ((action: string, message: IChatMessage) => {
            if (action === 'backfill') emit('change', message.realcontent);
          }) as any,
        },
      });
    };

    /**
     * 检查模型是否属于当前编辑器实例
     *
     * @param {monaco.editor.ITextModel} model
     * @return {*}  {boolean}
     */
    const validate = (model: monaco.editor.ITextModel): boolean => {
      const currentEditor = monacoEditor
        .getEditors()
        .find(e => e.getModel() === model);

      if (!currentEditor || (currentEditor as any).__instanceId !== UUID)
        return false;
      return true;
    };

    // 工具栏更新相关逻辑
    const updateTextToolbarPos = (selection: IParams): void => {
      // 获取选中文本的位置信息
      const position = selection.getStartPosition();
      if (position) {
        // 计算工具栏位置
        const coordinates = editor?.getScrolledVisiblePosition(position);
        const editorRect = editor?.getDomNode()?.getBoundingClientRect();
        if (!editorRect || !coordinates) return;

        textTBStyle.value = {
          ...textTBStyle.value,
          // 编辑器左侧距离 + 选区距离编辑器左侧距离
          [ns.cssVarBlockName('text-editor-toolbar-left')]: `${
            editorRect.left + coordinates.left
          }px`,
          // 编辑器上方距离 + 选区距离编辑器上方距离 + 行高度
          [ns.cssVarBlockName('text-editor-toolbar-top')]: `${
            editorRect.top + coordinates.top + coordinates.height
          }px`,
        };
      }
    };

    // 设置工具栏显隐状态
    const setTextTBVisible = (): void => {
      // 只读模式或无自填模式时始终隐藏
      if (
        props.readonly ||
        !enableEdit.value ||
        !c.deACMode ||
        !c.chatCompletion
      )
        return;

      const selection = editor?.getSelection();
      textTBVisible.value = !!(selection && !selection.isEmpty());
    };

    // 处理选中文本事件
    const onSelectionChange = (e: IParams): void => {
      const selection = e.selection;
      if (selection) {
        updateTextToolbarPos(selection);
        c.currentSelection = selection;
      }
    };

    // 处理行内ai点击
    const handleLineAiClick = (_e: MouseEvent): void => {
      const position = editor?.getSelection()?.getStartPosition();
      if (!position) return;
      const coordinates = editor?.getScrolledVisiblePosition(position);
      const editorRect = editor?.getDomNode()?.getBoundingClientRect();
      const textTBHeight = textTBRef.value.offsetHeight;
      if (!coordinates || !editorRect || !textTBHeight) return;
      const items: MenuItem[] = ibiz.inLineAIUtil.calcContextMenus(
        c.deACMode,
        (tag: string) => {
          c.doInLineAIUIAction(tag, c.model.appId);
        },
      );
      if (items.length === 0) return;
      ibiz.inLineAIUtil.showContextMenus(
        // 编辑器左侧距离 + 选区距离编辑器左侧距离
        editorRect.left + coordinates.left,
        // 编辑器上方距离 + 选区距离编辑器上方距离 + 行高度 + 工具栏高度
        editorRect.top + coordinates.top + coordinates.height + textTBHeight,
        items,
        {
          zIndex: zIndex.increment(),
          onClose: () => {
            zIndex.decrement();
          },
        },
      );
    };

    // 编辑器内鼠标点击事件
    const handleEditorClick = (e: MouseEvent): void => {
      if (!textTBRef.value?.contains(e.target)) {
        setTimeout(setTextTBVisible, 100); // 延迟检查，确保选择已更新
      }
    };

    // 窗口鼠标按下事件
    const handleMousedown = (e: MouseEvent): void => {
      if (textTBVisible.value && !textTBRef.value?.contains(e.target)) {
        textTBVisible.value = false;
      }
    };

    const editorInit = (): void => {
      nextTick(() => {
        isLoading.value = true;
        loader.config({
          paths: {
            vs: `${ibiz.env.pluginBaseUrl}/monaco-editor@0.52.2/min/vs`,
          },
        });
        loader
          .init()
          .then(loaderMonaco => {
            isLoading.value = false;
            // 初始化编辑器
            if (!editor) {
              monacoEditor = loaderMonaco.editor;
              editor = monacoEditor.create(codeEditBox.value, {
                language: props.language || props.controller.language, // 语言支持自行查阅demo
                theme: getMonacoTheme(UIStore.theme),
                foldingStrategy: 'indentation',
                renderLineHighlight: 'all', // 行亮
                selectOnLineNumbers: true, // 显示行号
                lineNumbers: isFullScreen.value
                  ? 'on'
                  : c.hideLineNumbers
                    ? 'off'
                    : 'on',
                minimap: {
                  enabled: isFullScreen.value ? true : !c.hideMinimap,
                },
                readOnly: hasEnableEdit.value
                  ? readonlyState.value
                  : props.readonly || props.disabled, // 只读
                readOnlyMessage: {
                  value: ibiz.i18n.t('editor.code.readOnlyPrompt'),
                },
                fontSize: 16, // 字体大小
                fixedOverflowWidgets: true, // 确保悬浮提示不会被裁剪
                scrollBeyondLastLine: false, // 取消代码后面一大段空白
                overviewRulerBorder: false, // 不要滚动条的边框
              });
              // 为当前编辑器实例添加自定义属性
              (editor as any).__instanceId = UUID;
              if (c.chatCompletion && ibiz.env.enableAI) {
                codeLensProviderDisposable =
                  loaderMonaco.languages.registerCodeLensProvider(
                    props.language || props.controller.language,
                    {
                      provideCodeLenses: function (model, _token) {
                        if (!validate(model))
                          return { lenses: [], dispose: () => {} };
                        return {
                          lenses: [
                            {
                              id: 'AI',
                              range: new loaderMonaco.Range(1, 1, 1, 1),
                              command: {
                                title: `${c.deACMode!.logicName}`,
                                id: editor!.addCommand(0, () => openAIChat())!,
                              },
                            },
                          ],
                          dispose: () => {},
                        };
                      },
                      resolveCodeLens: (_model, codeLens, _token) => codeLens,
                    },
                  );
              }
            }

            c.onCreated(editor, loaderMonaco);

            setTimeout(() => {
              editor!.layout();
              editor!.setValue(currentVal.value);
            });

            // 创建空白提示
            const createDecorationsCollection = (): void => {
              if (decorationsCollection) decorationsCollection.clear();
              if (c.placeHolder && !editor?.getValue()) {
                decorationsCollection = editor!.createDecorationsCollection([
                  {
                    range: new loaderMonaco.Range(1, 1, 1, 1), // 影响第1行的开始位置
                    options: {
                      isWholeLine: true, // 是否作用于整行
                      beforeContentClassName: `${ns.e(
                        'first-prompt',
                      )} ghost-text-decoration`, // 在内容前加修饰 mtk8为注释样式类名
                    },
                  },
                ]);
              }
            };

            // 保存原始的 setValue 方法
            const originalSetValue = editor.setValue.bind(editor);
            // 重写 setValue 方法
            editor.setValue = (newValue: string): void => {
              // 调用原始的 setValue 方法
              originalSetValue(newValue);
              createDecorationsCollection();
            };

            // 获取焦点
            editor.onDidFocusEditorText(() => {
              decorationsCollection?.clear();
            });

            // 失去焦点
            editor.onDidBlurEditorText(() => {
              createDecorationsCollection();
            });

            // 监听值的变化
            editor.onDidChangeModelContent(() => {
              setTextTBVisible();
              if (!hasEnableEdit.value) {
                currentVal.value = editor!.getValue();
                emit('change', currentVal.value);
              }
            });

            // 监听选择区变化事件
            editor.onDidChangeCursorSelection(onSelectionChange);

            // 点击编辑器其他区域时隐藏工具栏
            editor.getDomNode()?.addEventListener('click', handleEditorClick);

            window.addEventListener('resize', () => {
              editor!.layout();
            });
          })
          .catch(() => {
            isLoading.value = false;
          });
      });
    };

    // 更改编辑状态
    const changeEditState = () => {
      readonlyState.value = !readonlyState.value;
      if (!editor) return;
      if (!readonlyState.value) {
        editor.updateOptions({
          readOnly: false,
        });
      } else {
        editor.updateOptions({
          readOnly: true,
        });
      }
    };

    // 更新全屏状态
    const changeFullScreenState = async () => {
      currentVal.value = String(editor?.getValue());
      unload();
      isFullScreen.value = !isFullScreen.value;
      editorInit();
    };

    // 绘制全屏图标
    const isAllowRenderFullScreen = () => {
      if (enableFullScreen.value)
        return (
          <span
            class={ns.be('toolbar', 'fullscreen')}
            title={ibiz.i18n.t(
              `editor.common.${isFullScreen.value ? 'minimize' : 'fullscreen'}`,
            )}
            onClick={() => changeFullScreenState()}
          >
            {isFullScreen.value ? (
              <i class='ch-icon ch-icon-minscreen' />
            ) : (
              <i class='ch-icon ch-icon-fullscreen'></i>
            )}
          </span>
        );
      return null;
    };

    // 绘制取消消息盒子
    const renderCancelMessage = () => {
      return (
        <div class={ns.be('message', 'message-content')}>
          <p>{ibiz.i18n.t('editor.common.confirmCancelPrompt')}</p>
          <p class={ns.bem('message', 'message-content', 'message-tip')}>
            {ibiz.i18n.t('editor.common.cancelEditPrompt')}
          </p>
        </div>
      );
    };

    // 取消编辑
    const cancelEdit = () => {
      if (props.value !== editor?.getValue()) {
        ElMessageBox({
          title: ibiz.i18n.t('editor.common.confirmCancel'),
          type: 'warning',
          customClass: ns.b('message'),
          message: renderCancelMessage(),
          showCancelButton: true,
          cancelButtonClass: ns.be('message', 'message-cancel'),
          confirmButtonClass: ns.be('message', 'message-comfire'),
        })
          .then(() => {
            editor?.setValue(String(props.value || ''));
            changeEditState();
          })
          .catch(() => {
            // 重新聚焦
            editor?.focus();
          });
      } else {
        changeEditState();
      }
    };

    // 确认保存
    const save = () => {
      changeEditState();
      if (editor) {
        currentVal.value = editor!.getValue();
        emit('change', currentVal.value);
      }
      if (isFullScreen.value) {
        changeFullScreenState();
      }
    };

    // 绘制底部取消确认按钮
    const renderFooter = () => {
      if (hasEnableEdit.value) {
        return (
          <div
            class={[
              ns.b('footer'),
              { [ns.b('footer-dialog')]: isFullScreen.value },
            ]}
          >
            <div class={ns.be('footer', 'cancel')} onClick={() => cancelEdit()}>
              {ibiz.i18n.t('app.cancel')}
            </div>
            <div class={ns.be('footer', 'save')} onClick={() => save()}>
              {ibiz.i18n.t('app.save')}
            </div>
          </div>
        );
      }
      return null;
    };

    // 绘制头部工具栏
    const renderHeaderToolbar = () => {
      if (hasEnableEdit.value || enableFullScreen.value) {
        return (
          <div class={ns.b('toolbar')}>
            {hasEnableEdit.value && enableEdit.value && readonlyState.value ? (
              <i
                class='fa fa-edit'
                aria-hidden='true'
                onClick={() => changeEditState()}
              ></i>
            ) : null}
            {isAllowRenderFullScreen()}
          </div>
        );
      }
      return null;
    };

    // 绘制代码框内容
    const renderCodeContent = () => {
      return (
        <div
          ref={codeEditBox}
          class={ns.e('box')}
          style={{ [ns.cssVarBlockName('placeholder')]: `"${c.placeHolder}"` }}
        ></div>
      );
    };

    // 绘制行内文本编辑工具栏
    const renderTextEditorToolbar = () => {
      if (!textTBVisible.value || !c.chatCompletion) return null;
      return (
        <div
          ref='textTBRef'
          class={[ns.b('text-editor-toolbar')]}
          style={{
            ...textTBStyle.value,
          }}
        >
          <div
            class={[ns.be('text-editor-toolbar', 'item')]}
            title='AI'
            onClick={handleLineAiClick}
          >
            <svg
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1024 1024'
              width='1em'
              height='1em'
              fill='currentColor'
            >
              <path d='M274.344554 173.673875c16.429399 0 30.950568 8.00526 39.956484 20.338945a34.906655 34.906655 0 0 1 14.660796 15.754537l1.117013 2.815803 210.138065 597.927736c6.795162 19.268474-5.329083 40.817516-27.041022 48.147913-20.641469 6.95806-42.493035-1.419537-50.451753-18.803052l-1.117013-2.815803-54.477653-154.939008H134.997185L80.566074 837.039954c-6.771891 19.268474-29.856826 28.949253-51.568765 21.618855-20.641469-6.981331-32.602816-26.761769-27.925325-45.239025l0.861031-2.908888L212.047809 212.58316c4.025901-11.426112 13.799764-19.477914 25.598214-22.619512 9.029188-10.006575 22.107548-16.289773 36.67526-16.289773z m386.416675 169.460176c21.828295 0 39.723774 10.890876 41.469106 24.713912l0.116356 2.210755v461.652153c0 14.893506-18.616883 26.947938-41.585462 26.947938-21.805024 0-39.700503-10.890876-41.422565-24.737183l-0.162897-2.210755V370.081989c0-14.870235 18.616883-26.924667 41.585462-26.924667z m-389.697901-48.171184L163.620643 600.628812h214.88537l-107.442685-305.665945z m602.163076-206.181978a12.566396 12.566396 0 0 1 8.144887 8.051802l32.509731 99.041817 101.694723 36.07021a12.566396 12.566396 0 0 1-0.791218 23.922695l-99.53051 27.995137-30.857483 97.552467a12.566396 12.566396 0 0 1-23.899423 0.116355l-32.509732-99.018546-98.669479-31.322905a12.566396 12.566396 0 0 1-0.186169-23.876152l97.505924-32.812256 30.834212-97.529195a12.566396 12.566396 0 0 1 15.754537-8.191429zM649.544557 0.513593c2.676177 0.884302 4.770576 3.025243 5.608336 5.724692l18.523798 59.294772 60.970292 20.66474a8.796477 8.796477 0 0 1-0.325796 16.755194l-60.73758 18.058377-19.780438 59.550754a8.796477 8.796477 0 0 1-16.731924-0.162898l-18.523798-59.271501-59.062061-17.825665a8.796477 8.796477 0 0 1-0.395609-16.708653l59.574025-20.943993 19.780438-59.574025a8.796477 8.796477 0 0 1 11.100317-5.561794z'></path>
            </svg>
          </div>
        </div>
      );
    };

    onMounted(() => {
      editorInit();
      window.addEventListener('mousedown', handleMousedown.bind(this));
    });

    onUnmounted(() => {
      unload();
      window.removeEventListener('mousedown', handleMousedown.bind(this));
    });

    return {
      ns,
      currentVal,
      codeEditBox,
      isFullScreen,
      hasEnableEdit,
      readonlyState,
      isLoading,
      textTBRef,
      editorTheme,
      renderFooter,
      renderHeaderToolbar,
      renderTextEditorToolbar,
      renderCodeContent,
      changeFullScreenState,
    };
  },
  render() {
    const isLoading = !this.controller.view?.state?.isLoading && this.isLoading;
    return !this.isFullScreen ? (
      <div
        class={[
          this.ns.b(),
          this.ns.is(this.editorTheme, !!this.editorTheme),
          { [this.ns.b('editor-readonly')]: this.readonlyState },
          { [this.ns.b('editor-enable')]: !this.readonlyState },
          this.ns.is('enable', this.hasEnableEdit),
        ]}
        v-loading={isLoading}
      >
        {this.renderTextEditorToolbar()}
        {this.renderHeaderToolbar()}
        {this.renderCodeContent()}
        {this.hasEnableEdit && !this.readonlyState ? this.renderFooter() : null}
      </div>
    ) : (
      <el-dialog
        v-model={this.isFullScreen}
        class={this.ns.b('dialog-full-screen')}
        onClose={() => this.changeFullScreenState()}
      >
        <div
          class={[
            this.ns.b(),
            this.ns.is(this.editorTheme, !!this.editorTheme),
            { [this.ns.b('editor-readonly')]: this.readonlyState },
            { [this.ns.b('editor-enable')]: !this.readonlyState },
          ]}
          v-loading={isLoading}
        >
          {this.renderTextEditorToolbar()}
          {this.renderHeaderToolbar()}
          {this.renderCodeContent()}
          {this.hasEnableEdit && !this.readonlyState
            ? this.renderFooter()
            : null}
        </div>
      </el-dialog>
    );
  },
});
