import { CodeListService } from '@ibiz-template/runtime';
import {
  IAppCodeList,
  IAppDataEntity,
  IApplication,
  IAppView,
} from '@ibiz/model-core';

export async function registerCodeList(
  codeListService: CodeListService,
): Promise<void> {
  const setCodeList = (model: IData) => {
    codeListService.setCodeList(model as IAppCodeList);
  };
  setCodeList(await import('./code-list/code-list-46').then(m => m.default));
  setCodeList(await import('./code-list/code-list-50').then(m => m.default));
  setCodeList(await import('./code-list/code-list-81').then(m => m.default));
  setCodeList(await import('./code-list/code-list-82').then(m => m.default));
  setCodeList(await import('./code-list/code-list-83').then(m => m.default));
  setCodeList(await import('./code-list/code-list-85').then(m => m.default));
  setCodeList(await import('./code-list/sys-operator').then(m => m.default));
  setCodeList(await import('./code-list/wf-states').then(m => m.default));
  setCodeList(await import('./code-list/yes-no').then(m => m.default));
  setCodeList(
    await import('./code-list/extension-def-read-only-mode').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/extension-de-logic-sub-type').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/extension-auto-flow-type').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/extension-enable-action').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/extension-enable-field-change').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/extension-extension-status').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/extension-log-state').then(m => m.default),
  );
  setCodeList(await import('./code-list/field-data-type').then(m => m.default));
  setCodeList(
    await import('./code-list/field-data-type-simple').then(m => m.default),
  );
  setCodeList(await import('./code-list/field-type').then(m => m.default));
  setCodeList(await import('./code-list/mock-code-list').then(m => m.default));
  setCodeList(
    await import('./code-list/mock-code-list-2').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-3').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-allitem').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-cache').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-css').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-dsconditions').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/mock-code-list-dynamic').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-empty').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-field').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-globalcache').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-localcachetag').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/mock-code-list-num').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-numormode').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-static').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-textormode').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-textseparator').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/mock-code-list-threshold').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-tree').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-code-list-valueseparator').then(
      m => m.default,
    ),
  );
  setCodeList(
    await import('./code-list/mock-bi-chart-type-2').then(m => m.default),
  );
  setCodeList(
    await import('./code-list/mock-cl-categories').then(m => m.default),
  );
  setCodeList(await import('./code-list/mock-cl-region').then(m => m.default));
  setCodeList(await import('./code-list/mock-cl-sample').then(m => m.default));
  setCodeList(await import('./code-list/mock-cl-status').then(m => m.default));
  setCodeList(
    await import('./code-list/mock-wizard-state').then(m => m.default),
  );
}

export async function getAppDataEntityModel(
  name: string,
): Promise<IAppDataEntity> {
  const _name = name.toLowerCase();
  switch (_name) {
    case 'web.detail':
    case 'detail':
      return import('./entities/detail').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdefield':
    case 'psdefield':
      return import('./entities/psde-field').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdemslogic':
    case 'psdemslogic':
      return import('./entities/psdems-logic').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pscoreprdfunc':
    case 'pscoreprdfunc':
      return import('./entities/ps-core-prd-func').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.attachment':
    case 'attachment':
      return import('./entities/attachment').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pssysbicubedimension':
    case 'pssysbicubedimension':
      return import('./entities/ps-sys-bi-cube-dimension').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pssysbicube':
    case 'pssysbicube':
      return import('./entities/ps-sys-bi-cube').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdelogicnode':
    case 'psdelogicnode':
      return import('./entities/psde-logic-node').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.common_flow':
    case 'common_flow':
      return import('./entities/common-flow').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdelogic':
    case 'psdelogic':
      return import('./entities/psde-logic').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pssysbicubemeasure':
    case 'pssysbicubemeasure':
      return import('./entities/ps-sys-bi-cube-measure').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.activity':
    case 'activity':
      return import('./entities/activity').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.comment':
    case 'comment':
      return import('./entities/comment').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pssysbireport':
    case 'pssysbireport':
      return import('./entities/ps-sys-bi-report').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdelogiclink':
    case 'psdelogiclink':
      return import('./entities/psde-logic-link').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.region':
    case 'region':
      return import('./entities/region').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.psdeform':
    case 'psdeform':
      return import('./entities/psde-form').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.master':
    case 'master':
      return import('./entities/master').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.about':
    case 'about':
      return import('./entities/about').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.category':
    case 'category':
      return import('./entities/category').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.report':
    case 'report':
      return import('./entities/report').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pssysbireportitem':
    case 'pssysbireportitem':
      return import('./entities/ps-sys-bi-report-item').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.extend_log':
    case 'extend_log':
      return import('./entities/extend-log').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.appdetail':
    case 'appdetail':
      return import('./entities/appdetail').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.pswfversion':
    case 'pswfversion':
      return import('./entities/pswf-version').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.dyna_dashboard':
    case 'dyna_dashboard':
      return import('./entities/dyna-dashboard').then(
        m => m.default as unknown as IAppDataEntity,
      );
    default:
      throw new Error(`无法找到实体模型：${name}`);
  }
}
export async function getAppViewModel(name: string): Promise<IAppView> {
  const _name = name.toLowerCase();
  switch (_name) {
    case 'master_list_view':
      return import('./views/master-list-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_event_and_call':
      return import('./views/master-drbar-event-and-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_ability':
      return import('./views/master-drbar-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_logic_plugin':
      return import('./views/master-logic-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_select':
      return import('./views/master-tree-select').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_date_range':
      return import('./views/master-editor-date-range').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_rowedit':
      return import('./views/master-tree-grid-ex-rowedit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_dyna_visible':
      return import('./views/master-kanban-dyna-visible').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_refreshmode':
      return import('./views/master-tree-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_timeline':
      return import('./views/master-calendar-rightnav-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_actions_federation':
      return import('./views/master-actions-federation').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_advanced':
      return import('./views/master-searchform-advanced').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_refresh_default':
      return import('./views/master-grid-refresh-default').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_base':
      return import('./views/master-toolbar-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ctrl_event_trigger':
      return import('./views/master-ctrl-event-trigger').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_event_and_call':
      return import('./views/region-meditpanel-event-and-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_event_tab_exp_view':
      return import('./views/master-form-event-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_theme_plugin':
      return import('./views/master-theme-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_anchor':
      return import('./views/master-editform-anchor').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_spanlink':
      return import('./views/master-editor-spanlink').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_sort_exp':
      return import('./views/master-card-sort-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_show_edit':
      return import('./views/master-drtab-show-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_logic_event':
      return import('./views/master-searchbar-logic-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_user':
      return import('./views/master-calendar-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_design_edit':
      return import('./views/master-form-design-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_draggable':
      return import('./views/master-kanban-swimlane-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_container_datasource':
      return import('./views/master-panel-container-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_groupstyle2':
      return import('./views/master-kanban-swimlane-groupstyle-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'top_menu':
      return import('./views/top-menu').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_exp_grid':
      return import('./views/master-counter-exp-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_grid_layout':
      return import('./views/master-card-grid-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_day':
      return import('./views/master-calendar-contextmenu-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_week':
      return import('./views/master-calendar-nav-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_base_exp':
      return import('./views/master-kanban-base-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_usr4409_edit_view':
      return import('./views/master-usr-4409-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_group_draggable':
      return import('./views/master-card-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_agg_all':
      return import('./views/master-grid-agg-all').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_nodetabexpview':
      return import('./views/master-ui-logic-nodetabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_percent':
      return import('./views/master-grid-percent').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_cardstyle2':
      return import('./views/master-card-cardstyle-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_dropdown':
      return import('./views/master-drtab-dropdown').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_dyna_blank':
      return import('./views/master-list-dyna-blank').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_nocache_list_exp_view':
      return import('./views/region-list-nocache-list-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_load_mode_exp':
      return import('./views/master-card-load-mode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_defaultexpandall':
      return import('./views/master-list-defaultexpandall').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_container':
      return import('./views/master-panel-panel-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_medit_view9':
      return import('./views/region-medit-view-9').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar':
      return import('./views/master-drbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_plugin':
      return import('./views/master-ui-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_timeline':
      return import('./views/master-calendar-nav-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kannam_order_draggable':
      return import('./views/master-kannam-order-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_gridmpickupview':
      return import('./views/master-pickup-gridmpickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_searchbuttons':
      return import('./views/master-panel-searchbuttons').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_count':
      return import('./views/master-drbar-count').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_grid_design':
      return import('./views/category-grid-design').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_exp_view':
      return import('./views/master-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_draggable_edit':
      return import('./views/master-kanban-draggable-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_markdown':
      return import('./views/master-editor-markdown').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_edit_view':
      return import('./views/psde-logic-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_eventtabexpview':
      return import('./views/region-tree-grid-eventtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_logic':
      return import('./views/master-form-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_multiple':
      return import('./views/master-codelist-multiple').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane':
      return import('./views/master-kanban-swimlane').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_cssandicon':
      return import('./views/master-list-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_plugin':
      return import('./views/master-editor-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_cardpickupcontrolview':
      return import('./views/master-pickup-cardpickupcontrolview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_area':
      return import('./views/master-map-area').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_day':
      return import('./views/master-gantt-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_cache':
      return import('./views/master-codelist-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_week':
      return import('./views/master-calendar-bottomnav-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_count_default':
      return import('./views/master-searchbar-count-default').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_message':
      return import('./views/master-view-message').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_pickup_data_view':
      return import('./views/region-pickup-data-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_input':
      return import('./views/master-editor-input').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_nav_bottom':
      return import('./views/master-grid-nav-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_call':
      return import('./views/master-tree-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_expand':
      return import('./views/master-calendar-expand').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_form_sort':
      return import('./views/master-editform-repeater-form-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_ctrl_pos':
      return import('./views/master-panel-panel-ctrl-pos').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_quick_search':
      return import('./views/master-quick-search').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_no_cache_data_view_exp_view':
      return import('./views/master-no-cache-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_nav_param_tab_exp_view':
      return import('./views/master-chart-exp-nav-param-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_edit_view':
      return import('./views/master-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treegridex_nav_bottom':
      return import('./views/master-treegridex-nav-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_counter_disabled':
      return import('./views/master-drbar-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_dropdown_list':
      return import('./views/master-editor-dropdown-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_grid_tab_exp_view':
      return import('./views/master-chart-grid-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_view_line':
      return import('./views/master-chart-exp-view-line').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout_month':
      return import('./views/master-calendar-layout-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_switch':
      return import('./views/master-editor-switch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_backend':
      return import('./views/master-ui-action-backend').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_appgloable_datasource':
      return import('./views/master-tree-appgloable-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_cacherefresh':
      return import('./views/region-tree-grid-cacherefresh').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_colupdate_tab_exp_view':
      return import('./views/region-tree-grid-colupdate-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'ps_core_prd_func_tree_exp_view':
      return import('./views/ps-core-prd-func-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_picker_embed_view':
      return import('./views/master-data-picker-embed-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_edit_cell':
      return import('./views/master-grid-edit-cell').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_empty':
      return import('./views/master-card-empty').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_empty':
      return import('./views/master-list-empty').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_group_draggable':
      return import('./views/master-kanban-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_rowdetail_nav':
      return import('./views/master-list-rowdetail-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_logic_event':
      return import('./views/master-calendar-logic-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_disable_sort':
      return import('./views/master-card-disable-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_left_top_anchor_edit_view':
      return import('./views/master-left-top-anchor-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_nav':
      return import('./views/region-grid-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_contextmenu':
      return import('./views/master-tree-contextmenu').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_group':
      return import('./views/master-drbar-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_edit_view':
      return import('./views/detail-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_scroll_container':
      return import('./views/master-panel-scroll-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_meditpanel_embed':
      return import('./views/detail-meditpanel-embed').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_month':
      return import('./views/master-calendar-rightnav-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_codelist_group':
      return import('./views/master-kanban-codelist-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_logic_script':
      return import('./views/master-drtab-logic-script').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_event_tab_exp_view':
      return import('./views/master-wizard-event-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_link':
      return import('./views/master-ui-logic-link').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_state':
      return import('./views/master-wizard-state').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_dashboard_carousel_grid':
      return import('./views/master-data-dashboard-carousel-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_refreshmode_exp':
      return import('./views/master-card-refreshmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_msg_pos':
      return import('./views/master-view-msg-pos').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_base':
      return import('./views/master-tabexppanel-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_edit_view':
      return import('./views/master-pickup-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_enablegrouphidden':
      return import('./views/master-kanban-swimlane-enablegrouphidden').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_layout_exp':
      return import('./views/master-card-layout-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_edit':
      return import('./views/master-grid-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_base':
      return import('./views/master-drtab-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_user':
      return import('./views/master-calendar-nav-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel':
      return import('./views/master-panel').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_grid_design_edit':
      return import('./views/category-grid-design-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_expand':
      return import('./views/master-grid-expand').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_cursession_datasource':
      return import('./views/master-tree-cursession-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_order':
      return import('./views/master-grid-order').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_save_change':
      return import('./views/master-save-change').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_built_in_toobar_exp':
      return import('./views/master-list-built-in-toobar-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_call':
      return import('./views/master-wizard-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_draggable_edit':
      return import('./views/master-card-draggable-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_detail_grid_view':
      return import('./views/region-detail-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_multi_data_container_raw':
      return import('./views/master-panel-multi-data-container-raw').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_rawitem':
      return import('./views/master-panel-panel-rawitem').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_codelist_group':
      return import('./views/master-card-codelist-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_container':
      return import('./views/master-panel-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_logic_hidden':
      return import('./views/master-drtab-logic-hidden').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treegridex_column_uiaction_group':
      return import('./views/master-treegridex-column-uiaction-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_ability':
      return import('./views/master-searchform-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_ext_view1':
      return import('./views/master-list-ext-view-1').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_form_style2':
      return import('./views/master-editform-repeater-form-style-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_view':
      return import('./views/master-data-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_custom_cond':
      return import('./views/master-map-custom-cond').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_update_back':
      return import('./views/master-grid-update-back').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_hover':
      return import('./views/master-form-hover').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_page':
      return import('./views/master-kanban-page').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_view':
      return import('./views/master-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_action_plugin':
      return import('./views/master-de-action-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_cache_refreshmode':
      return import('./views/master-kanban-cache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_params':
      return import('./views/master-de-logic-params').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_horizontal_chart':
      return import('./views/master-horizontal-chart').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_noheader':
      return import('./views/region-tree-grid-noheader').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_modal_data_switching_edit':
      return import('./views/master-modal-data-switching-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_upload_image_preview':
      return import('./views/master-upload-image-preview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_view':
      return import('./views/master-kanban-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_enablefullscreen':
      return import('./views/master-kanban-enablefullscreen').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_localsort':
      return import('./views/region-tree-grid-localsort').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_edit_view':
      return import('./views/region-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_right_nav':
      return import('./views/master-card-right-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_tabexpview':
      return import('./views/master-pickup-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_export_front':
      return import('./views/master-grid-export-front').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_sort':
      return import('./views/master-grid-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_value_display':
      return import('./views/master-grid-value-display').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_left':
      return import('./views/master-tabexppanel-left').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action':
      return import('./views/master-ui-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_counter':
      return import('./views/master-panel-counter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchformitemevent':
      return import('./views/master-searchformitemevent').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard':
      return import('./views/master-wizard').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_ability':
      return import('./views/master-grid-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_cascadeselectpickup':
      return import('./views/master-tree-cascadeselectpickup').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_wrap':
      return import('./views/master-grid-wrap').then(
        m => m.default as unknown as IAppView,
      );
    case 'apploginview':
      return import('./views/apploginview').then(
        m => m.default as unknown as IAppView,
      );
    case 'about_drawer_hidden_mask':
      return import('./views/about-drawer-hidden-mask').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_regular':
      return import('./views/master-de-logic-regular').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_logic_count':
      return import('./views/master-drbar-logic-count').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_batchtoolbar':
      return import('./views/master-kanban-swimlane-batchtoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_count_searchbar':
      return import('./views/master-count-searchbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_cache_tab_exp_view':
      return import('./views/master-calendar-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tab_exp_view':
      return import('./views/master-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'func_demo':
      return import('./views/func-demo').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_navparam_list_exp_view':
      return import('./views/region-list-navparam-list-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_event':
      return import('./views/region-tree-grid-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_counter_disabled':
      return import('./views/master-tree-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_paging_load':
      return import('./views/master-list-paging-load').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_treegrid_column_uiaction_group':
      return import('./views/region-treegrid-column-uiaction-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout_day':
      return import('./views/master-calendar-layout-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_param_tab_exp_view':
      return import('./views/master-calendar-nav-param-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_built_in_toolbar_exp':
      return import('./views/master-card-built-in-toolbar-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_attr':
      return import('./views/master-panel-attr').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_export':
      return import('./views/master-grid-export').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_custom':
      return import('./views/master-ui-action-custom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_picker_link':
      return import('./views/master-data-picker-link').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_dropdown_emoji':
      return import('./views/master-dropdown-emoji').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_report_view':
      return import('./views/master-report-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder':
      return import('./views/master-teleport-placeholder').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_container_group':
      return import('./views/master-panel-panel-container-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_refreshmode':
      return import('./views/master-grid-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_fast_new':
      return import('./views/master-card-fast-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_drag':
      return import('./views/master-tree-drag').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_ctrl_federation':
      return import('./views/master-tree-ctrl-federation').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_event_edit_view':
      return import('./views/master-view-event-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_candlestick':
      return import('./views/master-chart-candlestick').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_instrument':
      return import('./views/master-chart-instrument').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar':
      return import('./views/master-toolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_navparam_grid_exp_view':
      return import('./views/region-grid-navparam-grid-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar':
      return import('./views/master-searchbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_mode_tab_exp_view':
      return import('./views/master-chart-group-mode-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_daterange':
      return import('./views/master-calendar-daterange').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_counter_disabled':
      return import('./views/master-drtab-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_showmode':
      return import('./views/master-calendar-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data_week':
      return import('./views/master-calendar-multiple-data-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_date_picker':
      return import('./views/master-editor-date-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_default_style':
      return import('./views/master-card-default-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_open_mode':
      return import('./views/master-view-open-mode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_tabexpview':
      return import('./views/master-codelist-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_ability':
      return import('./views/master-gantt-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_onlydata':
      return import('./views/master-grid-onlydata').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_timeline':
      return import('./views/master-calendar-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_pickup_grid_view':
      return import('./views/category-pickup-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_right_anchor_edit_view':
      return import('./views/master-right-anchor-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_uilogic':
      return import('./views/master-ui-action-uilogic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_date_range_select':
      return import('./views/master-editor-date-range-select').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_data_picker_link':
      return import('./views/master-grid-data-picker-link').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_load_more':
      return import('./views/master-list-load-more').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_plugin':
      return import('./views/master-counter-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_picker_select_view':
      return import('./views/master-data-picker-select-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_advanced':
      return import('./views/master-ui-logic-advanced').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_view_read':
      return import('./views/master-grid-view-read').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_showmode_exp':
      return import('./views/master-card-showmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar':
      return import('./views/master-calendar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_grid_view':
      return import('./views/master-pickup-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_cssandicon':
      return import('./views/master-kanban-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_enable':
      return import('./views/region-tree-grid-enable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_left':
      return import('./views/master-drtab-left').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_style':
      return import('./views/master-toolbar-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_count_hidden':
      return import('./views/master-searchbar-count-hidden').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_exp_form':
      return import('./views/master-counter-exp-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_option_view':
      return import('./views/category-option-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_quick_cfg_view':
      return import('./views/psde-logic-quick-cfg-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_line_right_nav':
      return import('./views/master-line-right-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_edit_all':
      return import('./views/master-grid-edit-all').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_nav_param_chart_exp_view':
      return import('./views/master-chart-nav-param-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_auto':
      return import('./views/master-searchform-auto').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_cascadeselectedit':
      return import('./views/master-tree-cascadeselectedit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_html':
      return import('./views/master-editor-html').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_parent_datasource':
      return import('./views/master-tree-parent-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_week':
      return import('./views/master-calendar-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pivottable':
      return import('./views/master-pivottable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_userstyle':
      return import('./views/master-card-userstyle').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_noderssearch':
      return import('./views/master-tree-noderssearch').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_alledit':
      return import('./views/region-tree-grid-alledit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_position':
      return import('./views/master-tabexppanel-position').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_base':
      return import('./views/master-calendar-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_exbar_tab_cache_tab_exp_view':
      return import('./views/master-tree-exbar-tab-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_raw':
      return import('./views/master-editor-raw').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ac_item_plugin':
      return import('./views/master-ac-item-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_bottom':
      return import('./views/master-drtab-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_navexp_exp':
      return import('./views/master-card-navexp-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_call':
      return import('./views/region-tree-grid-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_localsort':
      return import('./views/master-grid-localsort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_default_date_calendar_view_custom':
      return import('./views/master-default-date-calendar-view-custom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_dashboard':
      return import('./views/master-data-dashboard').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_auto_group':
      return import('./views/master-list-auto-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_rightnav':
      return import('./views/region-tree-grid-rightnav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_cache_tab_exp_view':
      return import('./views/master-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_m_pickup_view2':
      return import('./views/region-m-pickup-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_defaultsort':
      return import('./views/region-tree-grid-defaultsort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_view':
      return import('./views/master-chart-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_group_action':
      return import('./views/master-kanban-group-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab':
      return import('./views/master-drtab').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_action':
      return import('./views/master-list-group-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_view':
      return import('./views/master-wizard-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_detail_mdctrl_view':
      return import('./views/detail-detail-mdctrl-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_tab_cache_tab_exp_view':
      return import('./views/region-list-tab-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_logic':
      return import('./views/master-drtab-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_slider':
      return import('./views/master-editor-slider').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_month':
      return import('./views/master-calendar-contextmenu-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_event_call':
      return import('./views/master-card-event-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_nav_detail':
      return import('./views/master-grid-nav-detail').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_cache_refreshmode':
      return import('./views/master-card-cache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_draggablesort':
      return import('./views/master-gantt-draggablesort').then(
        m => m.default as unknown as IAppView,
      );
    case 'ps_core_prd_func_redirect_view':
      return import('./views/ps-core-prd-func-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_format':
      return import('./views/master-list-format').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_embed_pickup':
      return import('./views/master-tree-embed-pickup').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_bar':
      return import('./views/master-chart-bar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_base':
      return import('./views/master-list-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_datatarget':
      return import('./views/master-ui-action-datatarget').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_group_action':
      return import('./views/master-kanban-swimlane-group-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_app_portal_demo_grid_view':
      return import('./views/master-app-portal-demo-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_tabexpview':
      return import('./views/master-ui-logic-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_input_number':
      return import('./views/master-editor-input-number').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_base_data_view_exp_view':
      return import('./views/master-card-base-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_celledit':
      return import('./views/master-tree-grid-ex-celledit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_group_auto':
      return import('./views/master-grid-group-auto').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_built_in_nav':
      return import('./views/master-map-built-in-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_search':
      return import('./views/master-tree-search').then(
        m => m.default as unknown as IAppView,
      );
    case 'pswfversiondesign':
      return import('./views/pswfversiondesign').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_logictabexpview':
      return import('./views/region-tree-grid-logictabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_layout_view':
      return import('./views/master-layout-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_logic_base':
      return import('./views/master-list-logic-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_treempickupview2':
      return import('./views/master-pickup-treempickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_hidden_edit':
      return import('./views/master-drtab-hidden-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_array':
      return import('./views/master-editor-array').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_refreshmode_cache':
      return import('./views/master-tree-refreshmode-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_message_kind':
      return import('./views/master-view-message-kind').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_grid':
      return import('./views/master-teleport-placeholder-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_filter':
      return import('./views/master-grid-filter').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_single':
      return import('./views/region-tree-grid-single').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_view2':
      return import('./views/master-chart-exp-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_refresh':
      return import('./views/master-ui-action-refresh').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data_month':
      return import('./views/master-calendar-multiple-data-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_disablecolcustom':
      return import('./views/region-tree-grid-disablecolcustom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_group_close_mode':
      return import('./views/master-editform-group-close-mode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_mixin':
      return import('./views/master-calendar-mixin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_event_base':
      return import('./views/master-kanban-event-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_quick_search_chart_exp_view':
      return import(
        './views/master-chart-exp-quick-search-chart-exp-view'
      ).then(m => m.default as unknown as IAppView);
    case 'master_grid_css':
      return import('./views/master-grid-css').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_cssandicon':
      return import('./views/master-panel-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_day':
      return import('./views/master-calendar-rightnav-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_base_exp':
      return import('./views/master-list-base-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_picker':
      return import('./views/master-tree-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_event_ability':
      return import('./views/master-event-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_nav_right':
      return import('./views/master-tree-nav-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_row':
      return import('./views/region-meditpanel-row').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart':
      return import('./views/master-chart').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tab_nav':
      return import('./views/master-tab-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_drbar':
      return import('./views/master-counter-drbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_completion_date_chart':
      return import('./views/master-completion-date-chart').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_counter_hidden':
      return import('./views/master-panel-counter-hidden').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_master_drpart':
      return import('./views/detail-master-drpart').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_no_cacha_grid_exp_view':
      return import('./views/region-grid-no-cacha-grid-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_quick_create':
      return import('./views/region-quick-create').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_update_front':
      return import('./views/master-grid-update-front').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_runtime_components':
      return import('./views/master-runtime-components').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_cssandicon':
      return import('./views/master-card-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_toolbar_quick':
      return import('./views/master-grid-toolbar-quick').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_week_nav_param_calendar_exp_view':
      return import('./views/master-week-nav-param-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_rate':
      return import('./views/master-editor-rate').then(
        m => m.default as unknown as IAppView,
      );
    case 'about_modal_hidden_close':
      return import('./views/about-modal-hidden-close').then(
        m => m.default as unknown as IAppView,
      );
    case 'ps_core_prd_func_edit_view':
      return import('./views/ps-core-prd-func-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_event':
      return import('./views/master-chart-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_event':
      return import('./views/region-meditpanel-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_toolbar':
      return import('./views/master-counter-toolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_attachment_column':
      return import('./views/master-grid-attachment-column').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_nodetabexpview':
      return import('./views/master-de-logic-nodetabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_right_top_anchor_edit_view':
      return import('./views/master-right-top-anchor-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_draggable':
      return import('./views/master-list-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_aggtabexpview':
      return import('./views/region-tree-grid-aggtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_item_new':
      return import('./views/master-list-item-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_count':
      return import('./views/master-searchbar-count').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_base':
      return import('./views/region-tree-grid-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_logic_base':
      return import('./views/master-grid-logic-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_regular':
      return import('./views/master-ui-logic-regular').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_tree':
      return import('./views/master-counter-tree').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_nocache_refreshmode':
      return import('./views/master-kanban-nocache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_defiupdate':
      return import('./views/master-form-defiupdate').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_modal_edit_view':
      return import('./views/master-modal-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'about_modal_hidden_mask':
      return import('./views/about-modal-hidden-mask').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_dashboard_carousel_list':
      return import('./views/master-data-dashboard-carousel-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_hovershowplaceholder':
      return import('./views/master-hovershowplaceholder').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel':
      return import('./views/region-meditpanel').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_exp_view':
      return import('./views/region-grid-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_pie':
      return import('./views/master-chart-pie').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_edit_view2':
      return import('./views/region-edit-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_nocache_refreshmode':
      return import('./views/master-card-nocache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treegridex_nav_inside':
      return import('./views/master-treegridex-nav-inside').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_cardpickupview':
      return import('./views/master-pickup-cardpickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_dyna_logic_exp':
      return import('./views/master-list-dyna-logic-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_logic':
      return import('./views/master-panel-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_event_call_exp':
      return import('./views/master-kanban-event-call-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_column_uiaction_group':
      return import('./views/master-grid-column-uiaction-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_counter_disabled':
      return import('./views/master-toolbar-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_virtualized_grid':
      return import('./views/master-virtualized-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_m_pickup_view':
      return import('./views/region-m-pickup-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data_timeline':
      return import('./views/master-calendar-multiple-data-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_css':
      return import('./views/region-tree-grid-css').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_field_grid_design':
      return import('./views/psde-field-grid-design').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tab_card_tab_exp_view':
      return import('./views/master-tab-card-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_default_sort':
      return import('./views/master-card-default-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_group_collapse':
      return import('./views/master-editform-group-collapse').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_tooltip_text':
      return import('./views/master-map-tooltip-text').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_count':
      return import('./views/master-tabexppanel-count').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_radar':
      return import('./views/master-chart-radar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_usr9345_grid_view':
      return import('./views/master-usr-9345-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_message_close_mode':
      return import('./views/master-view-message-close-mode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_user':
      return import('./views/master-calendar-contextmenu-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_bottom_nav':
      return import('./views/master-card-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_validatemode':
      return import('./views/master-form-validatemode').then(
        m => m.default as unknown as IAppView,
      );
    case 'ps_core_prd_func_installed_grid_view':
      return import('./views/ps-core-prd-func-installed-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_counter':
      return import('./views/master-tree-counter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_navparam_groupmode_exp':
      return import('./views/master-navparam-groupmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu':
      return import('./views/master-calendar-contextmenu').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_built_in_toolbar_exp':
      return import('./views/master-kanban-built-in-toolbar-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_exp':
      return import('./views/master-editform-mdctrl-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_dynamic_logic':
      return import('./views/master-toolbar-dynamic-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_meditpanel_ability_form':
      return import('./views/master-meditpanel-ability-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav':
      return import('./views/master-calendar-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_step_bar_tab_exp_view':
      return import('./views/master-wizard-step-bar-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_autosave':
      return import('./views/master-editform-autosave').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_event':
      return import('./views/master-drtab-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_top':
      return import('./views/master-tabexppanel-top').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_common_editview':
      return import('./views/master-common-editview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_params':
      return import('./views/master-ui-action-params').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_pickup_view2':
      return import('./views/region-pickup-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_search_form_event':
      return import('./views/master-search-form-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_span':
      return import('./views/master-grid-span').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_newrow_group_auto':
      return import('./views/master-grid-newrow-group-auto').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_group_bar_chart_exp_view':
      return import('./views/master-group-bar-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_mixin_showmode':
      return import('./views/master-card-mixin-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_batchtoolbar':
      return import('./views/master-card-batchtoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_nodetabexpview':
      return import('./views/master-tree-grid-ex-nodetabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_transfer_picker':
      return import('./views/master-data-transfer-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_cardpickupview2':
      return import('./views/master-pickup-cardpickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_navtabexpview':
      return import('./views/region-tree-grid-navtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_counter_disabled':
      return import('./views/master-tabexppanel-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_sort_draggable':
      return import('./views/master-list-group-sort-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_btncss':
      return import('./views/master-searchform-btncss').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_refreshmode_exp':
      return import('./views/master-list-refreshmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_dyna_visible':
      return import('./views/master-card-dyna-visible').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_expbar_tab_exp_view':
      return import('./views/master-tree-expbar-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_hasvaluesearch':
      return import('./views/master-tree-hasvaluesearch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_mapstyle':
      return import('./views/master-map-mapstyle').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_tabexpview':
      return import('./views/master-tree-grid-ex-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_dyna_blank':
      return import('./views/master-kanban-dyna-blank').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_sort_default':
      return import('./views/master-grid-sort-default').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_group_action':
      return import('./views/master-editform-mdctrl-group-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_form_group':
      return import('./views/master-counter-form-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_month':
      return import('./views/master-chart-group-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_refreshmode':
      return import('./views/master-gantt-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_ability':
      return import('./views/master-map-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout_week':
      return import('./views/master-calendar-layout-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout_user':
      return import('./views/master-calendar-layout-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_msg_pos_scroll':
      return import('./views/master-view-msg-pos-scroll').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_treepickupview':
      return import('./views/master-pickup-treepickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_event':
      return import('./views/master-list-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_advanced_search':
      return import('./views/region-advanced-search').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_print_grid':
      return import('./views/master-print-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ctrl_event_grid_trigger':
      return import('./views/master-ctrl-event-grid-trigger').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_event_and_call':
      return import('./views/master-map-event-and-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_tab_exp':
      return import('./views/master-counter-tab-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_base':
      return import('./views/master-map-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_style2':
      return import('./views/master-list-group-style-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_event':
      return import('./views/master-map-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_span':
      return import('./views/master-editor-span').then(
        m => m.default as unknown as IAppView,
      );
    case 'about_drawer_hidden_close':
      return import('./views/about-drawer-hidden-close').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_form':
      return import('./views/master-editform-repeater-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_postion':
      return import('./views/master-drtab-postion').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_contextmenu':
      return import('./views/master-gantt-contextmenu').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_row_layout':
      return import('./views/master-kanban-row-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_table':
      return import('./views/master-editform-repeater-table').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid':
      return import('./views/master-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_tooltip_style':
      return import('./views/master-map-tooltip-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_action_plugin':
      return import('./views/master-action-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_mixin':
      return import('./views/master-grid-mixin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_css':
      return import('./views/master-tree-grid-ex-css').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treeview':
      return import('./views/master-treeview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_datasource_exp':
      return import('./views/master-tree-datasource-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_event':
      return import('./views/master-tree-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_form_defaultvalue':
      return import('./views/master-editform-repeater-form-defaultvalue').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_table_sort':
      return import('./views/master-editform-repeater-table-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_nav_exp':
      return import('./views/master-chart-nav-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_multiple_data':
      return import('./views/master-calendar-bottomnav-multiple-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_require':
      return import('./views/region-tree-grid-require').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_tab_exp_view':
      return import('./views/master-chart-exp-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_autocomplete':
      return import('./views/master-editor-autocomplete').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_hiddenstepbar':
      return import('./views/master-wizard-hiddenstepbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_custom_datasource':
      return import('./views/master-tree-custom-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_list':
      return import('./views/master-teleport-placeholder-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_event_trigger':
      return import('./views/master-view-event-trigger').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_attachment_column_file_preview':
      return import('./views/master-grid-attachment-column-file-preview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_logic2':
      return import('./views/master-drtab-logic-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_base':
      return import('./views/master-card-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_view':
      return import('./views/region-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_top':
      return import('./views/region-meditpanel-top').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_enable_cache_tree_exp_view':
      return import('./views/master-enable-cache-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_item_plugin':
      return import('./views/master-toolbar-item-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_group_action':
      return import('./views/master-card-group-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_draggable_exp':
      return import('./views/master-kanban-swimlane-draggable-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_cardmpickupview2':
      return import('./views/master-pickup-cardmpickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_all_log_grid_view':
      return import('./views/psde-logic-all-log-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_multiple_sequences':
      return import('./views/master-chart-multiple-sequences').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_base_chart_series':
      return import('./views/master-base-chart-series').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_call':
      return import('./views/master-list-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_refreshmode_nocache':
      return import('./views/master-calendar-refreshmode-nocache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban':
      return import('./views/master-kanban').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_disabled_sliderdraggable':
      return import('./views/master-gantt-disabled-sliderdraggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_workflow_design_grid':
      return import('./views/master-workflow-design-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_data_picker':
      return import('./views/master-editor-data-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_logic_require':
      return import('./views/master-grid-logic-require').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_delogic_datasource':
      return import('./views/master-tree-delogic-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_leafnode':
      return import('./views/master-tree-grid-ex-leafnode').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_valshow':
      return import('./views/region-tree-grid-valshow').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_form':
      return import('./views/master-editform-mdctrl-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_right':
      return import('./views/master-drtab-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_refreshmode_nocache':
      return import('./views/master-tree-refreshmode-nocache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_menushowmode':
      return import('./views/master-tree-menushowmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_logic_enable':
      return import('./views/master-grid-logic-enable').then(
        m => m.default as unknown as IAppView,
      );
    case 'report_bi_report_content_panel_view':
      return import('./views/report-bi-report-content-panel-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_upload_image_cropping':
      return import('./views/master-upload-image-cropping').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_data_container':
      return import('./views/master-panel-data-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_event_and_call':
      return import('./views/master-gantt-event-and-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_draggable_edit':
      return import('./views/master-list-draggable-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'comment_list_view':
      return import('./views/comment-list-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_view':
      return import('./views/master-map-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt':
      return import('./views/master-gantt').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treeview_cssandicon':
      return import('./views/master-treeview-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_wf_step_trace_view':
      return import('./views/app-wf-step-trace-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_export_back':
      return import('./views/master-grid-export-back').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_comment_display':
      return import('./views/master-comment-display').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_sedit_view':
      return import('./views/region-sedit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_cache_list_exp_view':
      return import('./views/region-list-cache-list-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_alledit':
      return import('./views/master-tree-grid-ex-alledit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_fast_new':
      return import('./views/master-list-fast-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_repeater_table_defaultvalue':
      return import('./views/master-editform-repeater-table-defaultvalue').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ctrl_event_form_trigger':
      return import('./views/master-ctrl-event-form-trigger').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_tabexpview':
      return import('./views/master-teleport-placeholder-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_month':
      return import('./views/master-calendar-bottomnav-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_gridexpbar_tab_exp_view':
      return import('./views/region-gridexpbar-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_stackbar_right_nav':
      return import('./views/master-stackbar-right-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_check_box':
      return import('./views/master-editor-check-box').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_logic_call':
      return import('./views/master-calendar-logic-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_cache_refreshmode':
      return import('./views/master-list-cache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_nav_bottom':
      return import('./views/master-list-nav-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_page_redirect_view':
      return import('./views/master-page-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_wrap':
      return import('./views/region-tree-grid-wrap').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_flow_panel_view':
      return import('./views/psde-logic-flow-panel-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_toolbar':
      return import('./views/master-grid-toolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pie_bottom_nav':
      return import('./views/master-pie-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_nocacherefresh':
      return import('./views/master-tree-grid-ex-nocacherefresh').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_refreshmode_cache':
      return import('./views/master-gantt-refreshmode-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'panel_appdatauploadview':
      return import('./views/panel-appdatauploadview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_roll_load':
      return import('./views/master-list-roll-load').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_enablefullscreen_exp':
      return import('./views/master-kanban-enablefullscreen-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_cardmpickupview':
      return import('./views/master-pickup-cardmpickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_autowidth':
      return import('./views/region-tree-grid-autowidth').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_editview':
      return import('./views/region-meditpanel-editview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_multiple_data_nav':
      return import('./views/master-calendar-nav-multiple-data-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_dfvalue':
      return import('./views/master-grid-dfvalue').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data':
      return import('./views/master-calendar-multiple-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_dsconditions':
      return import('./views/master-codelist-dsconditions').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_only_data':
      return import('./views/master-list-only-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_cacherefresh':
      return import('./views/master-tree-grid-ex-cacherefresh').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_css':
      return import('./views/master-codelist-css').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_month':
      return import('./views/master-gantt-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_portlet_plugin':
      return import('./views/master-portlet-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_node_base':
      return import('./views/master-ui-logic-node-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_radio_list':
      return import('./views/master-editor-radio-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'psdelogiclogicdesign':
      return import('./views/psdelogiclogicdesign').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_logic_call':
      return import('./views/master-card-logic-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_event':
      return import('./views/master-tree-grid-ex-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_sort_ban':
      return import('./views/master-grid-sort-ban').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_day':
      return import('./views/master-calendar-nav-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_toolbar_grid':
      return import('./views/master-teleport-placeholder-toolbar-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_enablegrouphidden_exp':
      return import('./views/master-kanban-enablegrouphidden-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_description':
      return import('./views/master-kanban-swimlane-description').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_refreshmode_cache':
      return import('./views/master-calendar-refreshmode-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_actioncol':
      return import('./views/region-tree-grid-actioncol').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_week':
      return import('./views/master-gantt-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_ability_edit_view':
      return import('./views/master-form-ability-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_contextmenurightclickinvoke':
      return import('./views/master-tree-contextmenurightclickinvoke').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_default_date_tab_exp_view':
      return import('./views/master-default-date-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_pickup_tree_view':
      return import('./views/region-pickup-tree-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_backendcolupdate':
      return import('./views/region-tree-grid-backendcolupdate').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_container_image':
      return import('./views/master-panel-panel-container-image').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_nav_right':
      return import('./views/master-grid-nav-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_item_action':
      return import('./views/master-kanban-item-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_cssandicon':
      return import('./views/master-ui-action-cssandicon').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_gridpickupview_pickup_grid_view':
      return import(
        './views/master-pickup-gridpickupview-pickup-grid-view'
      ).then(m => m.default as unknown as IAppView);
    case 'master_data':
      return import('./views/master-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treegridex_nav_right':
      return import('./views/master-treegridex-nav-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_emptydata':
      return import('./views/region-tree-grid-emptydata').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_agg_page':
      return import('./views/master-grid-agg-page').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_treempickupview':
      return import('./views/master-pickup-treempickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_common_action':
      return import('./views/master-tree-common-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_newrow_group_codelist':
      return import('./views/master-grid-newrow-group-codelist').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_ext_view2':
      return import('./views/master-list-ext-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_showmode_exp':
      return import('./views/master-list-showmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_group':
      return import('./views/master-toolbar-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_multiple_data':
      return import('./views/master-calendar-contextmenu-multiple-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_picker_dropdown':
      return import('./views/master-data-picker-dropdown').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_edit_view9':
      return import('./views/region-edit-view-9').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_groupbar':
      return import('./views/master-chart-groupbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_layout':
      return import('./views/master-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_event':
      return import('./views/master-drbar-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout':
      return import('./views/master-calendar-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_basetabexpview':
      return import('./views/region-tree-grid-basetabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_render':
      return import('./views/master-tree-render').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_master_theme_settings':
      return import('./views/master-master-theme-settings').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_scatter_bottom_nav':
      return import('./views/master-scatter-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_short_cut_gridview':
      return import('./views/master-short-cut-gridview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_multi_data_container':
      return import('./views/master-panel-multi-data-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_column_layout':
      return import('./views/master-kanban-column-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_actioncol':
      return import('./views/master-tree-grid-ex-actioncol').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_top':
      return import('./views/master-drtab-top').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_navparams_parenttochild':
      return import('./views/master-tree-navparams-parenttochild').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_timer_trigger':
      return import('./views/master-timer-trigger').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_bottomnav':
      return import('./views/region-tree-grid-bottomnav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_counter_disabled':
      return import('./views/master-searchbar-counter-disabled').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_quick_search_separator_tree_exp_view':
      return import('./views/master-quick-search-separator-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_select_pickerview':
      return import('./views/master-tree-select-pickerview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_timeline':
      return import('./views/master-calendar-bottomnav-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_frontcolupdate':
      return import('./views/region-tree-grid-frontcolupdate').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_view_logic':
      return import('./views/master-wizard-view-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_point':
      return import('./views/master-map-point').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_treepickupview2':
      return import('./views/master-pickup-treepickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_view':
      return import('./views/region-tree-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_action_column':
      return import('./views/master-grid-action-column').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_hover_tab_exp_view':
      return import('./views/master-editform-hover-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_selectpickup':
      return import('./views/master-tree-selectpickup').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_usr8928_chart_view':
      return import('./views/master-usr-8928-chart-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_item_render2':
      return import('./views/master-panel-panel-item-render-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_start_view':
      return import('./views/app-start-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_remoteagg':
      return import('./views/region-tree-grid-remoteagg').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_hidden_edit':
      return import('./views/master-drbar-hidden-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_wf_step_data_view':
      return import('./views/app-wf-step-data-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data_user':
      return import('./views/master-calendar-multiple-data-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_modal_data_switching_grid':
      return import('./views/master-modal-data-switching-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_no_draggable':
      return import('./views/master-kanban-swimlane-no-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_form_design_edit':
      return import('./views/category-form-design-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_rowedit':
      return import('./views/region-tree-grid-rowedit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_info_view':
      return import('./views/master-info-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_captionwidth':
      return import('./views/region-tree-grid-captionwidth').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_agg':
      return import('./views/master-grid-agg').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_toolbar_batch':
      return import('./views/master-grid-toolbar-batch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_enablefullscreen':
      return import('./views/master-kanban-swimlane-enablefullscreen').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_item_action':
      return import('./views/master-card-item-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_animation':
      return import('./views/master-map-animation').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_eventtabexpview':
      return import('./views/master-tree-grid-ex-eventtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_funnel_plot':
      return import('./views/master-chart-funnel-plot').then(
        m => m.default as unknown as IAppView,
      );
    case 'extend_log_info_view':
      return import('./views/extend-log-info-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_allsearch':
      return import('./views/master-tree-allsearch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_pickupview':
      return import('./views/master-ui-action-pickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_line_bar_chart_exp_view':
      return import('./views/master-line-bar-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_scatter_right_nav':
      return import('./views/master-scatter-right-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_view_message':
      return import('./views/master-panel-view-message').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wf_dyna_edit_view3':
      return import('./views/master-wf-dyna-edit-view-3').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_node_newedit':
      return import('./views/master-tree-node-newedit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_separator_data_view_exp_view':
      return import('./views/master-separator-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_select_mpickupview':
      return import('./views/master-tree-select-mpickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_paging_load':
      return import('./views/master-card-paging-load').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_count_flowdrtab':
      return import('./views/master-count-flowdrtab').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_usr1225_edit_view':
      return import('./views/master-usr-1225-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_async_activity':
      return import('./views/master-async-activity').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tab_ctrl_federation':
      return import('./views/master-tab-ctrl-federation').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_fullscreen':
      return import('./views/master-map-fullscreen').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_pickup_grid_view':
      return import('./views/region-pickup-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_grid_container':
      return import('./views/master-panel-grid-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_nav_right':
      return import('./views/master-list-nav-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_tabexppanel':
      return import('./views/master-counter-tabexppanel').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_edit_view3':
      return import('./views/region-edit-view-3').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_edit_view':
      return import('./views/master-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_info':
      return import('./views/master-form-info').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_scatter':
      return import('./views/master-chart-scatter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_ability':
      return import('./views/master-chart-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_enablestepbar':
      return import('./views/master-wizard-enablestepbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_logic':
      return import('./views/master-grid-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_meditpanel_ability':
      return import('./views/detail-meditpanel-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_cascadeselect_mpickerview':
      return import('./views/master-tree-cascadeselect-mpickerview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_tabexpview':
      return import('./views/master-de-logic-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_default_showmode':
      return import('./views/master-card-default-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_group_codelist':
      return import('./views/master-grid-group-codelist').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_dyna_blank':
      return import('./views/master-card-dyna-blank').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_flow_main_view':
      return import('./views/psde-logic-flow-main-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_dyna_logic':
      return import('./views/master-kanban-dyna-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_logic_script':
      return import('./views/master-drbar-logic-script').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_layout':
      return import('./views/master-form-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_upload_file_upload':
      return import('./views/master-upload-file-upload').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_hight':
      return import('./views/master-searchbar-hight').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_logic_ctrl_event':
      return import('./views/master-grid-logic-ctrl-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_data_mpicker':
      return import('./views/master-data-mpicker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_sort_exp':
      return import('./views/master-list-sort-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_count':
      return import('./views/master-drtab-count').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_edit_view4':
      return import('./views/region-edit-view-4').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_pickup_view':
      return import('./views/region-pickup-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_no_cache_tree_exp_view':
      return import('./views/master-no-cache-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_view_style':
      return import('./views/master-wizard-view-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_base':
      return import('./views/master-grid-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_nav_inside':
      return import('./views/master-grid-nav-inside').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_annular':
      return import('./views/master-chart-annular').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_base':
      return import('./views/master-tree-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_order_group_draggable':
      return import('./views/master-kanban-order-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_bottom':
      return import('./views/master-tabexppanel-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pie_nav_right':
      return import('./views/master-pie-nav-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_refresh_cache':
      return import('./views/master-grid-refresh-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_control_plugin':
      return import('./views/master-control-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_baseevent':
      return import('./views/master-de-logic-baseevent').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_de_logic_link':
      return import('./views/master-de-logic-link').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_filter':
      return import('./views/master-searchform-filter').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_percent':
      return import('./views/region-tree-grid-percent').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_message':
      return import('./views/region-grid-message').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_exp_view_quick_search':
      return import('./views/master-calendar-exp-view-quick-search').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_grid_view_base':
      return import('./views/master-chart-grid-view-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_localagg':
      return import('./views/region-tree-grid-localagg').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_nav_pos':
      return import('./views/master-panel-nav-pos').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_picker':
      return import('./views/master-map-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_event_tab':
      return import('./views/master-chart-event-tab').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_quick_create_popper':
      return import('./views/master-quick-create-popper').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_cascader':
      return import('./views/master-editor-cascader').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_dyna_visible':
      return import('./views/master-list-dyna-visible').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_year':
      return import('./views/master-chart-group-year').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_colfilter':
      return import('./views/region-tree-grid-colfilter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_user_param':
      return import('./views/master-codelist-user-param').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_redirect_view':
      return import('./views/psde-logic-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_batchtoolbar':
      return import('./views/master-list-batchtoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_childnodecount':
      return import('./views/master-tree-grid-ex-childnodecount').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_year_week':
      return import('./views/master-chart-group-year-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_base_exp':
      return import('./views/master-card-base-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_onlydata_showmode':
      return import('./views/master-card-onlydata-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_srfnextform':
      return import('./views/master-wizard-srfnextform').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_plugin':
      return import('./views/master-ui-logic-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_cache_tab_exp_view':
      return import('./views/master-chart-exp-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchform_layout':
      return import('./views/master-searchform-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_nav_param_area_chart_exp_view':
      return import('./views/master-nav-param-area-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_ctrl_federation':
      return import('./views/master-form-ctrl-federation').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_portal_view':
      return import('./views/app-portal-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_item_plugin':
      return import('./views/master-panel-item-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_counter_exp':
      return import('./views/master-panel-counter-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_coop_pos':
      return import('./views/master-coop-pos').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_item_render':
      return import('./views/master-panel-panel-item-render').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_celledit':
      return import('./views/region-tree-grid-celledit').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_pickup_view':
      return import('./views/category-pickup-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_ctrlstyle_exp':
      return import('./views/master-list-ctrlstyle-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_replace_default':
      return import('./views/master-replace-default').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_search_form':
      return import('./views/master-search-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_save_all':
      return import('./views/master-save-all').then(
        m => m.default as unknown as IAppView,
      );
    case 'about':
      return import('./views/about').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kaban_format':
      return import('./views/master-kaban-format').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_nocache_refreshmode':
      return import('./views/master-kanban-swimlane-nocache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_quar':
      return import('./views/master-chart-group-quar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_day':
      return import('./views/master-calendar-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_load_mode':
      return import('./views/master-list-load-mode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_flex_layout':
      return import('./views/master-card-flex-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_separator_grid_exp_view':
      return import('./views/region-grid-separator-grid-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_info_grid':
      return import('./views/region-info-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_code_list':
      return import('./views/master-chart-group-code-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_html_view':
      return import('./views/master-html-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'breadcrumb':
      return import('./views/breadcrumb').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_toolbartabexpview':
      return import('./views/region-tree-grid-toolbartabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_list':
      return import('./views/master-editform-mdctrl-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_user_custom_calendar_exp_view':
      return import('./views/master-user-custom-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'activity_history_list_view':
      return import('./views/activity-history-list-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_sorttabexpview':
      return import('./views/region-tree-grid-sorttabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_nax_tabexpview':
      return import('./views/master-tree-nax-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_treeview_navparams_tabexpview':
      return import('./views/master-treeview-navparams-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_entitynode':
      return import('./views/master-tree-entitynode').then(
        m => m.default as unknown as IAppView,
      );
    case 'detail_druipart_grid_view':
      return import('./views/detail-druipart-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_main_grid':
      return import('./views/master-main-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'welcome':
      return import('./views/welcome').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_expbar_navparam_tree_exp_view':
      return import('./views/master-tree-expbar-navparam-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_enablecustomized':
      return import('./views/master-gantt-enablecustomized').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_group_day':
      return import('./views/master-chart-group-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_view_contextmenu':
      return import('./views/master-tree-view-contextmenu').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_item_action':
      return import('./views/master-list-item-action').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_card':
      return import('./views/master-editform-mdctrl-card').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_plugin':
      return import('./views/master-view-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_default_date_calendar_view_week':
      return import('./views/master-default-date-calendar-view-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_align':
      return import('./views/region-tree-grid-align').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_ability':
      return import('./views/master-drtab-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_deaction_datasource':
      return import('./views/master-tree-deaction-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter_drtab':
      return import('./views/master-counter-drtab').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_toolbar_counter':
      return import('./views/master-toolbar-counter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_logic_event':
      return import('./views/master-gantt-logic-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_tab_exp_view':
      return import('./views/master-calendar-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_exp_view':
      return import('./views/region-list-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'report_baseinfo_edit_view':
      return import('./views/report-baseinfo-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_tree_exp_view':
      return import('./views/psde-logic-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_dyna_logic_exp':
      return import('./views/master-card-dyna-logic-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_enable_edit_view':
      return import('./views/master-enable-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_next':
      return import('./views/master-ui-action-next').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_logic_event':
      return import('./views/master-card-logic-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_usr2893_data_view_exp_view':
      return import('./views/master-usr-2893-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_nav_bottom':
      return import('./views/master-tree-nav-bottom').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_nocache_refreshmode':
      return import('./views/master-list-nocache-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_dyna_enbale':
      return import('./views/master-kanban-dyna-enbale').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map':
      return import('./views/master-map').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_stepper':
      return import('./views/master-editor-stepper').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_navparams_nodeview':
      return import('./views/master-tree-navparams-nodeview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_line_bottom_nav':
      return import('./views/master-line-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_search_logic':
      return import('./views/master-search-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_group_exp':
      return import('./views/master-kanban-group-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_storage':
      return import('./views/master-searchbar-storage').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_item_event_edit_view':
      return import('./views/master-form-item-event-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_format':
      return import('./views/master-card-format').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_p_icker_singletabexpview':
      return import('./views/master-p-icker-singletabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_cache_data_view_exp_view':
      return import('./views/master-cache-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_default_showmode':
      return import('./views/master-list-default-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_week':
      return import('./views/master-calendar-rightnav-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_month':
      return import('./views/master-calendar-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_nav_param_stack_bar_chart_exp_view':
      return import('./views/master-nav-param-stack-bar-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_single_data_container':
      return import('./views/master-panel-single-data-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_style_exp':
      return import('./views/master-card-style-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_nopermission_container':
      return import('./views/app-nopermission-container').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_mixin_showmode':
      return import('./views/master-list-mixin-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'app_welcome_view':
      return import('./views/app-welcome-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_exp':
      return import('./views/master-tree-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_tab_panel':
      return import('./views/master-panel-panel-tab-panel').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_field_quick_cfg_view':
      return import('./views/psde-field-quick-cfg-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_view_message_position':
      return import('./views/region-view-message-position').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_event':
      return import('./views/master-wizard-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_nullvaluesearch':
      return import('./views/master-tree-nullvaluesearch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_exp_view_no_cache':
      return import('./views/master-calendar-exp-view-no-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_exp':
      return import('./views/master-list-group-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_event_edit_view':
      return import('./views/master-form-event-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_category_mgr':
      return import('./views/category-category-mgr').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_cache2':
      return import('./views/master-drtab-cache-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_default_date_calendar_view_day':
      return import('./views/master-default-date-calendar-view-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_celledit':
      return import('./views/master-gantt-celledit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_bar_bottom_nav':
      return import('./views/master-bar-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_tab_cache_tab_exp_view':
      return import('./views/region-grid-tab-cache-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_extend':
      return import('./views/master-chart-extend').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_event':
      return import('./views/master-panel-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_frontexport':
      return import('./views/region-tree-grid-frontexport').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tab_ctrl_federation2':
      return import('./views/master-tab-ctrl-federation-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_refreshtabexpview':
      return import('./views/region-tree-grid-refreshtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_panel_exp_header':
      return import('./views/master-panel-panel-exp-header').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_nav_exp':
      return import('./views/master-list-nav-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'ps_core_prd_func_market_application_view':
      return import('./views/ps-core-prd-func-market-application-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_navparam_data_view_exp_view':
      return import('./views/master-navparam-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_backendexport':
      return import('./views/region-tree-grid-backendexport').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_quicktoolbar':
      return import('./views/master-list-quicktoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'psde_logic_global_flow_grid_view':
      return import('./views/psde-logic-global-flow-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_batchtoolbar':
      return import('./views/master-kanban-batchtoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_code':
      return import('./views/master-editor-code').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_muleditview':
      return import('./views/master-pickup-muleditview').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_data_view_exp_view':
      return import('./views/region-data-view-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_stackbar_bottom_nav':
      return import('./views/master-stackbar-bottom-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_timeline':
      return import('./views/master-calendar-contextmenu-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_num':
      return import('./views/master-codelist-num').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_load_more':
      return import('./views/master-card-load-more').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_auto_group':
      return import('./views/master-kanban-auto-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_toolbar':
      return import('./views/master-teleport-placeholder-toolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_event_call':
      return import('./views/master-calendar-event-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_bar_right_nav':
      return import('./views/master-bar-right-nav').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_field':
      return import('./views/master-codelist-field').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_sort_draggable':
      return import('./views/master-list-sort-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_contextmenu_week':
      return import('./views/master-calendar-contextmenu-week').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_lane_draggable':
      return import('./views/master-kanban-swimlane-lane-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_codelist_group':
      return import('./views/master-list-codelist-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_redirect_view':
      return import('./views/master-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_refreshmode_exp':
      return import('./views/master-kanban-refreshmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_refreshmode_nocache':
      return import('./views/master-gantt-refreshmode-nocache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_topsession_datasource':
      return import('./views/master-tree-topsession-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editform_mdctrl_table':
      return import('./views/master-editform-mdctrl-table').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_base':
      return import('./views/master-form-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_input_ip':
      return import('./views/master-editor-input-ip').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_default_sort':
      return import('./views/master-list-default-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_tabexpview':
      return import('./views/region-tree-grid-tabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'psdeformdesign_modal':
      return import('./views/psdeformdesign-modal').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_threshold':
      return import('./views/master-codelist-threshold').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_dyna_enbale':
      return import('./views/master-list-dyna-enbale').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_message_dynamic':
      return import('./views/master-view-message-dynamic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_base':
      return import('./views/master-drbar-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_format':
      return import('./views/master-panel-format').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_exp_view':
      return import('./views/master-tree-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_disable_sort':
      return import('./views/master-list-disable-sort').then(
        m => m.default as unknown as IAppView,
      );
    case 'report_bi_report_panel_view':
      return import('./views/report-bi-report-panel-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_empty':
      return import('./views/master-codelist-empty').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_nocache':
      return import('./views/region-tree-grid-nocache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_disable_edit_view':
      return import('./views/master-disable-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_logic':
      return import('./views/master-card-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_nav_month':
      return import('./views/master-calendar-nav-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_grid_mul_series':
      return import('./views/master-chart-grid-mul-series').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_nav_pos_view':
      return import('./views/master-panel-nav-pos-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_type':
      return import('./views/master-codelist-type').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_button':
      return import('./views/master-panel-button').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_dyna_style':
      return import('./views/master-map-dyna-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_depickup_view':
      return import('./views/master-depickup-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_quicktoolbar':
      return import('./views/master-card-quicktoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_logic':
      return import('./views/master-drbar-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_batch':
      return import('./views/region-tree-grid-batch').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_group_new':
      return import('./views/master-list-group-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_gridpickupview2':
      return import('./views/master-pickup-gridpickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_default_date_calendar_view_month':
      return import('./views/master-default-date-calendar-view-month').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_cache_edit_view':
      return import('./views/master-chart-exp-cache-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_listexp_tab_exp_view':
      return import('./views/region-listexp-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_open_redirect_view':
      return import('./views/master-open-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_color_picker':
      return import('./views/master-color-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_showmode':
      return import('./views/master-grid-showmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_teleport_placeholder_toolbar_list':
      return import('./views/master-teleport-placeholder-toolbar-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_column_plugin':
      return import('./views/master-grid-column-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_area_deafult':
      return import('./views/master-map-area-deafult').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_base':
      return import('./views/master-kanban-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_group_draggable':
      return import('./views/master-kanban-swimlane-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_anchor_tab_exp_view':
      return import('./views/master-anchor-tab-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_codelist_tree':
      return import('./views/master-codelist-tree').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_defaultval':
      return import('./views/region-tree-grid-defaultval').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drbar_logic_delogic':
      return import('./views/master-drbar-logic-delogic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_item_style':
      return import('./views/master-map-item-style').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_info_view':
      return import('./views/region-info-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_bar_chart_exp_view':
      return import('./views/master-bar-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_roll_load':
      return import('./views/master-card-roll-load').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_grouprowmode_exp':
      return import('./views/master-grid-grouprowmode-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_sort_draggable':
      return import('./views/master-card-sort-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_layout_timeline':
      return import('./views/master-calendar-layout-timeline').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_day':
      return import('./views/master-calendar-bottomnav-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_enablegrouphidden':
      return import('./views/master-kanban-enablegrouphidden').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_attachment_column_enabledownloadticket':
      return import(
        './views/master-grid-attachment-column-enabledownloadticket'
      ).then(m => m.default as unknown as IAppView);
    case 'master_ui_action_closeview':
      return import('./views/master-ui-action-closeview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_row_logic':
      return import('./views/master-grid-row-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_detail_plugin':
      return import('./views/master-form-detail-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_view_logic':
      return import('./views/master-view-logic').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_gridmpickupview2':
      return import('./views/master-pickup-gridmpickupview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_upload_image_upload':
      return import('./views/master-upload-image-upload').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_group_new':
      return import('./views/master-card-group-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_call':
      return import('./views/master-kanban-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_quicktoolbar':
      return import('./views/master-kanban-swimlane-quicktoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_layout':
      return import('./views/master-grid-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_ctrl_event':
      return import('./views/master-kanban-ctrl-event').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_layouttabexpview':
      return import('./views/region-tree-grid-layouttabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_rowedittabexpview':
      return import('./views/region-tree-grid-rowedittabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'report_all_report_grid_view':
      return import('./views/report-all-report-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_swimlane_refreshmode':
      return import('./views/master-kanban-swimlane-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_action_front':
      return import('./views/master-ui-action-front').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_cancel_change':
      return import('./views/master-cancel-change').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_month_nav_param_calendar_exp_view':
      return import('./views/master-month-nav-param-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_number_range_picker':
      return import('./views/master-number-range-picker').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_card_new':
      return import('./views/master-kanban-card-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_quicktoolbar':
      return import('./views/master-kanban-quicktoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_kanban_layout_exp':
      return import('./views/master-kanban-layout-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_group_exp':
      return import('./views/master-card-group-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_call':
      return import('./views/master-tree-grid-ex-call').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_multiple_data_day':
      return import('./views/master-calendar-multiple-data-day').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_hour':
      return import('./views/master-gantt-hour').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_fitcol':
      return import('./views/region-tree-grid-fitcol').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_quickcreate':
      return import('./views/master-quickcreate').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_check_box_list':
      return import('./views/master-editor-check-box-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_gridpickupview':
      return import('./views/master-pickup-gridpickupview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form':
      return import('./views/master-form').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_stacked_column':
      return import('./views/master-chart-stacked-column').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list':
      return import('./views/master-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_more':
      return import('./views/master-drtab-more').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_auto_group':
      return import('./views/master-card-auto-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_disablesort':
      return import('./views/region-tree-grid-disablesort').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_global_plugin':
      return import('./views/master-global-plugin').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_exp_view_cache':
      return import('./views/master-calendar-exp-view-cache').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_layout':
      return import('./views/master-gantt-layout').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_quicktoolbar':
      return import('./views/region-tree-grid-quicktoolbar').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_user':
      return import('./views/master-calendar-rightnav-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_dyna_enbale':
      return import('./views/master-card-dyna-enbale').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_redirect_view':
      return import('./views/region-redirect-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_exp_no_cache_chart_exp_view':
      return import('./views/master-chart-exp-no-cache-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_item_render':
      return import('./views/master-panel-item-render').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_baseurl':
      return import('./views/master-map-baseurl').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_meditpanel_base':
      return import('./views/region-meditpanel-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_design_preview':
      return import('./views/master-grid-design-preview').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_list_separator_list_exp_view':
      return import('./views/region-list-separator-list-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_editor_list_box':
      return import('./views/master-editor-list-box').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_grid_cache_grid_exp_view':
      return import('./views/region-grid-cache-grid-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_value_display':
      return import('./views/master-form-value-display').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_short_cut':
      return import('./views/master-short-cut').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_map_drilldown':
      return import('./views/master-map-drilldown').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_advanced_search':
      return import('./views/master-advanced-search').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_textbox_signature':
      return import('./views/master-textbox-signature').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_update':
      return import('./views/master-grid-update').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel':
      return import('./views/master-tabexppanel').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_group':
      return import('./views/master-grid-group').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_gantt_base':
      return import('./views/master-gantt-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_call_view_ability':
      return import('./views/master-call-view-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_nav_param_scatter_chart_exp_view':
      return import('./views/master-nav-param-scatter-chart-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_workflow_design_grid':
      return import('./views/category-workflow-design-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_treepickupcontrolview':
      return import('./views/master-pickup-treepickupcontrolview').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_row_expand_tree_grid':
      return import('./views/region-row-expand-tree-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_edit_row':
      return import('./views/master-grid-edit-row').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_refreshtabexpview':
      return import('./views/master-tree-grid-ex-refreshtabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_dedataset_datasource':
      return import('./views/master-tree-dedataset-datasource').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_base':
      return import('./views/master-searchbar-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_entitynode':
      return import('./views/master-tree-grid-ex-entitynode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_muleditview2':
      return import('./views/master-pickup-muleditview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_line':
      return import('./views/master-chart-line').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_ui_logic_params':
      return import('./views/master-ui-logic-params').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_grid_view':
      return import('./views/category-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_page':
      return import('./views/master-list-page').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_sort_group_draggable':
      return import('./views/master-card-sort-group-draggable').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_list_event_call_exp':
      return import('./views/master-list-event-call-exp').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_media':
      return import('./views/master-panel-media').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_view':
      return import('./views/master-calendar-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_panel_text':
      return import('./views/master-panel-text').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_drtab_event_ability':
      return import('./views/master-drtab-event-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_form_css':
      return import('./views/master-form-css').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_activity_display':
      return import('./views/master-activity-display').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_virtualized_list':
      return import('./views/master-virtualized-list').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tabexppanel_right':
      return import('./views/master-tabexppanel-right').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_base_calendar_exp_view':
      return import('./views/master-base-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_refreshmode':
      return import('./views/master-calendar-refreshmode').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_editview2':
      return import('./views/master-pickup-editview-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_pickup_multabexpview':
      return import('./views/master-pickup-multabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_grid_view':
      return import('./views/master-grid-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_width_height':
      return import('./views/master-card-width-height').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_entity_field_grid':
      return import('./views/master-entity-field-grid').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_new':
      return import('./views/master-card-new').then(
        m => m.default as unknown as IAppView,
      );
    case 'admin_index':
      return import('./views/admin-index').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_rightnav_multiple_data':
      return import('./views/master-calendar-rightnav-multiple-data').then(
        m => m.default as unknown as IAppView,
      );
    case 'region_tree_grid_exporttabexpview':
      return import('./views/region-tree-grid-exporttabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_loadmore':
      return import('./views/master-tree-loadmore').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_ability':
      return import('./views/master-searchbar-ability').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_workflow_design_edit':
      return import('./views/master-workflow-design-edit').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_day_nav_param_calendar_exp_view':
      return import('./views/master-day-nav-param-calendar-exp-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'category_edit_view':
      return import('./views/category-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_chart_regional':
      return import('./views/master-chart-regional').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_wizard_base':
      return import('./views/master-wizard-base').then(
        m => m.default as unknown as IAppView,
      );
    case 'report_edit_view':
      return import('./views/report-edit-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_calendar_bottomnav_user':
      return import('./views/master-calendar-bottomnav-user').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_searchbar_ph':
      return import('./views/master-searchbar-ph').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_grid_ex_rowedittabexpview':
      return import('./views/master-tree-grid-ex-rowedittabexpview').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_counter':
      return import('./views/master-counter').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_tree_eventcall':
      return import('./views/master-tree-eventcall').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_card_pagingbar':
      return import('./views/master-card-pagingbar').then(
        m => m.default as unknown as IAppView,
      );
    default:
      throw new Error(`无法找到视图模型：${name}`);
  }
}

export async function getAppModel(): Promise<IApplication> {
  ibiz.hub.defaultAppIndexViewName = 'admin_index';
  return import('./app/app').then(m => {
    const app = m.default as IData;
    // 设置应用原始模型到hub中
    ibiz.hub.setAppSourceModel(app.appId, app);
    app.appUtils?.forEach((util: IData) => {
      util.appId = app.appId;
    });
    // app.appId = undefined;
    return app as IApplication;
  });
}
