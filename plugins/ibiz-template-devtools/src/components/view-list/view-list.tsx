import { PropType, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './view-list.scss';
import { IViewController } from '@ibiz-template/runtime';
import { CenterController } from '../../controller/center.controller';
import { DetailInfo } from '../detail-info/detail-info';
import DevtoolButton from '../devtool-button/devtool-button';
import { devtoolT } from '../../locale/helper';

export const ViewList = defineComponent({
  name: 'DevToolViewList',
  component: [DevtoolButton],
  props: {
    center: {
      type: Object as PropType<CenterController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('view-list');

    /** 根据viewList的变更刷新render */
    const renderRefreshByViewList = (): string => {
      return props.center.state.viewListRefreshKey;
    };

    const onItemClick = (view: IViewController): void => {
      if (props.center.state.selectedViewId === view.id) {
        props.center.selectView();
      } else {
        props.center.selectView(view);
      }
    };

    const onMouseEnter = (_event: MouseEvent, view: IViewController): void => {
      props.center.hoverView(view);
    };
    const onMouseLeave = (_event: MouseEvent, _view: IViewController): void => {
      props.center.hoverView();
    };

    return {
      ns,
      renderRefreshByViewList,
      onItemClick,
      onMouseEnter,
      onMouseLeave,
    };
  },
  render() {
    this.renderRefreshByViewList();

    return (
      <div class={[this.ns.b()]}>
        {this.center.activeViews.length > 0 &&
          this.center.activeViews.map(view => {
            const caption = `${view.model.caption}（${view.model.codeName}）`;
            const isSelected = this.center.state.selectedViewId === view.id;
            return (
              <div
                class={[
                  this.ns.b('item'),
                  isSelected && this.ns.bm('item', 'selected'),
                ]}
                onClick={() => this.onItemClick(view)}
                onMouseenter={(evt: MouseEvent) => {
                  this.onMouseEnter(evt, view);
                }}
                onMouseleave={(evt: MouseEvent) => {
                  this.onMouseLeave(evt, view);
                }}
              >
                <div class={this.ns.be('item', 'header')}>
                  <div class={this.ns.be('item', 'caption')} title={caption}>
                    {caption}
                  </div>
                  <div class={this.ns.be('item', 'toolbar')}>
                    <DevtoolButton
                      title={devtoolT('copyCodeName')}
                      onClick={(evt: MouseEvent) => {
                        evt.stopPropagation();
                        this.center.copyCodeName(view);
                      }}
                    >
                      <ion-icon name='copy-outline'></ion-icon>
                    </DevtoolButton>
                    <DevtoolButton
                      title={devtoolT('openStudio')}
                      onClick={(evt: MouseEvent) => {
                        evt.stopPropagation();
                        this.center.openStudioUrl(view);
                      }}
                    >
                      <ion-icon name='create-outline'></ion-icon>
                    </DevtoolButton>
                    <DevtoolButton
                      onClick={(evt: MouseEvent) => {
                        evt.stopPropagation();
                        this.center.skimViewModel(view);
                      }}
                      title={devtoolT('viewModel')}
                    >
                      <ion-icon name='layers-outline'></ion-icon>
                    </DevtoolButton>
                    <DevtoolButton
                      onClick={(evt: MouseEvent) => {
                        evt.stopPropagation();
                        this.center.skimTempData(view);
                      }}
                      title={devtoolT('logTempData')}
                    >
                      <ion-icon name='server-outline'></ion-icon>
                    </DevtoolButton>
                  </div>
                </div>
                <div class={this.ns.be('item', 'content')}>
                  <DetailInfo center={this.center}></DetailInfo>
                </div>
              </div>
            );
          })}
      </div>
    );
  },
});
