import { PropType, defineComponent, ref, nextTick, computed } from 'vue';
import { useNamespace } from '../../use';
import './bi-report-select.scss';
import { BIReportDesignController } from '../../controller';
import BISplit from '../common/split/split';
import BISelectGroup from './select-group/select-group';
import { IAppBICubeData, IAppBISchemeData } from '../../interface';
import { biReportT } from '../../locale';

/** BI报表选择组件 */
export default defineComponent({
  name: 'BIReportSelect',
  components: {
    'bi-split': BISplit,
    'bi-select-group': BISelectGroup,
  },
  props: {
    controller: {
      type: Object as PropType<BIReportDesignController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(`select`);
    const c = props.controller;
    // UI相关变量
    const uiState = ref({
      searchState: false, // 是否搜索,
      searchValue: '', // 搜索值
      popoverVisible: false, // 数据集切换popover是否显示
      splitValue: 0.5, // 分割比例
      measureCollapse: false, // 指标是否收缩
      dimensionCollapse: false, // 纬度是否收缩
    });
    const searchInput = ref(); // 搜索框

    // 改变搜索状态
    const changeSearchState = () => {
      uiState.value.searchState = !uiState.value.searchState;
      if (uiState.value.searchState) {
        nextTick(() => {
          searchInput.value.focus();
        });
      } else {
        uiState.value.searchValue = '';
      }
    };

    // 绘制搜索图标
    const renderSearchIcon = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
          fill='currentColor'
        >
          <g id='aubnormal/search' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M6.751 12.303A5.557 5.557 0 0 1 1.2 6.751C1.2 3.691 3.69 1.2 6.751 1.2a5.558 5.558 0 0 1 5.551 5.551 5.557 5.557 0 0 1-5.551 5.552M6.751 0a6.751 6.751 0 1 0 4.309 11.949l3.855 3.855a.6.6 0 1 0 .849-.849l-3.854-3.853A6.751 6.751 0 0 0 6.751 0'
              id='aubFill-1'
            ></path>
          </g>
        </svg>
      );
    };

    // 绘制切换数据集图标
    const renderSwitchDataIcon = () => {
      return (
        <div class={ns.em('header', 'switch-data')}>
          <el-tooltip
            effect='dark'
            content={biReportT('switchDataset')}
            placement='top'
          >
            {{
              default: () => {
                return (
                  <svg
                    viewBox='0 0 16 16'
                    xmlns='http://www.w3.org/2000/svg'
                    height='1em'
                    width='1em'
                    focusable='false'
                    fill='currentColor'
                  >
                    <g
                      id='adqnormal/arrow-right-left'
                      stroke-width='1'
                      fill-rule='evenodd'
                    >
                      <path
                        d='M4.473 1.027a.6.6 0 0 1 .778.573v12.99a.6.6 0 0 1-1.2 0V3.707L2.617 6.182a.6.6 0 1 1-1.04-.6l2.47-4.262a.599.599 0 0 1 .426-.293zm7.156 14.051a.6.6 0 0 1-.778-.573V1.7a.6.6 0 1 1 1.2 0v10.723l1.523-2.594a.6.6 0 1 1 1.04.6l-2.558 4.357a.599.599 0 0 1-.427.292z'
                        id='adq形状结合'
                        transform='rotate(90 8.095 8.095)'
                      ></path>
                    </g>
                  </svg>
                );
              },
            }}
          </el-tooltip>
        </div>
      );
    };

    // 选择立方体数据
    const cascaderSelect = async (item: IAppBICubeData) => {
      c.switchCube(item.pssysbicubeid);
    };

    // 切换体系
    const selectScheme = (item: IAppBISchemeData) => {
      c.state.selectedScheme = item;
      c.state.cube = [];
      c.switchScheme(item.id!);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.stopPropagation();
        changeSearchState();
      }
    };

    // 绘制级联
    const renderCascader = (items: IAppBISchemeData[] = []) => {
      return items.map((item: IAppBISchemeData) => {
        if (
          c.state.cube &&
          c.state.cube.length > 0 &&
          c.state.selectedScheme!.id === item.id
        ) {
          return (
            uiState.value.popoverVisible && (
              <el-popover
                placement='right-start'
                width='200px'
                trigger='hover'
                offset={0}
                popper-class={ns.em('header', 'cascader-list')}
              >
                {{
                  reference: () => {
                    return (
                      <div
                        class={ns.e('select-item')}
                        onClick={() => selectScheme(item)}
                      >
                        <div class={ns.em('select-item', 'label')}>
                          {item.name}
                        </div>
                        <div class={ns.em('select-item', 'icon')}>
                          <i class='fa fa-angle-right' aria-hidden='true'></i>
                        </div>
                      </div>
                    );
                  },
                  default: () => {
                    return c.state.cube.map((cube: IAppBICubeData) => {
                      return (
                        <div
                          class={[
                            ns.e('select-item'),
                            ns.is(
                              'selected',
                              c.state.selectCube!.pssysbicubeid ===
                                cube.pssysbicubeid,
                            ),
                          ]}
                          onClick={() => cascaderSelect(cube)}
                        >
                          {cube.pssysbicubename}
                        </div>
                      );
                    });
                  },
                }}
              </el-popover>
            )
          );
        }
        return (
          <div class={ns.e('select-item')} onClick={() => selectScheme(item)}>
            <div class={ns.em('select-item', 'label')}>{item.name}</div>
            <div class={ns.em('select-item', 'icon')}>
              <i class='fa fa-angle-right' aria-hidden='true'></i>
            </div>
          </div>
        );
      });
    };

    const showSchemePop = computed(() => {
      return c.state.scheme && c.state.scheme.length > 0;
    });

    // 绘制默认头部
    const renderDefaultHeader = () => {
      return (
        <div class={ns.e('header')}>
          <div class={ns.em('header', 'caption')}>
            {c.state.selectedScheme?.name}
          </div>
          <div class={ns.em('header', 'select-icon')}>
            <div class={ns.em('header', 'search')} onClick={changeSearchState}>
              <el-tooltip
                effect='dark'
                content={biReportT('search')}
                placement='top'
              >
                {renderSearchIcon()}
              </el-tooltip>
            </div>
            <div class={ns.em('header', 'select')}>
              {showSchemePop.value ? (
                <el-popover
                  v-model:visible={uiState.value.popoverVisible}
                  trigger='click'
                  width='200px'
                  popper-class={ns.em('header', 'cascader-list')}
                >
                  {{
                    reference: () => {
                      return renderSwitchDataIcon();
                    },
                    default: () => {
                      return renderCascader(c.state?.scheme);
                    },
                  }}
                </el-popover>
              ) : (
                renderSwitchDataIcon()
              )}
            </div>
          </div>
        </div>
      );
    };

    // 绘制搜索时的头部
    const renderSearchHeader = () => {
      return (
        <div class={ns.e('header')}>
          <el-input
            ref='searchInput'
            class={ns.em('header', 'search-input')}
            v-model={uiState.value.searchValue}
            onKeydown={handleKeyDown}
            placeholder={biReportT('search')}
          >
            {{
              prefix: () => {
                return renderSearchIcon();
              },
            }}
          </el-input>
          <div class={ns.em('header', 'close')} onClick={changeSearchState}>
            <svg
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              focusable='false'
              fill='currentColor'
            >
              <g id='agqaction/close' stroke-width='1' fill-rule='evenodd'>
                <path
                  d='M7.456 7.456V-.115h1.2v7.571h7.572v1.2H8.656v7.572h-1.2V8.656H-.115v-1.2h7.571z'
                  id='agq形状结合'
                  transform='rotate(45 8.056 8.056)'
                ></path>
              </g>
            </svg>
          </div>
        </div>
      );
    };

    // 绘制选择区头部
    const renderSelectHeader = () => {
      return !uiState.value.searchState
        ? renderDefaultHeader()
        : renderSearchHeader();
    };

    // 打开新建界面
    const onAdd = async (type: 'measure' | 'dimension') => {
      const viewId: string = `ps_sys_bi_cube_${type.toLowerCase()}_quick_create_${type.toLowerCase()}`;
      const view = await ibiz.hub.config.view.get(viewId);
      const result = await ibiz.openView.modal(
        view.id,
        c.context,
        c.viewParams,
      );
      if (result && result.ok) {
        c.refreshCubeDetails(type);
      }
    };

    // 收缩
    const onCollapse = (value: string, tag: boolean) => {
      if (value === 'measure') {
        uiState.value.measureCollapse = tag;
      } else {
        uiState.value.dimensionCollapse = tag;
      }
    };

    // 是否收缩
    const collapseMode = computed(() => {
      return uiState.value.measureCollapse || uiState.value.dimensionCollapse;
    });

    // 绘制内容区分组 caption:标题 measureCollapse：是否收缩   groupItems：分组数据  _tag：分组标识
    const renderGroup = (
      caption: string,
      collapse: boolean,
      groupItems: IData[],
      _tag: 'measure' | 'dimension',
    ) => {
      return (
        <bi-select-group
          class={[
            { [ns.em('content', 'index')]: collapse },
            ns.is('collapse', collapse),
          ]}
          caption={caption}
          searchValue={uiState.value.searchValue}
          isSearch={uiState.value.searchState}
          collapse={collapse}
          type={_tag}
          items={groupItems}
          controller={c}
          onAdd={() => {
            onAdd(_tag);
          }}
          onCollapse={(tag: boolean) => onCollapse(_tag, tag)}
        ></bi-select-group>
      );
    };

    // 绘制选择器中间内容区
    const renderSelectContent = () => {
      if (collapseMode.value) {
        return (
          <div class={[ns.e('content'), ns.is('collapse', collapseMode.value)]}>
            {[
              renderGroup(
                biReportT('measure'),
                uiState.value.measureCollapse,
                c.state?.measure || [],
                'measure',
              ),
              renderGroup(
                biReportT('dimension'),
                uiState.value.dimensionCollapse,
                c.state?.dimension || [],
                'dimension',
              ),
            ]}
          </div>
        );
      }
      return (
        <div class={ns.e('content')}>
          <bi-split
            v-model={uiState.value.splitValue}
            mode='vertical'
            min={'48px'}
            max={'48px'}
          >
            {{
              top: () => {
                return renderGroup(
                  biReportT('measure'),
                  uiState.value.measureCollapse,
                  c.state?.measure || [],
                  'measure',
                );
              },
              bottom: () => {
                return renderGroup(
                  biReportT('dimension'),
                  uiState.value.dimensionCollapse,
                  c.state?.dimension || [],
                  'dimension',
                );
              },
            }}
          </bi-split>
        </div>
      );
    };

    return { ns, searchInput, renderSelectHeader, renderSelectContent };
  },
  render() {
    return (
      <div class={this.ns.b('container')}>
        {this.renderSelectHeader()}
        {this.renderSelectContent()}
      </div>
    );
  },
});
