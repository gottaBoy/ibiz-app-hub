import { en as runTimeEn } from '@ibiz-template/runtime';
import { en as vue3UtilEn } from '@ibiz-template/vue3-util';
import { en as modelHelperEn } from '@ibiz-template/model-helper';
import { en as coreEn } from '@ibiz-template/core';

export default {
  // 应用级
  app: {
    logout: 'Logout',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    return: 'Return',
    noData: 'No data available',
    refresh: 'Refresh',
    noSupport: 'Not supported currently',
    add: 'Add',
    delete: 'Delete',
    save: 'Save',
    edit: 'Edit',
    complete: 'Complete',
    more: 'More',
    close: 'Close',
    newlyBuild: 'Newly build',
    reset: 'Reset',
    search: 'Search',
    advanceSearch: 'Advance Search',
    rememberMe: 'Remember me',
    retract: 'Retract',
    pleaseEnterAccount: 'Please enter account number',
    pleaseEnterPassword: 'Please enter password',
    aiError: 'System encountered an exception, please try again later',
    fullscreen: 'Fullscreen',
    cancelFullscreen: 'Cancel fullscreen',
  },
  // 视图
  view: {
    common: {
      backHomepage: 'Back to home page',
      continueBrowsing: 'Continue browsing',
    },
    noPermissionView: {
      noPermissionPrompt:
        'Sorry, you do not have permission to access this page',
      noPermission: 'You do not have permission to access this page. Please',
    },
    noResourcesView: {
      noResourcePrompt: 'Sorry, the resource you are accessing does not exist',
      resourceNoExist:
        'The resource you are looking for does not exist. Please',
    },
    errorView: {
      noExistPrompt: 'Error view does not exist {code}',
    },
    loginView: {
      passwordLength: 'The password length cannot be less than 6 digits',
      login: 'Login',
      thirdAuthFail: 'Third party login authorization failed',
    },
    subAppRefView: {
      jump: 'Redirect',
    },
    shareView: {
      inviting: 'Inviting you to join the theme app!',
      use: 'Use',
      cancel: 'Cancel',
    },
  },
  viewEngine: {
    closeRemind: 'Close reminder',
    confirmClosePrompt:
      'The form data has been modified, are you sure you want to close it?',
    noExistVersionErr: 'The current workflow version does not exist',
    browseMsg: 'Browsed',
    editMsg: 'Edited',
    updateMsg: 'Updated',
    someone: 'Someone',
    refreshPrompt: 'Do you want to refresh',
    refreshPagePrompt:
      'The data has been modified. Do you want to refresh the page?',
    refreshRemind: 'Refresh reminder',
    confirmRefreshPrompt:
      'The form data has been modified. Are you sure you want to refresh it?',
    missingErr: 'context missing srfnavctrlid',
    subclassAchieve: 'Subclass implementation',
    missingConfigErr:
      'Missing configuration for a list component called simplelist',
    noFoundLayoutOccupied: 'No tabexppanel layout placeholders found',
    noFoundLayoutContainer: 'No {name} layout container found',
    noFoundFormModel: 'Unable to find the model for form {name}',
    missingToolbarModel: 'Missing toolbar component model',
    noCollapseTag: 'The fold identifier is not configured',
    noExpandTag: 'The expansion identifier is not configured',
  },
  webApp: {
    authGuard: {
      loginFailed: 'Anonymous user login failed',
      noPermission: 'No permission to access!',
    },
    unauthorizedHandler: {
      noFoundEnvParams: 'Unable to find environment parameter casLoginUrl',
      forbiddenAccess: 'Access to the current account is prohibited',
      logoutAccount: 'Do you want to log out of your current account?',
    },
  },
  // 部件
  control: {
    common: {
      determine: 'Determine',
      retreat: 'Retreat',
      forward: 'Forward',
      noSupportItem: '{name} is currently not supported',
      noFoundNode: 'Node with _uuid {id} not found',
      itemsSelected: '{length} items selected',
      citeErrMessage: 'Unable to find table component reference',
      noDomErrMessage: 'Unable to find corresponding table row dom element',
      noPopErrMessage: 'Unable to obtain an instance of the pop component',
      currentNoData: 'Current no data',
      updateSuccess: 'Update success',
      newSuccCreated: 'New successfully created',
      deleteSuccess: 'Delete successful',
      customTheme: {
        themeColor: 'Theme color',
        light: 'Bright color',
        dark: 'Dark',
        blue: 'Blue',
        user1: 'USER1',
        user2: 'USER2',
        user3: 'USER3',
        saveAndShare: 'Apply to global',
        resetAndShare: 'Reset to global',
        resetConfirmation: 'Reset confirmation',
        resetConfirmationDesc:
          'Please confirm if it is necessary to reset the currently selected theme and load global default data?',
        resetConfirmationGlobalDesc:
          'Please confirm if it is necessary to reset the global default data?',
        closeModelEdit: 'Close json model editing',
        modelEdit: 'Json model editing',
        adminOperation: 'Administrator operation',
        confirmCopyLink: 'Confirm copy link',
        preview: 'Preview',
        save: 'Apply',
        reset: 'Reset',
        share: 'Share',
        app: 'Apply',
        font: 'typeface',
        fontSize: 'Font size',
        fontSizeDesc: 'Applied font size',
        fontWeight: 'Font weight',
        fontWeightDesc: 'Apply the default word weight',
        other: 'Other',
        borderRadius: 'Fillet corner',
        borderRadiusDesc: 'Buttons, modes and other containers rounded corners',
        widthIcon: 'Icon size',
        widthIconDesc: 'Icon size, control the size of all ICONS',
        spacing: 'Spacing',
        spacingDesc:
          'Apply the spacing size, which is the space between elements',
        primaryColor: 'Primary color',
        primaryColorDesc:
          'Main colors, only used in situations that require strong emphasis',
        primaryTextColor: 'Main text color',
        primaryTextColorDesc:
          'Main color text color, contrasting with background color',
        primaryHoverColor: 'Main floating colors',
        primaryHoverColorDesc: 'Main colors in suspended state',
        primaryHoverTextColor: 'Main floating text colors',
        primaryHoverTextColorDesc:
          'The main color is the floating text color, which contrasts with the background color',
        primaryActiveColor: 'Main activation colors',
        primaryActiveColorDesc: 'Main color activation state',
        primaryActiveTextColor: 'Main activation text color',
        primaryActiveTextColorDesc:
          'The main color is the activated text color, which contrasts with the background color',
        primaryDisabledColor: 'Mainly disable colors',
        primaryDisabledColorDesc: 'Main color disabled state',
        primaryDisabledTextColor: 'Mainly disable text color',
        primaryDisabledTextColorDesc:
          'The main color is the disabled text color, which contrasts with the background color',
        primaryLightDefaultColor: 'Main light colors',
        primaryLightDefaultColorDesc:
          'The main color of the light version (mostly used for background). Only used in situations that require strong emphasis',
        primaryLightHoverColor: 'Main light floating colors',
        primaryLightHoverColorDesc: 'Light version with main colors suspended',
        primaryLightActiveColor: 'Main light activation colors',
        primaryLightActiveColorDesc:
          'Light version main color activation state',
        text: 'Text color',
        mainTextColor: 'Text  main color',
        mianTextColorDesc: 'Text colors - most important',
        minorTextColor: 'Text  slightly less colored',
        minorTextColorDesc: 'Text color - slightly Minor',
        secondaryTextColor: 'Text  secondary color',
        secondaryTextColorDesc: 'Text color - secondary',
        lastTextColor: 'Text  minimum color',
        lastTextColorDesc: 'Text color - least significant',
        linkColor: 'Link color',
        textLinkColor: 'Text link color',
        textLinkColorDesc: 'Link color - Most important',
        textLinkHoverColor: 'Text link floating color',
        textLinkHoverColorDesc: 'Link color - Suspended',
        textLinkActiveColor: 'Text link activation color',
        textLinkActiveColorDesc: 'Link color - Active',
        textLinkVisitedColor: 'Text link visited color',
        textLinkVisitedColorDesc: 'Link color - Visited',
        bgColor: 'Background',
        bgColorLowestLayer: 'Bottom layer of background color',
        bgColorLowestLayerDesc: 'Background Color - Bottom Layer (Bottom Page)',
        bgColorLowerLayer: 'Lower layer of background color',
        bgColorLowerLayerDesc:
          'Background color - lower level (content that needs to be improved on the page)',
        bgColorCenterLayer: 'Middle layer of background color',
        bgColorCenterLayerDesc:
          'Background Color - Middle Layer (Modal and other containers)',
        bgColorSecondaryUpperLayer: 'Background color secondary upper layer',
        bgColorSecondaryUpperLayerDesc:
          'Background Color - Secondary Layer (Notification, Toast, etc.)',
        bgColorTopLayer: 'Top layer of background color',
        bgColorTopLayerDesc: 'Background Color - Top (Special)',
        fillColor: 'Fill',
        fillDefault: 'Default fill color',
        fillDefaultDesc: 'Fill color - Default state',
        fillHover: 'Suspended fill color',
        fillHoverDesc: 'Fill color - Suspended',
        fillActive: 'Activate fill color',
        fillActiveDesc: 'Fill color - Active state',
        border: 'Border',
        borderColor: 'Border color',
        borderColorDesc: 'Default stroke color',
        disabledState: 'Disabled state',
        disabledText: 'Disable text color',
        disabledTextDesc: 'Disabled state - Text',
        disabledTextBorder: 'Disable stroke colors',
        disabledTextBorderDesc: 'Disabled state - stroke edge',
        disabledBg: 'Disable background color',
        disabledBgDesc: 'Disabled state - Background',
        disabledFill: 'Disable fill color',
        disabledFillDesc: 'Disabled state - Fill',
        sidebar: 'Side navigation bar',
        top: 'Top navigation bar',
        mainColor: 'Main font color',
        mainColorDesc: 'Main color of navigation bar font',
        secondaryColor: 'Font secondary color',
        secondaryColorDesc: 'Navigation bar font secondary color',
        mainBgColor: 'Background main color',
        mainBgColorDesc: 'Main color of navigation bar background ',
        secondaryBgColor: 'Background secondary color',
        secondaryBgColorDesc: 'Navigation bar background secondary color',
        iconMainColor: 'Icon main color',
        iconMainColorDesc: 'Main color of navigation bar ICONS',
        iconSecondaryColor: 'Icon secondary color',
        iconSecondaryColorDesc: 'Navigation bar icon secondary color ',
        appMenuColor: 'Menu colors',
        appMenuColorDesc: 'Navigation bar Application Menu Font color',
        appMenuHoverColor: 'Menu Suspension color',
        appMenuHoverColorDesc:
          'Navigation bar Application Menu Font Suspension color',
        appMenuHoverBgColor: 'Menu suspended background color',
        appMenuHoverBgColorDesc:
          'Navigation bar apply menu suspension background color',
        appMenuActiveColor: 'Menu color selection',
        appMenuActiveColorDesc:
          'Navigation bar application menu Select Font color ',
        appMenuActiveBgColor: 'Menu select Background color',
        appMenuActiveBgColorDesc:
          'navigation application menu to select the background color',
        ctrl: 'control',
        grid: 'Table',
        gridHeaderBg: 'Table header Background color',
        gridHeaderBgDesc:
          'Table header background color, different from table row background',
        gridHeaderColor: 'Table header Font color',
        gridHeaderColorDesc:
          'Table header font color, including table header, table sort button',
        gridRowBg: 'Table row background color Bright',
        gridRowBgDesc:
          'Table row background color Bright color, that is, the bright color of the table zebra print',
        gridRowBg2: 'Table row background Dark color',
        gridRowBg2Desc:
          'Table row background Dark color, that is, the dark color of the table zebra print',
        gridRowColor: 'Table row font color',
        gridRowColorDesc: 'Table row all font colors',
        gridRowHover: 'Table row hover color',
        gridRowHoverDesc:
          'Table row suspension color, background color when a row is hover',
        gridRowSelect: 'Select color for table row',
        gridRowSelectDesc:
          'Table row selected color, background color when a row is selected',
        tree: 'Tree',
        treeTextColor: 'Tree view text color',
        treeTextColorDesc: 'Tree view text color, tree node base text color',
        treeBgColor: 'Tree view background color',
        treeBgColorDesc:
          'Background color of the tree view, the overall background color of the tree view component',
        treeDisabledColor: 'Tree view disable color',
        treeDisabledColorDesc:
          'Disable color in the tree view and text color in the tree node',
        treeHoverColor: 'Tree view hover color',
        treeHoverColorDesc: 'Tree view hover color, tree node hover text color',
        treeHoverBgColor: 'Tree view suspension background color',
        treeHoverBgColorDesc:
          'Tree view suspension background color, tree node suspension background color',
        treeSelectColor: 'Tree view Selected color',
        treeSelectColorDesc:
          'In the tree view, select a color, and select a natural color for tree nodes',
        treeSelectBgColor: 'Tree View Select the background color',
        treeSelectBgColorDesc:
          'Select the background color for the tree view and the background color for the tree node',
      },
      loadMore: 'Load more',
      expandData: 'expand Data',
      collapseData: 'collapse Data',
    },
    menu: {
      noSupportAlign: 'The menu direction {align} is not supported temporarily',
      noFoundModel: 'no find the menu item model {menuKey}',
      noFoundFunction:
        'The adapter for {menuKey} does not have a renderText method',
      menuSetting: 'Menu setting',
    },
    menuDesign: {
      customMenu: 'Custom menu',
      reset: 'Reset',
      save: 'Save',
      visible: 'Visible',
      noMenuItemModel: 'No menu item model found {menu}',
      noFoundFunction:
        'The adapter for {menu} does not have a renderText method',
    },
    calendar: {
      lastYear: 'Last year',
      lastMonth: 'Last month',
      today: 'Today',
      nextMonth: 'Next month',
      nextYear: 'Next year',
      calendardaily: {
        title: 'Working Calendar',
        weeks: {
          sunday: 'Sunday',
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
        },
        tip: 'All Day',
        today: 'Today',
        tomorrow: 'To Morrow',
        nextweek: 'Next Week',
        selectdate: 'Select Date',
      },
      calendarmonth: {
        lastmonth: 'Last Month',
        nextmonth: 'Next Month',
        today: 'Today',
        year: 'Year',
        month: 'Month',
        weeks: {
          sunday: 'Sun',
          monday: 'Mon',
          tuesday: 'Tue',
          wednesday: 'Wed',
          thursday: 'Thu',
          friday: 'Fri',
          saturday: 'Sat',
        },
      },
      calendarweek: {
        weeks: {
          sunday: 'Sun',
          monday: 'Mon',
          tuesday: 'Tue',
          wednesday: 'Wed',
          thursday: 'Thu',
          friday: 'Fri',
          saturday: 'Sat',
        },
      },
      calendarUser: {
        weeks: {
          monday: 'Mon',
          tuesday: 'Tue',
          wednesday: 'Wed',
          thursday: 'Thu',
          friday: 'Fri',
          saturday: 'Sat',
          sunday: 'Sun',
        },
        selectWeekRange: 'Select week range',
        weekFormat: 'ww [Week] of YYYY',
      },
    },
    chart: {
      chartPlaceholder: 'Chart',
      drillDetail: 'drillDetail',
    },
    dashboard: {
      customDashboardContainer: {
        portalCustomPrompt: 'Portal customization',
        newFilter: 'New filter porlet',
      },
      dashboardDesign: {
        global: 'Global level',
        add: 'Add',
        customPortal: 'Customize portal',
        colNum: 'Column number',
        cellHeight: 'Cell height',
        restoreDefault: 'Restore default',
        save: 'Save',
        unGroup: 'Ungroup',
      },
      filterPortletDesign: {
        ctrlTitleError: 'Control name cannot be empty',
        ctrlTitle: 'Control name',
        ctrlPlaceholder: 'Please enter a control name',
        checkTitle: 'This parameter is valid for all reports in the data set',
        baseSet: 'Basic setup',
        filterTitle: 'Filter porlet',
        selectAll: 'Select all',
      },
    },
    form: {
      noSupportDetailType:
        'Form detail type not supported: {detailType} or corresponding provider cannot be found',
      formDruipart: {
        saveFirst: 'Please save the master data first',
        defaultText: 'FormDruipart',
      },
      formGroupPanel: {
        showMore: 'Show More',
      },
      formMDctrlForm: {
        noFindProvider: 'Provider not found for form',
      },
      formMDctrlRepeater: {
        noSupportStyle:
          'Repeater style {repeaterStyle} is currently not supported',
      },
      repeaterGrid: {
        promptInformation: 'Do you want to delete the selected item',
        absentOrLoad: 'Not present or loading',
      },
      repeaterSingleForm: {
        errorMessage: 'No repeatedForm',
      },
      mdCtrlContainer: {
        promptInformation: 'Do you want to delete the selected item',
        noSlot: 'Item slot not provided',
      },
      formMDctrl: {
        errorMessage:
          'The content type is currently not supported as {contentType}',
        defaultText: 'FormMDCtrl',
      },
      formGroup: {
        fold: 'Fold',
        unfold: 'Unfold',
      },
      formRawItem: {
        dividerText: 'Dividing line',
        infoText: 'Info tips',
        warningText: 'Warning tips',
        errorText: 'Error tips',
        defaultText: 'Direct content',
      },
    },
    gantt: {
      complete: 'Completed amount',
      total: 'Total',
      deadline: 'Deadline',
      hideControl: 'Column selection',
    },
    kanban: {
      lane: 'Lane',
      collapsed: 'Collapsed',
      expand: 'Expand',
      allCollapsed: 'All collapsed',
      allExpand: 'All expand',
      selectAll: 'Select all',
      selectedDataCount: 'Selected <span>{length}</span> pieces of data',
      natchOperation: 'Batch operation',
    },
    reportPanel: {
      unrealized: 'Unrealized',
    },
    searchBar: {
      saveGroup: 'Save group',
      filter: 'Filter',
      filterTree: {
        addItem: 'Add item',
      },
      searchGroups: {
        groupValueRule: 'Group name cannot be empty',
        errorMessage: 'Group name cannot be duplicate！',
        noEditPrompt: 'The configured grouping is not editable',
        savePrompt: 'Please save the group first',
        delTitle: 'Confirm delete',
        confirmDelPrompt:
          'Are you sure to delete group <span>{itemName}</span？',
        unrecoverablePrompt: 'Cannot recover after group deletion',
        newGroup: 'New group',
        groupManage: 'Group manage',
        groupName: 'Group Name',
        enterPrompt: 'Please enter the group name',
        editGroup: 'Edit grouping',
        manageTips: 'Tips：Manage grouping of search bars',
        name: 'Name',
        show: 'Show',
        operate: 'Operate',
        dialogCancel: 'Cancel',
        dialogDetermine: 'Determine',
      },
      quickSearchSelect: {
        searchField: 'Switch search field',
      },
    },
    toolbar: {
      exportExcel: {
        exportAll: 'Export all(Export up to 1000 rows)',
        expCurrentPage: 'Export current page',
        expCurrentSelect: 'Export the current selection',
        page: 'Page',
        export: 'Export',
      },
    },
    tree: {
      noFoundInstance: 'Unable to find el tree instance object',
      noSupported: 'Not currently supported dropType:{dropType}',
    },
    treeGridEx: {
      noFoundMessage: 'Unable to find row data object for {id}',
    },
    captionBar: {
      total: '{total} bar data {invisibleNum} bar is not visible',
    },
  },
  // 组件
  component: {
    indexSearch: {
      placeholder: 'Search Content',
    },
    dataImport: {
      startImport:
        'Start importing. Please refer to the application notification for detailed progress and results',
      importSuccess:
        'A total of {totalNum} pieces of imported data, error [{errorNum}], successful [{successNum}]',
      importData: 'Import Data',
      clickToUpload: 'Click on this area to upload',
      importResults: 'Import Results',
      downloadTemplate: 'Download the import template and fill in as required:',
      templateFile: 'Data import template file',
      continue: 'Continue importing',
    },
    dataImport2: {
      atLastOne: 'Select at least one mapping attribute',
      uploadPlease: 'Please upload the file',
      fileName: 'Current file name: {fileName}',
      saveMode: 'Import Mode Save',
      reUpload: 'Re upload files',
      fileUpload: 'File upload',
      import: 'Import',
      selectProperties: 'Please select column import properties!',
    },
    dataImport2Select: {
      selectMode: 'Select import mode',
      edit: 'Edit',
    },
    dataImport2Table: {
      selectAttribute:
        'Select the import attribute corresponding to the current column',
    },
    doingNotice: {
      jobInProgress:
        'There are <span class={class}>{num}</span> backend jobs currently executing, please wait',
    },
    extendActionTimeLine: {
      processTime: 'Processing time',
      comments: 'Approval opinions',
      reject: 'Reject',
    },
    mapChart: {
      high: 'High',
      low: 'Low',
    },
    pagination: {
      display: 'Display',
      piece: 'Piece',
      total: 'Total',
      pieceData: 'Piece of data',
    },
    rawItem: {
      errorConfig: '{type} type custom parameter configuration error',
      noSupportVideo: 'Your browser does not support video tags',
    },
    gridSetting: {
      hideControl: 'Column selection',
    },
    kanbanSetting: {
      hideGroup: 'Group selection',
    },
    ganttSetting: {
      resultDefault: 'Restore defaults',
      headerCaption: 'Header display attributes',
      optionalAttribute: 'Optional attributes',
      selectedAttribute: 'Selected attributes',
      limitsize: 'Maximum limit {max}',
      reachedMaximum: 'Reached maximum value',
    },
    actionToolbar: {
      more: 'More',
    },
    emojiSelect: {
      frequently: 'Frequently',
      peoples: 'Peoples',
      nature: 'Nature',
      foods: 'Foods',
      activity: 'Activity',
      objects: 'Objects',
      places: 'Places',
      symbols: 'Symbols',
      flags: 'Flags',
    },
    formItemContainer: {
      more: 'More',
    },
    pqlEditor: {
      noExpression: 'Wrong expressions. Missing expressions for connectors.',
      noConnection: 'Wrong expressions. The expression is missing a connector.',
      noKey: 'Wrong expressions. The expression is missing a key.',
      noOperator: 'Wrong expressions. The expression is missing an operator.',
      noValue: 'Wrong expressions. The expression is missing a value.',
      noDelimiter: 'Wrong expressions. The expression is missing a delimiter.',
      errorCombination: 'Wrong expressions. Wrong combination of parentheses.',
      errorDelimiter: 'Wrong expressions. Wrong splitter.',
    },
    controlNavigation: {
      showNav: 'Display navigation',
      hiddenNav: 'Hidden navigation',
    },
  },
  // 编辑器
  editor: {
    common: {
      entityConfigErr: 'Please configure entities and entity datasets',
      selectViewConfigErr: 'Please configure the data selection view',
      linkViewConfigErr: 'Please configure the data link view',
      confirmCancelPrompt: 'Are you sure you want to cancel editing?',
      cancelEditPrompt:
        'Canceling editing will prevent the modified content from being saved and cannot be retrieved.',
      confirmCancel: 'Confirm cancel',
      confirm: 'Confirm',
      cancel: 'Cancel',
      fullscreen: 'Fullscreen',
      minimize: 'Minimize',
    },
    cascader: {
      ibizCascader: {
        title: 'Title {index}',
      },
    },
    code: {
      readOnlyPrompt: 'Currently in read-only mode, not editable',
    },
    dateRange: {
      rangeSeparator: 'To',
    },
    dateRangeSelect: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year',
      static: 'Fixed time',
      dynamic: 'Dynamic time',
      dateunit: 'Time Unit',
      daterange: 'Time range',
      today: 'Today',
      recently: 'Recently',
      pastTime: 'In the past',
      future: 'The future',
      currentWeek: 'This week',
      currentMonth: 'This month',
      currentYear: 'This year',
      currentQuarter: 'This quarter',
      recentlySixMonth: 'Last 6 months',
    },
    html: {
      wangEditor: {
        customTips: 'Custom tip',
        emoji: 'Emoji',
      },
      enableedit: 'Enable edit',
      expand: 'Expand',
      reduce: 'Reduce',
    },
    markdown: {
      uploadJsonFormatErr:
        'The configuration of uploadparams did not follow the standard JSON format',
      exportJsonFormatErr:
        'The configuration of exportparams did not follow the standard JSON format',
    },
    notSupportedEditor: {
      unsupportedType: 'Unsupported editor types - {editorType}',
    },
    preset: {
      ibizPresetRawitem: {
        noSupportType: 'Not supported currently {type}',
      },
    },
    textBox: {
      warningMessage:
        'Ip format verification failed, paragraph {num} ip reset to old value',
    },
    upload: {
      uploadFiles: 'Upload files',
      fileSizeErr: 'The file size cannot exceed',
      uploadJsonFormatErr:
        'The configuration of uploadparams did not follow the standard JSON format',
      exportJsonFormatErr:
        'The configuration of exportparams did not follow the standard JSON format',
      cropImg: 'Crop image',
      cancelUpload: 'Cancel Upload',
    },
    emojiPicker: {
      addEmoji: 'Add emoji',
    },
    colorPicker: {
      systemColor: 'System Color',
      templateColor: 'Template Color',
      simpleBlue: 'Simple Blue',
      autumnOrange: 'Autumn Orange',
      Macaroon: 'Macaroon',
      mintGreen: 'Mint Green',
      selector: 'Selector',
      textValue: 'Text',
      add: 'Add',
    },
    mapPicker: {
      title: 'Please select an address',
      searchPlaceholder: 'Please enter a keyword to select a location',
    },
    transferPicker: {
      optionalList: 'Optional list',
      selectedList: 'Selected list',
    },
    treePicker: {
      allowAll: 'Allow all',
      allProhibited: 'All prohibited',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
    },
    signature: {
      undo: 'Undo',
      rewrite: 'Rewrite',
      confirm: 'Confirm',
      addSignature: 'Click here to add signature',
      signaturePrompt: 'Please write horizontally in the blank area',
    },
  },
  panelComponent: {
    authUserinfo: {
      visitor: 'Visitor',
    },
    authSsO: {
      noSupported: 'Login with {type} is not supported',
      dingLogin: 'DingTalk Login in',
      wechatLogin: 'Wechat Login in',
    },
    coopPos: {
      view: '{username} is browsing',
      edit: '{username} is editing',
      update: '{username} is being updated',
    },
    navPosIndex: {
      noSupportPrompt:
        'Non-routing mode navigation placeholder is not supported',
    },
    navTabs: {
      closeAll: 'Close all',
      closeOther: 'Close other',
    },
    navBreadcrumb: {
      home: 'Home',
    },
    searchformButtons: {
      errMessage: 'No search form called searchform found in the current view',
      enterPrompt: 'Please enter the custom query name to store:',
      queryPrompt: 'Store custom queries',
      saveCondition: 'Save condition',
    },
    shortCut: {
      expandToolbar: 'Expand the shortcut toolbar',
    },
    userMessage: {
      notice: 'Notice',
      backendTasks: 'Backend tasks',
      allRead: 'All read',
      asyncActionPreview: {
        downloadFailedErr: 'Download file failed',
        noExistentErr: 'The file stream data does not exist',
        importDetailPrompt: 'Import data details-{name}',
        parseImportInfoErr: 'Abnormal parsing of import information',
        downloadErrFile: 'Download error file',
        importTime: 'Import time: ',
        importTotal: 'Total number of imports: ',
        successImport: 'Number of successful imports: ',
        ImportFailed: 'Number of import failures: ',
      },
      asyncDataExport: {
        exportDetailPrompt: 'Export data details-{name}',
        excuteTime: 'Execution time',
        downloadFile: 'DownLoad File',
        executing: 'Executing......',
      },
      asyncActionTab: {
        noSupportType:
          'Asynchronous operation type {type} is not supported currently',
        noAsyncAction:
          'There are currently no asynchronous operations available',
      },
      internalMessageContainer: {
        markAsRead: 'Mark as read',
      },
      internalMessageJson: {
        jumpToView: 'Jump to view',
        missingHtml: 'Missing HTML in the content of the data',
        todoContent: '{createmanname} on {processdate} complete',
      },
      internalMessageTab: {
        noSupportType:
          'The message type {type} on the site is not currently supported',
        notificationYet: 'Current no notification',
        loadMore: 'Load more({length})',
        onlyShowUnread: 'Only show unread',
      },
    },
    customSetting: {
      theme: 'Custom Theme',
      menu: 'Custom Menu',
    },
    addinChanged: {
      tip: 'Click to refresh',
      title: 'System plugin update',
      content:
        'The system plugin has been updated, refresh the page to apply the latest changes',
    },
    globalSearch: {
      search: 'Search',
      loading: 'Loading...',
      empty: 'No matching results',
      clearHistory: 'Clear search history',
      placeholder: 'Model Retrieval (Ctrl+K)',
      moreTips: 'Only load the first {size} data, a total of {total} data',
    },
  },
  util: {
    uploadManager: {
      failed: 'File upload failure',
      title: 'Process manager',
    },
    appUtil: {
      aiTitle: 'delete conversation',
      aiDesc:
        'After deletion, the conversation will not be recoverable. Are you sure to delete?',
      clearTopic: 'Clear conversation',
      clearTopicDesc:
        'Are you sure to clear all conversation data except for the current activation item?',
    },
    appModal: {
      prev: 'Previous record',
      next: 'Next record',
    },
  },
  // runTime
  ...runTimeEn,
  // vue3Util
  ...vue3UtilEn,
  // core
  ...coreEn,
  // modelHelper
  ...modelHelperEn,
};
