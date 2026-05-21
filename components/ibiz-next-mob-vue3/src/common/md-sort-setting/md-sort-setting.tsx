import { defineComponent, PropType, ref, onUnmounted } from 'vue';
import { IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './md-sort-setting.scss';

type Order = 'asc' | 'desc';

interface IListItem {
  // 文本值
  label: string;
  // 唯一标识
  value: string;
}

export const IBizMdSortSetting = defineComponent({
  name: 'IBizMdSortSetting',
  props: {
    listItems: {
      type: Array as PropType<IListItem[]>,
      default: () => [],
    },
    customClass: {
      type: String,
      default: '',
    },
    sort: {
      type: Object as PropType<{ key: string; order: Order }>,
    },
    modal: {
      type: Object as PropType<IModal>,
    },
  },
  setup(props) {
    const ns = useNamespace('md-sort-setting');
    const sortData = [
      { text: ibiz.i18n.t('component.mdSortSetting.asc'), order: 'asc' },
      { text: ibiz.i18n.t('component.mdSortSetting.desc'), order: 'desc' },
    ];

    // 当前激活页
    const currentPage = ref<Order>('asc');
    // 当前激活项
    const selectedKey = ref<string>('');

    // 初始化数据
    const initData = () => {
      if (props.sort) {
        const { key, order } = props.sort;
        selectedKey.value = key;
        currentPage.value = order;
        return;
      }

      selectedKey.value = '';
      currentPage.value = 'asc';
    };

    initData();

    // 切换
    const onTabChange = (order: Order): void => {
      currentPage.value = order;
    };

    // 处理项点击
    const onItemClick = (item: IListItem): void => {
      const isCheck = selectedKey.value === item.value;
      let key = item.value || '';
      if (isCheck) {
        key = '';
      }

      selectedKey.value = key;
    };

    // 确定事件
    const onConfirm = () => {
      props.modal?.dismiss({
        ok: true,
        data: [
          {
            key: selectedKey.value || '',
            order: currentPage.value,
          },
        ],
      });
    };

    // 关闭弹框
    const onClose = () => {
      props.modal?.dismiss();
    };

    onUnmounted(() => {
      selectedKey.value = '';
      currentPage.value = 'asc';
    });

    // 绘制列表项
    const renderListItem = (item: IListItem) => {
      const isCheck = selectedKey.value === item.value;
      return (
        <div
          class={[ns.e('list-item'), ns.is('check', isCheck)]}
          onClick={() => onItemClick(item)}
        >
          <span class={ns.em('list-item', 'text')}>{item.label}</span>
          {isCheck && (
            <span class={ns.em('list-item', 'icon')}>
              <svg
                viewBox='0 0 16 16'
                xmlns='http://www.w3.org/2000/svg'
                height='1em'
                width='1em'
              >
                <g stroke-width='1' fill-rule='evenodd'>
                  <path d='M6.012 11.201L1.313 6.832l-.817.879 5.54 5.15 9.304-9.163-.842-.855z'></path>
                </g>
              </svg>
            </span>
          )}
        </div>
      );
    };

    // 绘制列表
    const renderList = (listItems: IListItem[]) => {
      return (
        <van-list>
          {{
            default: () => {
              return listItems.map((item: IListItem) => {
                return (
                  <van-cell>
                    {{
                      default: () => {
                        return renderListItem(item);
                      },
                    }}
                  </van-cell>
                );
              });
            },
          }}
        </van-list>
      );
    };

    return {
      ns,
      currentPage,
      sortData,
      onClose,
      onTabChange,
      renderList,
      onConfirm,
    };
  },
  render() {
    return (
      <div class={this.ns.e('content')}>
        <div class={this.ns.em('content', 'header')}>
          <div class={this.ns.em('content', 'title')}>
            {ibiz.i18n.t('component.mdSortSetting.sort')}
          </div>
          <van-icon
            name='cross'
            class={this.ns.em('content', 'icon')}
            onClick={this.onClose}
            title={ibiz.i18n.t('app.close')}
          />
        </div>
        <van-tabs
          class={this.ns.em('content', 'tabs')}
          active={this.currentPage}
          onChange={this.onTabChange}
        >
          {{
            default: () => {
              return this.sortData.map((item: IData) => {
                return (
                  <van-tab
                    class={this.ns.em('content', 'tab-item')}
                    name={item.order}
                  >
                    {{
                      default: () => this.renderList(this.listItems),
                      title: () => {
                        return <div>{item.text}</div>;
                      },
                    }}
                  </van-tab>
                );
              });
            },
          }}
        </van-tabs>
        <div class={this.ns.em('content', 'bottom')}>
          <van-button type='primary' block onClick={this.onConfirm}>
            {ibiz.i18n.t('component.mdSortSetting.confirm')}
          </van-button>
        </div>
      </div>
    );
  },
});
