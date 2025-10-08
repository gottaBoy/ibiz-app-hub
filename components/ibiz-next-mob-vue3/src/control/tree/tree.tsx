import {
  useControlController,
  useNamespace,
  IBizIcon,
} from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  PropType,
  ref,
  VNode,
  h as vueH,
  createApp,
  App,
  onUnmounted,
} from 'vue';
import { IDETree } from '@ibiz/model-core';
import {
  IControlProvider,
  ITreeController,
  ITreeNodeData,
  TreeController,
} from '@ibiz-template/runtime';
import { debounce } from 'lodash-es';
import { createUUID } from 'qx-util';
import { VsTreeComponent } from '@ibiz-template-package/vs-tree-ex';
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
  },
  setup() {
    const c = useControlController<TreeController>(
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

    // 创建图标节点
    const createIconNode = (customProps: IData) => {
      const iop = vueH(IBizIcon, customProps);
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
     * 根据id查找树节点数据对象
     * @export
     * @param {string} key (数据的_uuid 或者 _id)
     * @param {ITreeController} c
     * @return {*}  {(ITreeNodeData | undefined)}
     */
    function findNodeData(
      key: string,
      controller: ITreeController,
    ): ITreeNodeData | undefined {
      const find = controller.state.items.find(item => item._id === key);
      if (find) {
        return find;
      }
      return controller.state.items.find(item => item._uuid === key);
    }

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
      if (!c.state.isLoaded) {
        return;
      }

      // 加载时拦截点击事件
      let nodes: ITreeNodeData[];
      const nodeData = findNodeData(item.data._uuid, c)!;
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
    };

    /**
     * 多选时选中节点变更
     *
     * @param {ITreeNodeData} nodeData
     */
    const onNodeCheck = (event: MouseEvent, opts: IData) => {
      if (c.state.singleSelect) {
        return;
      }
      const { originData } = opts;
      // 选中相关处理
      const { selectedData } = c.state;
      const nodeData = findNodeData(originData._uuid, c)!;
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
      if (!originData._leaf) {
        return;
      }
      onNodeCheck(event, opts);
      c.onTreeNodeClick(originData, event);
    };

    // 处理展开节点切换
    const handleExpandedLastKey = (data: IData) => {
      c.state.mobExpandedKey = data._uuid || '';
    };

    // 搜索
    const debounceSearch = debounce(async () => {
      if (treeRef.value) {
        // 获取最后展开的节点
        const breadcrumbList =
          treeRef.value?.tree?.tree?.store?.breadcrumb?.list;
        const breadcrumbListLast = breadcrumbList
          ? breadcrumbList[breadcrumbList.length - 1]
          : null;
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

    const renderContent = (
      h: (tag: string, opt: IData) => VNode,
      opts: IData,
    ) => {
      if (c.state.singleSelect) handleSingleSelect(opts);
      const { originData } = opts;
      if (!originData._leaf) {
        return h('div', {
          text: ibiz.i18n.t('control.tree.subordinate'),
          className: 'tree-button',
          click: (e: Event, _opts: IData) => {
            _opts.store.breadcrumb.list.push(_opts);
            _opts.setExpand(true);
            handleExpandedLastKey(originData);
          },
        });
      }
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
      nocheckParent: true,
      rootName: c.model.detreeNodes?.find(item => item.rootNode)?.name,
      renderContent,
      customNodeClick,
    };

    if (breadcrumb.value) {
      Object.assign(options, {
        breadcrumb: {
          el: `#breadcrumb${uuid}`,
          link: (node: IData, data: IData) => {
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
        },
      });
    }

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
      treeRefreshKey,
      treeData,
      options,
      breadcrumb,
      checkedKeys,
      uuid,
      treeRef,
      onNodeCheck,
      onNodeClick,
      loadData,
      treeDataFormat,
      currentVal,
      onInput,
    };
  },
  render() {
    const slots: IData = {
      searchbar: () => {
        if (!this.c.enableQuickSearch) {
          return null;
        }
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
      return [
        this.breadcrumb && (
          <van-sticky>
            <div
              id={`breadcrumb${this.uuid}`}
              class={[
                this.ns.b('header'),
                this.ns.is('no-root', !this.c.model.rootVisible),
              ]}
            ></div>
          </van-sticky>
        ),
        this.c.state.isCreated && this.c.state.isLoaded && (
          <vs-tree
            show-line
            ref='treeRef'
            key={this.treeRefreshKey}
            class={[this.ns.b('content')]}
            lazy={true}
            strictLeaf={true}
            options={this.options}
            show-checkbox={!this.c.state.singleSelect}
            showIcon={true}
            data={this.treeData}
            highlightCurrent={true}
            checkedKeys={this.checkedKeys}
            format={this.treeDataFormat}
            load={this.loadData}
            onCheck={this.onNodeCheck}
          ></vs-tree>
        ),
      ];
    };
    return <iBizControlBase controller={this.c}>{slots}</iBizControlBase>;
  },
});

export default TreeControl;
