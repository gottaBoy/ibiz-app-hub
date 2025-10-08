import { Component, defineAsyncComponent } from 'vue';

function calcAppViewId(tag: string): string {
  let id = '';
  if (tag.indexOf('.') !== -1) {
    const ids = tag.split('.');
    id = ids[ids.length - 1];
  } else {
    id = tag.toLowerCase();
  }
  return id;
}

export async function getAppViewComponent(
  name: string,
  appId: string,
): Promise<Component> {
  const _name = calcAppViewId(name).toLowerCase();
  // 子应用视图
  if (appId !== ibiz.env.appId) {
    return defineAsyncComponent(
      () => import('../../components/sub-app-view/sub-app-view.vue'),
    );
  }
  switch (_name) {
    case 'master_list_view':
      return defineAsyncComponent(
        () => import('./master/master-list-view/master-list-view.vue'),
      );
    case 'master_drbar_event_and_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-event-and-call/master-drbar-event-and-call.vue'
          ),
      );
    case 'master_drbar_ability':
      return defineAsyncComponent(
        () => import('./master/master-drbar-ability/master-drbar-ability.vue'),
      );
    case 'master_logic_plugin':
      return defineAsyncComponent(
        () => import('./master/master-logic-plugin/master-logic-plugin.vue'),
      );
    case 'master_tree_select':
      return defineAsyncComponent(
        () => import('./master/master-tree-select/master-tree-select.vue'),
      );
    case 'master_editor_date_range':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-date-range/master-editor-date-range.vue'
          ),
      );
    case 'master_tree_grid_ex_rowedit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-rowedit/master-tree-grid-ex-rowedit.vue'
          ),
      );
    case 'master_kanban_dyna_visible':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-dyna-visible/master-kanban-dyna-visible.vue'
          ),
      );
    case 'master_tree_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-refreshmode/master-tree-refreshmode.vue'
          ),
      );
    case 'master_calendar_rightnav_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-timeline/master-calendar-rightnav-timeline.vue'
          ),
      );
    case 'master_actions_federation':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-actions-federation/master-actions-federation.vue'
          ),
      );
    case 'master_searchform_advanced':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchform-advanced/master-searchform-advanced.vue'
          ),
      );
    case 'master_grid_refresh_default':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-refresh-default/master-grid-refresh-default.vue'
          ),
      );
    case 'master_toolbar_base':
      return defineAsyncComponent(
        () => import('./master/master-toolbar-base/master-toolbar-base.vue'),
      );
    case 'master_ctrl_event_trigger':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ctrl-event-trigger/master-ctrl-event-trigger.vue'
          ),
      );
    case 'region_meditpanel_event_and_call':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-meditpanel-event-and-call/region-meditpanel-event-and-call.vue'
          ),
      );
    case 'master_form_event_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-event-tab-exp-view/master-form-event-tab-exp-view.vue'
          ),
      );
    case 'master_theme_plugin':
      return defineAsyncComponent(
        () => import('./master/master-theme-plugin/master-theme-plugin.vue'),
      );
    case 'master_editform_anchor':
      return defineAsyncComponent(
        () =>
          import('./master/master-editform-anchor/master-editform-anchor.vue'),
      );
    case 'master_editor_spanlink':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-spanlink/master-editor-spanlink.vue'),
      );
    case 'master_card_sort_exp':
      return defineAsyncComponent(
        () => import('./master/master-card-sort-exp/master-card-sort-exp.vue'),
      );
    case 'master_drtab_show_edit':
      return defineAsyncComponent(
        () =>
          import('./master/master-drtab-show-edit/master-drtab-show-edit.vue'),
      );
    case 'master_searchbar_logic_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-logic-event/master-searchbar-logic-event.vue'
          ),
      );
    case 'master_calendar_user':
      return defineAsyncComponent(
        () => import('./master/master-calendar-user/master-calendar-user.vue'),
      );
    case 'master_form_design_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-design-edit/master-form-design-edit.vue'
          ),
      );
    case 'master_kanban_swimlane_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-draggable/master-kanban-swimlane-draggable.vue'
          ),
      );
    case 'master_panel_container_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-container-datasource/master-panel-container-datasource.vue'
          ),
      );
    case 'master_kanban_swimlane_groupstyle2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-groupstyle-2/master-kanban-swimlane-groupstyle-2.vue'
          ),
      );
    case 'top_menu':
      return defineAsyncComponent(() => import('./top-menu/top-menu.vue'));
    case 'master_counter_exp_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-counter-exp-grid/master-counter-exp-grid.vue'
          ),
      );
    case 'master_card_grid_layout':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-grid-layout/master-card-grid-layout.vue'
          ),
      );
    case 'master_calendar_contextmenu_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-day/master-calendar-contextmenu-day.vue'
          ),
      );
    case 'master_calendar_nav_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-week/master-calendar-nav-week.vue'
          ),
      );
    case 'master_kanban_base_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-kanban-base-exp/master-kanban-base-exp.vue'),
      );
    case 'master_usr4409_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-usr-4409-edit-view/master-usr-4409-edit-view.vue'
          ),
      );
    case 'master_card_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-group-draggable/master-card-group-draggable.vue'
          ),
      );
    case 'master_grid_agg_all':
      return defineAsyncComponent(
        () => import('./master/master-grid-agg-all/master-grid-agg-all.vue'),
      );
    case 'master_ui_logic_nodetabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-logic-nodetabexpview/master-ui-logic-nodetabexpview.vue'
          ),
      );
    case 'master_grid_percent':
      return defineAsyncComponent(
        () => import('./master/master-grid-percent/master-grid-percent.vue'),
      );
    case 'master_card_cardstyle2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-cardstyle-2/master-card-cardstyle-2.vue'
          ),
      );
    case 'master_drtab_dropdown':
      return defineAsyncComponent(
        () =>
          import('./master/master-drtab-dropdown/master-drtab-dropdown.vue'),
      );
    case 'master_list_dyna_blank':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-dyna-blank/master-list-dyna-blank.vue'),
      );
    case 'region_list_nocache_list_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-list-nocache-list-exp-view/region-list-nocache-list-exp-view.vue'
          ),
      );
    case 'master_card_load_mode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-load-mode-exp/master-card-load-mode-exp.vue'
          ),
      );
    case 'master_list_defaultexpandall':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-defaultexpandall/master-list-defaultexpandall.vue'
          ),
      );
    case 'master_panel_panel_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-container/master-panel-panel-container.vue'
          ),
      );
    case 'region_medit_view9':
      return defineAsyncComponent(
        () => import('./region/region-medit-view-9/region-medit-view-9.vue'),
      );
    case 'master_drbar':
      return defineAsyncComponent(
        () => import('./master/master-drbar/master-drbar.vue'),
      );
    case 'master_ui_plugin':
      return defineAsyncComponent(
        () => import('./master/master-ui-plugin/master-ui-plugin.vue'),
      );
    case 'master_calendar_nav_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-timeline/master-calendar-nav-timeline.vue'
          ),
      );
    case 'master_kannam_order_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kannam-order-draggable/master-kannam-order-draggable.vue'
          ),
      );
    case 'master_pickup_gridmpickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-gridmpickupview/master-pickup-gridmpickupview.vue'
          ),
      );
    case 'master_panel_searchbuttons':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-searchbuttons/master-panel-searchbuttons.vue'
          ),
      );
    case 'master_drbar_count':
      return defineAsyncComponent(
        () => import('./master/master-drbar-count/master-drbar-count.vue'),
      );
    case 'category_grid_design':
      return defineAsyncComponent(
        () =>
          import('./category/category-grid-design/category-grid-design.vue'),
      );
    case 'master_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-exp-view/master-calendar-exp-view.vue'
          ),
      );
    case 'master_kanban_draggable_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-draggable-edit/master-kanban-draggable-edit.vue'
          ),
      );
    case 'master_editor_markdown':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-markdown/master-editor-markdown.vue'),
      );
    case 'psde_logic_edit_view':
      return defineAsyncComponent(
        () =>
          import('./psde-logic/psde-logic-edit-view/psde-logic-edit-view.vue'),
      );
    case 'region_tree_grid_eventtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-eventtabexpview/region-tree-grid-eventtabexpview.vue'
          ),
      );
    case 'master_form_logic':
      return defineAsyncComponent(
        () => import('./master/master-form-logic/master-form-logic.vue'),
      );
    case 'master_codelist_multiple':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-codelist-multiple/master-codelist-multiple.vue'
          ),
      );
    case 'master_kanban_swimlane':
      return defineAsyncComponent(
        () =>
          import('./master/master-kanban-swimlane/master-kanban-swimlane.vue'),
      );
    case 'master_list_cssandicon':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-cssandicon/master-list-cssandicon.vue'),
      );
    case 'master_editor_plugin':
      return defineAsyncComponent(
        () => import('./master/master-editor-plugin/master-editor-plugin.vue'),
      );
    case 'master_pickup_cardpickupcontrolview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-cardpickupcontrolview/master-pickup-cardpickupcontrolview.vue'
          ),
      );
    case 'master_map_area':
      return defineAsyncComponent(
        () => import('./master/master-map-area/master-map-area.vue'),
      );
    case 'master_gantt_day':
      return defineAsyncComponent(
        () => import('./master/master-gantt-day/master-gantt-day.vue'),
      );
    case 'master_codelist_cache':
      return defineAsyncComponent(
        () =>
          import('./master/master-codelist-cache/master-codelist-cache.vue'),
      );
    case 'master_calendar_bottomnav_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-week/master-calendar-bottomnav-week.vue'
          ),
      );
    case 'master_searchbar_count_default':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-count-default/master-searchbar-count-default.vue'
          ),
      );
    case 'master_view_message':
      return defineAsyncComponent(
        () => import('./master/master-view-message/master-view-message.vue'),
      );
    case 'region_pickup_data_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-pickup-data-view/region-pickup-data-view.vue'
          ),
      );
    case 'master_editor_input':
      return defineAsyncComponent(
        () => import('./master/master-editor-input/master-editor-input.vue'),
      );
    case 'master_grid_nav_bottom':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-nav-bottom/master-grid-nav-bottom.vue'),
      );
    case 'master_tree_call':
      return defineAsyncComponent(
        () => import('./master/master-tree-call/master-tree-call.vue'),
      );
    case 'master_calendar_expand':
      return defineAsyncComponent(
        () =>
          import('./master/master-calendar-expand/master-calendar-expand.vue'),
      );
    case 'master_editform_repeater_form_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-form-sort/master-editform-repeater-form-sort.vue'
          ),
      );
    case 'master_panel_panel_ctrl_pos':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-ctrl-pos/master-panel-panel-ctrl-pos.vue'
          ),
      );
    case 'master_quick_search':
      return defineAsyncComponent(
        () => import('./master/master-quick-search/master-quick-search.vue'),
      );
    case 'master_no_cache_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-no-cache-data-view-exp-view/master-no-cache-data-view-exp-view.vue'
          ),
      );
    case 'master_chart_exp_nav_param_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-nav-param-tab-exp-view/master-chart-exp-nav-param-tab-exp-view.vue'
          ),
      );
    case 'master_edit_view':
      return defineAsyncComponent(
        () => import('./master/master-edit-view/master-edit-view.vue'),
      );
    case 'master_treegridex_nav_bottom':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treegridex-nav-bottom/master-treegridex-nav-bottom.vue'
          ),
      );
    case 'master_drbar_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-counter-disabled/master-drbar-counter-disabled.vue'
          ),
      );
    case 'master_editor_dropdown_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-dropdown-list/master-editor-dropdown-list.vue'
          ),
      );
    case 'master_chart_grid_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-grid-tab-exp-view/master-chart-grid-tab-exp-view.vue'
          ),
      );
    case 'master_chart_exp_view_line':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-view-line/master-chart-exp-view-line.vue'
          ),
      );
    case 'master_calendar_layout_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-layout-month/master-calendar-layout-month.vue'
          ),
      );
    case 'master_editor_switch':
      return defineAsyncComponent(
        () => import('./master/master-editor-switch/master-editor-switch.vue'),
      );
    case 'master_ui_action_backend':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-backend/master-ui-action-backend.vue'
          ),
      );
    case 'master_tree_appgloable_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-appgloable-datasource/master-tree-appgloable-datasource.vue'
          ),
      );
    case 'region_tree_grid_cacherefresh':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-cacherefresh/region-tree-grid-cacherefresh.vue'
          ),
      );
    case 'region_tree_grid_colupdate_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-colupdate-tab-exp-view/region-tree-grid-colupdate-tab-exp-view.vue'
          ),
      );
    case 'ps_core_prd_func_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './ps-core-prd-func/ps-core-prd-func-tree-exp-view/ps-core-prd-func-tree-exp-view.vue'
          ),
      );
    case 'master_data_picker_embed_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-picker-embed-view/master-data-picker-embed-view.vue'
          ),
      );
    case 'master_grid_edit_cell':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-edit-cell/master-grid-edit-cell.vue'),
      );
    case 'master_card_empty':
      return defineAsyncComponent(
        () => import('./master/master-card-empty/master-card-empty.vue'),
      );
    case 'master_list_empty':
      return defineAsyncComponent(
        () => import('./master/master-list-empty/master-list-empty.vue'),
      );
    case 'master_kanban_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-group-draggable/master-kanban-group-draggable.vue'
          ),
      );
    case 'master_list_rowdetail_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-rowdetail-nav/master-list-rowdetail-nav.vue'
          ),
      );
    case 'master_calendar_logic_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-logic-event/master-calendar-logic-event.vue'
          ),
      );
    case 'master_card_disable_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-disable-sort/master-card-disable-sort.vue'
          ),
      );
    case 'master_left_top_anchor_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-left-top-anchor-edit-view/master-left-top-anchor-edit-view.vue'
          ),
      );
    case 'region_grid_nav':
      return defineAsyncComponent(
        () => import('./region/region-grid-nav/region-grid-nav.vue'),
      );
    case 'master_tree_contextmenu':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-contextmenu/master-tree-contextmenu.vue'
          ),
      );
    case 'master_drbar_group':
      return defineAsyncComponent(
        () => import('./master/master-drbar-group/master-drbar-group.vue'),
      );
    case 'detail_edit_view':
      return defineAsyncComponent(
        () => import('./detail/detail-edit-view/detail-edit-view.vue'),
      );
    case 'master_panel_scroll_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-scroll-container/master-panel-scroll-container.vue'
          ),
      );
    case 'detail_meditpanel_embed':
      return defineAsyncComponent(
        () =>
          import(
            './detail/detail-meditpanel-embed/detail-meditpanel-embed.vue'
          ),
      );
    case 'master_calendar_rightnav_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-month/master-calendar-rightnav-month.vue'
          ),
      );
    case 'master_kanban_codelist_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-codelist-group/master-kanban-codelist-group.vue'
          ),
      );
    case 'master_drtab_logic_script':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drtab-logic-script/master-drtab-logic-script.vue'
          ),
      );
    case 'master_wizard_event_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-event-tab-exp-view/master-wizard-event-tab-exp-view.vue'
          ),
      );
    case 'master_ui_logic_link':
      return defineAsyncComponent(
        () => import('./master/master-ui-logic-link/master-ui-logic-link.vue'),
      );
    case 'master_wizard_state':
      return defineAsyncComponent(
        () => import('./master/master-wizard-state/master-wizard-state.vue'),
      );
    case 'master_data_dashboard_carousel_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-dashboard-carousel-grid/master-data-dashboard-carousel-grid.vue'
          ),
      );
    case 'master_card_refreshmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-refreshmode-exp/master-card-refreshmode-exp.vue'
          ),
      );
    case 'master_view_msg_pos':
      return defineAsyncComponent(
        () => import('./master/master-view-msg-pos/master-view-msg-pos.vue'),
      );
    case 'master_tabexppanel_base':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-base/master-tabexppanel-base.vue'
          ),
      );
    case 'master_pickup_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-edit-view/master-pickup-edit-view.vue'
          ),
      );
    case 'master_kanban_swimlane_enablegrouphidden':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-enablegrouphidden/master-kanban-swimlane-enablegrouphidden.vue'
          ),
      );
    case 'master_card_layout_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-layout-exp/master-card-layout-exp.vue'),
      );
    case 'master_grid_edit':
      return defineAsyncComponent(
        () => import('./master/master-grid-edit/master-grid-edit.vue'),
      );
    case 'master_drtab_base':
      return defineAsyncComponent(
        () => import('./master/master-drtab-base/master-drtab-base.vue'),
      );
    case 'master_calendar_nav_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-user/master-calendar-nav-user.vue'
          ),
      );
    case 'master_panel':
      return defineAsyncComponent(
        () => import('./master/master-panel/master-panel.vue'),
      );
    case 'category_grid_design_edit':
      return defineAsyncComponent(
        () =>
          import(
            './category/category-grid-design-edit/category-grid-design-edit.vue'
          ),
      );
    case 'master_grid_expand':
      return defineAsyncComponent(
        () => import('./master/master-grid-expand/master-grid-expand.vue'),
      );
    case 'master_tree_cursession_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-cursession-datasource/master-tree-cursession-datasource.vue'
          ),
      );
    case 'master_grid_order':
      return defineAsyncComponent(
        () => import('./master/master-grid-order/master-grid-order.vue'),
      );
    case 'master_save_change':
      return defineAsyncComponent(
        () => import('./master/master-save-change/master-save-change.vue'),
      );
    case 'master_list_built_in_toobar_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-built-in-toobar-exp/master-list-built-in-toobar-exp.vue'
          ),
      );
    case 'master_wizard_call':
      return defineAsyncComponent(
        () => import('./master/master-wizard-call/master-wizard-call.vue'),
      );
    case 'master_card_draggable_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-draggable-edit/master-card-draggable-edit.vue'
          ),
      );
    case 'region_detail_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-detail-grid-view/region-detail-grid-view.vue'
          ),
      );
    case 'master_panel_multi_data_container_raw':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-multi-data-container-raw/master-panel-multi-data-container-raw.vue'
          ),
      );
    case 'master_panel_panel_rawitem':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-rawitem/master-panel-panel-rawitem.vue'
          ),
      );
    case 'master_card_codelist_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-codelist-group/master-card-codelist-group.vue'
          ),
      );
    case 'master_panel_container':
      return defineAsyncComponent(
        () =>
          import('./master/master-panel-container/master-panel-container.vue'),
      );
    case 'master_drtab_logic_hidden':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drtab-logic-hidden/master-drtab-logic-hidden.vue'
          ),
      );
    case 'master_treegridex_column_uiaction_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treegridex-column-uiaction-group/master-treegridex-column-uiaction-group.vue'
          ),
      );
    case 'master_searchform_ability':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchform-ability/master-searchform-ability.vue'
          ),
      );
    case 'master_list_ext_view1':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-ext-view-1/master-list-ext-view-1.vue'),
      );
    case 'master_editform_repeater_form_style2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-form-style-2/master-editform-repeater-form-style-2.vue'
          ),
      );
    case 'master_data_view':
      return defineAsyncComponent(
        () => import('./master/master-data-view/master-data-view.vue'),
      );
    case 'master_map_custom_cond':
      return defineAsyncComponent(
        () =>
          import('./master/master-map-custom-cond/master-map-custom-cond.vue'),
      );
    case 'master_grid_update_back':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-update-back/master-grid-update-back.vue'
          ),
      );
    case 'master_form_hover':
      return defineAsyncComponent(
        () => import('./master/master-form-hover/master-form-hover.vue'),
      );
    case 'master_kanban_page':
      return defineAsyncComponent(
        () => import('./master/master-kanban-page/master-kanban-page.vue'),
      );
    case 'master_grid_view':
      return defineAsyncComponent(
        () => import('./master/master-grid-view/master-grid-view.vue'),
      );
    case 'master_de_action_plugin':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-de-action-plugin/master-de-action-plugin.vue'
          ),
      );
    case 'master_kanban_cache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-cache-refreshmode/master-kanban-cache-refreshmode.vue'
          ),
      );
    case 'master_de_logic_params':
      return defineAsyncComponent(
        () =>
          import('./master/master-de-logic-params/master-de-logic-params.vue'),
      );
    case 'master_horizontal_chart':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-horizontal-chart/master-horizontal-chart.vue'
          ),
      );
    case 'region_tree_grid_noheader':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-noheader/region-tree-grid-noheader.vue'
          ),
      );
    case 'master_modal_data_switching_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-modal-data-switching-edit/master-modal-data-switching-edit.vue'
          ),
      );
    case 'master_upload_image_preview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-upload-image-preview/master-upload-image-preview.vue'
          ),
      );
    case 'master_kanban_view':
      return defineAsyncComponent(
        () => import('./master/master-kanban-view/master-kanban-view.vue'),
      );
    case 'master_kanban_enablefullscreen':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-enablefullscreen/master-kanban-enablefullscreen.vue'
          ),
      );
    case 'region_tree_grid_localsort':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-localsort/region-tree-grid-localsort.vue'
          ),
      );
    case 'region_edit_view':
      return defineAsyncComponent(
        () => import('./region/region-edit-view/region-edit-view.vue'),
      );
    case 'master_card_right_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-right-nav/master-card-right-nav.vue'),
      );
    case 'master_pickup_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-tabexpview/master-pickup-tabexpview.vue'
          ),
      );
    case 'master_grid_export_front':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-export-front/master-grid-export-front.vue'
          ),
      );
    case 'master_grid_sort':
      return defineAsyncComponent(
        () => import('./master/master-grid-sort/master-grid-sort.vue'),
      );
    case 'master_grid_value_display':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-value-display/master-grid-value-display.vue'
          ),
      );
    case 'master_tabexppanel_left':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-left/master-tabexppanel-left.vue'
          ),
      );
    case 'master_ui_action':
      return defineAsyncComponent(
        () => import('./master/master-ui-action/master-ui-action.vue'),
      );
    case 'master_panel_counter':
      return defineAsyncComponent(
        () => import('./master/master-panel-counter/master-panel-counter.vue'),
      );
    case 'master_searchformitemevent':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchformitemevent/master-searchformitemevent.vue'
          ),
      );
    case 'master_wizard':
      return defineAsyncComponent(
        () => import('./master/master-wizard/master-wizard.vue'),
      );
    case 'master_grid_ability':
      return defineAsyncComponent(
        () => import('./master/master-grid-ability/master-grid-ability.vue'),
      );
    case 'master_tree_cascadeselectpickup':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-cascadeselectpickup/master-tree-cascadeselectpickup.vue'
          ),
      );
    case 'master_grid_wrap':
      return defineAsyncComponent(
        () => import('./master/master-grid-wrap/master-grid-wrap.vue'),
      );
    case 'apploginview':
      return defineAsyncComponent(
        () => import('./apploginview/apploginview.vue'),
      );
    case 'about_drawer_hidden_mask':
      return defineAsyncComponent(
        () =>
          import(
            './about/about-drawer-hidden-mask/about-drawer-hidden-mask.vue'
          ),
      );
    case 'master_de_logic_regular':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-de-logic-regular/master-de-logic-regular.vue'
          ),
      );
    case 'master_drbar_logic_count':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-logic-count/master-drbar-logic-count.vue'
          ),
      );
    case 'master_kanban_swimlane_batchtoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-batchtoolbar/master-kanban-swimlane-batchtoolbar.vue'
          ),
      );
    case 'master_count_searchbar':
      return defineAsyncComponent(
        () =>
          import('./master/master-count-searchbar/master-count-searchbar.vue'),
      );
    case 'master_calendar_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-cache-tab-exp-view/master-calendar-cache-tab-exp-view.vue'
          ),
      );
    case 'master_tab_exp_view':
      return defineAsyncComponent(
        () => import('./master/master-tab-exp-view/master-tab-exp-view.vue'),
      );
    case 'func_demo':
      return defineAsyncComponent(() => import('./func-demo/func-demo.vue'));
    case 'region_list_navparam_list_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-list-navparam-list-exp-view/region-list-navparam-list-exp-view.vue'
          ),
      );
    case 'region_tree_grid_event':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-event/region-tree-grid-event.vue'),
      );
    case 'master_tree_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-counter-disabled/master-tree-counter-disabled.vue'
          ),
      );
    case 'master_list_paging_load':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-paging-load/master-list-paging-load.vue'
          ),
      );
    case 'region_treegrid_column_uiaction_group':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-treegrid-column-uiaction-group/region-treegrid-column-uiaction-group.vue'
          ),
      );
    case 'master_calendar_layout_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-layout-day/master-calendar-layout-day.vue'
          ),
      );
    case 'master_calendar_nav_param_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-param-tab-exp-view/master-calendar-nav-param-tab-exp-view.vue'
          ),
      );
    case 'master_card_built_in_toolbar_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-built-in-toolbar-exp/master-card-built-in-toolbar-exp.vue'
          ),
      );
    case 'master_panel_attr':
      return defineAsyncComponent(
        () => import('./master/master-panel-attr/master-panel-attr.vue'),
      );
    case 'master_grid_export':
      return defineAsyncComponent(
        () => import('./master/master-grid-export/master-grid-export.vue'),
      );
    case 'master_ui_action_custom':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-custom/master-ui-action-custom.vue'
          ),
      );
    case 'master_data_picker_link':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-picker-link/master-data-picker-link.vue'
          ),
      );
    case 'master_dropdown_emoji':
      return defineAsyncComponent(
        () =>
          import('./master/master-dropdown-emoji/master-dropdown-emoji.vue'),
      );
    case 'master_report_view':
      return defineAsyncComponent(
        () => import('./master/master-report-view/master-report-view.vue'),
      );
    case 'master_teleport_placeholder':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder/master-teleport-placeholder.vue'
          ),
      );
    case 'master_panel_panel_container_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-container-group/master-panel-panel-container-group.vue'
          ),
      );
    case 'master_grid_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-refreshmode/master-grid-refreshmode.vue'
          ),
      );
    case 'master_card_fast_new':
      return defineAsyncComponent(
        () => import('./master/master-card-fast-new/master-card-fast-new.vue'),
      );
    case 'master_tree_drag':
      return defineAsyncComponent(
        () => import('./master/master-tree-drag/master-tree-drag.vue'),
      );
    case 'master_tree_ctrl_federation':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-ctrl-federation/master-tree-ctrl-federation.vue'
          ),
      );
    case 'master_view_event_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-event-edit-view/master-view-event-edit-view.vue'
          ),
      );
    case 'master_chart_candlestick':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-candlestick/master-chart-candlestick.vue'
          ),
      );
    case 'master_chart_instrument':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-instrument/master-chart-instrument.vue'
          ),
      );
    case 'master_toolbar':
      return defineAsyncComponent(
        () => import('./master/master-toolbar/master-toolbar.vue'),
      );
    case 'region_grid_navparam_grid_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-grid-navparam-grid-exp-view/region-grid-navparam-grid-exp-view.vue'
          ),
      );
    case 'master_searchbar':
      return defineAsyncComponent(
        () => import('./master/master-searchbar/master-searchbar.vue'),
      );
    case 'master_chart_group_mode_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-mode-tab-exp-view/master-chart-group-mode-tab-exp-view.vue'
          ),
      );
    case 'master_calendar_daterange':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-daterange/master-calendar-daterange.vue'
          ),
      );
    case 'master_drtab_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drtab-counter-disabled/master-drtab-counter-disabled.vue'
          ),
      );
    case 'master_calendar_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-showmode/master-calendar-showmode.vue'
          ),
      );
    case 'master_calendar_multiple_data_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data-week/master-calendar-multiple-data-week.vue'
          ),
      );
    case 'master_editor_date_picker':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-date-picker/master-editor-date-picker.vue'
          ),
      );
    case 'master_card_default_style':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-default-style/master-card-default-style.vue'
          ),
      );
    case 'master_view_open_mode':
      return defineAsyncComponent(
        () =>
          import('./master/master-view-open-mode/master-view-open-mode.vue'),
      );
    case 'master_codelist_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-codelist-tabexpview/master-codelist-tabexpview.vue'
          ),
      );
    case 'master_gantt_ability':
      return defineAsyncComponent(
        () => import('./master/master-gantt-ability/master-gantt-ability.vue'),
      );
    case 'master_grid_onlydata':
      return defineAsyncComponent(
        () => import('./master/master-grid-onlydata/master-grid-onlydata.vue'),
      );
    case 'master_calendar_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-timeline/master-calendar-timeline.vue'
          ),
      );
    case 'category_pickup_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './category/category-pickup-grid-view/category-pickup-grid-view.vue'
          ),
      );
    case 'master_right_anchor_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-right-anchor-edit-view/master-right-anchor-edit-view.vue'
          ),
      );
    case 'master_ui_action_uilogic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-uilogic/master-ui-action-uilogic.vue'
          ),
      );
    case 'master_editor_date_range_select':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-date-range-select/master-editor-date-range-select.vue'
          ),
      );
    case 'master_grid_data_picker_link':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-data-picker-link/master-grid-data-picker-link.vue'
          ),
      );
    case 'master_list_load_more':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-load-more/master-list-load-more.vue'),
      );
    case 'master_counter_plugin':
      return defineAsyncComponent(
        () =>
          import('./master/master-counter-plugin/master-counter-plugin.vue'),
      );
    case 'master_data_picker_select_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-picker-select-view/master-data-picker-select-view.vue'
          ),
      );
    case 'master_ui_logic_advanced':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-logic-advanced/master-ui-logic-advanced.vue'
          ),
      );
    case 'master_grid_view_read':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-view-read/master-grid-view-read.vue'),
      );
    case 'master_card_showmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-showmode-exp/master-card-showmode-exp.vue'
          ),
      );
    case 'master_calendar':
      return defineAsyncComponent(
        () => import('./master/master-calendar/master-calendar.vue'),
      );
    case 'master_pickup_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-grid-view/master-pickup-grid-view.vue'
          ),
      );
    case 'master_kanban_cssandicon':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-cssandicon/master-kanban-cssandicon.vue'
          ),
      );
    case 'region_tree_grid_enable':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-enable/region-tree-grid-enable.vue'
          ),
      );
    case 'master_drtab_left':
      return defineAsyncComponent(
        () => import('./master/master-drtab-left/master-drtab-left.vue'),
      );
    case 'master_toolbar_style':
      return defineAsyncComponent(
        () => import('./master/master-toolbar-style/master-toolbar-style.vue'),
      );
    case 'master_searchbar_count_hidden':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-count-hidden/master-searchbar-count-hidden.vue'
          ),
      );
    case 'master_counter_exp_form':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-counter-exp-form/master-counter-exp-form.vue'
          ),
      );
    case 'category_option_view':
      return defineAsyncComponent(
        () =>
          import('./category/category-option-view/category-option-view.vue'),
      );
    case 'psde_logic_quick_cfg_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-quick-cfg-view/psde-logic-quick-cfg-view.vue'
          ),
      );
    case 'master_line_right_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-line-right-nav/master-line-right-nav.vue'),
      );
    case 'master_grid_edit_all':
      return defineAsyncComponent(
        () => import('./master/master-grid-edit-all/master-grid-edit-all.vue'),
      );
    case 'master_chart_nav_param_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-nav-param-chart-exp-view/master-chart-nav-param-chart-exp-view.vue'
          ),
      );
    case 'master_searchform_auto':
      return defineAsyncComponent(
        () =>
          import('./master/master-searchform-auto/master-searchform-auto.vue'),
      );
    case 'master_tree_cascadeselectedit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-cascadeselectedit/master-tree-cascadeselectedit.vue'
          ),
      );
    case 'master_editor_html':
      return defineAsyncComponent(
        () => import('./master/master-editor-html/master-editor-html.vue'),
      );
    case 'master_tree_parent_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-parent-datasource/master-tree-parent-datasource.vue'
          ),
      );
    case 'master_calendar_week':
      return defineAsyncComponent(
        () => import('./master/master-calendar-week/master-calendar-week.vue'),
      );
    case 'master_pivottable':
      return defineAsyncComponent(
        () => import('./master/master-pivottable/master-pivottable.vue'),
      );
    case 'master_card_userstyle':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-userstyle/master-card-userstyle.vue'),
      );
    case 'master_tree_noderssearch':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-noderssearch/master-tree-noderssearch.vue'
          ),
      );
    case 'region_tree_grid_alledit':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-alledit/region-tree-grid-alledit.vue'
          ),
      );
    case 'master_tabexppanel_position':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-position/master-tabexppanel-position.vue'
          ),
      );
    case 'master_calendar_base':
      return defineAsyncComponent(
        () => import('./master/master-calendar-base/master-calendar-base.vue'),
      );
    case 'master_tree_exbar_tab_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-exbar-tab-cache-tab-exp-view/master-tree-exbar-tab-cache-tab-exp-view.vue'
          ),
      );
    case 'master_editor_raw':
      return defineAsyncComponent(
        () => import('./master/master-editor-raw/master-editor-raw.vue'),
      );
    case 'master_ac_item_plugin':
      return defineAsyncComponent(
        () =>
          import('./master/master-ac-item-plugin/master-ac-item-plugin.vue'),
      );
    case 'master_drtab_bottom':
      return defineAsyncComponent(
        () => import('./master/master-drtab-bottom/master-drtab-bottom.vue'),
      );
    case 'master_card_navexp_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-navexp-exp/master-card-navexp-exp.vue'),
      );
    case 'region_tree_grid_call':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-call/region-tree-grid-call.vue'),
      );
    case 'master_grid_localsort':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-localsort/master-grid-localsort.vue'),
      );
    case 'master_default_date_calendar_view_custom':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-default-date-calendar-view-custom/master-default-date-calendar-view-custom.vue'
          ),
      );
    case 'master_data_dashboard':
      return defineAsyncComponent(
        () =>
          import('./master/master-data-dashboard/master-data-dashboard.vue'),
      );
    case 'master_list_auto_group':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-auto-group/master-list-auto-group.vue'),
      );
    case 'region_tree_grid_rightnav':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-rightnav/region-tree-grid-rightnav.vue'
          ),
      );
    case 'master_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-cache-tab-exp-view/master-cache-tab-exp-view.vue'
          ),
      );
    case 'region_m_pickup_view2':
      return defineAsyncComponent(
        () =>
          import('./region/region-m-pickup-view-2/region-m-pickup-view-2.vue'),
      );
    case 'region_tree_grid_defaultsort':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-defaultsort/region-tree-grid-defaultsort.vue'
          ),
      );
    case 'master_chart_view':
      return defineAsyncComponent(
        () => import('./master/master-chart-view/master-chart-view.vue'),
      );
    case 'master_kanban_group_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-group-action/master-kanban-group-action.vue'
          ),
      );
    case 'master_drtab':
      return defineAsyncComponent(
        () => import('./master/master-drtab/master-drtab.vue'),
      );
    case 'master_list_group_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-group-action/master-list-group-action.vue'
          ),
      );
    case 'master_wizard_view':
      return defineAsyncComponent(
        () => import('./master/master-wizard-view/master-wizard-view.vue'),
      );
    case 'detail_detail_mdctrl_view':
      return defineAsyncComponent(
        () =>
          import(
            './detail/detail-detail-mdctrl-view/detail-detail-mdctrl-view.vue'
          ),
      );
    case 'region_list_tab_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-list-tab-cache-tab-exp-view/region-list-tab-cache-tab-exp-view.vue'
          ),
      );
    case 'master_drtab_logic':
      return defineAsyncComponent(
        () => import('./master/master-drtab-logic/master-drtab-logic.vue'),
      );
    case 'master_editor_slider':
      return defineAsyncComponent(
        () => import('./master/master-editor-slider/master-editor-slider.vue'),
      );
    case 'master_calendar_contextmenu_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-month/master-calendar-contextmenu-month.vue'
          ),
      );
    case 'master_card_event_call':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-event-call/master-card-event-call.vue'),
      );
    case 'master_grid_nav_detail':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-nav-detail/master-grid-nav-detail.vue'),
      );
    case 'master_card_cache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-cache-refreshmode/master-card-cache-refreshmode.vue'
          ),
      );
    case 'master_gantt_draggablesort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-draggablesort/master-gantt-draggablesort.vue'
          ),
      );
    case 'ps_core_prd_func_redirect_view':
      return defineAsyncComponent(
        () =>
          import(
            './ps-core-prd-func/ps-core-prd-func-redirect-view/ps-core-prd-func-redirect-view.vue'
          ),
      );
    case 'master_list_format':
      return defineAsyncComponent(
        () => import('./master/master-list-format/master-list-format.vue'),
      );
    case 'master_tree_embed_pickup':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-embed-pickup/master-tree-embed-pickup.vue'
          ),
      );
    case 'master_chart_bar':
      return defineAsyncComponent(
        () => import('./master/master-chart-bar/master-chart-bar.vue'),
      );
    case 'master_list_base':
      return defineAsyncComponent(
        () => import('./master/master-list-base/master-list-base.vue'),
      );
    case 'master_ui_action_datatarget':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-datatarget/master-ui-action-datatarget.vue'
          ),
      );
    case 'master_kanban_swimlane_group_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-group-action/master-kanban-swimlane-group-action.vue'
          ),
      );
    case 'master_app_portal_demo_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-app-portal-demo-grid-view/master-app-portal-demo-grid-view.vue'
          ),
      );
    case 'master_ui_logic_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-logic-tabexpview/master-ui-logic-tabexpview.vue'
          ),
      );
    case 'master_editor_input_number':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-input-number/master-editor-input-number.vue'
          ),
      );
    case 'master_card_base_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-base-data-view-exp-view/master-card-base-data-view-exp-view.vue'
          ),
      );
    case 'master_tree_grid_ex_celledit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-celledit/master-tree-grid-ex-celledit.vue'
          ),
      );
    case 'master_grid_group_auto':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-group-auto/master-grid-group-auto.vue'),
      );
    case 'master_map_built_in_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-map-built-in-nav/master-map-built-in-nav.vue'
          ),
      );
    case 'master_tree_search':
      return defineAsyncComponent(
        () => import('./master/master-tree-search/master-tree-search.vue'),
      );
    case 'pswfversiondesign':
      return defineAsyncComponent(
        () => import('./pswf-version/pswfversiondesign/pswfversiondesign.vue'),
      );
    case 'region_tree_grid_logictabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-logictabexpview/region-tree-grid-logictabexpview.vue'
          ),
      );
    case 'master_layout_view':
      return defineAsyncComponent(
        () => import('./master/master-layout-view/master-layout-view.vue'),
      );
    case 'master_list_logic_base':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-logic-base/master-list-logic-base.vue'),
      );
    case 'master_pickup_treempickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-treempickupview-2/master-pickup-treempickupview-2.vue'
          ),
      );
    case 'master_drtab_hidden_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drtab-hidden-edit/master-drtab-hidden-edit.vue'
          ),
      );
    case 'master_editor_array':
      return defineAsyncComponent(
        () => import('./master/master-editor-array/master-editor-array.vue'),
      );
    case 'master_tree_refreshmode_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-refreshmode-cache/master-tree-refreshmode-cache.vue'
          ),
      );
    case 'master_view_message_kind':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-message-kind/master-view-message-kind.vue'
          ),
      );
    case 'master_teleport_placeholder_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-grid/master-teleport-placeholder-grid.vue'
          ),
      );
    case 'master_grid_filter':
      return defineAsyncComponent(
        () => import('./master/master-grid-filter/master-grid-filter.vue'),
      );
    case 'region_tree_grid_single':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-single/region-tree-grid-single.vue'
          ),
      );
    case 'master_chart_exp_view2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-view-2/master-chart-exp-view-2.vue'
          ),
      );
    case 'master_ui_action_refresh':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-refresh/master-ui-action-refresh.vue'
          ),
      );
    case 'master_calendar_multiple_data_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data-month/master-calendar-multiple-data-month.vue'
          ),
      );
    case 'region_tree_grid_disablecolcustom':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-disablecolcustom/region-tree-grid-disablecolcustom.vue'
          ),
      );
    case 'master_editform_group_close_mode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-group-close-mode/master-editform-group-close-mode.vue'
          ),
      );
    case 'master_calendar_mixin':
      return defineAsyncComponent(
        () =>
          import('./master/master-calendar-mixin/master-calendar-mixin.vue'),
      );
    case 'master_kanban_event_base':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-event-base/master-kanban-event-base.vue'
          ),
      );
    case 'master_chart_exp_quick_search_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-quick-search-chart-exp-view/master-chart-exp-quick-search-chart-exp-view.vue'
          ),
      );
    case 'master_grid_css':
      return defineAsyncComponent(
        () => import('./master/master-grid-css/master-grid-css.vue'),
      );
    case 'master_panel_cssandicon':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-cssandicon/master-panel-cssandicon.vue'
          ),
      );
    case 'master_calendar_rightnav_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-day/master-calendar-rightnav-day.vue'
          ),
      );
    case 'master_list_base_exp':
      return defineAsyncComponent(
        () => import('./master/master-list-base-exp/master-list-base-exp.vue'),
      );
    case 'master_tree_picker':
      return defineAsyncComponent(
        () => import('./master/master-tree-picker/master-tree-picker.vue'),
      );
    case 'master_event_ability':
      return defineAsyncComponent(
        () => import('./master/master-event-ability/master-event-ability.vue'),
      );
    case 'master_tree_nav_right':
      return defineAsyncComponent(
        () =>
          import('./master/master-tree-nav-right/master-tree-nav-right.vue'),
      );
    case 'region_meditpanel_row':
      return defineAsyncComponent(
        () =>
          import('./region/region-meditpanel-row/region-meditpanel-row.vue'),
      );
    case 'master_chart':
      return defineAsyncComponent(
        () => import('./master/master-chart/master-chart.vue'),
      );
    case 'master_tab_nav':
      return defineAsyncComponent(
        () => import('./master/master-tab-nav/master-tab-nav.vue'),
      );
    case 'master_counter_drbar':
      return defineAsyncComponent(
        () => import('./master/master-counter-drbar/master-counter-drbar.vue'),
      );
    case 'master_completion_date_chart':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-completion-date-chart/master-completion-date-chart.vue'
          ),
      );
    case 'master_panel_counter_hidden':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-counter-hidden/master-panel-counter-hidden.vue'
          ),
      );
    case 'detail_master_drpart':
      return defineAsyncComponent(
        () => import('./detail/detail-master-drpart/detail-master-drpart.vue'),
      );
    case 'region_grid_no_cacha_grid_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-grid-no-cacha-grid-exp-view/region-grid-no-cacha-grid-exp-view.vue'
          ),
      );
    case 'region_quick_create':
      return defineAsyncComponent(
        () => import('./region/region-quick-create/region-quick-create.vue'),
      );
    case 'master_grid_update_front':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-update-front/master-grid-update-front.vue'
          ),
      );
    case 'master_runtime_components':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-runtime-components/master-runtime-components.vue'
          ),
      );
    case 'master_card_cssandicon':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-cssandicon/master-card-cssandicon.vue'),
      );
    case 'master_grid_toolbar_quick':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-toolbar-quick/master-grid-toolbar-quick.vue'
          ),
      );
    case 'master_week_nav_param_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-week-nav-param-calendar-exp-view/master-week-nav-param-calendar-exp-view.vue'
          ),
      );
    case 'master_editor_rate':
      return defineAsyncComponent(
        () => import('./master/master-editor-rate/master-editor-rate.vue'),
      );
    case 'about_modal_hidden_close':
      return defineAsyncComponent(
        () =>
          import(
            './about/about-modal-hidden-close/about-modal-hidden-close.vue'
          ),
      );
    case 'ps_core_prd_func_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './ps-core-prd-func/ps-core-prd-func-edit-view/ps-core-prd-func-edit-view.vue'
          ),
      );
    case 'master_chart_event':
      return defineAsyncComponent(
        () => import('./master/master-chart-event/master-chart-event.vue'),
      );
    case 'region_meditpanel_event':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-meditpanel-event/region-meditpanel-event.vue'
          ),
      );
    case 'master_counter_toolbar':
      return defineAsyncComponent(
        () =>
          import('./master/master-counter-toolbar/master-counter-toolbar.vue'),
      );
    case 'master_grid_attachment_column':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-attachment-column/master-grid-attachment-column.vue'
          ),
      );
    case 'master_de_logic_nodetabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-de-logic-nodetabexpview/master-de-logic-nodetabexpview.vue'
          ),
      );
    case 'master_right_top_anchor_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-right-top-anchor-edit-view/master-right-top-anchor-edit-view.vue'
          ),
      );
    case 'master_list_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-group-draggable/master-list-group-draggable.vue'
          ),
      );
    case 'region_tree_grid_aggtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-aggtabexpview/region-tree-grid-aggtabexpview.vue'
          ),
      );
    case 'master_list_item_new':
      return defineAsyncComponent(
        () => import('./master/master-list-item-new/master-list-item-new.vue'),
      );
    case 'master_searchbar_count':
      return defineAsyncComponent(
        () =>
          import('./master/master-searchbar-count/master-searchbar-count.vue'),
      );
    case 'region_tree_grid_base':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-base/region-tree-grid-base.vue'),
      );
    case 'master_grid_logic_base':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-logic-base/master-grid-logic-base.vue'),
      );
    case 'master_ui_logic_regular':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-logic-regular/master-ui-logic-regular.vue'
          ),
      );
    case 'master_counter_tree':
      return defineAsyncComponent(
        () => import('./master/master-counter-tree/master-counter-tree.vue'),
      );
    case 'master_kanban_nocache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-nocache-refreshmode/master-kanban-nocache-refreshmode.vue'
          ),
      );
    case 'master_form_defiupdate':
      return defineAsyncComponent(
        () =>
          import('./master/master-form-defiupdate/master-form-defiupdate.vue'),
      );
    case 'master_modal_edit_view':
      return defineAsyncComponent(
        () =>
          import('./master/master-modal-edit-view/master-modal-edit-view.vue'),
      );
    case 'about_modal_hidden_mask':
      return defineAsyncComponent(
        () =>
          import('./about/about-modal-hidden-mask/about-modal-hidden-mask.vue'),
      );
    case 'master_data_dashboard_carousel_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-dashboard-carousel-list/master-data-dashboard-carousel-list.vue'
          ),
      );
    case 'master_hovershowplaceholder':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-hovershowplaceholder/master-hovershowplaceholder.vue'
          ),
      );
    case 'region_meditpanel':
      return defineAsyncComponent(
        () => import('./region/region-meditpanel/region-meditpanel.vue'),
      );
    case 'region_grid_exp_view':
      return defineAsyncComponent(
        () => import('./region/region-grid-exp-view/region-grid-exp-view.vue'),
      );
    case 'master_chart_pie':
      return defineAsyncComponent(
        () => import('./master/master-chart-pie/master-chart-pie.vue'),
      );
    case 'region_edit_view2':
      return defineAsyncComponent(
        () => import('./region/region-edit-view-2/region-edit-view-2.vue'),
      );
    case 'master_card_nocache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-nocache-refreshmode/master-card-nocache-refreshmode.vue'
          ),
      );
    case 'master_treegridex_nav_inside':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treegridex-nav-inside/master-treegridex-nav-inside.vue'
          ),
      );
    case 'master_pickup_cardpickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-cardpickupview/master-pickup-cardpickupview.vue'
          ),
      );
    case 'master_list_dyna_logic_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-dyna-logic-exp/master-list-dyna-logic-exp.vue'
          ),
      );
    case 'master_panel_logic':
      return defineAsyncComponent(
        () => import('./master/master-panel-logic/master-panel-logic.vue'),
      );
    case 'master_kanban_event_call_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-event-call-exp/master-kanban-event-call-exp.vue'
          ),
      );
    case 'master_grid_column_uiaction_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-column-uiaction-group/master-grid-column-uiaction-group.vue'
          ),
      );
    case 'master_toolbar_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-toolbar-counter-disabled/master-toolbar-counter-disabled.vue'
          ),
      );
    case 'master_virtualized_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-virtualized-grid/master-virtualized-grid.vue'
          ),
      );
    case 'region_m_pickup_view':
      return defineAsyncComponent(
        () => import('./region/region-m-pickup-view/region-m-pickup-view.vue'),
      );
    case 'master_calendar_multiple_data_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data-timeline/master-calendar-multiple-data-timeline.vue'
          ),
      );
    case 'region_tree_grid_css':
      return defineAsyncComponent(
        () => import('./region/region-tree-grid-css/region-tree-grid-css.vue'),
      );
    case 'psde_field_grid_design':
      return defineAsyncComponent(
        () =>
          import(
            './psde-field/psde-field-grid-design/psde-field-grid-design.vue'
          ),
      );
    case 'master_tab_card_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tab-card-tab-exp-view/master-tab-card-tab-exp-view.vue'
          ),
      );
    case 'master_card_default_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-default-sort/master-card-default-sort.vue'
          ),
      );
    case 'master_editform_group_collapse':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-group-collapse/master-editform-group-collapse.vue'
          ),
      );
    case 'master_map_tooltip_text':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-map-tooltip-text/master-map-tooltip-text.vue'
          ),
      );
    case 'master_tabexppanel_count':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-count/master-tabexppanel-count.vue'
          ),
      );
    case 'master_chart_radar':
      return defineAsyncComponent(
        () => import('./master/master-chart-radar/master-chart-radar.vue'),
      );
    case 'master_usr9345_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-usr-9345-grid-view/master-usr-9345-grid-view.vue'
          ),
      );
    case 'master_view_message_close_mode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-message-close-mode/master-view-message-close-mode.vue'
          ),
      );
    case 'master_calendar_contextmenu_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-user/master-calendar-contextmenu-user.vue'
          ),
      );
    case 'master_card_bottom_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-bottom-nav/master-card-bottom-nav.vue'),
      );
    case 'master_form_validatemode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-validatemode/master-form-validatemode.vue'
          ),
      );
    case 'ps_core_prd_func_installed_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './ps-core-prd-func/ps-core-prd-func-installed-grid-view/ps-core-prd-func-installed-grid-view.vue'
          ),
      );
    case 'master_tree_counter':
      return defineAsyncComponent(
        () => import('./master/master-tree-counter/master-tree-counter.vue'),
      );
    case 'master_navparam_groupmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-navparam-groupmode-exp/master-navparam-groupmode-exp.vue'
          ),
      );
    case 'master_calendar_contextmenu':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu/master-calendar-contextmenu.vue'
          ),
      );
    case 'master_kanban_built_in_toolbar_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-built-in-toolbar-exp/master-kanban-built-in-toolbar-exp.vue'
          ),
      );
    case 'master_editform_mdctrl_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-exp/master-editform-mdctrl-exp.vue'
          ),
      );
    case 'master_toolbar_dynamic_logic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-toolbar-dynamic-logic/master-toolbar-dynamic-logic.vue'
          ),
      );
    case 'master_meditpanel_ability_form':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-meditpanel-ability-form/master-meditpanel-ability-form.vue'
          ),
      );
    case 'master_calendar_nav':
      return defineAsyncComponent(
        () => import('./master/master-calendar-nav/master-calendar-nav.vue'),
      );
    case 'master_wizard_step_bar_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-step-bar-tab-exp-view/master-wizard-step-bar-tab-exp-view.vue'
          ),
      );
    case 'master_editform_autosave':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-autosave/master-editform-autosave.vue'
          ),
      );
    case 'master_drtab_event':
      return defineAsyncComponent(
        () => import('./master/master-drtab-event/master-drtab-event.vue'),
      );
    case 'master_tabexppanel_top':
      return defineAsyncComponent(
        () =>
          import('./master/master-tabexppanel-top/master-tabexppanel-top.vue'),
      );
    case 'master_common_editview':
      return defineAsyncComponent(
        () =>
          import('./master/master-common-editview/master-common-editview.vue'),
      );
    case 'master_ui_action_params':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-params/master-ui-action-params.vue'
          ),
      );
    case 'region_pickup_view2':
      return defineAsyncComponent(
        () => import('./region/region-pickup-view-2/region-pickup-view-2.vue'),
      );
    case 'master_search_form_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-search-form-event/master-search-form-event.vue'
          ),
      );
    case 'master_grid_span':
      return defineAsyncComponent(
        () => import('./master/master-grid-span/master-grid-span.vue'),
      );
    case 'master_grid_newrow_group_auto':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-newrow-group-auto/master-grid-newrow-group-auto.vue'
          ),
      );
    case 'master_group_bar_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-group-bar-chart-exp-view/master-group-bar-chart-exp-view.vue'
          ),
      );
    case 'master_card_mixin_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-mixin-showmode/master-card-mixin-showmode.vue'
          ),
      );
    case 'master_card_batchtoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-batchtoolbar/master-card-batchtoolbar.vue'
          ),
      );
    case 'master_tree_grid_ex_nodetabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-nodetabexpview/master-tree-grid-ex-nodetabexpview.vue'
          ),
      );
    case 'master_data_transfer_picker':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-transfer-picker/master-data-transfer-picker.vue'
          ),
      );
    case 'master_pickup_cardpickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-cardpickupview-2/master-pickup-cardpickupview-2.vue'
          ),
      );
    case 'region_tree_grid_navtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-navtabexpview/region-tree-grid-navtabexpview.vue'
          ),
      );
    case 'master_tabexppanel_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-counter-disabled/master-tabexppanel-counter-disabled.vue'
          ),
      );
    case 'master_list_group_sort_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-group-sort-draggable/master-list-group-sort-draggable.vue'
          ),
      );
    case 'master_searchform_btncss':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchform-btncss/master-searchform-btncss.vue'
          ),
      );
    case 'master_list_refreshmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-refreshmode-exp/master-list-refreshmode-exp.vue'
          ),
      );
    case 'master_card_dyna_visible':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-dyna-visible/master-card-dyna-visible.vue'
          ),
      );
    case 'master_tree_expbar_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-expbar-tab-exp-view/master-tree-expbar-tab-exp-view.vue'
          ),
      );
    case 'master_tree_hasvaluesearch':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-hasvaluesearch/master-tree-hasvaluesearch.vue'
          ),
      );
    case 'master_map_mapstyle':
      return defineAsyncComponent(
        () => import('./master/master-map-mapstyle/master-map-mapstyle.vue'),
      );
    case 'master_tree_grid_ex_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-tabexpview/master-tree-grid-ex-tabexpview.vue'
          ),
      );
    case 'master_kanban_dyna_blank':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-dyna-blank/master-kanban-dyna-blank.vue'
          ),
      );
    case 'master_grid_sort_default':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-sort-default/master-grid-sort-default.vue'
          ),
      );
    case 'master_editform_mdctrl_group_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-group-action/master-editform-mdctrl-group-action.vue'
          ),
      );
    case 'master_counter_form_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-counter-form-group/master-counter-form-group.vue'
          ),
      );
    case 'master_chart_group_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-month/master-chart-group-month.vue'
          ),
      );
    case 'master_gantt_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-refreshmode/master-gantt-refreshmode.vue'
          ),
      );
    case 'master_map_ability':
      return defineAsyncComponent(
        () => import('./master/master-map-ability/master-map-ability.vue'),
      );
    case 'master_calendar_layout_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-layout-week/master-calendar-layout-week.vue'
          ),
      );
    case 'master_calendar_layout_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-layout-user/master-calendar-layout-user.vue'
          ),
      );
    case 'master_view_msg_pos_scroll':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-msg-pos-scroll/master-view-msg-pos-scroll.vue'
          ),
      );
    case 'master_pickup_treepickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-treepickupview/master-pickup-treepickupview.vue'
          ),
      );
    case 'master_list_event':
      return defineAsyncComponent(
        () => import('./master/master-list-event/master-list-event.vue'),
      );
    case 'region_advanced_search':
      return defineAsyncComponent(
        () =>
          import('./region/region-advanced-search/region-advanced-search.vue'),
      );
    case 'master_print_grid':
      return defineAsyncComponent(
        () => import('./master/master-print-grid/master-print-grid.vue'),
      );
    case 'master_ctrl_event_grid_trigger':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ctrl-event-grid-trigger/master-ctrl-event-grid-trigger.vue'
          ),
      );
    case 'master_map_event_and_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-map-event-and-call/master-map-event-and-call.vue'
          ),
      );
    case 'master_counter_tab_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-counter-tab-exp/master-counter-tab-exp.vue'),
      );
    case 'master_map_base':
      return defineAsyncComponent(
        () => import('./master/master-map-base/master-map-base.vue'),
      );
    case 'master_list_group_style2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-group-style-2/master-list-group-style-2.vue'
          ),
      );
    case 'master_map_event':
      return defineAsyncComponent(
        () => import('./master/master-map-event/master-map-event.vue'),
      );
    case 'master_editor_span':
      return defineAsyncComponent(
        () => import('./master/master-editor-span/master-editor-span.vue'),
      );
    case 'about_drawer_hidden_close':
      return defineAsyncComponent(
        () =>
          import(
            './about/about-drawer-hidden-close/about-drawer-hidden-close.vue'
          ),
      );
    case 'master_editform_repeater_form':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-form/master-editform-repeater-form.vue'
          ),
      );
    case 'master_drtab_postion':
      return defineAsyncComponent(
        () => import('./master/master-drtab-postion/master-drtab-postion.vue'),
      );
    case 'master_gantt_contextmenu':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-contextmenu/master-gantt-contextmenu.vue'
          ),
      );
    case 'master_kanban_row_layout':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-row-layout/master-kanban-row-layout.vue'
          ),
      );
    case 'master_editform_repeater_table':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-table/master-editform-repeater-table.vue'
          ),
      );
    case 'master_grid':
      return defineAsyncComponent(
        () => import('./master/master-grid/master-grid.vue'),
      );
    case 'master_map_tooltip_style':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-map-tooltip-style/master-map-tooltip-style.vue'
          ),
      );
    case 'master_action_plugin':
      return defineAsyncComponent(
        () => import('./master/master-action-plugin/master-action-plugin.vue'),
      );
    case 'master_grid_mixin':
      return defineAsyncComponent(
        () => import('./master/master-grid-mixin/master-grid-mixin.vue'),
      );
    case 'master_tree_grid_ex_css':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-css/master-tree-grid-ex-css.vue'
          ),
      );
    case 'master_treeview':
      return defineAsyncComponent(
        () => import('./master/master-treeview/master-treeview.vue'),
      );
    case 'master_tree_datasource_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-datasource-exp/master-tree-datasource-exp.vue'
          ),
      );
    case 'master_tree_event':
      return defineAsyncComponent(
        () => import('./master/master-tree-event/master-tree-event.vue'),
      );
    case 'master_editform_repeater_form_defaultvalue':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-form-defaultvalue/master-editform-repeater-form-defaultvalue.vue'
          ),
      );
    case 'master_editform_repeater_table_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-table-sort/master-editform-repeater-table-sort.vue'
          ),
      );
    case 'master_chart_nav_exp':
      return defineAsyncComponent(
        () => import('./master/master-chart-nav-exp/master-chart-nav-exp.vue'),
      );
    case 'master_calendar_bottomnav_multiple_data':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-multiple-data/master-calendar-bottomnav-multiple-data.vue'
          ),
      );
    case 'region_tree_grid_require':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-require/region-tree-grid-require.vue'
          ),
      );
    case 'master_chart_exp_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-tab-exp-view/master-chart-exp-tab-exp-view.vue'
          ),
      );
    case 'master_editor_autocomplete':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-autocomplete/master-editor-autocomplete.vue'
          ),
      );
    case 'master_wizard_hiddenstepbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-hiddenstepbar/master-wizard-hiddenstepbar.vue'
          ),
      );
    case 'master_tree_custom_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-custom-datasource/master-tree-custom-datasource.vue'
          ),
      );
    case 'master_teleport_placeholder_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-list/master-teleport-placeholder-list.vue'
          ),
      );
    case 'master_view_event_trigger':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-event-trigger/master-view-event-trigger.vue'
          ),
      );
    case 'master_grid_attachment_column_file_preview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-attachment-column-file-preview/master-grid-attachment-column-file-preview.vue'
          ),
      );
    case 'master_drtab_logic2':
      return defineAsyncComponent(
        () => import('./master/master-drtab-logic-2/master-drtab-logic-2.vue'),
      );
    case 'master_card_base':
      return defineAsyncComponent(
        () => import('./master/master-card-base/master-card-base.vue'),
      );
    case 'region_grid_view':
      return defineAsyncComponent(
        () => import('./region/region-grid-view/region-grid-view.vue'),
      );
    case 'region_meditpanel_top':
      return defineAsyncComponent(
        () =>
          import('./region/region-meditpanel-top/region-meditpanel-top.vue'),
      );
    case 'master_enable_cache_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-enable-cache-tree-exp-view/master-enable-cache-tree-exp-view.vue'
          ),
      );
    case 'master_toolbar_item_plugin':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-toolbar-item-plugin/master-toolbar-item-plugin.vue'
          ),
      );
    case 'master_card_group_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-group-action/master-card-group-action.vue'
          ),
      );
    case 'master_kanban_swimlane_draggable_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-draggable-exp/master-kanban-swimlane-draggable-exp.vue'
          ),
      );
    case 'master_pickup_cardmpickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-cardmpickupview-2/master-pickup-cardmpickupview-2.vue'
          ),
      );
    case 'psde_logic_all_log_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-all-log-grid-view/psde-logic-all-log-grid-view.vue'
          ),
      );
    case 'master_chart_multiple_sequences':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-multiple-sequences/master-chart-multiple-sequences.vue'
          ),
      );
    case 'master_base_chart_series':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-base-chart-series/master-base-chart-series.vue'
          ),
      );
    case 'master_list_call':
      return defineAsyncComponent(
        () => import('./master/master-list-call/master-list-call.vue'),
      );
    case 'master_calendar_refreshmode_nocache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-refreshmode-nocache/master-calendar-refreshmode-nocache.vue'
          ),
      );
    case 'master_kanban':
      return defineAsyncComponent(
        () => import('./master/master-kanban/master-kanban.vue'),
      );
    case 'master_gantt_disabled_sliderdraggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-disabled-sliderdraggable/master-gantt-disabled-sliderdraggable.vue'
          ),
      );
    case 'master_workflow_design_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-workflow-design-grid/master-workflow-design-grid.vue'
          ),
      );
    case 'master_editor_data_picker':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-data-picker/master-editor-data-picker.vue'
          ),
      );
    case 'master_grid_logic_require':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-logic-require/master-grid-logic-require.vue'
          ),
      );
    case 'master_tree_delogic_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-delogic-datasource/master-tree-delogic-datasource.vue'
          ),
      );
    case 'master_tree_grid_ex_leafnode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-leafnode/master-tree-grid-ex-leafnode.vue'
          ),
      );
    case 'region_tree_grid_valshow':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-valshow/region-tree-grid-valshow.vue'
          ),
      );
    case 'master_editform_mdctrl_form':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-form/master-editform-mdctrl-form.vue'
          ),
      );
    case 'master_drtab_right':
      return defineAsyncComponent(
        () => import('./master/master-drtab-right/master-drtab-right.vue'),
      );
    case 'master_tree_refreshmode_nocache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-refreshmode-nocache/master-tree-refreshmode-nocache.vue'
          ),
      );
    case 'master_tree_menushowmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-menushowmode/master-tree-menushowmode.vue'
          ),
      );
    case 'master_grid_logic_enable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-logic-enable/master-grid-logic-enable.vue'
          ),
      );
    case 'report_bi_report_content_panel_view':
      return defineAsyncComponent(
        () =>
          import(
            './report/report-bi-report-content-panel-view/report-bi-report-content-panel-view.vue'
          ),
      );
    case 'master_upload_image_cropping':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-upload-image-cropping/master-upload-image-cropping.vue'
          ),
      );
    case 'master_panel_data_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-data-container/master-panel-data-container.vue'
          ),
      );
    case 'master_gantt_event_and_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-event-and-call/master-gantt-event-and-call.vue'
          ),
      );
    case 'master_list_draggable_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-draggable-edit/master-list-draggable-edit.vue'
          ),
      );
    case 'comment_list_view':
      return defineAsyncComponent(
        () => import('./comment/comment-list-view/comment-list-view.vue'),
      );
    case 'master_map_view':
      return defineAsyncComponent(
        () => import('./master/master-map-view/master-map-view.vue'),
      );
    case 'master_gantt':
      return defineAsyncComponent(
        () => import('./master/master-gantt/master-gantt.vue'),
      );
    case 'master_treeview_cssandicon':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treeview-cssandicon/master-treeview-cssandicon.vue'
          ),
      );
    case 'app_wf_step_trace_view':
      return defineAsyncComponent(
        () => import('./app-wf-step-trace-view/app-wf-step-trace-view.vue'),
      );
    case 'master_grid_export_back':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-export-back/master-grid-export-back.vue'
          ),
      );
    case 'master_comment_display':
      return defineAsyncComponent(
        () =>
          import('./master/master-comment-display/master-comment-display.vue'),
      );
    case 'region_sedit_view':
      return defineAsyncComponent(
        () => import('./region/region-sedit-view/region-sedit-view.vue'),
      );
    case 'region_list_cache_list_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-list-cache-list-exp-view/region-list-cache-list-exp-view.vue'
          ),
      );
    case 'master_tree_grid_ex_alledit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-alledit/master-tree-grid-ex-alledit.vue'
          ),
      );
    case 'master_list_fast_new':
      return defineAsyncComponent(
        () => import('./master/master-list-fast-new/master-list-fast-new.vue'),
      );
    case 'master_editform_repeater_table_defaultvalue':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-repeater-table-defaultvalue/master-editform-repeater-table-defaultvalue.vue'
          ),
      );
    case 'master_ctrl_event_form_trigger':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ctrl-event-form-trigger/master-ctrl-event-form-trigger.vue'
          ),
      );
    case 'master_teleport_placeholder_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-tabexpview/master-teleport-placeholder-tabexpview.vue'
          ),
      );
    case 'master_calendar_bottomnav_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-month/master-calendar-bottomnav-month.vue'
          ),
      );
    case 'region_gridexpbar_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-gridexpbar-tab-exp-view/region-gridexpbar-tab-exp-view.vue'
          ),
      );
    case 'master_stackbar_right_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-stackbar-right-nav/master-stackbar-right-nav.vue'
          ),
      );
    case 'master_editor_check_box':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-check-box/master-editor-check-box.vue'
          ),
      );
    case 'master_calendar_logic_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-logic-call/master-calendar-logic-call.vue'
          ),
      );
    case 'master_list_cache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-cache-refreshmode/master-list-cache-refreshmode.vue'
          ),
      );
    case 'master_list_nav_bottom':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-nav-bottom/master-list-nav-bottom.vue'),
      );
    case 'master_page_redirect_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-page-redirect-view/master-page-redirect-view.vue'
          ),
      );
    case 'region_tree_grid_wrap':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-wrap/region-tree-grid-wrap.vue'),
      );
    case 'psde_logic_flow_panel_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-flow-panel-view/psde-logic-flow-panel-view.vue'
          ),
      );
    case 'master_grid_toolbar':
      return defineAsyncComponent(
        () => import('./master/master-grid-toolbar/master-grid-toolbar.vue'),
      );
    case 'master_pie_bottom_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-pie-bottom-nav/master-pie-bottom-nav.vue'),
      );
    case 'master_tree_grid_ex_nocacherefresh':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-nocacherefresh/master-tree-grid-ex-nocacherefresh.vue'
          ),
      );
    case 'master_gantt_refreshmode_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-refreshmode-cache/master-gantt-refreshmode-cache.vue'
          ),
      );
    case 'panel_appdatauploadview':
      return defineAsyncComponent(
        () => import('./panel-appdatauploadview/panel-appdatauploadview.vue'),
      );
    case 'master_list_roll_load':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-roll-load/master-list-roll-load.vue'),
      );
    case 'master_kanban_enablefullscreen_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-enablefullscreen-exp/master-kanban-enablefullscreen-exp.vue'
          ),
      );
    case 'master_pickup_cardmpickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-cardmpickupview/master-pickup-cardmpickupview.vue'
          ),
      );
    case 'region_tree_grid_autowidth':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-autowidth/region-tree-grid-autowidth.vue'
          ),
      );
    case 'region_meditpanel_editview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-meditpanel-editview/region-meditpanel-editview.vue'
          ),
      );
    case 'master_calendar_nav_multiple_data_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-multiple-data-nav/master-calendar-nav-multiple-data-nav.vue'
          ),
      );
    case 'master_grid_dfvalue':
      return defineAsyncComponent(
        () => import('./master/master-grid-dfvalue/master-grid-dfvalue.vue'),
      );
    case 'master_calendar_multiple_data':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data/master-calendar-multiple-data.vue'
          ),
      );
    case 'master_codelist_dsconditions':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-codelist-dsconditions/master-codelist-dsconditions.vue'
          ),
      );
    case 'master_list_only_data':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-only-data/master-list-only-data.vue'),
      );
    case 'master_tree_grid_ex_cacherefresh':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-cacherefresh/master-tree-grid-ex-cacherefresh.vue'
          ),
      );
    case 'master_codelist_css':
      return defineAsyncComponent(
        () => import('./master/master-codelist-css/master-codelist-css.vue'),
      );
    case 'master_gantt_month':
      return defineAsyncComponent(
        () => import('./master/master-gantt-month/master-gantt-month.vue'),
      );
    case 'master_portlet_plugin':
      return defineAsyncComponent(
        () =>
          import('./master/master-portlet-plugin/master-portlet-plugin.vue'),
      );
    case 'master_ui_logic_node_base':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-logic-node-base/master-ui-logic-node-base.vue'
          ),
      );
    case 'master_editor_radio_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-radio-list/master-editor-radio-list.vue'
          ),
      );
    case 'psdelogiclogicdesign':
      return defineAsyncComponent(
        () =>
          import('./psde-logic/psdelogiclogicdesign/psdelogiclogicdesign.vue'),
      );
    case 'master_card_logic_call':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-logic-call/master-card-logic-call.vue'),
      );
    case 'master_tree_grid_ex_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-event/master-tree-grid-ex-event.vue'
          ),
      );
    case 'master_grid_sort_ban':
      return defineAsyncComponent(
        () => import('./master/master-grid-sort-ban/master-grid-sort-ban.vue'),
      );
    case 'master_calendar_nav_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-day/master-calendar-nav-day.vue'
          ),
      );
    case 'master_teleport_placeholder_toolbar_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-toolbar-grid/master-teleport-placeholder-toolbar-grid.vue'
          ),
      );
    case 'master_kanban_enablegrouphidden_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-enablegrouphidden-exp/master-kanban-enablegrouphidden-exp.vue'
          ),
      );
    case 'master_kanban_swimlane_description':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-description/master-kanban-swimlane-description.vue'
          ),
      );
    case 'master_calendar_refreshmode_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-refreshmode-cache/master-calendar-refreshmode-cache.vue'
          ),
      );
    case 'region_tree_grid_actioncol':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-actioncol/region-tree-grid-actioncol.vue'
          ),
      );
    case 'master_gantt_week':
      return defineAsyncComponent(
        () => import('./master/master-gantt-week/master-gantt-week.vue'),
      );
    case 'master_form_ability_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-ability-edit-view/master-form-ability-edit-view.vue'
          ),
      );
    case 'master_tree_contextmenurightclickinvoke':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-contextmenurightclickinvoke/master-tree-contextmenurightclickinvoke.vue'
          ),
      );
    case 'master_default_date_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-default-date-tab-exp-view/master-default-date-tab-exp-view.vue'
          ),
      );
    case 'region_pickup_tree_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-pickup-tree-view/region-pickup-tree-view.vue'
          ),
      );
    case 'region_tree_grid_backendcolupdate':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-backendcolupdate/region-tree-grid-backendcolupdate.vue'
          ),
      );
    case 'master_panel_panel_container_image':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-container-image/master-panel-panel-container-image.vue'
          ),
      );
    case 'master_grid_nav_right':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-nav-right/master-grid-nav-right.vue'),
      );
    case 'master_kanban_item_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-item-action/master-kanban-item-action.vue'
          ),
      );
    case 'master_ui_action_cssandicon':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-cssandicon/master-ui-action-cssandicon.vue'
          ),
      );
    case 'master_pickup_gridpickupview_pickup_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-gridpickupview-pickup-grid-view/master-pickup-gridpickupview-pickup-grid-view.vue'
          ),
      );
    case 'master_data':
      return defineAsyncComponent(
        () => import('./master/master-data/master-data.vue'),
      );
    case 'master_treegridex_nav_right':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treegridex-nav-right/master-treegridex-nav-right.vue'
          ),
      );
    case 'region_tree_grid_emptydata':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-emptydata/region-tree-grid-emptydata.vue'
          ),
      );
    case 'master_grid_agg_page':
      return defineAsyncComponent(
        () => import('./master/master-grid-agg-page/master-grid-agg-page.vue'),
      );
    case 'master_pickup_treempickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-treempickupview/master-pickup-treempickupview.vue'
          ),
      );
    case 'master_tree_common_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-common-action/master-tree-common-action.vue'
          ),
      );
    case 'master_grid_newrow_group_codelist':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-newrow-group-codelist/master-grid-newrow-group-codelist.vue'
          ),
      );
    case 'master_list_ext_view2':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-ext-view-2/master-list-ext-view-2.vue'),
      );
    case 'master_list_showmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-showmode-exp/master-list-showmode-exp.vue'
          ),
      );
    case 'master_toolbar_group':
      return defineAsyncComponent(
        () => import('./master/master-toolbar-group/master-toolbar-group.vue'),
      );
    case 'master_calendar_contextmenu_multiple_data':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-multiple-data/master-calendar-contextmenu-multiple-data.vue'
          ),
      );
    case 'master_data_picker_dropdown':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-data-picker-dropdown/master-data-picker-dropdown.vue'
          ),
      );
    case 'region_edit_view9':
      return defineAsyncComponent(
        () => import('./region/region-edit-view-9/region-edit-view-9.vue'),
      );
    case 'master_chart_groupbar':
      return defineAsyncComponent(
        () =>
          import('./master/master-chart-groupbar/master-chart-groupbar.vue'),
      );
    case 'master_layout':
      return defineAsyncComponent(
        () => import('./master/master-layout/master-layout.vue'),
      );
    case 'master_drbar_event':
      return defineAsyncComponent(
        () => import('./master/master-drbar-event/master-drbar-event.vue'),
      );
    case 'master_calendar_layout':
      return defineAsyncComponent(
        () =>
          import('./master/master-calendar-layout/master-calendar-layout.vue'),
      );
    case 'region_tree_grid_basetabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-basetabexpview/region-tree-grid-basetabexpview.vue'
          ),
      );
    case 'master_tree_render':
      return defineAsyncComponent(
        () => import('./master/master-tree-render/master-tree-render.vue'),
      );
    case 'master_master_theme_settings':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-master-theme-settings/master-master-theme-settings.vue'
          ),
      );
    case 'master_scatter_bottom_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-scatter-bottom-nav/master-scatter-bottom-nav.vue'
          ),
      );
    case 'master_short_cut_gridview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-short-cut-gridview/master-short-cut-gridview.vue'
          ),
      );
    case 'master_panel_multi_data_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-multi-data-container/master-panel-multi-data-container.vue'
          ),
      );
    case 'master_kanban_column_layout':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-column-layout/master-kanban-column-layout.vue'
          ),
      );
    case 'master_tree_grid_ex_actioncol':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-actioncol/master-tree-grid-ex-actioncol.vue'
          ),
      );
    case 'master_drtab_top':
      return defineAsyncComponent(
        () => import('./master/master-drtab-top/master-drtab-top.vue'),
      );
    case 'master_tree_navparams_parenttochild':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-navparams-parenttochild/master-tree-navparams-parenttochild.vue'
          ),
      );
    case 'master_timer_trigger':
      return defineAsyncComponent(
        () => import('./master/master-timer-trigger/master-timer-trigger.vue'),
      );
    case 'region_tree_grid_bottomnav':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-bottomnav/region-tree-grid-bottomnav.vue'
          ),
      );
    case 'master_searchbar_counter_disabled':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-counter-disabled/master-searchbar-counter-disabled.vue'
          ),
      );
    case 'master_quick_search_separator_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-quick-search-separator-tree-exp-view/master-quick-search-separator-tree-exp-view.vue'
          ),
      );
    case 'master_tree_select_pickerview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-select-pickerview/master-tree-select-pickerview.vue'
          ),
      );
    case 'master_calendar_bottomnav_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-timeline/master-calendar-bottomnav-timeline.vue'
          ),
      );
    case 'region_tree_grid_frontcolupdate':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-frontcolupdate/region-tree-grid-frontcolupdate.vue'
          ),
      );
    case 'master_wizard_view_logic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-view-logic/master-wizard-view-logic.vue'
          ),
      );
    case 'master_map_point':
      return defineAsyncComponent(
        () => import('./master/master-map-point/master-map-point.vue'),
      );
    case 'master_pickup_treepickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-treepickupview-2/master-pickup-treepickupview-2.vue'
          ),
      );
    case 'region_tree_grid_view':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-view/region-tree-grid-view.vue'),
      );
    case 'master_grid_action_column':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-action-column/master-grid-action-column.vue'
          ),
      );
    case 'master_editform_hover_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-hover-tab-exp-view/master-editform-hover-tab-exp-view.vue'
          ),
      );
    case 'master_tree_selectpickup':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-selectpickup/master-tree-selectpickup.vue'
          ),
      );
    case 'master_usr8928_chart_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-usr-8928-chart-view/master-usr-8928-chart-view.vue'
          ),
      );
    case 'master_panel_panel_item_render2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-item-render-2/master-panel-panel-item-render-2.vue'
          ),
      );
    case 'app_start_view':
      return defineAsyncComponent(
        () => import('./app-start-view/app-start-view.vue'),
      );
    case 'region_tree_grid_remoteagg':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-remoteagg/region-tree-grid-remoteagg.vue'
          ),
      );
    case 'master_drbar_hidden_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-hidden-edit/master-drbar-hidden-edit.vue'
          ),
      );
    case 'app_wf_step_data_view':
      return defineAsyncComponent(
        () => import('./app-wf-step-data-view/app-wf-step-data-view.vue'),
      );
    case 'master_calendar_multiple_data_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data-user/master-calendar-multiple-data-user.vue'
          ),
      );
    case 'master_modal_data_switching_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-modal-data-switching-grid/master-modal-data-switching-grid.vue'
          ),
      );
    case 'master_kanban_swimlane_no_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-no-draggable/master-kanban-swimlane-no-draggable.vue'
          ),
      );
    case 'category_form_design_edit':
      return defineAsyncComponent(
        () =>
          import(
            './category/category-form-design-edit/category-form-design-edit.vue'
          ),
      );
    case 'region_tree_grid_rowedit':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-rowedit/region-tree-grid-rowedit.vue'
          ),
      );
    case 'master_info_view':
      return defineAsyncComponent(
        () => import('./master/master-info-view/master-info-view.vue'),
      );
    case 'region_tree_grid_captionwidth':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-captionwidth/region-tree-grid-captionwidth.vue'
          ),
      );
    case 'master_grid_agg':
      return defineAsyncComponent(
        () => import('./master/master-grid-agg/master-grid-agg.vue'),
      );
    case 'master_grid_toolbar_batch':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-toolbar-batch/master-grid-toolbar-batch.vue'
          ),
      );
    case 'master_kanban_swimlane_enablefullscreen':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-enablefullscreen/master-kanban-swimlane-enablefullscreen.vue'
          ),
      );
    case 'master_card_item_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-item-action/master-card-item-action.vue'
          ),
      );
    case 'master_map_animation':
      return defineAsyncComponent(
        () => import('./master/master-map-animation/master-map-animation.vue'),
      );
    case 'master_tree_grid_ex_eventtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-eventtabexpview/master-tree-grid-ex-eventtabexpview.vue'
          ),
      );
    case 'master_chart_funnel_plot':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-funnel-plot/master-chart-funnel-plot.vue'
          ),
      );
    case 'extend_log_info_view':
      return defineAsyncComponent(
        () =>
          import('./extend-log/extend-log-info-view/extend-log-info-view.vue'),
      );
    case 'master_tree_allsearch':
      return defineAsyncComponent(
        () =>
          import('./master/master-tree-allsearch/master-tree-allsearch.vue'),
      );
    case 'master_ui_action_pickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-pickupview/master-ui-action-pickupview.vue'
          ),
      );
    case 'master_line_bar_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-line-bar-chart-exp-view/master-line-bar-chart-exp-view.vue'
          ),
      );
    case 'master_scatter_right_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-scatter-right-nav/master-scatter-right-nav.vue'
          ),
      );
    case 'master_panel_view_message':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-view-message/master-panel-view-message.vue'
          ),
      );
    case 'master_wf_dyna_edit_view3':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wf-dyna-edit-view-3/master-wf-dyna-edit-view-3.vue'
          ),
      );
    case 'master_tree_node_newedit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-node-newedit/master-tree-node-newedit.vue'
          ),
      );
    case 'master_separator_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-separator-data-view-exp-view/master-separator-data-view-exp-view.vue'
          ),
      );
    case 'master_tree_select_mpickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-select-mpickupview/master-tree-select-mpickupview.vue'
          ),
      );
    case 'master_card_paging_load':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-paging-load/master-card-paging-load.vue'
          ),
      );
    case 'master_count_flowdrtab':
      return defineAsyncComponent(
        () =>
          import('./master/master-count-flowdrtab/master-count-flowdrtab.vue'),
      );
    case 'master_usr1225_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-usr-1225-edit-view/master-usr-1225-edit-view.vue'
          ),
      );
    case 'master_async_activity':
      return defineAsyncComponent(
        () =>
          import('./master/master-async-activity/master-async-activity.vue'),
      );
    case 'master_tab_ctrl_federation':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tab-ctrl-federation/master-tab-ctrl-federation.vue'
          ),
      );
    case 'master_map_fullscreen':
      return defineAsyncComponent(
        () =>
          import('./master/master-map-fullscreen/master-map-fullscreen.vue'),
      );
    case 'region_pickup_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-pickup-grid-view/region-pickup-grid-view.vue'
          ),
      );
    case 'master_panel_grid_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-grid-container/master-panel-grid-container.vue'
          ),
      );
    case 'master_list_nav_right':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-nav-right/master-list-nav-right.vue'),
      );
    case 'master_counter_tabexppanel':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-counter-tabexppanel/master-counter-tabexppanel.vue'
          ),
      );
    case 'region_edit_view3':
      return defineAsyncComponent(
        () => import('./region/region-edit-view-3/region-edit-view-3.vue'),
      );
    case 'master_edit_view':
      return defineAsyncComponent(
        () => import('./master/master-edit-view/master-edit-view.vue'),
      );
    case 'master_form_info':
      return defineAsyncComponent(
        () => import('./master/master-form-info/master-form-info.vue'),
      );
    case 'master_chart_scatter':
      return defineAsyncComponent(
        () => import('./master/master-chart-scatter/master-chart-scatter.vue'),
      );
    case 'master_chart_ability':
      return defineAsyncComponent(
        () => import('./master/master-chart-ability/master-chart-ability.vue'),
      );
    case 'master_wizard_enablestepbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-enablestepbar/master-wizard-enablestepbar.vue'
          ),
      );
    case 'master_grid_logic':
      return defineAsyncComponent(
        () => import('./master/master-grid-logic/master-grid-logic.vue'),
      );
    case 'detail_meditpanel_ability':
      return defineAsyncComponent(
        () =>
          import(
            './detail/detail-meditpanel-ability/detail-meditpanel-ability.vue'
          ),
      );
    case 'master_tree_cascadeselect_mpickerview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-cascadeselect-mpickerview/master-tree-cascadeselect-mpickerview.vue'
          ),
      );
    case 'master_de_logic_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-de-logic-tabexpview/master-de-logic-tabexpview.vue'
          ),
      );
    case 'master_card_default_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-default-showmode/master-card-default-showmode.vue'
          ),
      );
    case 'master_grid_group_codelist':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-group-codelist/master-grid-group-codelist.vue'
          ),
      );
    case 'master_card_dyna_blank':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-dyna-blank/master-card-dyna-blank.vue'),
      );
    case 'psde_logic_flow_main_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-flow-main-view/psde-logic-flow-main-view.vue'
          ),
      );
    case 'master_kanban_dyna_logic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-dyna-logic/master-kanban-dyna-logic.vue'
          ),
      );
    case 'master_drbar_logic_script':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-logic-script/master-drbar-logic-script.vue'
          ),
      );
    case 'master_form_layout':
      return defineAsyncComponent(
        () => import('./master/master-form-layout/master-form-layout.vue'),
      );
    case 'master_upload_file_upload':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-upload-file-upload/master-upload-file-upload.vue'
          ),
      );
    case 'master_searchbar_hight':
      return defineAsyncComponent(
        () =>
          import('./master/master-searchbar-hight/master-searchbar-hight.vue'),
      );
    case 'master_grid_logic_ctrl_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-logic-ctrl-event/master-grid-logic-ctrl-event.vue'
          ),
      );
    case 'master_data_mpicker':
      return defineAsyncComponent(
        () => import('./master/master-data-mpicker/master-data-mpicker.vue'),
      );
    case 'master_list_sort_exp':
      return defineAsyncComponent(
        () => import('./master/master-list-sort-exp/master-list-sort-exp.vue'),
      );
    case 'master_drtab_count':
      return defineAsyncComponent(
        () => import('./master/master-drtab-count/master-drtab-count.vue'),
      );
    case 'region_edit_view4':
      return defineAsyncComponent(
        () => import('./region/region-edit-view-4/region-edit-view-4.vue'),
      );
    case 'region_pickup_view':
      return defineAsyncComponent(
        () => import('./region/region-pickup-view/region-pickup-view.vue'),
      );
    case 'master_no_cache_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-no-cache-tree-exp-view/master-no-cache-tree-exp-view.vue'
          ),
      );
    case 'master_wizard_view_style':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-view-style/master-wizard-view-style.vue'
          ),
      );
    case 'master_grid_base':
      return defineAsyncComponent(
        () => import('./master/master-grid-base/master-grid-base.vue'),
      );
    case 'master_grid_nav_inside':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-nav-inside/master-grid-nav-inside.vue'),
      );
    case 'master_chart_annular':
      return defineAsyncComponent(
        () => import('./master/master-chart-annular/master-chart-annular.vue'),
      );
    case 'master_tree_base':
      return defineAsyncComponent(
        () => import('./master/master-tree-base/master-tree-base.vue'),
      );
    case 'master_kanban_order_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-order-group-draggable/master-kanban-order-group-draggable.vue'
          ),
      );
    case 'master_tabexppanel_bottom':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-bottom/master-tabexppanel-bottom.vue'
          ),
      );
    case 'master_pie_nav_right':
      return defineAsyncComponent(
        () => import('./master/master-pie-nav-right/master-pie-nav-right.vue'),
      );
    case 'master_grid_refresh_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-refresh-cache/master-grid-refresh-cache.vue'
          ),
      );
    case 'master_control_plugin':
      return defineAsyncComponent(
        () =>
          import('./master/master-control-plugin/master-control-plugin.vue'),
      );
    case 'master_de_logic_baseevent':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-de-logic-baseevent/master-de-logic-baseevent.vue'
          ),
      );
    case 'master_de_logic_link':
      return defineAsyncComponent(
        () => import('./master/master-de-logic-link/master-de-logic-link.vue'),
      );
    case 'master_searchform_filter':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchform-filter/master-searchform-filter.vue'
          ),
      );
    case 'region_tree_grid_percent':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-percent/region-tree-grid-percent.vue'
          ),
      );
    case 'region_grid_message':
      return defineAsyncComponent(
        () => import('./region/region-grid-message/region-grid-message.vue'),
      );
    case 'master_calendar_exp_view_quick_search':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-exp-view-quick-search/master-calendar-exp-view-quick-search.vue'
          ),
      );
    case 'master_chart_grid_view_base':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-grid-view-base/master-chart-grid-view-base.vue'
          ),
      );
    case 'region_tree_grid_localagg':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-localagg/region-tree-grid-localagg.vue'
          ),
      );
    case 'master_panel_nav_pos':
      return defineAsyncComponent(
        () => import('./master/master-panel-nav-pos/master-panel-nav-pos.vue'),
      );
    case 'master_map_picker':
      return defineAsyncComponent(
        () => import('./master/master-map-picker/master-map-picker.vue'),
      );
    case 'master_chart_event_tab':
      return defineAsyncComponent(
        () =>
          import('./master/master-chart-event-tab/master-chart-event-tab.vue'),
      );
    case 'master_quick_create_popper':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-quick-create-popper/master-quick-create-popper.vue'
          ),
      );
    case 'master_editor_cascader':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-cascader/master-editor-cascader.vue'),
      );
    case 'master_list_dyna_visible':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-dyna-visible/master-list-dyna-visible.vue'
          ),
      );
    case 'master_chart_group_year':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-year/master-chart-group-year.vue'
          ),
      );
    case 'region_tree_grid_colfilter':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-colfilter/region-tree-grid-colfilter.vue'
          ),
      );
    case 'master_codelist_user_param':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-codelist-user-param/master-codelist-user-param.vue'
          ),
      );
    case 'psde_logic_redirect_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-redirect-view/psde-logic-redirect-view.vue'
          ),
      );
    case 'master_list_batchtoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-batchtoolbar/master-list-batchtoolbar.vue'
          ),
      );
    case 'master_tree_grid_ex_childnodecount':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-childnodecount/master-tree-grid-ex-childnodecount.vue'
          ),
      );
    case 'master_chart_group_year_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-year-week/master-chart-group-year-week.vue'
          ),
      );
    case 'master_card_base_exp':
      return defineAsyncComponent(
        () => import('./master/master-card-base-exp/master-card-base-exp.vue'),
      );
    case 'master_card_onlydata_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-onlydata-showmode/master-card-onlydata-showmode.vue'
          ),
      );
    case 'master_wizard_srfnextform':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-wizard-srfnextform/master-wizard-srfnextform.vue'
          ),
      );
    case 'master_ui_logic_plugin':
      return defineAsyncComponent(
        () =>
          import('./master/master-ui-logic-plugin/master-ui-logic-plugin.vue'),
      );
    case 'master_chart_exp_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-cache-tab-exp-view/master-chart-exp-cache-tab-exp-view.vue'
          ),
      );
    case 'master_searchform_layout':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchform-layout/master-searchform-layout.vue'
          ),
      );
    case 'master_nav_param_area_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-nav-param-area-chart-exp-view/master-nav-param-area-chart-exp-view.vue'
          ),
      );
    case 'master_form_ctrl_federation':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-ctrl-federation/master-form-ctrl-federation.vue'
          ),
      );
    case 'app_portal_view':
      return defineAsyncComponent(
        () => import('./app-portal-view/app-portal-view.vue'),
      );
    case 'master_panel_item_plugin':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-item-plugin/master-panel-item-plugin.vue'
          ),
      );
    case 'master_panel_counter_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-counter-exp/master-panel-counter-exp.vue'
          ),
      );
    case 'master_coop_pos':
      return defineAsyncComponent(
        () => import('./master/master-coop-pos/master-coop-pos.vue'),
      );
    case 'master_panel_panel_item_render':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-item-render/master-panel-panel-item-render.vue'
          ),
      );
    case 'region_tree_grid_celledit':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-celledit/region-tree-grid-celledit.vue'
          ),
      );
    case 'category_pickup_view':
      return defineAsyncComponent(
        () =>
          import('./category/category-pickup-view/category-pickup-view.vue'),
      );
    case 'master_list_ctrlstyle_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-ctrlstyle-exp/master-list-ctrlstyle-exp.vue'
          ),
      );
    case 'master_replace_default':
      return defineAsyncComponent(
        () =>
          import('./master/master-replace-default/master-replace-default.vue'),
      );
    case 'master_search_form':
      return defineAsyncComponent(
        () => import('./master/master-search-form/master-search-form.vue'),
      );
    case 'master_save_all':
      return defineAsyncComponent(
        () => import('./master/master-save-all/master-save-all.vue'),
      );
    case 'about':
      return defineAsyncComponent(() => import('./about/about/about.vue'));
    case 'master_kaban_format':
      return defineAsyncComponent(
        () => import('./master/master-kaban-format/master-kaban-format.vue'),
      );
    case 'master_kanban_swimlane_nocache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-nocache-refreshmode/master-kanban-swimlane-nocache-refreshmode.vue'
          ),
      );
    case 'master_chart_group_quar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-quar/master-chart-group-quar.vue'
          ),
      );
    case 'master_calendar_day':
      return defineAsyncComponent(
        () => import('./master/master-calendar-day/master-calendar-day.vue'),
      );
    case 'master_list_load_mode':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-load-mode/master-list-load-mode.vue'),
      );
    case 'master_card_flex_layout':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-flex-layout/master-card-flex-layout.vue'
          ),
      );
    case 'region_grid_separator_grid_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-grid-separator-grid-exp-view/region-grid-separator-grid-exp-view.vue'
          ),
      );
    case 'region_info_grid':
      return defineAsyncComponent(
        () => import('./region/region-info-grid/region-info-grid.vue'),
      );
    case 'master_chart_group_code_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-group-code-list/master-chart-group-code-list.vue'
          ),
      );
    case 'master_html_view':
      return defineAsyncComponent(
        () => import('./master/master-html-view/master-html-view.vue'),
      );
    case 'breadcrumb':
      return defineAsyncComponent(() => import('./breadcrumb/breadcrumb.vue'));
    case 'region_tree_grid_toolbartabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-toolbartabexpview/region-tree-grid-toolbartabexpview.vue'
          ),
      );
    case 'master_editform_mdctrl_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-list/master-editform-mdctrl-list.vue'
          ),
      );
    case 'master_user_custom_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-user-custom-calendar-exp-view/master-user-custom-calendar-exp-view.vue'
          ),
      );
    case 'activity_history_list_view':
      return defineAsyncComponent(
        () =>
          import(
            './activity/activity-history-list-view/activity-history-list-view.vue'
          ),
      );
    case 'region_tree_grid_sorttabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-sorttabexpview/region-tree-grid-sorttabexpview.vue'
          ),
      );
    case 'master_tree_nax_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-nax-tabexpview/master-tree-nax-tabexpview.vue'
          ),
      );
    case 'master_treeview_navparams_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-treeview-navparams-tabexpview/master-treeview-navparams-tabexpview.vue'
          ),
      );
    case 'master_tree_entitynode':
      return defineAsyncComponent(
        () =>
          import('./master/master-tree-entitynode/master-tree-entitynode.vue'),
      );
    case 'detail_druipart_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './detail/detail-druipart-grid-view/detail-druipart-grid-view.vue'
          ),
      );
    case 'master_main_grid':
      return defineAsyncComponent(
        () => import('./master/master-main-grid/master-main-grid.vue'),
      );
    case 'welcome':
      return defineAsyncComponent(() => import('./about/welcome/welcome.vue'));
    case 'master_tree_expbar_navparam_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-expbar-navparam-tree-exp-view/master-tree-expbar-navparam-tree-exp-view.vue'
          ),
      );
    case 'master_gantt_enablecustomized':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-enablecustomized/master-gantt-enablecustomized.vue'
          ),
      );
    case 'master_chart_group_day':
      return defineAsyncComponent(
        () =>
          import('./master/master-chart-group-day/master-chart-group-day.vue'),
      );
    case 'master_tree_view_contextmenu':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-view-contextmenu/master-tree-view-contextmenu.vue'
          ),
      );
    case 'master_list_item_action':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-item-action/master-list-item-action.vue'
          ),
      );
    case 'master_editform_mdctrl_card':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-card/master-editform-mdctrl-card.vue'
          ),
      );
    case 'master_view_plugin':
      return defineAsyncComponent(
        () => import('./master/master-view-plugin/master-view-plugin.vue'),
      );
    case 'master_default_date_calendar_view_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-default-date-calendar-view-week/master-default-date-calendar-view-week.vue'
          ),
      );
    case 'region_tree_grid_align':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-align/region-tree-grid-align.vue'),
      );
    case 'master_drtab_ability':
      return defineAsyncComponent(
        () => import('./master/master-drtab-ability/master-drtab-ability.vue'),
      );
    case 'master_tree_deaction_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-deaction-datasource/master-tree-deaction-datasource.vue'
          ),
      );
    case 'master_counter_drtab':
      return defineAsyncComponent(
        () => import('./master/master-counter-drtab/master-counter-drtab.vue'),
      );
    case 'master_toolbar_counter':
      return defineAsyncComponent(
        () =>
          import('./master/master-toolbar-counter/master-toolbar-counter.vue'),
      );
    case 'master_gantt_logic_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-logic-event/master-gantt-logic-event.vue'
          ),
      );
    case 'master_calendar_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-tab-exp-view/master-calendar-tab-exp-view.vue'
          ),
      );
    case 'region_list_exp_view':
      return defineAsyncComponent(
        () => import('./region/region-list-exp-view/region-list-exp-view.vue'),
      );
    case 'report_baseinfo_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './report/report-baseinfo-edit-view/report-baseinfo-edit-view.vue'
          ),
      );
    case 'psde_logic_tree_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-tree-exp-view/psde-logic-tree-exp-view.vue'
          ),
      );
    case 'master_card_dyna_logic_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-dyna-logic-exp/master-card-dyna-logic-exp.vue'
          ),
      );
    case 'master_enable_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-enable-edit-view/master-enable-edit-view.vue'
          ),
      );
    case 'master_ui_action_next':
      return defineAsyncComponent(
        () =>
          import('./master/master-ui-action-next/master-ui-action-next.vue'),
      );
    case 'master_card_logic_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-logic-event/master-card-logic-event.vue'
          ),
      );
    case 'master_usr2893_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-usr-2893-data-view-exp-view/master-usr-2893-data-view-exp-view.vue'
          ),
      );
    case 'master_tree_nav_bottom':
      return defineAsyncComponent(
        () =>
          import('./master/master-tree-nav-bottom/master-tree-nav-bottom.vue'),
      );
    case 'master_list_nocache_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-nocache-refreshmode/master-list-nocache-refreshmode.vue'
          ),
      );
    case 'master_kanban_dyna_enbale':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-dyna-enbale/master-kanban-dyna-enbale.vue'
          ),
      );
    case 'master_map':
      return defineAsyncComponent(
        () => import('./master/master-map/master-map.vue'),
      );
    case 'master_editor_stepper':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-stepper/master-editor-stepper.vue'),
      );
    case 'master_tree_navparams_nodeview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-navparams-nodeview/master-tree-navparams-nodeview.vue'
          ),
      );
    case 'master_line_bottom_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-line-bottom-nav/master-line-bottom-nav.vue'),
      );
    case 'master_search_logic':
      return defineAsyncComponent(
        () => import('./master/master-search-logic/master-search-logic.vue'),
      );
    case 'master_kanban_group_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-group-exp/master-kanban-group-exp.vue'
          ),
      );
    case 'master_searchbar_storage':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-storage/master-searchbar-storage.vue'
          ),
      );
    case 'master_form_item_event_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-item-event-edit-view/master-form-item-event-edit-view.vue'
          ),
      );
    case 'master_card_format':
      return defineAsyncComponent(
        () => import('./master/master-card-format/master-card-format.vue'),
      );
    case 'master_p_icker_singletabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-p-icker-singletabexpview/master-p-icker-singletabexpview.vue'
          ),
      );
    case 'master_cache_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-cache-data-view-exp-view/master-cache-data-view-exp-view.vue'
          ),
      );
    case 'master_list_default_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-default-showmode/master-list-default-showmode.vue'
          ),
      );
    case 'master_calendar_rightnav_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-week/master-calendar-rightnav-week.vue'
          ),
      );
    case 'master_calendar_month':
      return defineAsyncComponent(
        () =>
          import('./master/master-calendar-month/master-calendar-month.vue'),
      );
    case 'master_nav_param_stack_bar_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-nav-param-stack-bar-chart-exp-view/master-nav-param-stack-bar-chart-exp-view.vue'
          ),
      );
    case 'master_panel_single_data_container':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-single-data-container/master-panel-single-data-container.vue'
          ),
      );
    case 'master_card_style_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-style-exp/master-card-style-exp.vue'),
      );
    case 'app_nopermission_container':
      return defineAsyncComponent(
        () =>
          import('./app-nopermission-container/app-nopermission-container.vue'),
      );
    case 'master_list_mixin_showmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-mixin-showmode/master-list-mixin-showmode.vue'
          ),
      );
    case 'app_welcome_view':
      return defineAsyncComponent(
        () => import('./app-welcome-view/app-welcome-view.vue'),
      );
    case 'master_tree_exp':
      return defineAsyncComponent(
        () => import('./master/master-tree-exp/master-tree-exp.vue'),
      );
    case 'master_panel_panel_tab_panel':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-tab-panel/master-panel-panel-tab-panel.vue'
          ),
      );
    case 'psde_field_quick_cfg_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-field/psde-field-quick-cfg-view/psde-field-quick-cfg-view.vue'
          ),
      );
    case 'region_view_message_position':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-view-message-position/region-view-message-position.vue'
          ),
      );
    case 'master_wizard_event':
      return defineAsyncComponent(
        () => import('./master/master-wizard-event/master-wizard-event.vue'),
      );
    case 'master_tree_nullvaluesearch':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-nullvaluesearch/master-tree-nullvaluesearch.vue'
          ),
      );
    case 'master_calendar_exp_view_no_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-exp-view-no-cache/master-calendar-exp-view-no-cache.vue'
          ),
      );
    case 'master_list_group_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-group-exp/master-list-group-exp.vue'),
      );
    case 'master_form_event_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-event-edit-view/master-form-event-edit-view.vue'
          ),
      );
    case 'category_category_mgr':
      return defineAsyncComponent(
        () =>
          import('./category/category-category-mgr/category-category-mgr.vue'),
      );
    case 'master_drtab_cache2':
      return defineAsyncComponent(
        () => import('./master/master-drtab-cache-2/master-drtab-cache-2.vue'),
      );
    case 'master_default_date_calendar_view_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-default-date-calendar-view-day/master-default-date-calendar-view-day.vue'
          ),
      );
    case 'master_gantt_celledit':
      return defineAsyncComponent(
        () =>
          import('./master/master-gantt-celledit/master-gantt-celledit.vue'),
      );
    case 'master_bar_bottom_nav':
      return defineAsyncComponent(
        () =>
          import('./master/master-bar-bottom-nav/master-bar-bottom-nav.vue'),
      );
    case 'region_grid_tab_cache_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-grid-tab-cache-tab-exp-view/region-grid-tab-cache-tab-exp-view.vue'
          ),
      );
    case 'master_chart_extend':
      return defineAsyncComponent(
        () => import('./master/master-chart-extend/master-chart-extend.vue'),
      );
    case 'master_panel_event':
      return defineAsyncComponent(
        () => import('./master/master-panel-event/master-panel-event.vue'),
      );
    case 'region_tree_grid_frontexport':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-frontexport/region-tree-grid-frontexport.vue'
          ),
      );
    case 'master_tab_ctrl_federation2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tab-ctrl-federation-2/master-tab-ctrl-federation-2.vue'
          ),
      );
    case 'region_tree_grid_refreshtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-refreshtabexpview/region-tree-grid-refreshtabexpview.vue'
          ),
      );
    case 'master_panel_panel_exp_header':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-panel-exp-header/master-panel-panel-exp-header.vue'
          ),
      );
    case 'master_list_nav_exp':
      return defineAsyncComponent(
        () => import('./master/master-list-nav-exp/master-list-nav-exp.vue'),
      );
    case 'ps_core_prd_func_market_application_view':
      return defineAsyncComponent(
        () =>
          import(
            './ps-core-prd-func/ps-core-prd-func-market-application-view/ps-core-prd-func-market-application-view.vue'
          ),
      );
    case 'master_navparam_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-navparam-data-view-exp-view/master-navparam-data-view-exp-view.vue'
          ),
      );
    case 'region_tree_grid_backendexport':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-backendexport/region-tree-grid-backendexport.vue'
          ),
      );
    case 'master_list_quicktoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-quicktoolbar/master-list-quicktoolbar.vue'
          ),
      );
    case 'psde_logic_global_flow_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './psde-logic/psde-logic-global-flow-grid-view/psde-logic-global-flow-grid-view.vue'
          ),
      );
    case 'master_kanban_batchtoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-batchtoolbar/master-kanban-batchtoolbar.vue'
          ),
      );
    case 'master_editor_code':
      return defineAsyncComponent(
        () => import('./master/master-editor-code/master-editor-code.vue'),
      );
    case 'master_pickup_muleditview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-muleditview/master-pickup-muleditview.vue'
          ),
      );
    case 'region_data_view_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-data-view-exp-view/region-data-view-exp-view.vue'
          ),
      );
    case 'master_stackbar_bottom_nav':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-stackbar-bottom-nav/master-stackbar-bottom-nav.vue'
          ),
      );
    case 'master_calendar_contextmenu_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-timeline/master-calendar-contextmenu-timeline.vue'
          ),
      );
    case 'master_codelist_num':
      return defineAsyncComponent(
        () => import('./master/master-codelist-num/master-codelist-num.vue'),
      );
    case 'master_card_load_more':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-load-more/master-card-load-more.vue'),
      );
    case 'master_kanban_auto_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-auto-group/master-kanban-auto-group.vue'
          ),
      );
    case 'master_teleport_placeholder_toolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-toolbar/master-teleport-placeholder-toolbar.vue'
          ),
      );
    case 'master_calendar_event_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-event-call/master-calendar-event-call.vue'
          ),
      );
    case 'master_bar_right_nav':
      return defineAsyncComponent(
        () => import('./master/master-bar-right-nav/master-bar-right-nav.vue'),
      );
    case 'master_codelist_field':
      return defineAsyncComponent(
        () =>
          import('./master/master-codelist-field/master-codelist-field.vue'),
      );
    case 'master_list_sort_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-sort-draggable/master-list-sort-draggable.vue'
          ),
      );
    case 'master_calendar_contextmenu_week':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-contextmenu-week/master-calendar-contextmenu-week.vue'
          ),
      );
    case 'master_kanban_swimlane_lane_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-lane-draggable/master-kanban-swimlane-lane-draggable.vue'
          ),
      );
    case 'master_list_codelist_group':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-codelist-group/master-list-codelist-group.vue'
          ),
      );
    case 'master_redirect_view':
      return defineAsyncComponent(
        () => import('./master/master-redirect-view/master-redirect-view.vue'),
      );
    case 'master_kanban_refreshmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-refreshmode-exp/master-kanban-refreshmode-exp.vue'
          ),
      );
    case 'master_gantt_refreshmode_nocache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-gantt-refreshmode-nocache/master-gantt-refreshmode-nocache.vue'
          ),
      );
    case 'master_tree_topsession_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-topsession-datasource/master-tree-topsession-datasource.vue'
          ),
      );
    case 'master_editform_mdctrl_table':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editform-mdctrl-table/master-editform-mdctrl-table.vue'
          ),
      );
    case 'master_form_base':
      return defineAsyncComponent(
        () => import('./master/master-form-base/master-form-base.vue'),
      );
    case 'master_editor_input_ip':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-input-ip/master-editor-input-ip.vue'),
      );
    case 'master_list_default_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-default-sort/master-list-default-sort.vue'
          ),
      );
    case 'region_tree_grid_tabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-tabexpview/region-tree-grid-tabexpview.vue'
          ),
      );
    case 'psdeformdesign_modal':
      return defineAsyncComponent(
        () =>
          import('./psde-form/psdeformdesign-modal/psdeformdesign-modal.vue'),
      );
    case 'master_codelist_threshold':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-codelist-threshold/master-codelist-threshold.vue'
          ),
      );
    case 'master_list_dyna_enbale':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-dyna-enbale/master-list-dyna-enbale.vue'
          ),
      );
    case 'master_view_message_dynamic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-view-message-dynamic/master-view-message-dynamic.vue'
          ),
      );
    case 'master_drbar_base':
      return defineAsyncComponent(
        () => import('./master/master-drbar-base/master-drbar-base.vue'),
      );
    case 'master_panel_format':
      return defineAsyncComponent(
        () => import('./master/master-panel-format/master-panel-format.vue'),
      );
    case 'master_tree_exp_view':
      return defineAsyncComponent(
        () => import('./master/master-tree-exp-view/master-tree-exp-view.vue'),
      );
    case 'master_list_disable_sort':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-disable-sort/master-list-disable-sort.vue'
          ),
      );
    case 'report_bi_report_panel_view':
      return defineAsyncComponent(
        () =>
          import(
            './report/report-bi-report-panel-view/report-bi-report-panel-view.vue'
          ),
      );
    case 'master_codelist_empty':
      return defineAsyncComponent(
        () =>
          import('./master/master-codelist-empty/master-codelist-empty.vue'),
      );
    case 'region_tree_grid_nocache':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-nocache/region-tree-grid-nocache.vue'
          ),
      );
    case 'master_disable_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-disable-edit-view/master-disable-edit-view.vue'
          ),
      );
    case 'master_card_logic':
      return defineAsyncComponent(
        () => import('./master/master-card-logic/master-card-logic.vue'),
      );
    case 'master_calendar_nav_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-nav-month/master-calendar-nav-month.vue'
          ),
      );
    case 'master_chart_grid_mul_series':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-grid-mul-series/master-chart-grid-mul-series.vue'
          ),
      );
    case 'master_panel_nav_pos_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-nav-pos-view/master-panel-nav-pos-view.vue'
          ),
      );
    case 'master_codelist_type':
      return defineAsyncComponent(
        () => import('./master/master-codelist-type/master-codelist-type.vue'),
      );
    case 'master_panel_button':
      return defineAsyncComponent(
        () => import('./master/master-panel-button/master-panel-button.vue'),
      );
    case 'master_map_dyna_style':
      return defineAsyncComponent(
        () =>
          import('./master/master-map-dyna-style/master-map-dyna-style.vue'),
      );
    case 'master_depickup_view':
      return defineAsyncComponent(
        () => import('./master/master-depickup-view/master-depickup-view.vue'),
      );
    case 'master_card_quicktoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-quicktoolbar/master-card-quicktoolbar.vue'
          ),
      );
    case 'master_drbar_logic':
      return defineAsyncComponent(
        () => import('./master/master-drbar-logic/master-drbar-logic.vue'),
      );
    case 'region_tree_grid_batch':
      return defineAsyncComponent(
        () =>
          import('./region/region-tree-grid-batch/region-tree-grid-batch.vue'),
      );
    case 'master_list_group_new':
      return defineAsyncComponent(
        () =>
          import('./master/master-list-group-new/master-list-group-new.vue'),
      );
    case 'master_pickup_gridpickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-gridpickupview-2/master-pickup-gridpickupview-2.vue'
          ),
      );
    case 'master_default_date_calendar_view_month':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-default-date-calendar-view-month/master-default-date-calendar-view-month.vue'
          ),
      );
    case 'master_chart_exp_cache_edit_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-cache-edit-view/master-chart-exp-cache-edit-view.vue'
          ),
      );
    case 'region_listexp_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-listexp-tab-exp-view/region-listexp-tab-exp-view.vue'
          ),
      );
    case 'master_open_redirect_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-open-redirect-view/master-open-redirect-view.vue'
          ),
      );
    case 'master_color_picker':
      return defineAsyncComponent(
        () => import('./master/master-color-picker/master-color-picker.vue'),
      );
    case 'master_grid_showmode':
      return defineAsyncComponent(
        () => import('./master/master-grid-showmode/master-grid-showmode.vue'),
      );
    case 'master_teleport_placeholder_toolbar_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-teleport-placeholder-toolbar-list/master-teleport-placeholder-toolbar-list.vue'
          ),
      );
    case 'master_grid_column_plugin':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-column-plugin/master-grid-column-plugin.vue'
          ),
      );
    case 'master_map_area_deafult':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-map-area-deafult/master-map-area-deafult.vue'
          ),
      );
    case 'master_kanban_base':
      return defineAsyncComponent(
        () => import('./master/master-kanban-base/master-kanban-base.vue'),
      );
    case 'master_kanban_swimlane_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-group-draggable/master-kanban-swimlane-group-draggable.vue'
          ),
      );
    case 'master_anchor_tab_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-anchor-tab-exp-view/master-anchor-tab-exp-view.vue'
          ),
      );
    case 'master_codelist_tree':
      return defineAsyncComponent(
        () => import('./master/master-codelist-tree/master-codelist-tree.vue'),
      );
    case 'region_tree_grid_defaultval':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-defaultval/region-tree-grid-defaultval.vue'
          ),
      );
    case 'master_drbar_logic_delogic':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drbar-logic-delogic/master-drbar-logic-delogic.vue'
          ),
      );
    case 'master_map_item_style':
      return defineAsyncComponent(
        () =>
          import('./master/master-map-item-style/master-map-item-style.vue'),
      );
    case 'region_info_view':
      return defineAsyncComponent(
        () => import('./region/region-info-view/region-info-view.vue'),
      );
    case 'master_bar_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-bar-chart-exp-view/master-bar-chart-exp-view.vue'
          ),
      );
    case 'master_card_roll_load':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-roll-load/master-card-roll-load.vue'),
      );
    case 'master_grid_grouprowmode_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-grouprowmode-exp/master-grid-grouprowmode-exp.vue'
          ),
      );
    case 'master_card_sort_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-sort-draggable/master-card-sort-draggable.vue'
          ),
      );
    case 'master_calendar_layout_timeline':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-layout-timeline/master-calendar-layout-timeline.vue'
          ),
      );
    case 'master_calendar_bottomnav_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-day/master-calendar-bottomnav-day.vue'
          ),
      );
    case 'master_kanban_enablegrouphidden':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-enablegrouphidden/master-kanban-enablegrouphidden.vue'
          ),
      );
    case 'master_grid_attachment_column_enabledownloadticket':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-attachment-column-enabledownloadticket/master-grid-attachment-column-enabledownloadticket.vue'
          ),
      );
    case 'master_ui_action_closeview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-ui-action-closeview/master-ui-action-closeview.vue'
          ),
      );
    case 'master_grid_row_logic':
      return defineAsyncComponent(
        () =>
          import('./master/master-grid-row-logic/master-grid-row-logic.vue'),
      );
    case 'master_form_detail_plugin':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-detail-plugin/master-form-detail-plugin.vue'
          ),
      );
    case 'master_view_logic':
      return defineAsyncComponent(
        () => import('./master/master-view-logic/master-view-logic.vue'),
      );
    case 'master_pickup_gridmpickupview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-gridmpickupview-2/master-pickup-gridmpickupview-2.vue'
          ),
      );
    case 'master_upload_image_upload':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-upload-image-upload/master-upload-image-upload.vue'
          ),
      );
    case 'master_card_group_new':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-group-new/master-card-group-new.vue'),
      );
    case 'master_kanban_call':
      return defineAsyncComponent(
        () => import('./master/master-kanban-call/master-kanban-call.vue'),
      );
    case 'master_kanban_swimlane_quicktoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-quicktoolbar/master-kanban-swimlane-quicktoolbar.vue'
          ),
      );
    case 'master_grid_layout':
      return defineAsyncComponent(
        () => import('./master/master-grid-layout/master-grid-layout.vue'),
      );
    case 'master_kanban_ctrl_event':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-ctrl-event/master-kanban-ctrl-event.vue'
          ),
      );
    case 'region_tree_grid_layouttabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-layouttabexpview/region-tree-grid-layouttabexpview.vue'
          ),
      );
    case 'region_tree_grid_rowedittabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-rowedittabexpview/region-tree-grid-rowedittabexpview.vue'
          ),
      );
    case 'report_all_report_grid_view':
      return defineAsyncComponent(
        () =>
          import(
            './report/report-all-report-grid-view/report-all-report-grid-view.vue'
          ),
      );
    case 'master_kanban_swimlane_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-swimlane-refreshmode/master-kanban-swimlane-refreshmode.vue'
          ),
      );
    case 'master_ui_action_front':
      return defineAsyncComponent(
        () =>
          import('./master/master-ui-action-front/master-ui-action-front.vue'),
      );
    case 'master_cancel_change':
      return defineAsyncComponent(
        () => import('./master/master-cancel-change/master-cancel-change.vue'),
      );
    case 'master_month_nav_param_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-month-nav-param-calendar-exp-view/master-month-nav-param-calendar-exp-view.vue'
          ),
      );
    case 'master_number_range_picker':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-number-range-picker/master-number-range-picker.vue'
          ),
      );
    case 'master_kanban_card_new':
      return defineAsyncComponent(
        () =>
          import('./master/master-kanban-card-new/master-kanban-card-new.vue'),
      );
    case 'master_kanban_quicktoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-quicktoolbar/master-kanban-quicktoolbar.vue'
          ),
      );
    case 'master_kanban_layout_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-kanban-layout-exp/master-kanban-layout-exp.vue'
          ),
      );
    case 'master_card_group_exp':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-group-exp/master-card-group-exp.vue'),
      );
    case 'master_tree_grid_ex_call':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-call/master-tree-grid-ex-call.vue'
          ),
      );
    case 'master_calendar_multiple_data_day':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-multiple-data-day/master-calendar-multiple-data-day.vue'
          ),
      );
    case 'master_gantt_hour':
      return defineAsyncComponent(
        () => import('./master/master-gantt-hour/master-gantt-hour.vue'),
      );
    case 'region_tree_grid_fitcol':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-fitcol/region-tree-grid-fitcol.vue'
          ),
      );
    case 'master_quickcreate':
      return defineAsyncComponent(
        () => import('./master/master-quickcreate/master-quickcreate.vue'),
      );
    case 'master_editor_check_box_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-editor-check-box-list/master-editor-check-box-list.vue'
          ),
      );
    case 'master_pickup_gridpickupview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-gridpickupview/master-pickup-gridpickupview.vue'
          ),
      );
    case 'master_form':
      return defineAsyncComponent(
        () => import('./master/master-form/master-form.vue'),
      );
    case 'master_chart_stacked_column':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-stacked-column/master-chart-stacked-column.vue'
          ),
      );
    case 'master_list':
      return defineAsyncComponent(
        () => import('./master/master-list/master-list.vue'),
      );
    case 'master_drtab_more':
      return defineAsyncComponent(
        () => import('./master/master-drtab-more/master-drtab-more.vue'),
      );
    case 'master_card_auto_group':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-auto-group/master-card-auto-group.vue'),
      );
    case 'region_tree_grid_disablesort':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-disablesort/region-tree-grid-disablesort.vue'
          ),
      );
    case 'master_global_plugin':
      return defineAsyncComponent(
        () => import('./master/master-global-plugin/master-global-plugin.vue'),
      );
    case 'master_calendar_exp_view_cache':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-exp-view-cache/master-calendar-exp-view-cache.vue'
          ),
      );
    case 'master_gantt_layout':
      return defineAsyncComponent(
        () => import('./master/master-gantt-layout/master-gantt-layout.vue'),
      );
    case 'region_tree_grid_quicktoolbar':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-quicktoolbar/region-tree-grid-quicktoolbar.vue'
          ),
      );
    case 'master_calendar_rightnav_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-user/master-calendar-rightnav-user.vue'
          ),
      );
    case 'master_card_dyna_enbale':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-dyna-enbale/master-card-dyna-enbale.vue'
          ),
      );
    case 'region_redirect_view':
      return defineAsyncComponent(
        () => import('./region/region-redirect-view/region-redirect-view.vue'),
      );
    case 'master_chart_exp_no_cache_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-chart-exp-no-cache-chart-exp-view/master-chart-exp-no-cache-chart-exp-view.vue'
          ),
      );
    case 'master_panel_item_render':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-panel-item-render/master-panel-item-render.vue'
          ),
      );
    case 'master_map_baseurl':
      return defineAsyncComponent(
        () => import('./master/master-map-baseurl/master-map-baseurl.vue'),
      );
    case 'region_meditpanel_base':
      return defineAsyncComponent(
        () =>
          import('./region/region-meditpanel-base/region-meditpanel-base.vue'),
      );
    case 'master_grid_design_preview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-grid-design-preview/master-grid-design-preview.vue'
          ),
      );
    case 'region_list_separator_list_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-list-separator-list-exp-view/region-list-separator-list-exp-view.vue'
          ),
      );
    case 'master_editor_list_box':
      return defineAsyncComponent(
        () =>
          import('./master/master-editor-list-box/master-editor-list-box.vue'),
      );
    case 'region_grid_cache_grid_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-grid-cache-grid-exp-view/region-grid-cache-grid-exp-view.vue'
          ),
      );
    case 'master_form_value_display':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-form-value-display/master-form-value-display.vue'
          ),
      );
    case 'master_short_cut':
      return defineAsyncComponent(
        () => import('./master/master-short-cut/master-short-cut.vue'),
      );
    case 'master_map_drilldown':
      return defineAsyncComponent(
        () => import('./master/master-map-drilldown/master-map-drilldown.vue'),
      );
    case 'master_advanced_search':
      return defineAsyncComponent(
        () =>
          import('./master/master-advanced-search/master-advanced-search.vue'),
      );
    case 'master_textbox_signature':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-textbox-signature/master-textbox-signature.vue'
          ),
      );
    case 'master_grid_update':
      return defineAsyncComponent(
        () => import('./master/master-grid-update/master-grid-update.vue'),
      );
    case 'master_tabexppanel':
      return defineAsyncComponent(
        () => import('./master/master-tabexppanel/master-tabexppanel.vue'),
      );
    case 'master_grid_group':
      return defineAsyncComponent(
        () => import('./master/master-grid-group/master-grid-group.vue'),
      );
    case 'master_gantt_base':
      return defineAsyncComponent(
        () => import('./master/master-gantt-base/master-gantt-base.vue'),
      );
    case 'master_call_view_ability':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-call-view-ability/master-call-view-ability.vue'
          ),
      );
    case 'master_nav_param_scatter_chart_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-nav-param-scatter-chart-exp-view/master-nav-param-scatter-chart-exp-view.vue'
          ),
      );
    case 'category_workflow_design_grid':
      return defineAsyncComponent(
        () =>
          import(
            './category/category-workflow-design-grid/category-workflow-design-grid.vue'
          ),
      );
    case 'master_pickup_treepickupcontrolview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-treepickupcontrolview/master-pickup-treepickupcontrolview.vue'
          ),
      );
    case 'region_row_expand_tree_grid':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-row-expand-tree-grid/region-row-expand-tree-grid.vue'
          ),
      );
    case 'master_grid_edit_row':
      return defineAsyncComponent(
        () => import('./master/master-grid-edit-row/master-grid-edit-row.vue'),
      );
    case 'master_tree_grid_ex_refreshtabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-refreshtabexpview/master-tree-grid-ex-refreshtabexpview.vue'
          ),
      );
    case 'master_tree_dedataset_datasource':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-dedataset-datasource/master-tree-dedataset-datasource.vue'
          ),
      );
    case 'master_searchbar_base':
      return defineAsyncComponent(
        () =>
          import('./master/master-searchbar-base/master-searchbar-base.vue'),
      );
    case 'master_tree_grid_ex_entitynode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-entitynode/master-tree-grid-ex-entitynode.vue'
          ),
      );
    case 'master_pickup_muleditview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-muleditview-2/master-pickup-muleditview-2.vue'
          ),
      );
    case 'master_chart_line':
      return defineAsyncComponent(
        () => import('./master/master-chart-line/master-chart-line.vue'),
      );
    case 'master_ui_logic_params':
      return defineAsyncComponent(
        () =>
          import('./master/master-ui-logic-params/master-ui-logic-params.vue'),
      );
    case 'category_grid_view':
      return defineAsyncComponent(
        () => import('./category/category-grid-view/category-grid-view.vue'),
      );
    case 'master_list_page':
      return defineAsyncComponent(
        () => import('./master/master-list-page/master-list-page.vue'),
      );
    case 'master_card_sort_group_draggable':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-sort-group-draggable/master-card-sort-group-draggable.vue'
          ),
      );
    case 'master_list_event_call_exp':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-list-event-call-exp/master-list-event-call-exp.vue'
          ),
      );
    case 'master_panel_media':
      return defineAsyncComponent(
        () => import('./master/master-panel-media/master-panel-media.vue'),
      );
    case 'master_calendar_view':
      return defineAsyncComponent(
        () => import('./master/master-calendar-view/master-calendar-view.vue'),
      );
    case 'master_panel_text':
      return defineAsyncComponent(
        () => import('./master/master-panel-text/master-panel-text.vue'),
      );
    case 'master_drtab_event_ability':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-drtab-event-ability/master-drtab-event-ability.vue'
          ),
      );
    case 'master_form_css':
      return defineAsyncComponent(
        () => import('./master/master-form-css/master-form-css.vue'),
      );
    case 'master_activity_display':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-activity-display/master-activity-display.vue'
          ),
      );
    case 'master_virtualized_list':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-virtualized-list/master-virtualized-list.vue'
          ),
      );
    case 'master_tabexppanel_right':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tabexppanel-right/master-tabexppanel-right.vue'
          ),
      );
    case 'master_base_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-base-calendar-exp-view/master-base-calendar-exp-view.vue'
          ),
      );
    case 'master_calendar_refreshmode':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-refreshmode/master-calendar-refreshmode.vue'
          ),
      );
    case 'master_pickup_editview2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-editview-2/master-pickup-editview-2.vue'
          ),
      );
    case 'master_pickup_multabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-pickup-multabexpview/master-pickup-multabexpview.vue'
          ),
      );
    case 'master_grid_view':
      return defineAsyncComponent(
        () => import('./master/master-grid-view/master-grid-view.vue'),
      );
    case 'master_card_width_height':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-card-width-height/master-card-width-height.vue'
          ),
      );
    case 'master_entity_field_grid':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-entity-field-grid/master-entity-field-grid.vue'
          ),
      );
    case 'master_card_new':
      return defineAsyncComponent(
        () => import('./master/master-card-new/master-card-new.vue'),
      );
    case 'admin_index':
      return defineAsyncComponent(
        () => import('./admin-index/admin-index.vue'),
      );
    case 'master_calendar_rightnav_multiple_data':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-rightnav-multiple-data/master-calendar-rightnav-multiple-data.vue'
          ),
      );
    case 'region_tree_grid_exporttabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './region/region-tree-grid-exporttabexpview/region-tree-grid-exporttabexpview.vue'
          ),
      );
    case 'master_tree_loadmore':
      return defineAsyncComponent(
        () => import('./master/master-tree-loadmore/master-tree-loadmore.vue'),
      );
    case 'master_searchbar_ability':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-searchbar-ability/master-searchbar-ability.vue'
          ),
      );
    case 'master_workflow_design_edit':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-workflow-design-edit/master-workflow-design-edit.vue'
          ),
      );
    case 'master_day_nav_param_calendar_exp_view':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-day-nav-param-calendar-exp-view/master-day-nav-param-calendar-exp-view.vue'
          ),
      );
    case 'category_edit_view':
      return defineAsyncComponent(
        () => import('./category/category-edit-view/category-edit-view.vue'),
      );
    case 'master_chart_regional':
      return defineAsyncComponent(
        () =>
          import('./master/master-chart-regional/master-chart-regional.vue'),
      );
    case 'master_wizard_base':
      return defineAsyncComponent(
        () => import('./master/master-wizard-base/master-wizard-base.vue'),
      );
    case 'report_edit_view':
      return defineAsyncComponent(
        () => import('./report/report-edit-view/report-edit-view.vue'),
      );
    case 'master_calendar_bottomnav_user':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-calendar-bottomnav-user/master-calendar-bottomnav-user.vue'
          ),
      );
    case 'master_searchbar_ph':
      return defineAsyncComponent(
        () => import('./master/master-searchbar-ph/master-searchbar-ph.vue'),
      );
    case 'master_tree_grid_ex_rowedittabexpview':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-tree-grid-ex-rowedittabexpview/master-tree-grid-ex-rowedittabexpview.vue'
          ),
      );
    case 'master_counter':
      return defineAsyncComponent(
        () => import('./master/master-counter/master-counter.vue'),
      );
    case 'master_tree_eventcall':
      return defineAsyncComponent(
        () =>
          import('./master/master-tree-eventcall/master-tree-eventcall.vue'),
      );
    case 'master_card_pagingbar':
      return defineAsyncComponent(
        () =>
          import('./master/master-card-pagingbar/master-card-pagingbar.vue'),
      );
    default:
      throw new Error(`无法找到视图模型：${name}`);
  }
}
