/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable vue/no-mutating-props */
import {
  getViewProvider,
  IViewProvider,
  calcDynaSysParams,
  getErrorViewProvider,
  RedrawViewEvent,
  IModal,
  CTX,
  EventBase,
  IViewShellHooks,
} from '@ibiz-template/runtime';
import {
  defineComponent,
  h,
  PropType,
  provide,
  Ref,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import { IAppView } from '@ibiz/model-core';
import { RuntimeError } from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import { isEmpty, isNil, clone } from 'ramda';
import { useNamespace } from '../../use';
import './view-shell.scss';

export const IBizViewShell = defineComponent({
  name: 'IBizViewShell',
  props: {
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams> },
    modelData: { type: Object as PropType<IAppView> },
    viewId: { type: String },
    // 解决打开浮动容器（模态、抽屉、弹出框）ctx丢失问题
    ctx: { type: Object as PropType<CTX> },
    viewShellHooks: { type: Object as PropType<IViewShellHooks> },
  },
  setup(props, { attrs }) {
    const ns = useNamespace('view-shell');
    const isComplete = ref(false);
    const errMsg = ref('');
    const provider = ref<IViewProvider>();
    const viewModelData = ref<IAppView | undefined>();
    const hasAuthority = ref(true);
    if (props.ctx) {
      provide('ctx', props.ctx);
    }
    // 当前视图上下文
    const context: Ref<IContext> = ref(props.context);
    // 当前视图参数
    const params: Ref<IParams> = ref(props.params || {});
    // 动态视图加载缓存key
    let dynaViewCacheKey: string = '';
    // 监听上层视图视图参数合视图上下文变化
    watch(
      () => ({ context: props.context, params: props.params }),
      newVal => {
        context.value = newVal.context;
        params.value = newVal.params ? newVal.params : {};
      },
    );

    // 检查视图权限
    const checkViewAuthority = async (
      viewModel: IAppView,
    ): Promise<boolean> => {
      let checkResult: boolean = true;
      const { accUserMode, accessKey } = viewModel;
      const authInfo = ibiz.auth.getAuthInfo();
      // 0：未指定、 1：未登录用户、 2：登录用户、 3：未登录用户及登录用户、 4：登录用户且拥有指定资源能力
      if (accUserMode !== undefined) {
        switch (accUserMode) {
          case 1:
            if (authInfo) {
              checkResult = false;
            }
            break;
          case 2:
            if (!authInfo) {
              checkResult = false;
            }
            break;
          case 4:
            if (accessKey) {
              const app = await ibiz.hub.getApp(context.value.srfappid);
              const permitted = app.authority.calcByResCode(accessKey);
              if (!permitted) {
                checkResult = false;
              }
            }
            break;
          default:
            break;
        }
      }
      return checkResult;
    };

    let viewModel: IAppView | undefined;

    // 设置动态视图加载缓存key，排除传入参数srfdatatype以外的参数
    const getDynaViewCacheKey = (args: IParams): string => {
      const copyArgs = clone(args);
      if (copyArgs.srfdatatype) {
        delete copyArgs.srfdatatype;
      }
      return JSON.stringify(copyArgs);
    };

    // 初始化视图模型
    const initViewModel = async (): Promise<void> => {
      if (props.modelData) {
        viewModel = props.modelData;
      } else {
        viewModel = await ibiz.hub.getAppView(props.viewId!);
      }
    };

    // 初始化方法
    const init = async (): Promise<void> => {
      try {
        await initViewModel();
        if (!viewModel) {
          throw new RuntimeError(
            ibiz.i18n.t('vue3Util.common.noFoundViewModel'),
          );
        }
        // 检查权限
        hasAuthority.value = await checkViewAuthority(viewModel);
        if (!hasAuthority.value) {
          return;
        }

        if (viewModel.dynaSysMode === 1) {
          //* 计算实体资源路径上下文参数
          const appDataEntityId = viewModel.appDataEntityId;
          if (!appDataEntityId) {
            throw new RuntimeError(
              ibiz.i18n.t('vue3Util.common.noSupportLoadingDynamic', {
                codeName: viewModel.codeName,
              }),
            );
          }

          /** 加载动态模型的请求参数 */
          const loadModelParams: IParams = await calcDynaSysParams(
            appDataEntityId,
            context.value,
            { viewParams: params.value, appId: viewModel.appId },
          );

          if (params.value.srfdatatype) {
            loadModelParams.srfdatatype = params.value.srfdatatype;
          }

          // 如果视图参数中存在 srfwftag 则直接使用视图参数
          if (params.value.srfwftag) {
            loadModelParams.srfwftag = params.value.srfwftag;
          } else if (appDataEntityId && viewModel.enableWF) {
            // 处理数据请求的上下文
            // 存在主键则加载数据计算对应的参数
            if (loadModelParams.srfkey) {
              const noSrfSessionId =
                isNil(context.value.srfsessionid) ||
                isEmpty(context.value.srfsessionid);
              const id = createUUID();
              // 只要上下文中无 srfsessionid 则生成一个
              if (noSrfSessionId) {
                // 生成一个界面域，界面域标识为当前控制器实例的标识
                const domain = ibiz.uiDomainManager.create(id, appDataEntityId);
                context.value.srfsessionid = domain.id;
              }

              const app = ibiz.hub.getApp(viewModel.appId);
              if (!context.value.srfappid)
                context.value.srfappid = viewModel.appId;
              const service = await app.deService.getService(
                context.value,
                appDataEntityId!,
              );
              const res = await service.get(context.value, params.value || {});
              if (res.ok && res.data) {
                const { srfwftag, processdefinitionkey, taskdefinitionkey } =
                  res.data;
                if (srfwftag) {
                  loadModelParams.srfwftag = srfwftag;
                }

                // *动态工作流编辑视图从数据里额外获取参数
                if (
                  ['DEWFDYNAEDITVIEW3', 'DEWFDYNAEDITVIEW'].includes(
                    viewModel.viewType!,
                  )
                ) {
                  // 如果视图参数中没有获取到对应流程实例标识与步骤标识，则从请求回来的数据中获取对应信息
                  if (isNil(params.value.processDefinitionKey)) {
                    params.value.processDefinitionKey = processdefinitionkey;
                  }
                  if (isNil(params.value.taskDefinitionKey)) {
                    params.value.taskDefinitionKey = taskdefinitionkey;
                  }
                }
              }

              if (noSrfSessionId) {
                ibiz.uiDomainManager.destroy(id);
                context.value.srfsessionid = '';
              }
            }
          }
          // 当前计算加载动态视图key和缓存key一致，则不需要重新加载动态视图
          const curDynaViewCacheKey = getDynaViewCacheKey(loadModelParams);
          if (curDynaViewCacheKey === dynaViewCacheKey) {
            setTimeout(() => {
              isComplete.value = true;
            });
            return;
          }
          // *加载动态模型
          viewModelData.value = await ibiz.hub.loadAppView(
            viewModel.appId,
            viewModel.id!,
            loadModelParams,
          );
          dynaViewCacheKey = getDynaViewCacheKey(loadModelParams);
        } else {
          viewModelData.value = viewModel;
        }
        provider.value = await getViewProvider(viewModel);
      } catch (error) {
        ibiz.log.error(error);
        errMsg.value = (error as IData).message;
      } finally {
        isComplete.value = true;
      }
    };

    init();

    // 重绘视图
    const redrawView = async (event: RedrawViewEvent): Promise<void> => {
      isComplete.value = false;
      const { redrawData } = event;
      const { isReloadModel } = redrawData;
      // 合并参数
      Object.assign(context.value, redrawData.context);
      Object.assign(params.value, redrawData.params);
      // 重绘清空原关闭监听
      const modal = attrs.modal as IModal;
      if (modal) {
        modal.hooks.preDismiss.clear();
        modal.hooks.shouldDismiss.clear();
        modal.hooks.beforeDismiss.clear();
      }
      if (isReloadModel) {
        await init();
      } else {
        setTimeout(() => {
          isComplete.value = true;
        });
      }
    };

    // 视图创建完成
    const onCreated = (event: EventBase): void => {
      if (props.viewShellHooks) {
        props.viewShellHooks.hooks.viewCreated.call(event);
      }
    };

    return {
      ns,
      errMsg,
      provider,
      isComplete,
      hasAuthority,
      viewModelData,
      redrawView,
      onCreated,
      curContext: context,
      curParams: params,
    };
  },
  render() {
    if (this.isComplete && this.provider && this.hasAuthority) {
      return h(
        resolveComponent(this.provider.component) as string,
        {
          context: this.curContext,
          params: this.curParams,
          modelData: clone(this.viewModelData),
          ...this.$attrs,
          provider: this.provider,
          onRedrawView: this.redrawView,
          onCreated: this.onCreated,
        },
        this.$slots,
      );
    }
    // 无权限访问绘制403界面
    if (!this.hasAuthority) {
      const provider = getErrorViewProvider('403');
      if (provider) {
        if (typeof provider.component === 'string') {
          return h(resolveComponent(provider.component) as string);
        }
        return h(provider.component);
      }
    }
    return (
      <div class={this.ns.b()} v-loading={!this.isComplete}>
        {this.isComplete ? this.errMsg : null}
      </div>
    );
  },
});
