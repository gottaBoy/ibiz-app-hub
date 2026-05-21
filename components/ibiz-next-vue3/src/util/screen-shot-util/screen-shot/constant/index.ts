import {
  AIIcon,
  RectIcon,
  TextIcon,
  ArrowIcon,
  BrushIcon,
  CircleIcon,
  MosaicIcon,
  DrawdownIcon,
  CloseIcon,
} from '../icon';
import { IToolbarItem, ToolbarItemType } from '../type';

/**
 * @description 获取默认工具栏
 * @export
 * @returns {*}  {IToolbarItem[]}
 */
export function getDefaultToolbarItems(): IToolbarItem[] {
  return [
    {
      icon: BrushIcon,
      type: ToolbarItemType.BRUSH,
      text: ibiz.i18n.t('util.screenShotUtil.brush'),
      sizeOpts: [
        {
          value: 2,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 4,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 8,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 2,
      color: '#F53340',
    },
    {
      icon: RectIcon,
      type: ToolbarItemType.RECT,
      text: ibiz.i18n.t('util.screenShotUtil.rect'),
      sizeOpts: [
        {
          value: 2,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 4,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 8,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 2,
      color: '#F53340',
    },
    {
      icon: CircleIcon,
      type: ToolbarItemType.CIRCLE,
      text: ibiz.i18n.t('util.screenShotUtil.circle'),
      sizeOpts: [
        {
          value: 2,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 4,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 8,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 2,
      color: '#F53340',
    },
    {
      icon: MosaicIcon,
      type: ToolbarItemType.MOSAIC,
      text: ibiz.i18n.t('util.screenShotUtil.mosaic'),
      sizeOpts: [
        {
          value: 10,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 15,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 20,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 10,
    },
    {
      // 文本注释 - 文字标注
      icon: TextIcon,
      type: ToolbarItemType.TEXT,
      text: ibiz.i18n.t('util.screenShotUtil.text'),
      sizeOpts: [
        {
          value: 16,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 20,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 24,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 16,
      color: '#F53340',
    },
    {
      // 箭头工具 - 箭头标注
      icon: ArrowIcon,
      type: ToolbarItemType.ARROW,
      text: ibiz.i18n.t('util.screenShotUtil.arrow'),
      sizeOpts: [
        {
          value: 2,
          type: 'small',
          text: ibiz.i18n.t('util.screenShotUtil.small'),
        },
        {
          value: 4,
          type: 'medium',
          text: ibiz.i18n.t('util.screenShotUtil.medium'),
        },
        {
          value: 8,
          type: 'big',
          text: ibiz.i18n.t('util.screenShotUtil.big'),
        },
      ],
      size: 2,
      color: '#F53340',
    },
    {
      // 分割项 - 视觉分隔线（无交互）
      type: ToolbarItemType.DIVIDER,
    },
    {
      // 回撤
      icon: DrawdownIcon,
      type: ToolbarItemType.DRAWDOWN,
      text: ibiz.i18n.t('util.screenShotUtil.drawdown'),
    },
    {
      // AI助手 - AI分析/标注
      icon: AIIcon,
      type: ToolbarItemType.AI,
      text: 'AI',
    },
    {
      // 关闭
      icon: CloseIcon,
      type: ToolbarItemType.CLOSE,
      text: ibiz.i18n.t('app.close'),
    },
  ];
}
