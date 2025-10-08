export const zhCn = {
  vue3Util: {
    common: {
      undefined: '未定义',
      onFoundCorrespondingPart: '未定义未找到对应部件的适配器',
      noFoundViewModel: '未找到视图模型',
      noSupportLoadingDynamic: '{codeName}无实体,暂不支持加载动态模型',
      invalidPointCoordinates: '点坐标无效: ({x}, {y})',
    },
    control: {
      unsupportedPanel: '暂未支持的面板项: {id} - {itemType}',
    },
    panelComponent: {
      noConfiguardDataObject: '没有配置数据对象名称',
      noSupportedDataSourceType: '数据源类型{dataSourceType}暂未支持',
      noConfiguredEntityLogic: '没有配置实体逻辑',
      noConfiguredEntity: '没有配置实体',
      noReturnValue: '实体逻辑{appDELogicId}没有返回值',
      noAttribute: '全局变量里没有{dataName}属性',
      noConfiguredScript: '没有配置脚本代码',
      noConfiguerdEntityBehanior: '没有配置实体行为',
      sessionView: '绑定视图的会话不存在{dataName}',
      viewStateAttribute: '视图state里没有{dataName}属性',
      noImplementMethod: '未执行的方法',
      noProvidedSlot: '未提供{id}插槽',
      cannotEmpty: '{caption} 不能为空',
      unadaptedLayout: '未适配的布局占位{layoutPos}',
      placeholderIdentifier: '视图{viewCodeName}的面板成员{id}的占位标识是：',
      refresh: '刷新',
      wxQrcodeCaption: '请使用微信扫描二维码登录',
    },
    plugin: {
      failureConfigurationLoad: '配置加载失败',
      failedRemotePluginLoad:
        '远程插件加载失败, 远程插件未找到[default]默认导出',
      fileContentFormat: '远程插件加载失败, 未找到文件或文件内容格式不正确',
    },
    use: {
      control: {
        parameterChanges: '{id}的上下文或视图参数变更：',
        stateChange: '部件 [{name}] state 变更',
      },
      focusBlur: {
        noFocus: '没有聚焦，不触发失焦',
      },
      view: {
        stateChange: '视图 [{name}] state 变更',
      },
    },
    util: {
      noInjected: '没有注入createVueApp方法',
      convertString: '转换成字符串失败',
      viewIdentifiers: '第{depth}级路由不存在视图标识',
      noFoundView: '找不到视图{viewCodeName}',
      routeCorrectly: '无法正确获取route,可能是依赖问题',
    },
    view: {
      redirectionProgress: '重定向跳转中',
      viewType: '视图类型{viewType}暂未支持',
      noTeleportTag: '没有找到部件{name}的teleportTag',
      embeddedRedirectionView: '嵌入重定向视图不支持url跳转',
      insufficientRedirection: '重定向参数不足无法跳转',
      toDoList: '待办列表重定向',
    },
  },
};
