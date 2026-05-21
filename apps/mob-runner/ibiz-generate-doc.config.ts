/* eslint-disable import/no-extraneous-dependencies */
import { defineGenerateDocConfig } from '@ibiz-template/cli';

export default defineGenerateDocConfig({
  // 是否移动端
  isMob: true,
  // 输出目录
  outputDir: './docs',
  // 路径配置
  dirPathConfig: {
    coreBasePath: '/root/workspace/template/ibiz-template/packages/core/',
    runtimeBasePath: '/root/workspace/template/ibiz-template/packages/runtime/',
    vueUtilBasePath:
      '/root/workspace/template/ibiz-template/packages/vue3-util/',
    vueWebBasePath: '/root/workspace/template/ibiz-next-vue3/',
    vueMobBasePath: '/root/workspace/template/ibiz-next-mob-vue3/',
  },
  // 链接配置
  linkPathConfig: {
    coreBasePath:
      'https://gitee.com/iBizModeling/ibiz-template/tree/next/packages/core',
    runtimeBasePath:
      'https://gitee.com/iBizModeling/ibiz-template/tree/next/packages/runtime',
    vueUtilBasePath:
      'https://gitee.com/iBizModeling/ibiz-template/tree/next/packages/vue3-util',
    vueWebBasePath: 'https://gitee.com/iBizModeling/ibiz-next-vue3/tree/next/',
    vueMobBasePath:
      'https://gitee.com/iBizModeling/ibiz-next-mob-vue3/tree/next/',
  },
  // 发布文件清单配置
  items: [
    // --------全局配置START-------------
    {
      type: 'CONFIG',
      outputFileName: 'global-config',
      mainFilePath: '',
      fieldFilePath:
        './src/interface/api/common/global-config/i-api-global-config.ts',
      eventFilePath: '',
      linkFilePath: '',
      category: 'cfg',
    },
    // --------全局配置END-------------
    // --------环境配置START-------------
    {
      type: 'ENVIRONMENTS',
      outputFileName: 'environment-config',
      mainFilePath: '',
      fieldFilePath: './src/interface/api/environment/i-environment.ts',
      eventFilePath: '',
      linkFilePath: '',
      category: 'cfg',
    },
    // --------环境配置END-------------
    // --------视图START-------------
    {
      type: 'VIEW',
      outputFileName: 'view',
      linkFilePath: './src/view/common/view.tsx',
      fieldFilePath: './src/interface/api/state/view/i-api-view.state.ts',
      mainFilePath:
        './src/interface/api/controller/view/i-api-view.controller.ts',
      eventFilePath: './src/interface/controller/event/view/i-view.event.ts',
      category: 'common',
    },
    // --------视图END-------------
    // --------特殊部件（面板和视图部件面板）START-------------
    {
      type: 'CTRL',
      outputFileName: 'panel',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/control/panel/panel/panel.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-panel.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-panel.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-panel.event.ts',
      category: 'common',
    },
    {
      type: 'CTRL',
      outputFileName: 'view-layout-panel',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/control/panel/view-layout-panel/view-layout-panel.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-view-layout-panel.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-view-layout-panel.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-view-layout-panel.event.ts',
      category: 'common',
    },
    // --------特殊部件（面板和视图部件面板）END-------------
    // --------特殊面板项START-------------
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-container-group',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container-group/panel-container-group.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container-group/panel-container-group.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container-group/panel-container-group.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'scroll-container',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/scroll-container/scroll-container/scroll-container.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/scroll-container/scroll-container/scroll-container.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'grid-container',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/grid-container/grid-container.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/grid-container/grid-container.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/grid-container/grid-container.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-container-tabs',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container/panel-container.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container/panel-container.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container-tabs/panel-container-tabs.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'single-data-container',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/single-data-container/single-data-container.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/single-data-container/single-data-container.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/single-data-container/single-data-container.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'multi-data-container',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container/multi-data-container.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container/multi-data-container.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container/multi-data-container.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'multi-data-container-raw',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container-raw/multi-data-container-raw.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container-raw/multi-data-container-raw.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/multi-data-container-raw/multi-data-container-raw.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-tab-page',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-tab-page/panel-tab-page.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'nav-pos',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/nav-pos/nav-pos.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/nav-pos/nav-pos.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/nav-pos/nav-pos.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-item-render',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-item-render/panel-item-render.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-item-render/panel-item-render.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-rawitem',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-rawitem/panel-rawitem.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-rawitem/panel-rawitem.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-container',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container/panel-container.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container/panel-container.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-container/panel-container.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-field',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-field/panel-field.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-field/panel-field.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-field/panel-field.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-ctrl-view-page-caption',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-ctrl-view-page-caption/panel-ctrl-view-page-caption.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-ctrl-view-page-caption/panel-ctrl-view-page-caption.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-ctrl-view-page-caption/panel-ctrl-view-page-caption.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-ctrl-pos',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-ctrl-pos/panel-ctrl-pos.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/panel-ctrl-pos/panel-ctrl-pos.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'teleport-placeholder',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/teleport-placeholder/teleport-placeholder.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/teleport-placeholder/teleport-placeholder.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/teleport-placeholder/teleport-placeholder.tsx',
      category: 'common',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'auth-wxmp-qrcode',
      mainFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/auth-wxmp-qrcode/auth-wxmp-qrcode.controller.ts',
      fieldFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/auth-wxmp-qrcode/auth-wxmp-qrcode.state.ts',
      eventFilePath: '',
      linkFilePath:
        '/root/workspace/template/ibiz-template/packages/vue3-util/src/panel-component/auth-wxmp-qrcode/auth-wxmp-qrcode.tsx',
      category: 'common',
    },
    // --------特殊面板项END-------------
    // --------部件START-------------
    {
      type: 'CTRL',
      outputFileName: 'app-menu',
      linkFilePath: './src/control/app-menu/app-menu.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-app-menu.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-app-menu.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-app-menu.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'caption-bar',
      linkFilePath: './src/control/caption-bar/caption-bar.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-caption-bar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-caption-bar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-caption-bar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'edit-form',
      linkFilePath: './src/control/form/edit-form/edit-form.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-edit-form.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-edit-form.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-edit-form.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'search-form',
      linkFilePath: './src/control/form/search-form/search-form.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-search-form.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-search-form.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-search-form.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'search-bar',
      linkFilePath: './src/control/search-bar/search-bar.tsx',
      fieldFilePath:
        './src/interface/api/state/control/search-bar/i-api-search-bar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-search-bar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-search-bar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'list',
      linkFilePath: './src/control/list/list/list.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-list.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-list.controller.ts',
      eventFilePath: './src/interface/controller/event/control/i-list.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'md-ctrl',
      linkFilePath: './src/control/list/md-ctrl/md-ctrl.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-mob-md-ctrl.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-mob-md-ctrl.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-mob-md-ctrl.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'tab-exp-panel',
      linkFilePath: './src/control/tab-exp-panel/tab-exp-panel.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-tab-exp-panel.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-tab-exp-panel.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-tab-exp-panel.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'toolbar',
      linkFilePath: './src/control/toolbar/toolbar.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-toolbar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-toolbar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-toolbar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'tree',
      linkFilePath: './src/control/tree/tree.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-tree.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-tree.controller.ts',
      eventFilePath: './src/interface/controller/event/control/i-tree.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'tree-exp-bar',
      linkFilePath: './src/control/tree-exp-bar/tree-exp-bar.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-tree-exp-bar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-tree-exp-bar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-tree-exp-bar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'data-view',
      linkFilePath: './src/control/data-view/data-view.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-data-view-control.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-data-view-control.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-data-view-control.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'drbar',
      linkFilePath: './src/control/drbar/drbar.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-drbar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-drbar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-drbar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'drtab',
      linkFilePath: './src/control/drtab/drtab.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-drtab.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-drtab.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-drtab.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'chart',
      linkFilePath: './src/control/chart/chart.tsx',
      fieldFilePath: './src/interface/api/state/control/i-api-chart.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-chart.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-chart.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'calendar',
      linkFilePath: './src/control/calendar/calendar.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-calendar.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-calendar.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-calendar.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'dashboard',
      linkFilePath: './src/control/dashboard/dashboard.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-dashboard.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-dashboard.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-dashboard.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'pickup-view-panel',
      linkFilePath: './src/control/pickup-view-panel/pickup-view-panel.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-pickup-view-panel.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-pickup-view-panel.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-pickup-view-panel.event.ts',
    },
    {
      type: 'CTRL',
      outputFileName: 'wizard-panel',
      linkFilePath: './src/control/wizard-panel/wizard-panel.tsx',
      fieldFilePath:
        './src/interface/api/state/control/i-api-wizard-panel.state.ts',
      mainFilePath:
        './src/interface/api/controller/control/i-api-wizard-panel.controller.ts',
      eventFilePath:
        './src/interface/controller/event/control/i-wizard-panel.event.ts',
    },
    // --------编辑器组件START-------------
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/span/span/span.tsx',
      outputFileName: 'span',
      fieldFilePath: './src/props/editor/span.ts',
      mainFilePath: './src/editor/span/span/span.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/span/span-link/span-link.tsx',
      outputFileName: 'span-link',
      fieldFilePath: './src/props/editor/span.ts',
      mainFilePath: './src/editor/span/span-link/span-link.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/text-box/input/input.tsx',
      outputFileName: 'input',
      fieldFilePath: './src/props/editor/text-box.ts',
      mainFilePath: './src/editor/text-box/input/input.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/text-box/ibiz-input-number/ibiz-input-number.tsx',
      outputFileName: 'input-number',
      fieldFilePath: './src/props/editor/input-number.ts',
      mainFilePath:
        './src/editor/text-box/ibiz-input-number/ibiz-input-number.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/check-box/ibiz-checkbox/ibiz-checkbox.tsx',
      outputFileName: 'check-box',
      fieldFilePath: './src/props/editor/check-box.ts',
      mainFilePath: './src/editor/check-box/ibiz-checkbox/ibiz-checkbox.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/check-box-list/ibiz-checkbox-list/ibiz-checkbox-list.tsx',
      outputFileName: 'check-box-list',
      fieldFilePath: './src/props/editor/check-box-list.ts',
      mainFilePath:
        './src/editor/check-box-list/ibiz-checkbox-list/ibiz-checkbox-list.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/dropdown-list/ibiz-dropdown/ibiz-dropdown.tsx',
      outputFileName: 'dropdown',
      fieldFilePath: './src/props/editor/dropdown-list.ts',
      mainFilePath:
        './src/editor/dropdown-list/ibiz-dropdown/ibiz-dropdown.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/dropdown-list/ibiz-dropdown-list/ibiz-dropdown-list.tsx',
      outputFileName: 'dropdown-list',
      fieldFilePath: './src/props/editor/dropdown-list.ts',
      mainFilePath:
        './src/editor/dropdown-list/ibiz-dropdown-list/ibiz-dropdown-list.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/number-range/ibiz-number-range-picker/ibiz-number-range-picker.tsx',
      outputFileName: 'number-range-picker',
      fieldFilePath: './src/props/editor/number-range.ts',
      mainFilePath:
        './src/editor/number-range/ibiz-number-range-picker/ibiz-number-range-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/raw/ibiz-raw/ibiz-raw.tsx',
      outputFileName: 'raw',
      fieldFilePath: './src/props/editor/raw.ts',
      mainFilePath: './src/editor/raw/ibiz-raw/ibiz-raw.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/stepper/ibiz-stepper/ibiz-stepper.tsx',
      outputFileName: 'stepper',
      fieldFilePath: './src/props/editor/stepper.ts',
      mainFilePath: './src/editor/stepper/ibiz-stepper/ibiz-stepper.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/stepper/ibiz-switch/ibiz-switch.tsx',
      outputFileName: 'switch',
      fieldFilePath: './src/props/editor/switch.ts',
      mainFilePath: './src/editor/switch/ibiz-switch/ibiz-switch.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/slider/ibiz-slider/ibiz-slider.tsx',
      outputFileName: 'slider',
      fieldFilePath: './src/props/editor/slider.ts',
      mainFilePath: './src/editor/slider/ibiz-slider/ibiz-slider.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/radio-button-list/ibiz-radio/ibiz-radio.tsx',
      outputFileName: 'radio-button-list',
      fieldFilePath: './src/props/editor/radio-button-list.ts',
      mainFilePath: './src/editor/radio-button-list/ibiz-radio/ibiz-radio.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/rate/ibiz-rate/ibiz-rate.tsx',
      outputFileName: 'rate',
      fieldFilePath: './src/props/editor/rate.ts',
      mainFilePath: './src/editor/rate/ibiz-rate/ibiz-rate.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/cascader/ibiz-cascader/ibiz-cascader.tsx',
      outputFileName: 'cascader',
      fieldFilePath: './src/props/editor/cascader.ts',
      mainFilePath: './src/editor/cascader/ibiz-cascader/ibiz-cascader.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/color-picker/ibiz-color-picker/ibiz-color-picker.tsx',
      outputFileName: 'color-picker',
      fieldFilePath: './src/props/editor/color-picker.ts',
      mainFilePath:
        './src/editor/color-picker/ibiz-color-picker/ibiz-color-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/html/quill-editor/quill-editor.tsx',
      outputFileName: 'html',
      fieldFilePath: './src/props/editor/html.ts',
      mainFilePath: './src/editor/html/quill-editor/quill-editor.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/markdown/ibiz-markdown-editor/ibiz-markdown-editor.tsx',
      outputFileName: 'markdown',
      fieldFilePath: './src/props/editor/markdown.ts',
      mainFilePath:
        './src/editor/markdown/ibiz-markdown-editor/ibiz-markdown-editor.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/upload/ibiz-file-upload/ibiz-file-upload.tsx',
      outputFileName: 'file-upload',
      fieldFilePath: './src/props/editor/upload.ts',
      mainFilePath: './src/editor/upload/ibiz-file-upload/ibiz-file-upload.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/upload/ibiz-image-select/ibiz-image-select.tsx',
      outputFileName: 'image-select',
      fieldFilePath: './src/props/editor/upload.ts',
      mainFilePath:
        './src/editor/upload/ibiz-image-select/ibiz-image-select.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/upload/ibiz-image-upload/ibiz-image-upload.tsx',
      outputFileName: 'image-upload',
      fieldFilePath: './src/props/editor/upload.ts',
      mainFilePath:
        './src/editor/upload/ibiz-image-upload/ibiz-image-upload.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/data-picker/ibiz-mpicker/ibiz-mpicker.tsx',
      outputFileName: 'data-mpicker',
      fieldFilePath: './src/props/editor/data-picker.ts',
      mainFilePath: './src/editor/data-picker/ibiz-mpicker/ibiz-mpicker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/data-picker/ibiz-picker/ibiz-picker.tsx',
      outputFileName: 'data-picker',
      fieldFilePath: './src/props/editor/data-picker.ts',
      mainFilePath: './src/editor/data-picker/ibiz-picker/ibiz-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/data-picker/ibiz-picker-select-view/ibiz-picker-select-view.tsx',
      outputFileName: 'picker-select-view',
      fieldFilePath: './src/props/editor/data-picker.ts',
      mainFilePath:
        './src/editor/data-picker/ibiz-picker-select-view/ibiz-picker-select-view.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/date-picker/ibiz-date-picker/ibiz-date-picker.tsx',
      outputFileName: 'date-picker',
      fieldFilePath: './src/props/editor/date-picker.ts',
      mainFilePath:
        './src/editor/date-picker/ibiz-date-picker/ibiz-date-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/date-range/ibiz-date-range-picker/ibiz-date-range-picker.tsx',
      outputFileName: 'date-range-picker',
      fieldFilePath: './src/props/editor/date-range.ts',
      mainFilePath:
        './src/editor/date-range/ibiz-date-range-picker/ibiz-date-range-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/upload/ibiz-carousel/ibiz-carousel.tsx',
      outputFileName: 'ibiz-carousel',
      fieldFilePath: './src/props/editor/upload.ts',
      mainFilePath: './src/editor/upload/ibiz-carousel/ibiz-carousel.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/upload/ibiz-image-cropping/ibiz-image-cropping.tsx',
      outputFileName: 'image-cropping',
      fieldFilePath: './src/props/editor/upload.ts',
      mainFilePath:
        './src/editor/upload/ibiz-image-cropping/ibiz-image-cropping.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath:
        './src/editor/dropdown-list/ibiz-emoji-picker/ibiz-emoji-picker.tsx',
      outputFileName: 'emoji-picker',
      fieldFilePath: './src/props/editor/dropdown-list.ts',
      mainFilePath:
        './src/editor/dropdown-list/ibiz-emoji-picker/ibiz-emoji-picker.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    {
      type: 'EDITOR',
      linkFilePath: './src/editor/qrcode/ibiz-qrcode/ibiz-qrcode.tsx',
      outputFileName: 'qrcode',
      fieldFilePath: './src/props/editor/raw.ts',
      mainFilePath: './src/editor/qrcode/ibiz-qrcode/ibiz-qrcode.tsx',
      eventFilePath: './src/props/editor/common.ts',
    },
    // --------编辑器组件END-------------
    // --------面板项组件START-------------
    {
      type: 'PANEL-ITEM',
      outputFileName: 'auth-sso',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath: './src/panel-component/auth-sso/auth-sso.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'auth-userinfo',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath: './src/panel-component/auth-userinfo/auth-userinfo.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'nav-pos-index',
      mainFilePath:
        './src/panel-component/nav-pos-index/nav-pos-index.controller.ts',
      fieldFilePath:
        './src/panel-component/nav-pos-index/nav-pos-index.state.ts',
      eventFilePath: '',
      linkFilePath: './src/panel-component/nav-pos-index/nav-pos-index.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-app-title',
      mainFilePath:
        './src/panel-component/panel-app-title/panel-app-title.controller.ts',
      fieldFilePath:
        './src/panel-component/panel-app-title/panel-app-title.state.ts',
      eventFilePath: '',
      linkFilePath: './src/panel-component/panel-app-title/panel-app-title.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-button',
      mainFilePath:
        './src/panel-component/panel-button/panel-button.controller.ts',
      fieldFilePath: './src/panel-component/panel-button/panel-button.state.ts',
      eventFilePath: '',
      linkFilePath: './src/panel-component/panel-button/panel-button.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-button-list',
      mainFilePath:
        './src/panel-component/panel-button-list/panel-button-list.controller.ts',
      fieldFilePath:
        './src/panel-component/panel-button-list/panel-button-list.state.ts',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/panel-button-list/panel-button-list.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-tab-panel',
      mainFilePath:
        './src/panel-component/panel-tab-panel/panel-tab-panel.controller.ts',
      fieldFilePath:
        './src/panel-component/panel-tab-panel/panel-tab-panel.state.ts',
      eventFilePath: '',
      linkFilePath: './src/panel-component/panel-tab-panel/panel-tab-panel.tsx',
    },
    // {
    //   type: 'PANEL-ITEM',
    //   outputFileName: 'mob-async-action',
    //   mainFilePath:
    //     './src/panel-component/async-action/mob-async-action.controller.ts',
    //   fieldFilePath: '',
    //   eventFilePath: '',
    //   linkFilePath: './src/panel-component/async-action/mob-async-action.tsx',
    // },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-carousel',
      mainFilePath:
        './src/panel-component/panel-carousel/panel-carousel.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath: './src/panel-component/panel-carousel/panel-carousel.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'panel-video-player',
      mainFilePath:
        './src/panel-component/panel-video-player/panel-video-player.controller.ts',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/panel-video-player/panel-video-player.tsx',
    },
    // {
    //   type: 'PANEL-ITEM',
    //   outputFileName: 'user-message',
    //   mainFilePath:
    //     './src/panel-component/user-message/user-message.controller.ts',
    //   fieldFilePath: '',
    //   eventFilePath: '',
    //   linkFilePath: './src/panel-component/user-message/user-message.tsx',
    // },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'view-content-panel-container',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/view-content-panel-container/view-content-panel-container.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'view-footer-panel-container',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/view-footer-panel-container/view-footer-panel-container.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'view-header-panel-container',
      mainFilePath: '',
      fieldFilePath: '',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/view-header-panel-container/view-header-panel-container.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'wf-action-button',
      mainFilePath:
        './src/panel-component/wf-action-button/wf-action-button.controller.ts',
      fieldFilePath:
        './src/panel-component/wf-action-button/wf-action-button.state.ts',
      eventFilePath: '',
      linkFilePath:
        './src/panel-component/wf-action-button/wf-action-button.tsx',
    },
    {
      type: 'PANEL-ITEM',
      outputFileName: 'wf-step-trace',
      mainFilePath:
        './src/panel-component/wf-step-trace/wf-step-trace.controller.ts',
      fieldFilePath:
        './src/panel-component/wf-step-trace/wf-step-trace.state.ts',
      eventFilePath: '',
      linkFilePath: './src/panel-component/wf-step-trace/wf-step-trace.tsx',
    },
    // --------面板项组件END-------------
  ],
});
