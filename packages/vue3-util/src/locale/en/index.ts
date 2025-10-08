export const en = {
  vue3Util: {
    common: {
      undefined: 'undefined',
      onFoundCorrespondingPart:
        'Undefined adapter with no corresponding part found',
      noFoundViewModel: 'View model not found',
      noSupportLoadingDynamic:
        '{codeName}No entity, do not support loading dynamic models at this time',
      invalidPointCoordinates: 'Invalid point coordinates: ({x}, {y})',
    },
    control: {
      unsupportedPanel: 'Unsupported panel items: {id} - {itemType}',
    },
    panelComponent: {
      noConfiguardDataObject: 'No data object name config',
      noSupportedDataSourceType:
        'The data source type {dataSourceType} is not supported',
      noConfiguredEntityLogic: 'No entity logic config',
      noConfiguredEntity: 'No entity config',
      noReturnValue: 'The entity logic {appDELogicId} has no return value',
      noAttribute: 'There is no {dataName} attribute in the global variable.',
      noConfiguredScript: 'No javaScript config',
      noConfiguerdEntityBehanior: 'No entity behavior config',
      sessionView:
        'The session to which the view is bound does not exist {dataName}',
      viewStateAttribute: 'There is no {dataName} attribute in the view state',
      noImplementMethod: 'Method not implemented.',
      noProvidedSlot: 'No {id} slot provided',
      cannotEmpty: '{caption} cannot be empty',
      unadaptedLayout: 'Unadapted layout placeholder {layoutPos}',
      placeholderIdentifier:
        'The placeholder identifier for panel member {id} of view {viewCodeName} is:',
      refresh: 'Refresh',
      wxQrcodeCaption: 'Please use wechat to scan the QR code to log in',
    },
    plugin: {
      failureConfigurationLoad: 'Configuration load failure',
      failedRemotePluginLoad:
        'Remote Plugin failed to load, Remote Plugin did not find [default] Default Export',
      fileContentFormat:
        'Remote plugin failed to load, file not found or file content format is incorrect',
    },
    use: {
      control: {
        parameterChanges: 'Context or view parameter changes for {id}:',
        stateChange: 'Part [{name}] state change',
      },
      focusBlur: {
        noFocus: 'No focus, no out-of-focus triggering',
      },
      view: {
        stateChange: 'View [{name}] state change',
      },
    },
    util: {
      noInjected: 'The createVueApp method is not injected.',
      convertString: 'Failed to convert to string',
      viewIdentifiers: 'View identifiers do not exist for {depth} level routes',
      noFoundView: 'View not found {viewCodeName}',
      routeCorrectly:
        'Cannot get the route correctly, could be a dependency issue.',
    },
    view: {
      redirectionProgress: 'Redirection in progress',
      viewType: 'View type {viewType} is not supported yet.',
      noTeleportTag: 'No teleportTag was found for part {name}.',
      embeddedRedirectionView:
        'Embedded redirection view does not support url jumping',
      insufficientRedirection: 'Insufficient redirection parameters to jump',
      toDoList: 'To-Do List Redirection',
    },
  },
};
