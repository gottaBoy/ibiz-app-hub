import { PropType, defineComponent, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { CenterController } from '../../controller/center.controller';
import { DevToolCollapse, DevToolCollapsePanel } from '../collapse/index';
import './detail-info.scss';
import { ObjectViewer } from '../object-viewer/object-viewer';
import { devtoolT } from '../../locale/helper';

export const DetailInfo = defineComponent({
  name: 'DevToolDetailInfo',
  component: [DevToolCollapse, DevToolCollapsePanel],
  props: {
    center: {
      type: Object as PropType<CenterController>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('detail-info');

    const expandItems = ref(['context']);

    return { ns, expandItems };
  },
  render() {
    // eslint-disable-next-line no-unused-expressions
    this.center.state.viewListRefreshKey; // 响应式刷新用

    if (!this.center.state.selectedViewId) {
      return null;
    }

    const view = this.center.activeViews.find(
      item => item.id === this.center.state.selectedViewId,
    );
    if (!view) {
      return null;
    }

    return (
      <div class={[this.ns.b()]}>
        <DevToolCollapse value={this.expandItems}>
          <DevToolCollapsePanel title={devtoolT('viewContext')} name='context'>
            <ObjectViewer obj={view.context}></ObjectViewer>
          </DevToolCollapsePanel>
          <DevToolCollapsePanel
            title={devtoolT('viewParams')}
            name='viewparams'
          >
            {view.params && <ObjectViewer obj={view.params}></ObjectViewer>}
          </DevToolCollapsePanel>
        </DevToolCollapse>
      </div>
    );
  },
});
