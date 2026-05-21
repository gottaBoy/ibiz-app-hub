/* eslint-disable no-restricted-globals */
/* eslint-disable prefer-template */
import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';
import './download-view.scss';
import { CoreConst, setAppCookie } from '@ibiz-template/core';
import { isAndroid, isWeChat } from '@ibiz-template/runtime';

export const DownloadView = defineComponent({
  setup() {
    const ns = useNamespace('download-view');

    const route = useRoute();

    // 是否为安卓微信端
    const isAndroidWeChat: Ref<boolean> = ref(false);

    // 提示信息
    const tooltip: Ref<string> = ref('');

    const status: Ref<string> = ref('init');

    const searchParams: IData = {};
    if (route.query.filename) {
      searchParams.fileName = decodeURIComponent(
        route.query.filename as string,
      );
    }
    if (route.query.fileurl) {
      searchParams.fileUrl = decodeURIComponent(route.query.fileurl as string);
    }
    if (route.query.token) {
      setAppCookie(CoreConst.TOKEN, route.query.token as string, 0);
    }

    const onDownload = async () => {
      status.value = 'processing';
      tooltip.value = ibiz.i18n.t('view.downloading');
      const result = await ibiz.platform.download(
        searchParams.fileUrl,
        searchParams.fileName,
      );
      if (result) {
        status.value = 'success';
        tooltip.value = ibiz.i18n.t('view.downloadSuccess');
      } else {
        status.value = 'error';
        tooltip.value = ibiz.i18n.t('view.downloadFailed');
      }
    };

    isAndroidWeChat.value = isWeChat() && isAndroid();

    // 微信环境下安卓下载特殊处理，需跳转到其他浏览器中打开下载
    if (isAndroidWeChat.value) {
      tooltip.value = ibiz.i18n.t('view.noSupportDownload');
      status.value = 'disabled';
    } else {
      onDownload();
    }

    const renderTip = () => {
      if (status.value === 'success') {
        return (
          <img class={ns.b('success-img')} src='./assets/img/success.png' />
        );
      }
      if (['disabled', 'error'].includes(status.value)) {
        return <img class={ns.b('error-img')} src='./assets/img/error.png' />;
      }
      if (status.value === 'processing') {
        return <van-loading type='spinner' />;
      }
    };

    const renderButton = () => {
      if (status.value === 'init') {
        return (
          <van-button onClick={onDownload} type='primary'>
            {ibiz.i18n.t('view.immediatelyDownload')}
          </van-button>
        );
      }
      if (['success', 'error'].includes(status.value)) {
        return (
          <van-button onClick={onDownload} type='primary'>
            {ibiz.i18n.t('view.reDownload')}
          </van-button>
        );
      }
    };

    onMounted(() => {
      ibiz.util.hiddenAppLoading();
    });

    return {
      ns,
      tooltip,
      status,
      onDownload,
      renderTip,
      renderButton,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('disabled', this.status === 'disabled'),
        ]}
      >
        <div class={this.ns.e('tip')}>{this.renderTip()}</div>
        <div class={this.ns.e('tooltip')}>{this.tooltip}</div>
        {this.renderButton()}
      </div>
    );
  },
});
