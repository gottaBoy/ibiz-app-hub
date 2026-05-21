/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Cherry from 'cherry-markdown';
import { nextTick } from 'vue';
import { MenuItem } from '@imengyu/vue3-context-menu';
import { useUIStore } from '@ibiz-template/vue3-util';
import { IChatMessage } from '@ibiz-template/core';
import { MarkDownEditorController } from '../markdown-editor.controller';

/**
 * 初始化自定义菜单
 *
 * @export
 * @param {(IData | null)} editor
 * @param {MarkDownEditorController} c
 * @return {*}  {IData[]}
 */
export function initCustomMenu(
  c: MarkDownEditorController,
  opts: IData,
): IData[] {
  const { props, isEditing, currentVal, emit } = opts;
  let chatInstance = opts.chatInstance;
  const AIMenu = Cherry.createMenuHook('AI', {
    icon: {
      type: 'svg',
      content: `<svg
                viewBox='0 0 16 16'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                height='1em'
                width='1em'
                preserveAspectRatio='xMidYMid meet'
                focusable='false'
              >
                <g
                  id='aae1.Base基础/1.icon图标/2.normal/ai-star'
                  stroke-width='1'
                  fill-rule='evenodd'
                >
                  <path
                    d='M5.817 1.53l3.158 8.797h.054v.152l1.443 4.021-1.402.001-1.041-2.982H2.495l-1.03 2.982L0 14.5 4.671 1.533l1.146-.003zm7.86 5.424V14.5h-1.213V6.954h1.212zM5.248 3.549l-2.342 6.778h4.706L5.249 3.55zM13.046 0c.075 0 .147.02.204.071a.318.318 0 01.094.181l.064.273c.097.417.17.727.255.968.084.24.177.4.31.523.134.124.318.218.599.306.281.088.65.166 1.15.265a.358.358 0 01.195.095c.056.057.083.13.083.213a.289.289 0 01-.083.21.362.362 0 01-.197.094c-.528.093-.918.167-1.214.255-.295.088-.485.187-.621.324-.137.138-.23.324-.31.606-.08.283-.145.651-.23 1.147a.329.329 0 01-.093.184.293.293 0 01-.206.075.308.308 0 01-.207-.072.322.322 0 01-.1-.188l-.006-.033c-.085-.486-.149-.845-.228-1.12-.079-.274-.17-.452-.305-.585-.135-.133-.323-.23-.618-.32s-.683-.168-1.21-.273a.353.353 0 01-.2-.096.29.29 0 01-.08-.208c0-.079.023-.153.079-.211a.35.35 0 01.2-.097c.5-.098.869-.176 1.15-.263.282-.087.465-.18.597-.302.132-.12.224-.278.306-.511.082-.236.151-.539.244-.947l.071-.312a.312.312 0 01.102-.183.311.311 0 01.205-.069z'
                    id='aae形状结合'
                  ></path>
                </g>
              </svg>
            `,
    },
    onClick: (_selection: string, _menukey: string, event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      nextTick(() => {
        if (c.mdeditor?.bubble) {
          c.mdeditor.bubble.showBubble();
          const selectionPosition =
            c.mdeditor.bubble.bubbleDom.getBoundingClientRect();
          if (
            !selectionPosition ||
            !selectionPosition.left ||
            !selectionPosition.top
          )
            return;
          const items: MenuItem[] = ibiz.inLineAIUtil.calcContextMenus(
            c.deACMode,
            (tag: string) => {
              c.doInLineAIUIAction(tag, c.model.appId);
            },
          );
          if (items.length === 0) return;
          const { zIndex } = useUIStore();
          const popoverZIndex = zIndex.increment();
          ibiz.inLineAIUtil.showContextMenus(
            // 浮动工具栏的左侧距离
            selectionPosition.left,
            // 浮动工具栏的顶部距离 + 浮动工具栏的高度
            selectionPosition.top + 43,
            items,
            {
              zIndex: popoverZIndex,
              onClose: () => {
                zIndex.decrement();
              },
            },
          );
        }
      });
    },
  });

  const AIChart = Cherry.createMenuHook('AIChart', {
    icon: {
      type: 'svg',
      content: `<svg
                viewBox='0 0 16 16'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                height='1em'
                width='1em'
                preserveAspectRatio='xMidYMid meet'
                focusable='false'
              >
                <g
                  id='aae1.Base基础/1.icon图标/2.normal/ai-star'
                  stroke-width='1'
                  fill-rule='evenodd'
                >
                  <path
                    d='M5.817 1.53l3.158 8.797h.054v.152l1.443 4.021-1.402.001-1.041-2.982H2.495l-1.03 2.982L0 14.5 4.671 1.533l1.146-.003zm7.86 5.424V14.5h-1.213V6.954h1.212zM5.248 3.549l-2.342 6.778h4.706L5.249 3.55zM13.046 0c.075 0 .147.02.204.071a.318.318 0 01.094.181l.064.273c.097.417.17.727.255.968.084.24.177.4.31.523.134.124.318.218.599.306.281.088.65.166 1.15.265a.358.358 0 01.195.095c.056.057.083.13.083.213a.289.289 0 01-.083.21.362.362 0 01-.197.094c-.528.093-.918.167-1.214.255-.295.088-.485.187-.621.324-.137.138-.23.324-.31.606-.08.283-.145.651-.23 1.147a.329.329 0 01-.093.184.293.293 0 01-.206.075.308.308 0 01-.207-.072.322.322 0 01-.1-.188l-.006-.033c-.085-.486-.149-.845-.228-1.12-.079-.274-.17-.452-.305-.585-.135-.133-.323-.23-.618-.32s-.683-.168-1.21-.273a.353.353 0 01-.2-.096.29.29 0 01-.08-.208c0-.079.023-.153.079-.211a.35.35 0 01.2-.097c.5-.098.869-.176 1.15-.263.282-.087.465-.18.597-.302.132-.12.224-.278.306-.511.082-.236.151-.539.244-.947l.071-.312a.312.312 0 01.102-.183.311.311 0 01.205-.069z'
                    id='aae形状结合'
                  ></path>
                </g>
              </svg>
            `,
    },
    onClick: async () => {
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
          zIndex: containerZIndex,
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
              if (isEditing.value) {
                // 可以直接抛出然后再走回填
                currentVal.value = message.realcontent || '';
              } else {
                emit('change', message.realcontent);
              }
            }
          },
        },
      });
    },
  });
  return [AIMenu, AIChart];
}
