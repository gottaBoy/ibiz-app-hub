import { ElColorPicker } from 'element-plus';
import { PropType, defineComponent, reactive, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IBrushOption, IToolbarItem, ToolbarItemType } from '../../type';
import { getDefaultToolbarItems } from '../../constant';
import './screen-shot-toolbar.scss';

export const ScreenShotToolbar = defineComponent({
  name: 'IBizScreenShotToolbar',
  props: {
    history: {
      type: Array as PropType<IData[]>,
      required: true,
    },
  },
  emits: {
    itemClick: (_type: ToolbarItemType, _opt: IBrushOption) => true,
  },
  setup(_props, { emit }) {
    const ns = useNamespace('screen-shot-toolbar');

    const items = reactive<IToolbarItem[]>(getDefaultToolbarItems());

    const activeItem = ref<IToolbarItem | null>(null);

    // 选项值变更
    const onChange = (): void => {
      const { type, color, size } = activeItem.value || {};
      if (!type) return;
      emit('itemClick', type, {
        size,
        color,
      } as IBrushOption);
    };

    // 字体大小变更
    const handleSizeClick = (size: number): void => {
      if (activeItem.value) activeItem.value.size = size;
      onChange();
    };

    // 颜色变更
    const handleColorChange = (color: string): void => {
      if (activeItem.value) activeItem.value.color = color;
      onChange();
    };

    // 项点击
    const handleItemClick = (item: IToolbarItem): void => {
      activeItem.value = item;
      onChange();
    };

    // 阻止事件冒泡
    const stopPropagation = (e: MouseEvent): void => {
      e.stopPropagation();
      e.preventDefault();
    };

    return {
      ns,
      items,
      activeItem,
      stopPropagation,
      handleItemClick,
      handleSizeClick,
      handleColorChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} onClick={this.stopPropagation}>
        <div class={this.ns.e('content')} onMouseup={this.stopPropagation}>
          {this.items.map(item => {
            return (
              <div
                class={[
                  this.ns.e('item'),
                  this.ns.em('item', item.type),
                  this.ns.is(
                    'active',
                    item.type !== ToolbarItemType.DRAWDOWN &&
                      item.type === this.activeItem?.type,
                  ),
                  this.ns.is(
                    'disabled',
                    item.type === ToolbarItemType.DRAWDOWN &&
                      this.history.length <= 1,
                  ),
                ]}
                onClick={() => this.handleItemClick(item)}
              >
                <div class={this.ns.em('item', 'icon')} title={item.text}>
                  {item.icon}
                </div>
              </div>
            );
          })}
        </div>
        {this.activeItem?.size || this.activeItem?.color ? (
          <div class={this.ns.e('item-options')}>
            <div class={this.ns.em('item-options', 'content')}>
              {this.activeItem.sizeOpts ? (
                <div class={this.ns.e('size')}>
                  {this.activeItem.sizeOpts.map(item => (
                    <div
                      class={[
                        this.ns.em('size', 'item'),
                        this.ns.em('size', item.type),
                        this.ns.is(
                          'active',
                          item.value === this.activeItem!.size,
                        ),
                      ]}
                      title={item.text}
                      onClick={() => this.handleSizeClick(item.value)}
                    />
                  ))}
                </div>
              ) : null}
              {this.activeItem.color ? (
                <div class={this.ns.e('color-picker')}>
                  <ElColorPicker
                    teleported={false}
                    v-model={this.activeItem.color}
                    onChange={this.handleColorChange}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
});
