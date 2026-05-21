import { en as runTimeEn } from '@ibiz-template/runtime';
import { en as vue3UtilEn } from '@ibiz-template/vue3-util';
import { en as modelHelperEn } from '@ibiz-template/model-helper';
import { en as coreEn } from '@ibiz-template/core';

export default {
  // 应用级
  app: {
    noSupport: 'Not supported currently',
    add: 'Add',
    delete: 'Delete',
    retract: 'Retract',
    close: 'Close',
    search: 'Search',
  },
  // 组件
  component: {
    actionToolbar: {
      noSupportDropDown: 'The drop-down mode is not supported',
    },
    rawItem: {
      errorConfig: '{type} type custom parameter configuration error',
      noSupportVideo: 'Your browser does not support video tags',
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
    mdSortSetting: {
      confirm: 'Confirm',
      sort: 'Sort',
      asc: 'ascend',
      desc: 'descend',
    },
    dropdown: {
      pleaseSelect: 'Please Select',
      clear: 'Clear',
      searchPlaceholder: 'Search',
    },
    dateRangePicker: {
      headerPlaceholder: 'Please select a date range',
      confirm: 'Confirm',
      today: 'Today',
      startDate: 'Start date',
      endDate: 'End date',
      scopeIsInvalid: 'The scope is invalid',
      overLimit: 'Not within the allowed range',
      year: 'Year',
      month: 'Month',
      day: 'Day',
      formatIsInvalid: 'The format is invalid',
      use: 'Use',
      example: 'Example',
      selectDate: 'Please select a date',
      noSelect: 'No Select',
    },
    formItemContainer: {
      more: 'More',
    },
    mpicker: {
      simpleErr:
        'The value of the SIMPLE type address bar {props.value} does not meet the requirements of a JSON string',
    },
    signature: {
      undo: 'Undo',
      rewrite: 'Rewrite',
      confirm: 'Confirm',
      addSignature: 'Click here to add signature',
      signaturePrompt: 'Please write horizontally in the blank area',
    },
  },
  // 部件
  control: {
    common: {
      loadMore: 'Load more...',
      loadFinish: 'I have made it to the end',
      loadError: 'Loading failed. Click to reload',
      addbtn: 'Add',
    },
    appmenu: {
      more: 'More',
      bottomNav: 'Bottom Navigation',
      customNav: 'Customize Navigation',
      save: 'Save',
      noData: 'No data',
    },
    form: {
      noSupportDetailType:
        'Form detail type not supported: {detailType} or corresponding provider cannot be found',
      formGroupPanel: {
        showMore: 'Show More',
      },
      formMDctrlForm: {
        noFindProvider: 'Provider not found for form',
      },
      repeaterMultiForm: {
        confirmTitle: 'Tips for deletion',
        confirmDesc: 'Do you want to delete the selection?',
      },
      repeaterSingleForm: {
        errorMessage: 'No repeatedForm',
      },
      formMDctrlRepeater: {
        noSupportStyle:
          'Repeater style {repeaterStyle} is currently not supported',
      },
      mdCtrlContainer: {
        noSlot: 'Item slot not provided',
      },
      formMDctrl: {
        errorMessage:
          'The content type is currently not supported as {contentType}',
      },
      searchForm: {
        search: 'Search',
        reset: 'Reset',
      },
      repeaterGrid: {
        index: 'Index',
        noData: 'No data',
      },
    },
    list: {
      expand: 'Expand',
      selectedData: 'Selected data',
      end: 'The end~',
    },
    searchBar: {
      confirm: 'Confirm',
      reset: 'Reset',
      filter: 'Filter',
      add: 'Add',
      remove: 'Remove',
      addCond: 'Add filter',
      value: 'Value',
      when: 'When',
      operate: 'Operation',
      property: 'property',
      and: 'AND',
      or: 'OR',
      expand: 'Expand',
      collapse: 'Collapse',
      history: 'History',
      clear: 'Clear',
      more: 'More',
      cancel: 'Cancel',
    },
    toolbar: {
      noSupportType: 'Toolbar item type: {itemType} is not supported',
    },
    tree: {
      subordinate: 'Subordinate',
    },
    wizardPanel: {
      prev: 'Previous',
      next: 'Next',
      finish: 'Finish',
    },
    calendar: {
      today: 'Today',
      pickerDate: 'Picker Date',
      customPicker: 'Please select a date',
    },
    dashboard: {
      customLayout: 'Custom Layout',
      save: 'Save',
      showList: 'Show List',
      hiddenList: 'Hidden List',
    },
  },
  // 编辑器
  editor: {
    common: {
      entityConfigErr: 'Please configure entities and entity datasets',
      selectViewConfigErr: 'Please configure the data selection view',
      linkViewConfigErr: 'Please configure the data link view',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    html: {
      expand: 'Expand',
      collapse: 'Collapse',
    },
    cascader: {
      ibizCascader: {
        title: 'Title {index}',
      },
      noData: 'No data',
    },
    datePicker: {
      title: 'Select a date',
      cancel: 'Cancel',
      confirm: 'Confirm',
      year: 'Year',
      month: 'Month',
      day: 'Day',
      hour: 'Hour',
      min: 'Minute',
      sec: 'Second',
      clear: 'Clear',
    },
    dropdownList: {
      noSupportTreePicker: 'Drop-down tree selection is not supported',
      confirm: 'confirm',
    },
    mapPicker: {
      searchPlaceholder: 'Please enter a keyword to select a location',
    },
    markdown: {
      uploadJsonFormatErr:
        'The configuration of uploadparams did not follow the standard JSON format',
      exportJsonFormatErr:
        'The configuration of exportparams did not follow the standard JSON format',
      downloadFailedErr: 'Download file failed',
      noExistentErr: 'The file stream data does not exist',
    },
    notSupportedEditor: {
      unsupportedType: 'Unsupported editor types - {editorType}',
    },
    stepper: {
      pleaseEnter: 'Please enter',
    },
    upload: {
      uploadJsonFormatErr:
        'The configuration of uploadparams did not follow the standard JSON format',
      exportJsonFormatErr:
        'The configuration of exportparams did not follow the standard JSON format',
      cancelUpload: 'Cancel Upload',
      compressError: 'Image compression failed',
    },
    emojiPicker: {
      addEmoji: 'Add emoji',
    },
    dateRangePicker: {
      selectRange: 'Please select a date range',
    },
  },
  // 多语言
  locale: {
    prompt: 'Prompt',
    switchLanguagePrompt:
      'Switching languages requires refreshing the page, are you sure to switch?',
  },
  mobApp: {
    authGuard: {
      loginFailed: 'Anonymous user login failed',
      noPermission: 'No permission to access!',
    },
    unauthorizedHandler: {
      noFoundEnvParams: 'Unable to find environment parameter casLoginUrl',
      prohibitAccessPrompt: 'Access to the current account is prohibited',
      exitPrompt: 'Do you want to exit the current account?',
    },
  },
  // 面板组件
  panelComponent: {
    authUserinfo: {
      visitor: 'Visitor',
    },
    authSsO: {
      noSupported: 'Login with {type} is not supported',
      dingLogin: 'DingTalk Login in',
      wechatLogin: 'Wechat Login in',
    },
    navPosIndex: {
      noSupportPrompt:
        'Non routing mode navigation placeholder is not supported',
    },
    panelVideoPlayer: {
      noSupportPrompt: 'Your device does not support video tags',
    },
    wfStepTrace: {
      processingComplete: 'Processing completion time',
      processingSteps: 'Processing steps',
      processingPersonnel: 'Processing personnel',
      submissionPath: 'Submission path',
      processInformation: 'Process information',
    },
    userMessage: {
      notice: 'Notice',
      backendTasks: 'Backend tasks',
      allRead: 'All read',
      all: 'All',
      unread: 'unread',
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
        todo: 'I have assigned you process tasks',
        done: 'Complete process tasks',
      },
      internalMessageTab: {
        noSupportType:
          'The message type {type} on the site is not currently supported',
        notificationYet: 'Current no notification',
        loadMore: 'Load more({length})',
        onlyShowUnread: 'Only show unread',
      },
    },
    themeToggling: {
      auto: 'Follow system',
      light: 'Light',
      dark: 'Dark',
    },
  },
  // 工具
  util: {
    loading: 'Loading',
    notAchieved: 'Not implemented',
    unrealized: 'Unrealized',
    cacheWarningPrompt:
      'There is only one item in the cache stack and it cannot be navigated back',
    scanQrcode: {
      notAllowedError: 'You need to grant camera access permission',
      notFoundError: 'No camera on this device',
      notSupportedError: 'Secure context required (HTTPS, localhost)',
      notReadableError: 'Is the camera already in use?',
      overconstrainedError: 'Installed cameras are not suitable',
      streamApiNotSupportedError: 'Stream API is not supported in this browser',
      insecureContextError:
        'Camera access is only permitted in secure context. use HTTPS or localhost rather than HTTP.',
    },
    aiChartUtil: {
      feedback: 'Feedback',
      description: 'Description',
      regardingIssue: 'Regarding the problem',
      understandProblem: 'Not understanding the problem',
      forgotContext: 'Forgot the previous text',
      notFollowingRequire: 'Not Following Requirements',
      regardingResponse: 'Regarding the effectiveness of the answer',
      incorrectAswer: 'Incorrect answer',
      logicalConfusion: 'Logical confusion',
      poorTimeliness: 'Poor timeliness',
      poorReadability: 'Poor readability',
      incompleteAnswer: 'Incomplete answer',
      unprofessional: 'The answer is vague and unprofessional',
      report: 'Report',
      pornographicVulgar: 'Pornographic Vulgar',
      politicallySensitive: 'Politically sensitive',
      illegalCriminal: 'Illegal crime',
      discriminationPrejudice: 'Discrimination or Prejudice Answer',
      violationPrivacy: 'Violation of Privacy',
      contentInfringement: 'Content infringement',
      placeholder: 'Please enter',
    },
    printPreviewUtil: {
      title: 'Print Preview',
    },
  },
  // 视图
  view: {
    fillInUserName: 'Please fill in user the name',
    fillInPassword: 'Please fill in the password',
    loginFailed: 'Login failed',
    enterUserName: 'Please enter the username',
    enterPassword: 'Please enter the password',
    userName: 'User name',
    password: 'Password',
    login: 'Login',
    thirdAuthFail: 'Third party login authorization failed',
    downloading: 'Download now...',
    downloadSuccess: 'Download successful!',
    downloadFailed: 'Download failed!',
    noSupportDownload:
      'This file is not supported for download. Please click the upper right corner to open and download it with your browser!',
    immediatelyDownload: 'Download now',
    reDownload: 'Download again',
  },
  // 视图引擎
  viewEngine: {
    closeRemind: 'Close reminder',
    confirmClosePrompt:
      'The form data has been modified, are you sure you want to close it?',
    noExistVersionErr: 'The current workflow version does not exist',
    noFoundFormModel: 'Unable to find the model for form {name}',
    missingToolbarModel: 'Missing toolbar component model',
    notReceivedPrompt: 'No appDataElementId received',
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
