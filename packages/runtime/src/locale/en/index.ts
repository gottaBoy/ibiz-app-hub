export const en = {
  // runtime
  runtime: {
    common: {
      unrealized: 'unrealized',
      noExplanation: 'No explanation available at the moment',
    },
    command: {
      app: {
        noFindApplicationFunction:
          'An app feature called {appFuncId} cannot be found',
        noFindApplicationFunctionYype:
          'Unsupported application function type: {appFuncType}',
        noFindApplicationView:
          'The application view [{appViewId}] does not exist',
        unsupportedPopup: 'Unsupported view opening modes: POPUP',
        unsupportedPopupapp: 'Unsupported view opening modes: POPUPAPP',
        missingEvent: 'Bubble opening missing event',
      },
    },
    controller: {
      common: {
        control: {
          componentActivation: 'Component [{name}] ({id}) is active',
          componentPause: 'Component [{name}] ({id}) is pause',
          unsupportedType: 'Unsupported entity data change type: {type}',
          uncheckedData: 'Unchecked data',
          dataDeletion: 'data deletion',
          confirmDataDeletion: 'Confirm deletion of data?',
          noImportModel: 'No import model is configured!',
        },
        md: {
          rowData: 'Row data does not exist',
          simpleMode: 'Simple mode, no saving',
          dataDeleted: 'Data [{str}] deleted successfully!',
          noChange: 'The value has not changed',
          firstComplete:
            'Please complete the current line in the line editor first',
          noMoveDataCconfig: 'No move data behavior config',
          exportRequestFailed: 'Export request failed',
          changeGroupError: 'Failed to switch the group',
          computeMoveMetaError:
            'Error in calculating target position and movement type',
          unclassified: 'Unclassified',
          today: 'Today',
          adjustmentsGroup:
            'The current control does not allow adjustments to the grouping!',
          noAllowReorder: 'Current control does not allow reordering!',
          sortingProperties: 'Sorting attribute not configured',
          invalidSortType: 'Sorting property is not a numeric type',
          logicOpendata: 'Missing {itemType}_opendata view logic',
          logicNewdata: 'Missing {itemType}_newdata view logic',
        },
        editor: {
          editorNoConfigured:
            'Editor type [{editorType}], code table not configured',
          itemsText: 'All',
        },
        view: {
          viewActivation: 'View [{name}] ({id}) is active',
          viewPause: 'View [{name}] ({id}) is pause',
          viewDestroy: 'View [{name}] ({id}) is destroy',
          noFoundViewEngine: 'The View Engine implementation was not found:',
          noSupportBehavior:
            'No engine support for pre-built interface behavior {key}',
          forbiddenAccess: 'Insufficient permission',
          logoutAccount:
            'You do not have permission to access this resource at the moment. You can contact the administrator.',
        },
      },
      control: {
        menu: {
          noFindMenu: 'Cannot find menu item named {id}',
          noConfigured: 'No application functionality configured',
        },
        calendar: {
          noFoundModel: 'Calendar item model not found',
        },
        chart: {
          noConfiguredX: 'Sequence is not configured with X-axis',
          noConfiguredY: 'Sequence is not configured with Y-axis',
          missingClassification:
            'Missing classification attribute configuration',
          missingValue: 'Missing value attribute configuration',
          noSupportSequence:
            'Charts do not support sequence types at this time {seriesType}',
          noFindSequence: 'Cannot find generator for {seriesIndex} sequence!',
          noInitialised: 'The chart object is not properly initialised',
          noCalculated: 'Options have not been calculated.',
          classificationNotArray:
            'The configured classification attribute value is not an array',
          classificationNotString:
            'The configured classification attribute value is not an string',
          errorJson: 'JSON parsing error',
          value: 'Value',
          percent: 'Percent',
          serieGroup: 'Serie group',
          catalogField: 'Catalog field',
        },
        dataView: {
          noBehaviourGroup:
            'No interface behaviour group is configured for the action',
          noBehaviourGroupAction:
            'No interface behaviour is configured for the action item interface behaviour group',
          propertiesNoConfigured: 'Grouping properties are not configured',
          tableNoConfigured: 'The grouping code table is not configured',
          sortingItems:
            'Items with sorting enabled must be associated with an entity attribute',
        },
        expBar: {
          unableMore:
            'Unable to get multiple data widgets [{xdataControlName}] controller',
          multiNode: 'Multi-node views are implemented by subclasses',
          noFindNodeModel: 'Cannot find node model for {nodeId}',
        },
        form: {
          formCompletion: 'Please check the form completion!',
          savedSuccessfully: '{srfmajortext}Saved successfully!',
          prompt: 'prompt',
          deletion: 'Confirm deletion?',
          itemUpdate: 'No {formItemUpdateId} form item update was found.',
          processStarted: 'Process started successfully',
          processSubmitted: 'Process submitted successfully',
          lackBehavior: 'Lack of return operation entity behavior',
          initializationException:
            'Initialization Exception: Form member [{id}]({detailType}) already exists, duplicate form item identifier Please check configuration!',
          relationshipInterface:
            'Receive data change events from the relationship interface',
          fillIn: 'Please fill in {caption} ',
          unconfiguredWidgets:
            'Multi-data widgets unconfigured content widgets',
          noFoundFormController:
            'No form controller corresponding to {id} found',
          multiDataAddData:
            'Multi-data widget type {contentType} does not support adding data at the moment',
          mdControllerNoExist: 'mdController does not exist',
          repeaterNoSupported:
            'Repeater styles are not supported at this time {detailStyle}',
          searchTerms: 'No search terms found to apply',
          saveSearch: 'No saved search criteria found',
          noFoundFormGroup: 'Form group not found',
          refreshPrompt: 'Do you want to refresh',
          refreshPagePrompt:
            'The data has been modified. Do you want to refresh the page?',
        },
        gantt: {
          noNode: 'Not entity gantt node data',
          nonentity: 'Non-entity node data cannot be saved',
          noSupport: '{treeNodeType} node type not supported',
        },
        grid: {
          unsupported: 'Unsupported types {type}',
          attributeColumns:
            'Attribute columns with no grouping attributes configured',
          configureFirstColumn:
            'Please configure the grouping attribute column {groupFieldName} as the first column',
          requiresCodeTable:
            'Code table grouping mode requires code table configuration',
          noMatchCodeTable:
            'The grouping code table does not match the code table for the attribute column {groupFieldName}',
          convertedValue:
            'The sort attribute of {srfmajortext} cannot be converted to a value',
          missingConfiguration:
            'Missing configuration of aggregated entities or aggregated datasets',
          newRows: 'New rows are not supported',
          saveCancel: 'Row data validation failed, save cancel',
          noSupportRowEditing:
            'The current form does not support row editing, and you cannot toggle on row editing.',
          lineEditing: 'Please save the current line first',
          updateColumns: 'No {updateId} edit columns found for update',
          exported: 'No exported data',
          tabularColumns: 'No tabular columns',
          corresponding: 'Corresponding table data item not found [{deField}].',
          pickedUpData:
            'The value of {valueItem} is not picked up in the row data.',
          noSupportedMode:
            'Attribute column aggregation mode {aggMode} is not supported yet.',
          remoteAggregation: 'Remote aggregation is not supported yet',
          aggregateMode: 'Aggregate mode is not supported yet {aggMode}',
          formattingError: '{aggValue} value formatting error',
          checksumErrors: '{codeName}Checksum errors, {fieldName}',
          behaviorGroup:
            'The action column does not have an interface behavior group configured',
          interfaceBehavior:
            'No interface behavior is configured for the action column interface behavior group',
        },
        kanban: {
          sortDirection: 'Sort direction is not configured',
          groupedOn: 'Kanban components must be grouped on',
        },
        meditViewPanel: {
          DraftNew: 'Draft - New',
          dataExist: 'Edit View Panel widget UI data does not exist',
        },
        panel: {
          panelData: 'Panel data not captured',
        },
        reportPanel: {
          reportType:
            'Report panel generator factory parameter error, report panel does not specify report type',
          noImplemented:
            'Specify the report {reportType} type report panel generator not implemented yet',
          noReportUIModel: 'The report ui model is not configured',
        },
        searchBar: {
          noFoundEntity:
            'Cannot find the associated entity corresponding to the attribute {targetField}.',
          missingModel: 'Missing editor model',
          JSONFormat: '{data} non-standard JSON format:',
        },
        toolbar: {
          noFound: 'Interface behavior model {actionId} not found',
        },
        tree: {
          noFoundTreeData: 'Cannot find corresponding tree node data',
          sortAttribute: 'Missing Configuration Sort Attribute',
          editMode: 'The tree node is not configured for edit mode: name',
          nodeData: 'Not entity tree node data',
          noFoundTreeNode: 'Tree node not found',
        },
        treeGrid: {
          columnsSchema: 'TreeTable Unvalued Columns Schema',
          columnMode: 'Tree table without parent column mode',
        },
        treeGridEx: {
          noConfigured:
            'The node is not configured with a data item that corresponds to the table column {name}',
          editItem:
            'Edit item model corresponding to table column {name} was not found',
          noPickedUp:
            'The value of {valueItem} is not picked up in the row data.',
          behaviorGroup:
            'The {id} action column does not have an interface behavior group configured.',
          noSupportCreation: 'Does not support the creation of new',
          updateBehavior:
            'Tree nodes are not configured to update entity behavior',
        },
        wizardPanel: {
          wizardForm: 'Cannot find the wizard form for {activeFormTag}.',
          formController: 'Cannot find a form controller for {activeFormTag}.',
          noConfiguration: 'There is no Configuration Wizard form collection',
          wizardFormIdentifier:
            'Cannot find the wizard form with the {tag} identifier.',
          noPreviousForm: 'No previous form',
          nextStep: 'Cannot find next wizard step',
          nextForm: 'Cannot find the next wizard form',
        },
        dashboard: {
          unGroup: 'Ungroup',
        },
      },
      utils: {
        buttonState: {
          isFinitenconsistency:
            'Inconsistency between entity {appDeName} of {uiActionId} interface behavior and entity {appDeId} of data',
        },
        counter: {
          decrement: 'Decrement cannot be called for a count of 0!',
        },
        dataFileUtil: {
          startImport:
            'Start importing. Please refer to the application notification for detailed progress and results',
          noExist: 'ibiz.util.getExportExcel does not exist',
          loadError: 'Export module loading error',
          importData: 'No corresponding import data model was found',
        },
        valueDefault: {
          noExist: 'appdata.context does not exist',
          nosupported: 'Default value type [{valueType}] not supported',
        },
        valueEx: {
          objectNameField: 'Missing objectNameField',
        },
        valueRule: {
          maxLength:
            'The length of the content must be less than or equal to {maxLength}, the current length is {length}.',
          minLength:
            'The content length must be greater than or equal to {minLength}, and the current length is {length}',
          length:
            'The content length must be less than or equal to {maxLength}',
          maxValue: 'The value must be less than or equal to {maxValue}',
          minValue: 'The value must be greater than or equal to {minValue}',
        },
        viewMsg: {
          message: 'Cannot find model for view message group {msgGroupId}',
          noFound: 'No {message} view message model found',
          unconfigured: 'Unconfigured entity dataset',
          unconfiguredEntities: 'Application entities not configured',
        },
        voiceUtil: {
          textToSpeechError: 'Text to speech failed',
        },
        encyptionUtil: {
          encryptionError: 'Encryption failed',
          publicKeyPemError: 'Get PublicKeyPem error',
        },
        customThemeUtil: {
          saveSuccess: 'Save custom theme successfully',
          saveError: 'Failed to save custom theme',
          resetSuccess: 'Reset custom theme successfully',
          resetError: 'Reset custom theme failed',
        },
        util: {
          quarter: 'Quarter',
          month: 'Month',
          week: 'Week',
        },
      },
    },
    deLogic: {
      deLogicLink: {
        connectionConditional:
          'Interface Connection Conditional Logic Group Unconfigured Logic Item',
        entityConnectionConditional:
          'Entity Logic Connection Condition Group Name: {name} - Condition Group Identifier: {id} - Run Result:',
        missingConditionValue:
          'The current condition value type is [Data object attribute], and the configuration condition value is missing.',
        sourceDataMissingConditionValue:
          'The current condition value type is [Source Data Object Attribute], and the configuration condition value is missing.',
        noSupportedTime:
          'Conditional value type [current time] is not supported at this time',
        entityLogicalConnection:
          'Entity Logical Connection Condition Item: {name} - Condition Value Type: {type} - Source Attribute Name: {dstField} - Source Object Value:',
        entityLogicalContainsConnection:
          'Entity Logical Connection Condition Item: {name} - Source Attribute Name: {dstField} - Source Object Value:',
        comparisonCondition: '-comparison condition: {op}',
        comparisonValue: '-comparison value',
        compareResults: '-Compare and contrast results:',
      },
      deLogicNode: {
        missingTargetParameter:
          'Missing target parameter object or source parameter object configuration',
        additionalParameter:
          'Entity logic node (appended to the array): {id} - additional parameter:',
        addedValue: '-Added value:',
        logicNodeParameterName:
          'Entity Logic Node (Binding Parameters): {id} - Parameter Name: {dstDELogicParamId} - Value:',
        copyParameter:
          'Entity logic node (copy parameter): {id} - parameter name: {dstDELogicParamId} - value:',
        dataSet:
          'Entity Logic Node (Data Set): {id} - Dataset Entity Id: {dstAppDataEntityId} - Dataset Id: {dstAppDEDataSetId} - Parameter Name: {retDELogicParamId} - Value:',
        unspecifiedEntity: 'Unspecified application entity',
        unspecifiedBehavior: 'Behavior of unspecified entities',
        entityActions:
          'Entity Logic Node (Entity Actions): {id} - Entity to which the interface action belongs: {dstAppDataEntityId} - Entity Activity Identifier: {dstAppDEActionId} - Parameter Name: {retDELogicParamId} - Value:',
        unsupportedReturnType: 'Unsupported end node return type: {returnType}',
        endNode:
          'Entity logic node (end node): {id} - return value type: {returnType} - return value:',
        noSupportedLogic:
          'Logic handling of parameter actions {paramAction} is not supported at this time.',
        preparationParameter:
          'Entity Logic Node (Preparation Parameter): {id} - Parameter Processing Action: {paramAction} - Target Logic Parameter: {dstDELogicParamId} - Source Parameter (value):',
        targetParameter: '-Target parameter (value):',
        missingConfiguration: 'Missing target parameter object configuration',
        rebuildParameter:
          'Entity Logic Node (rebuild parameter): {id} - rebuild parameter: {dstDELogicParamId}',
        resetParameter:
          'Entity logic node (reset parameter): {id} - reset parameter: {dstDELogicParamId}',
        missingParameterProperty:
          'Missing target parameter object or target property configuration',
        sortedArrayParameters:
          'Entity Logic Node (Sorted Array Parameters): {id} - Sort Attribute: {dstFieldName} - Sort Mode: {dstSortDir} - Parameter Name: {dstDELogicParamId} - Sorted Array:',
        startupNode: 'Entity logical node (startup node): {id}',
        throwsException:
          'Entity Logic Node (throws exception): {id} - Error Code: {errorCode} - Error Message: {errorInfo}',
        environmentVariables:
          'Unsupported logical parameter types: system environment variables',
        fileObjectListVariable:
          'Unsupported logical parameter type: file object list variable',
        fileObjectVariables:
          'Unsupported logical parameter types: file object variables',
        filterObjectVariables:
          'Unsupported logical parameter types: filter object variables',
        finalDataVariables:
          'Unsupported logical parameter types: final data variables',
        rawDataObjects: 'Unsupported logical parameter types: Raw Data Objects',
        operationSessionVariables:
          'Unsupported Logical Parameter Types: Operation Session Variables',
        calculateEntity: 'Calculated entity logic parameter, identifier: {tag}',
        value: '-value:',
        recreatingVariables:
          'Unsupported logical parameter types recreating variables',
        reEstablish:
          'Re-establish the entity logic parameter, identifier: {tag}',
        expressionEmpty: 'Expression is empty',
        sourceValueType:
          'The source value type {srcValueType} is not supported yet.',
        fetchingAttribute:
          'Fetching the attribute {srcField} from the source parameter reports an error, source parameter:',
        noScriptCode: 'Script code mode has no script code configured',
        noConfigurationLogicNode:
          'The entity logic does not have a configuration logic node',
        unsupportedLogical: 'Unsupported logical node types: {logicNodeType}',
        noSetStartNode: 'No start node set',
        startExecuting:
          'Start executing entity logic, logic identifier: {id} - logic name: {name}',
        endExecution:
          'End execution entity logic, logic identifier: {id} - logic name: {name}',
        noFoundEntityLogic:
          '{dataEntityId} entity logic not found {deDELogicId}',
      },
    },
    engine: {
      correspondingEngine: 'There is no {key} corresponding engine',
      logicOpendata: 'Missing view logic for opendata',
      logicNewdata: 'Missing view logic for newdata',
      deleteModel: '{codeName} Delete model: {name}',
      childComponentsMounted:
        'The child components of {id}: {childName} are mounted.',
      minimization:
        'The current view is opened in [{mode}], minimization is not supported!',
      loadEntityData: 'The view has no entities and cannot load entity data',
    },
    global: {
      noImplemented: 'Getting application global variables is not implemented',
      noImplementedRouting:
        'Getting view routing parameter variables is not implemented',
    },
    hub: {
      failedParse: 'View parameter {paramsName} failed to parse: {error}',
      noExist: 'View [{id}] does not exist',
    },
    logicScheduler: {
      executor: {
        noConfiguredLogic: 'No entity interface logic is configured',
        missingTrigger:
          'Missing trigger application entity interface behavior id in logic',
        noActionableData: 'There is no actionable data for opendata!',
        defaultOpendataViewLogic:
          'opendata view logic is not configured to open the view by default',
        noActuallyReference:
          'The default open view for opendata view logic does not actually reference the view',
        attributeConfiguration:
          '{codeName}[Multiple Form Entity] or [Index Entity] missing type attribute configuration',
        entityAttributeValues:
          'Data Source No Form Type Applied Entity Attribute Values',
        editViews:
          'No edit views were found for the entity associated with the form type {formTypeValue}.',
        selectionView:
          'Selection view that needs to be opened for batch add was not found',
        noSupportedBatchAddOnly: 'batchAddOnly is not supported yet.',
        newdataViewLogic:
          'The newdata view logic is not configured to default to a new data view',
        indexEntity: 'Missing Default Index Entity Selection View',
        checkOne: 'Please check one piece of data',
        entitiesAssociated:
          'No edit view found for entities associated with index type {indexType}',
        relationships:
          'Entities do not have a collection of relationships from!',
        foreignKey:
          'No foreign key attribute found for {pickParentDeName} in the current entity',
        mappingProperties: 'Batch New Conversion Mapping Properties',
        newCreationData: 'Batch new creation data',
        logicType: 'Logic type {logicType} Not supported yet!',
        noImplementedMethod: 'Method not implemented.',
      },
      trigger: {
        triggerType:
          'The trigger type for the predefined logical type {type} can only be a script',
        noSupportedType: 'Trigger type {triggerType} Not supported yet!',
        noExecutorBound: '{id} No executor bound.',
        timerLacks: 'Timer lacks timing intervals',
        parameterCallback: 'Timer missing default parameter callback',
      },
    },
    model: {
      utils: {
        noFoundApplication: 'Application not found',
        unconfiguredPlugins: 'Apply unconfigured plug-ins',
        noFound: 'Plugin not found {id}',
      },
      view: {
        engineClassifications:
          'Unsupported engine classifications: {engineType}',
      },
    },
    platform: {
      failedDownload: 'Failed to download file',
      fileStreamData: 'File stream data does not exist',
    },
    register: {
      helper: {
        adapter:
          'Cannot find the adapter corresponding to the system counter plugin {pluginKey}.',
        customizedSystemAdapter:
          'Cannot find the adapter corresponding to the customized system counter {codeName}.',
        noFoundSystemCounter:
          'Adapter for system counter type {counterType} is not found.',
        applicationMenu:
          'Cannot find the adapter corresponding to the application menu item plugin {pluginKey}.',
        asynchronousAction:
          'Find the adapter that does not correspond to the asynchronous action type {actiontype}.',
        matchedPlugin: 'Not matched to plugin [{pluginId}] model',
        customRegistration:
          'Cannot find an adapter with a custom registration ID of [{registerKey}].',
        widgetPlugin:
          'Cannot find the adapter corresponding to the widget plugin {pluginKey}.',
        widgetStyleType:
          'Cannot find the adapter corresponding to the widget style: [{controlStyle}] for the widget type: [{controlType}].',
        widgetType: 'Cannot find an adapter for widget type {controlType}.',
        entityBehaviorPlugin:
          'Cannot find the adapter corresponding to the entity behavior plugin {pluginKey}.',
        entityBehaviorMethod:
          'Find adapters that donnot have an entity behavior method type of {methodType}',
        editorPlugin:
          'Cannot find the adapter corresponding to the editor plugin {pluginKey}.',
        editorStyleType:
          'Cannot find the adapter corresponding to editor style: [{editorStyle}] for editor type: [{editorType}].',
        editorTypePredefinedType:
          'Cannot find an adapter corresponding to editorType: [{editorType}] for predefinedType: [{predefinedType}].',
        editorType:
          'Cannot find the adapter corresponding to editor type {editorType}.',
        formMemberPlugin:
          'Cannot find the adapter corresponding to the form member plugin {pluginKey}.',
        formMemberType:
          'Cannot find an adapter for form member type {detailType}.',
        tableColumnPlugin:
          'Cannot find the adapter corresponding to the table column plugin {pluginKey}.',
        tableColumnType: 'Cannot find an adapter for table column type {key}.',
        messageType:
          'Cannot find the adapter corresponding to the message type {content_type}.',
        panelMemberPlugin:
          'The adapter corresponding to the panel member plugin {pluginKey} could not be found.',
        panelContainerPredefined:
          'Cannot find an adapter with panel container predefined type {predefinedType}, registered key {key}',
        panelMemberDirectContent:
          'Cannot find adapter with panel member direct content predefined type {predefinedType}, registered key {key}',
        panelMemberType:
          'The adapter corresponding to the panel member type {itemType} could not be found.',
        portalWidgetPlugin:
          'Cannot find the adapter corresponding to the portal widget plugin {pluginKey}.',
        portalWidgetMemberType:
          'Adapter corresponding to portal widget member type {portletType} not found',
        treeTableColumnPlugin:
          'Cannot find the adapter corresponding to the tree table column plugin {pluginKey}.',
        interfaceBehaviorPlugin:
          'Cannot find the adapter corresponding to the interface behavior plugin {pluginKey}.',
        interfaceBehaviorMode:
          'Find the adapter that does not correspond to the interface behavior mode {uiactionMode}.',
        frontEndPluginNode:
          'Cannot find interface logic front-end plugin node, plugin {pluginKey} corresponding adapter',
        viewPlugin:
          'Cannot find the adapter corresponding to the view plugin {pluginKey}.',
        correspondViewTypeStyle:
          'Cannot find an adapter for view type: [{viewType}] corresponding to view style: [{viewStyle}].',
        toolbarItem:
          'Cannot find the adapter corresponding to the toolbar item plugin {pluginKey}.',
        acItem:
          'Cannot find the adapter corresponding to the ac item plugin {pluginKey}.',
      },
    },
    service: {
      noConfiguredPrimary:
        'Entity [{codeName}] is not configured with a primary key field',
      noConfiguredField:
        'Entity [{codeName}] is not configured with a primary text field',
      convertedNumber: '{value} cannot be converted to a number.',
      subRelationships:
        'Sub-relationships not configured with a nested relational dataset will result in a recursive query death loop, please configure it!',
      unsupportedMethod:
        'Unsupported application entity method input attribute type: {type}',
      noFoundUsernamePassword:
        'Anonymous login configuration username or password not found',
      loginFailure: 'Login Failure',
      logoutFailure: 'Logout failure',
      noFound: 'Application entity not found [{id}]',
      mainState:
        '{codeName} entity does not exist, the main state is not enabled, or the main state collection is empty, return true',
      operationIdentifier:
        'Operation identifier {dataAccessAction} main state calculation started',
      matchMasterState: 'Match master state',
      masterStatePermissions: 'Collection of allowed master state permissions',
      noMatchedState: 'Returns false if the main state is not matched.',
      permissionCalculation:
        'Operation identifier {dataAccessAction} end of permission calculation: {result}',
      noFindCodeList: 'Cannot find {tag} code list',
      noConfiguredCounters: 'Application counters not configured!',
      lackEntityLogic: 'Lack of entity handling logic',
      createBehavior: 'The create behavior does not pass data',
      updateBehavior: 'The update behavior does not pass data',
      deletionDeletion:
        'Currently, only [DER1N] relationship type association deletion deletion is supported.',
      unableDelete:
        'Unable to delete [{logicName}-{srfmajortext}], data referenced by [{modelLogicName}-{msg}].',
      noSupportedDataSource: 'Data source type {dataSetType} not supported yet',
      sourceCodeTable: 'No data is specified for the source code table',
      requestMethods: 'Unsupported request methods: {requestMethod}',
      noConfiguredRequestMethod: 'Request method not configured',
      unsupportedBehaviorTypes: 'Unsupported Behavior Types [{actionType}]',
      noFoundServiceMethod: 'Service method not found: {id}',
      UnsupportedServiceMethod:
        'Unsupported service method types: {methodType}',
      noSupportedMethod: 'The 「{id}」 method is not supported by {codeName}.',
      noFoundStorageEntity:
        'Application function [{name}] storage entity not found [{stoageAppDataEntityId}]',
      noExist: 'Application function [{name}] does not exist',
      noFoundEntity: 'Storage Entity Not Found [{stoageAppDataEntityId}]',
      noImplemented: '「{methodName}」 is not implemented.',
      noImplementedCounter: 'Counter loading method not implemented',
      noFoundCounterBehavior: 'Get counter behavior not found!',
      createPrimaryKeyData:
        'Failed to create new joint primary key data with existing primary key {srfkey}',
      updatePrimaryKeyData:
        'Failed to update joint primary key data with existing primary key {srfkey}',
      noExistNoUpdated: 'Data does not exist and cannot be updated!',
      dataNoExistNoUpdated:
        'Data [{srfdename}-{srfmajortext}({srfkey})] does not exist and cannot be updated!',
      noDeleted:
        'The following data 「{notRemoveKey}」 was not found and could not be deleted!',
      noAttributeName: 'No attribute name is specified',
      noContextParameterName: 'No context parameter name is specified',
      conditionalObjects: 'Unrecognizable Conditional Objects',
      mustArray: 'The value must be an array',
      unsupportedQueryTypes: 'Unsupported query types: {condType}',
      predefinedType:
        'Predefined type {predefinedType} is not supported at this time.',
      dynamicCodeTable:
        'The return value of a dynamic code table data property is not an object-formatted string and cannot be converted!',
      unconfiguredDataset: 'Unconfigured dataset',
      processedWithout:
        'Execution of 「{funcName}」 cannot be processed without 「srfkey」.',
      noExistProcessed:
        'Execution of 「{funcName}」 does not exist and 「srfsessionid」 cannot be processed.',
      missingDetreeColumnId:
        'Model exception missing detreeColumnId or dataItemName.',
      thirdAuth: {
        noSupported: 'Login with {type} is not supported',
        corpidError: 'Abnormal acquisition of enterprise ID',
        dingTalkCodeErrir:
          'Abnormal acquisition of DingTalk authorization code',
        dingTalkAuthError:
          'Unknown exception occurred during DingTalk authorization',
        appIdError: 'Exception in obtaining website application APPID',
        oauthOpenAccessIdError:
          'Unable to find environment parameter OAUTHOPENACCESSID',
        noImplemented: 'No Implemented',
      },
      dataException: 'Data exception',
      noSortField: 'No sorting value preset field, unable to move position',
      noDragElementId:
        'No drag element identification field, unable to move position',
      noTargetElementId:
        'No target element identification field, unable to move position',
      noMoveTypeField: 'No move location type field, unable to move position',
    },
    uiAction: {
      noEntityOrBehavior: 'No entity or entity behavior configured',
      noEntityOrAcMode: 'Not configured entity or entity self filling mode',
      noConfiguredopenView: 'Not configured to open the view',
      frontProcessingModes:
        'Unsupported front processing modes [{frontProcessType}]',
      missingConfigurationScriptCode:
        'Custom types are missing configuration script code',
      dataPrimaryKey: 'Data primary key not found',
      printFailure: 'print failure',
      physicalPrint: 'No physical print items found',
      exportRequestFailed: 'Export request failed',
      noEntityExportsFound: 'No entity exports found',
      lackNativeEvent: 'Lack of native JS event objects',
      wantLogout: 'Are you sure you want to log out?',
      logout: 'Logout',
      operationConfirmation: 'Operation Confirmation',
      viewParameterModalOption:
        'View parameter modalOption failed to parse: {error}',
      withdrawalConfirmed: 'Is the execution of the withdrawal confirmed?',
      noFoundBehaviorModel: 'No interface behavior model found for {actionId}.',
      noEnableAI: 'AI support not enabled',
      exportWithNoDataSet: 'Export data without specifying an export dataset',
    },
    uiLogic: {
      interfaceConnectionConditional:
        'Interface Connection Conditional Logic Group Unconfigured Logic Item',
      connectionConditionGroup:
        'Interface Logic Connection Condition Group Name: {name} - Condition Group Identifier: {id} - Run Result:',
      currentConditionValue:
        'The current condition value type is [Data object attribute], and the configuration condition value is missing.',
      sourceDataObjectAttribute:
        'The current condition value type is [Source Data Object Attribute], and the configuration condition value is missing.',
      currentTime:
        'Conditional value type [current time] is not supported at this time',
      interfaceConnectionConditionalTypeName:
        'Interface Logic Connection Condition Item: {name} - Condition Value Type: {type} - Source Property Name: {dstField} - Source Object Value:',
      interfaceConnectionConditionalContains:
        'Interface Logic Connection Condition Item: {name} - Source Property Name: {dstField} - Source Object Value:',
      asynchronousTermination:
        'Unsupported logical connection type: asynchronous termination',
      asynchronousRejection:
        'Unsupported logical connection type: asynchronous rejection',
      exceptionHandling:
        'Unsupported Logical Connection Type: Exception Handling',
      logicalLinkTypes: 'Unsupported logical link types:{linkMode}',
      missingTargetParameter:
        'Missing target parameter object or source parameter object configuration',
      appendedArray:
        'Interface logic node (appended to the array): {id} - additional parameter:',
      bindingParameters:
        'Interface Logic Node (Binding Parameters): {id} - Parameter Name: {dstDEUILogicParamId} - Value:',
      copyParameter:
        'Interface logic node (copy parameter): {id} - parameter name: {dstDEUILogicParamId} - value:',
      missingfilter: 'Missing configuration filter parameters',
      interfaceLogicNodeDataSet:
        'Interface Logic Node (Data Set): {id} - Dataset Entity Identifier: {dstAppDataEntityId} - Dataset Identifier: {dstAppDEDataSetId} - Parameter Name: {retDEUILogicParamId} - Value:',
      interfaceLogicNodeEntityActions:
        'Interface Logic Node (Entity Actions): {id} - Entity to which the interface action belongs: {dstAppDataEntityId} - Entity Activity Identifier: {dstAppDEActionId} - Parameter Name: {retDEUILogicParamId} - Value:',
      noConfiguredInterfaceBehavior: 'Interface behavior not configured',
      interfaceLogicNodeEntityInterfaceAction:
        'Interface Logic Node (Entity Interface Action): {id} - Interface Action Identifier: {dstAppDEUIActionId} - Entity to which the Interface Action belongs: {dstAppDataEntityId} - Target Logic Parameter Object: {dstDEUILogicParamId}',
      logicalNodeOperation: 'Logical node {name} operation parameter value:',
      unsupportedEndNode:
        'Unsupported end node return value types: {returnType}',
      interfaceLogicNodeEndNode:
        'Interface logic node (end node): {id} - return value type: {returnType} - return value:',
      noEntityConfigured: 'No entity configured',
      noEntityLogicConfigured: 'No entity logic configured',
      noIncomingLogic: 'No incoming logic parameters are configured',
      passedParameter: 'Passed parameter {dstDEUILogicParamId} not found',
      interfaceLogicNodeExecutingEntityLogic:
        'Interface logic node (executing entity logic): {id} - entity logic identifier: {dstAppDELogicId} - entity to which the entity logic belongs: {dstAppDataEntityId} - parameter name: {retDEUILogicParamId} - value:',
      missingMessageTypeConfiguration: 'Missing message type configuration',
      missingButtonTypeConfiguration: 'Missing button type configuration',
      interfaceLogicNodeMessagePopup:
        'Interface logic node (message popup): {id} - message type: {type} - message: {message}',
      message: 'messages',
      yes: 'yes',
      no: 'no',
      determine: 'Determine',
      cancel: 'Cancel',
      noSupportItem: '{name} is currently not supported',
      interfaceLogicNodeFrontendPlugin:
        'Interface Logic Node (Frontend Plugin): {id} - Plugin Id: {sysPFPluginId}',
      interfaceLogicNodePreparationParameter:
        'Interface Logic Node (Preparation Parameter): {id} - Parameter Processing Action: {paramAction} - Target Logic Parameter: {dstDEUILogicParamId} - Source Parameter (value):',
      noTargetParameter: 'No target parameter object id',
      targetParameter:
        'Assigning a value to the target parameter attribute {dstFieldName} reports an error, target parameter:',
      interfaceLogicNodeDirectCode:
        'Interface logic node (direct code): {id}-direct code:',
      interfaceLogicNodeRebuildParameter:
        'Interface Logic Node (rebuild parameter): {id} - rebuild parameter: {dstDEUILogicParamId}',
      interfaceLogicNodeResetParameter:
        'Interface Logic Node (Reset Parameter): {id} - Reset Parameter: {dstDEUILogicParamId}',
      interfaceLogicNodeSortedArrayParameters:
        'Interface Logic Node (Sorted Array Parameters): {id} - Sort Attribute: {dstFieldName} - Sort Mode: {dstSortDir} - Parameter Name: {dstDEUILogicParamId} - Sorted Array:',
      interfaceLogicNodeStartupNode:
        'Interface logic node (startup node): {id}',
      interfaceLogicNodeThrowingExceptions:
        'Interface Logic node (throwing exceptions): {id} - error message: {errorInfo}',
      noConfiguredTriggerObject: 'No trigger object is configured',
      noConfiguredEvent: 'The event name parameter is not configured',
      noConfiguredEventParameters: 'No event parameters are configured',
      noFoundTriggerObject: 'Trigger object not found {fireCtrlId}',
      noFoundEventParameterObject:
        'Event parameter object not found {eventParamId}',
      interfaceLogicNodeViewWidgetEventTriggerLogic:
        'Interface logic node (view widget event trigger logic): {id} - name of the calling view widget: {fireCtrlId} - name of the triggering event: {eventName} - triggering parameters:',
      noConfiguredInterfaceObject: 'No interface object is configured',
      noConfiguredOperatingParameters: 'No operating parameters are configured',
      noConfiguredCallMethod: 'No call method is configured',
      noFoundOperationParameter:
        'The operation parameter {invokeParamId} was not found.',
      noFoundInterfaceObject: 'Interface object {invokeCtrlId} was not found.',
      noFoundInvokeMethod: 'The invoke method {invokeMethod} was not found.',
      interfaceLogicNodeViewWidgetInvocation:
        'Interface logic node (view widget invocation): {id} - name of the invoking view widget: {invokeCtrlId} - name of the invoking method: {invokeMethod} - trigger parameter:',
      viewLogicInitializationParameter:
        'View logic initialization parameter, {codeName} specified widget object not found',
      calculateInterfaceLogicParameters:
        'Calculate interface logic parameters, identifier: {tag}',
      restablishInterfaceLogic:
        'Re-establish the interface logic parameters, identifying: {tag}',
      interfaceLogic:
        'Interface logic {deUILogicId} for entity {appDataEntityId} not found',
      startExecutingInterfaceLogic:
        'Start executing the interface logic, entity: {appDataEntityId} - logic name: {name}',
      endExecutionInterfaceLogic:
        'End execution interface logic, entity: {appDataEntityId} - logic name: {name}',
      noLogicalNodesConfigured:
        'The interface logic has no logical nodes configured',
    },
    utils: {
      encryptionUitl: {
        failed: 'Failed to obtain public key',
      },
      anime: {
        noExistEndpointElement: 'The endpoint element does not exist',
        noExistAnimationElement: 'Animation element does not exist',
        noClone: 'Cannot clone a null or undefined element.',
      },
      errorHandler: {
        noPermissionless: 'No permissionless error handler registered',
        noProcessor: 'No processor was found that can handle this error',
      },
      fileUtil: {
        fileUploadFailed: 'File upload failed',
        getDownloadTicketFailed: 'Get download credentials exception',
      },
      handlebars: {
        noInitHandlebars: 'handlebars not init',
      },
      modal: {
        externalClosureCapability: 'External closure capability not registered',
        shouldDismissResult:
          'The result of shouldDismiss is false, closing the interrupt.',
      },
      openRedirectView: {
        parseSrfnavctxParameter:
          'Failed to parse srfnavctx parameter in redirection [{urlStr}].',
        missingEntityName: 'Entity name missing from redirection parameter',
        noFoundSpecifiedEntity:
          'CodeName not found for the specified entity: {deName}',
        unsupportedLinkUrl: 'Unsupported linkUrl format: {linkUrl}',
        noConfiguredActualReference: 'Actual reference view not configured',
        redirectingViewReferences: 'Redirecting view references there:',
        redirectionIdentifier:
          'Redirection identifier [{rdTag}] or [{deRdTag}] or workflow [{wfRdTag}] corresponding to view not found',
        noMatchActualReferenceView:
          'Identifies that [{rdTag}] did not match the actual reference view',
        redirectionView:
          'Redirection view [{name}] custom category attribute [{typeFieldId}] value is null',
      },
      script: {
        errorReportingScript: 'Error Reporting Script',
      },
      shortCut: {
        invalidIndexNewIndex:
          'Invalid index newIndex: {newIndex}, oldIndex: {oldIndex}, current array length {length}',
      },
      uiDomain: {
        transactionOpen:
          'Transaction has been opened, only one transaction can be opened for a single interface domain.',
        currentTransaction:
          'The current transaction has not been committed and cannot be closed directly.',
      },
      uiDomainManager: {
        invalidInterfaceDomain: 'Invalid interface domain identifier [{id}]',
      },
      collaborateManager: {
        invalidCollaborateRoom: 'Invalid collaborate room identifier [{id}]',
      },
      verify: {
        contentConform: 'Content must conform to value rules',
        scopeRules: 'Content length must conform to scope rules',
        valueNull: 'The value is null',
        regularRules: 'The value must conform to the regular rules',
        rangeRules: 'Values must conform to the value range rules',
        scriptRules: 'The value must conform to the script rules',
        emptyLogicGroups:
          'Empty logic groups were found and the logic could not be executed properly!',
        unsupportedLogicTypes: 'Unsupported logic types {logicType}',
        emptyLogicGroupsProperly:
          'Empty logic groups were found and the logic could not be executed properly!',
        valueOperations: 'Value operations: {op}, not yet supported',
        noCompared: '{value} and {value2} cannot be compared.',
        conditionalValues:
          'Conditional values for range comparisons do not exist or are not strings',
      },
      firstregister: 'Please register the model loading adapter first',
      recordNav: {
        noFoundCtrl:
          'The specified identifier [{ctrlId}] component was not found',
        firstRecord: 'The current data is already the first record of data',
        lastRecord: 'The current data is already the last record of data',
      },
    },
    deAction: {
      responseDataError: 'Response data exception [data]: {error}',
    },
  },
};
