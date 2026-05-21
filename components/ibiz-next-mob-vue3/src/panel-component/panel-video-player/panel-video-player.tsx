import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent } from 'vue';
import { createUUID } from 'qx-util';
import { PanelVideoPlayerController } from './panel-video-player.controller';
import './panel-video-player.scss';

/**
 * 视频播放器
 * @primary
 * @description  可配置视频地址播放视频。
 * @panelitemparams {name:path,parameterType:string,defaultvalue:-,description:视频地址}
 * @panelitemparams {name:autoplay,parameterType:string,defaultvalue:-,description:是否自动播放，值为1自动播放，值为0不自动播放}
 * @panelitemparams {name:showcontrols,parameterType:string,defaultvalue:-,description:是否显示控制栏，值为1显示，值为0不显示}
 * @panelitemparams {name:replay,parameterType:string,defaultvalue:-,description:是否循环播放，值为1循环播放，值为0不循环播放}
 * @panelitemparams {name:mute,parameterType:string,defaultvalue:-,description:是否静音播放，值为1静音播放，值为0不静音播放，自动播放时，固定静音，不静音播放时，无法自动播放，这是浏览器安全限制}
 */
export const PanelVideoPlayer = defineComponent({
  name: 'IBizPanelVideoPlayer',
  props: {
    /**
     * @description 视频控制器
     */
    controller: {
      type: PanelVideoPlayerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-video-player');

    const id = createUUID();
    // 路径
    const path = props.controller.getParamsValue('path');
    // 自动播放
    const autoplay = props.controller.getParamsValue('autoplay') === '1';
    // 显示控制栏
    const showcontrols =
      props.controller.getParamsValue('showcontrols') === '1';
    // 循环播放
    const replay = props.controller.getParamsValue('replay') === '1';
    // 静音
    const mute = props.controller.getParamsValue('mute') === '1';

    return {
      ns,
      id,
      path,
      autoplay,
      showcontrols,
      replay,
      mute,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('video')}>
          <video
            {...this.controller.rawItemParams}
            id={this.id}
            src={this.path}
            autoplay={this.autoplay}
            controls={this.showcontrols}
            loop={this.replay}
            muted={this.mute}
          >
            <source src={this.path} type='video/mp4' />
            <source src={this.path} type='video/ogg' />
            <source src={this.path} type='video/webm' />
            {ibiz.i18n.t('panelComponent.panelVideoPlayer.noSupportPrompt')}
          </video>
        </div>
      </div>
    );
  },
});
export default PanelVideoPlayer;
