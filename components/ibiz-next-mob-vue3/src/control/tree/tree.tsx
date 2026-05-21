import {
  IBizIcon,
  useNamespace,
  IBizControlShell,
  useControlController,
} from '@ibiz-template/vue3-util';
import {
  h,
  App,
  ref,
  VNode,
  computed,
  PropType,
  createApp,
  onUnmounted,
  defineComponent,
} from 'vue';
import { isNil } from 'ramda';
import { IDETree, IDETreeNode } from '@ibiz/model-core';
import {
  ITreeNodeData,
  TreeController,
  IControlProvider,
  getControlPanel,
} from '@ibiz-template/runtime';
import { debounce } from 'lodash-es';
import { createUUID } from 'qx-util';
import { VsTreeComponent } from '@ibiz-template-package/vs-tree-ex';
import { createVueApp } from '../../mob-app/create-vue-app';
import './tree.scss';

export const TreeControl = defineComponent({
  name: 'IBizTreeControl',
  components: {
    'vs-tree': VsTreeComponent,
  },
  props: {
    /**
     * @description 树控件模型数据
     */
    modelData: { type: Object as PropType<IDETree>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 部件激活模式，值为0：无激活，值为1：单击激活，值为2：双击激活
     * @default 2
     */
    mdctrlActiveMode: { type: Number, default: 2 },
    /**
     * @description 是否单选
     * @default true
     */
    singleSelect: { type: Boolean, default: true },
    /**
     * @description 是否是导航内的（即树导航里的树）
     */
    navigational: { type: Boolean, default: undefined },
  },
  setup() {
    const c: TreeController = useControlController<TreeController>(
      (...args) => new TreeController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    // 默认选中项
    const checkedKeys = computed(() => {
      return c.state.selectedData.map(item => item._id);
    });

    // 节点创建的app实例,用于组件销毁时销毁所有实例
    let vueApps: App[] = [];
    // 引用的树组件实例
    const treeRef = ref();
    // 用于树强制刷新
    const treeRefreshKey = ref(createUUID());

    // 快捷搜索值
    const currentVal = ref('');

    const uuid = createUUID();

    // 启用面包屑功能
    const breadcrumb = ref(true);

    // 隐藏显示面包屑
    const hiddenBreadcrumb = ref(false);

    const isHeaderStyle =
      c.crumbShowMode === 'HEADERSTYLE' || c.state.navigational;

    // 创建图标节点
    const createIconNode = (customProps: IData) => {
      const iop = h(IBizIcon, customProps);
      const vueApp = createApp(iop);
      const dom = document.createElement('span');
      vueApp.mount(dom);
      vueApps.push(vueApp);
      return dom;
    };

    /**
     * 创建新的节点对象，隔离组件数据和controller数据
     * @param {ITreeNodeData[]} nodes
     * @return {*}  {IData[]}
     */
    const toElNodes = (nodes: ITreeNodeData[]): IData[] => {
      return nodes.map(node => {
        const iconDom = node?._icon
          ? createIconNode({ icon: node?._icon })
          : '';
        return {
          _id: node._id,
          id: node._id,
          _uuid: node._uuid,
          _leaf: node._leaf,
          _text: node._text,
          icon: iconDom,
          _disableSelect: node._disableSelect,
        };
      });
    };

    /** 树展示数据 */
    const treeData = computed(() => {
      if (!c.state.isLoaded) {
        return [];
      }
      const nodes = c.model.rootVisible
        ? c.state.rootNodes
        : c.state.rootNodes.reduce<ITreeNodeData[]>((result, nodeData) => {
            if (nodeData._children) {
              return result.concat(nodeData._children as ITreeNodeData[]);
            }
            return result;
          }, []);
      return toElNodes(nodes as ITreeNodeData[]);
    });

    /**
     * @description 查找节点模型
     * @param {string} key
     * @returns {*}  {(IDETreeNode | undefined)}
     */
    const findNodeModel = (key: string): IDETreeNode | undefined => {
      const nodeData = c.getNodeData(key);
      if (nodeData) return c.getNodeModel(nodeData._nodeId);
    };

    /**
     * @description 查找节点视图布局面板
     * @param {string} key
     * @returns {*}
     */
    const findNodeLayoutPanel = (key: string) => {
      const nodeData = c.getNodeData(key);
      if (nodeData) {
        const nodeModel = c.getNodeModel(nodeData._nodeId);
        const layoutPanel = nodeModel ? getControlPanel(nodeModel) : undefined;
        if (layoutPanel) return { nodeData, layoutPanel };
      }
    };

    /**
     * @description 更新vs树，防止树节点数据加载完后选中数据丢失
     */
    const updateUI = () => {
      if (treeRef.value) {
        treeRef.value.tree.tree.store.checkedKeys = checkedKeys.value;
        treeRef.value.tree.tree.store.setDefaultChecked();
        const list = treeRef.value.tree.tree.store.breadcrumb?.list || [];
        hiddenBreadcrumb.value = list.length < 2;
      }
    };

    /**
     * 触发节点加载数据
     * @author zk
     * @date 2023-05-29 09:16:07
     * @param {IData} item
     * @param {(nodes: IData[]) => void} callback
     */
    const loadData = async (
      item: IData,
      callback: (nodes: IData[]) => void,
    ) => {
      // 没加载前拦截
      if (!c.state.isLoaded) return;
      // 加载时拦截点击事件
      let nodes: ITreeNodeData[];
      const nodeData = c.getNodeData(item.data._uuid)!;
      // 有搜索值为搜索框搜索,必须请求后台数据过滤
      if (nodeData && nodeData._children && !c.state.query) {
        ibiz.log.debug('节点展开加载-本地', nodeData);
        nodes = nodeData._children;
      } else {
        ibiz.log.debug('节点展开加载-远程', nodeData);
        nodes = await c.loadNodes(nodeData);
      }
      // 根节点搜索时,返回树展示数据,并强制刷新
      if (nodes && c.state.rootNodes.includes(nodes[0])) {
        callback(treeData.value);
        c.state.mobExpandedKey = '';
        treeRefreshKey.value = createUUID();
        return;
      }
      callback(toElNodes(nodes));
      updateUI();
    };

    /**
     * 多选时选中节点变更
     *
     * @param {ITreeNodeData} nodeData
     */
    const onNodeCheck = (event: MouseEvent, opts: IData) => {
      const { originData } = opts;
      if (c.state.singleSelect || originData._disableSelect) return;
      // 选中相关处理
      const { selectedData } = c.state;
      const nodeData = c.getNodeData(originData._uuid)!;
      // 选中里没有则添加，有则删除
      const filterArr = selectedData.filter(
        (item: IData) => item._id !== nodeData._id,
      );
      if (filterArr.length === selectedData.length) {
        c.setSelection(selectedData.concat([nodeData]));
      } else {
        c.setSelection(filterArr);
      }
    };

    const onNodeClick = (event: MouseEvent, opts: IData) => {
      event.stopPropagation();
      const { originData } = opts;
      onNodeCheck(event, opts);
      c.onTreeNodeClick(originData, event);
    };

    // 处理展开节点切换
    const handleExpandedLastKey = (data: IData) => {
      c.state.mobExpandedKey = data._uuid || '';
    };

    // 面包屑回退按钮点击事件
    const handleCrumbBack = (_e: MouseEvent, crumbItem?: IData) => {
      _e.preventDefault();
      _e.stopPropagation();

      const breads = crumbItem?.parent.list;
      const prevIndex = breads.length - 2;
      const prevNode = breads[prevIndex];
      if (!prevNode) return;
      const store = prevNode.store;
      const _data = prevNode.store?.data;
      breads.splice(prevIndex + 1);
      store.update();
      handleExpandedLastKey(_data);
    };

    // 搜索
    const debounceSearch = debounce(async () => {
      if (treeRef.value) {
        // 获取最后展开的节点
        const list = treeRef.value?.tree?.tree?.store?.breadcrumb?.list;
        const breadcrumbListLast = list ? list[list.length - 1] : null;
        if (breadcrumbListLast) {
          breadcrumbListLast.childNodes = [];
          treeRef.value?.tree?.tree?.store?.nodesChange([]);
          breadcrumbListLast.loaded = false;
          breadcrumbListLast.setExpand(true);
        }
      }
    }, 500);

    const onInput = async (value: string): Promise<void> => {
      c.state.query = value;
      await c.load();
    };

    c.evt.on('onAfterRefreshParent', () => {
      debounceSearch();
    });

    c.evt.on('onLoadSuccess', () => {
      c.state.mobExpandedKey = '';
      treeRefreshKey.value = createUUID();
    });

    /**
     * 树数据格式化
     *
     * @author zk
     * @date 2023-07-03 11:07:59
     * @param {ITreeNodeData} data
     * @return {*}
     */
    const treeDataFormat = (data: ITreeNodeData) => {
      return {
        id: data._id,
        name: data._text,
        children: data._children,
        isLeaf: data._leaf,
      };
    };

    /**
     * 处理单选默认选中样式
     *
     * @author ljx
     * @date 2024-12-12 15:07:59
     * @param {IData} opts
     * @return {*}
     */
    const handleSingleSelect = (opts: IData) => {
      const { originData, loadingEl } = opts;
      if (checkedKeys.value.includes(originData._id) && loadingEl) {
        loadingEl.parentNode.parentNode.classList.add('selected');
        opts.store.selectedCurrent = opts;
      }
    };

    /**
     * @description 绘制节点
     * @param {HTMLDivElement} dom 父dom元素
     * @param {IData} opts 配置
     * @returns {*}
     */
    const renderNode = (dom: HTMLDivElement, opts: IData) => {
      const { originData } = opts;
      const nodeLayoutPanel = findNodeLayoutPanel(originData._id);
      if (nodeLayoutPanel) {
        const { nodeData, layoutPanel } = nodeLayoutPanel;
        const nodePanel = h(IBizControlShell, {
          data: nodeData,
          modelData: layoutPanel,
          context: c.context,
          params: c.params,
        });
        const vueApp = createVueApp(nodePanel);
        vueApp.mount(dom);
        vueApps.push(vueApp);
        return dom;
      }
    };

    const renderContent = (
      _h: (tag: string, opt: IData) => VNode,
      opts: IData,
    ) => {
      // 添加节点样式表
      const { loadingEl, originData } = opts;
      const nodeModel = findNodeModel(originData._id);
      if (loadingEl && nodeModel?.sysCss?.cssName)
        loadingEl.parentNode.parentNode.classList.add(
          `${nodeModel.sysCss.cssName}`,
        );
      if (c.state.singleSelect) handleSingleSelect(opts);

      const children: HTMLElement[] = [];

      // 添加计数器
      if (nodeModel?.counterId) {
        const count = c.state.counterData[nodeModel.counterId];
        if (!(isNil(count) || (nodeModel.counterMode === 1 && count === 0))) {
          const child = document.createElement('div');
          child.className = `ibiz-badge tree-counter ${ns.is('mob', true)}`;
          child.innerText = count > 99 ? `${99}+` : count;
          children.push(child);
        }
      }

      // 非叶子节点添加展开图标
      if (!originData._leaf) {
        const child = document.createElement('i');
        child.className = 'van-icon van-icon-arrow';
        children.push(child);
      }

      // 节点内容区绘制
      return _h('div', {
        className: `tree-button ${ns.b('node-expanded-btn')}`,
        click: (e: Event, _opts: IData) => {
          if (originData._leaf) return;
          _opts.store.breadcrumb.list.push(_opts);
          _opts.setExpand(true);
          handleExpandedLastKey(originData);
        },
        children,
      });
    };

    const customNodeClick = (event: MouseEvent, opts: IData) => {
      const { checked } = opts;
      opts.setChecked(!checked);
      onNodeClick(event, opts);
    };

    // vs树配置项
    const options = {
      maxHeight: '100%',
      // 继承父状态
      checkInherit: false,
      // 不能选择父节点
      nocheckParent: false,
      rootName: c.model.detreeNodes?.find(item => item.rootNode)?.name,
      virtual: {
        showCount: 30, // 虚拟列表显示数量，太少时会导致虚拟列表无法滚动
      },
      renderNode,
      renderContent,
      customNodeClick,
    } as IParams;

    if (breadcrumb.value) {
      Object.assign(options, {
        breadcrumb: {
          el: `#breadcrumb${uuid}`,
          link: (node: IData, data: IData) => {
            const list = node.store?.breadcrumb?.list || [];
            if (list.length < 2) {
              hiddenBreadcrumb.value = true;
              return null;
            }
            hiddenBreadcrumb.value = false;
            const content = document.createElement('span');
            const textDom = document.createElement('span');
            textDom.innerText = data.name;
            if (data.icon instanceof HTMLElement) {
              content.appendChild(data.icon.cloneNode(true));
            }
            content.appendChild(textDom);
            content.className = `${ns.be('header', 'crumb')} ${ns.is(
              'root',
              data._vsroot,
            )}`;
            content.onclick = () => handleExpandedLastKey.bind(this)(data);
            return content;
          },
          separator: '>',
        },
      });

      if (isHeaderStyle) {
        Object.assign(options.breadcrumb, {
          icon: (...args: IParams[]) => {
            const crumbItem = args[2];
            const content = document.createElement('span');
            const iconDom = document.createElement('i');
            iconDom.className = 'van-icon van-icon-arrow-left';
            content.className = `${ns.bem('header', 'crumb', 'back-btn')}`;
            content.appendChild(iconDom);
            content.onclick = (_e: MouseEvent) =>
              handleCrumbBack.bind(this)(_e, crumbItem);
            return content;
          },
        });
      }
    }

    /**
     * 滚动事件
     * - 加载更多
     */
    const onScroll = debounce(
      async (event: MouseEvent) => {
        const { mobExpandedKey } = c.state;
        // 当前展开节点默认是根节点
        const expandNodeKey = mobExpandedKey || c.state.rootNodes[0]._uuid;
        const nodeData = c.getNodeData(expandNodeKey);
        if (!nodeData) return;
        const infoItems = c.getLoadMoreInfoItems(nodeData._id);
        if (!infoItems) return;
        const result = infoItems.some(infoItem => {
          return infoItem.curPage < infoItem.totalPage - 1;
        });
        const { scrollTop, clientHeight, scrollHeight } = event.target as IData;
        // 滚动到底部且还有下一页数据时
        if (result && scrollTop + clientHeight >= scrollHeight - 10) {
          const childern = toElNodes(await c.loadNodes(nodeData, true));
          // 如果不显示根节点并且当前展开是根节点时 nodeKey为 undefined
          const nodeKey =
            !c.model.rootVisible && !mobExpandedKey
              ? undefined
              : mobExpandedKey;
          const node = treeRef.value.getNodeById(nodeKey);
          // 在父节点上添加子数据
          childern.forEach(child => node.append(child));
        }
      },
      300,
      { leading: true },
    );

    onUnmounted(() => {
      // 卸载绘制的图标节点
      vueApps.forEach((vueApp: App) => {
        vueApp.unmount();
      });
      vueApps = [];
    });

    return {
      c,
      ns,
      uuid,
      options,
      treeRef,
      treeData,
      breadcrumb,
      currentVal,
      checkedKeys,
      treeRefreshKey,
      hiddenBreadcrumb,
      isHeaderStyle,
      onInput,
      loadData,
      onScroll,
      onNodeCheck,
      onNodeClick,
      treeDataFormat,
    };
  },
  render() {
    const slots: IData = {
      searchbar: () => {
        if (!this.c.enableQuickSearch) return null;
        return (
          <van-search
            modelValue={this.c.state.query}
            class={this.ns.b('quick-search')}
            clearable={true}
            placeholder={this.c.state.placeHolder}
            onUpdate:model-value={this.onInput}
          ></van-search>
        );
      },
    };
    const key = this.c.controlPanel ? 'tree' : 'default';
    slots[key] = () => {
      const content = [
        this.breadcrumb && (
          <div
            class={[
              this.ns.be('header', 'container'),
              this.ns.is('hidden', this.hiddenBreadcrumb),
            ]}
          >
            <van-sticky>
              <div
                id={`breadcrumb${this.uuid}`}
                class={[
                  this.ns.b('header'),
                  this.ns.is('no-root', !this.treeData.length),
                  this.ns.is('header-style', this.isHeaderStyle),
                ]}
              ></div>
            </van-sticky>
          </div>
        ),
        this.c.state.isCreated && this.c.state.isLoaded && (
          <vs-tree
            show-line
            ref='treeRef'
            lazy={true}
            showIcon={true}
            strictLeaf={true}
            data={this.treeData}
            options={this.options}
            highlightCurrent={true}
            key={this.treeRefreshKey}
            class={this.ns.b('content')}
            checkedKeys={this.checkedKeys}
            expandKeys={this.c.state.expandedKeys}
            show-checkbox={!this.c.state.singleSelect}
            load={this.loadData}
            onScroll={this.onScroll}
            onCheck={this.onNodeCheck}
            format={this.treeDataFormat}
          ></vs-tree>
        ),
      ];
      return <div class={this.ns.b('container')}>{content}</div>;
    };
    return (
      <iBizControlBase v-loading={this.c.state.isLoading} controller={this.c}>
        {slots}
      </iBizControlBase>
    );
  },
});

export default TreeControl;
