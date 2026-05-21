/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useComputed } from '@preact/signals';
import { AiChatController } from '../../../controller';
import { IMaterial } from '../../../interface';
import { Namespace } from '../../../utils';
import { DefaultMaterialSvg, DownLoadSvg } from '../../../icons';
import { isSvg } from '../../../utils/util/util';
import './common-material.scss';

export interface CommonMaterialProps {
  controller: AiChatController;
  material: IMaterial;
}

const ns = new Namespace('common-material');

export const CommonMaterial = (props: CommonMaterialProps) => {
  const targetToolbarItem = props.controller.opts.questionToolbarItems?.find(
    item => {
      return item.id === (props.material.metadata as any).actionId;
    },
  );

  const content = useComputed(() => {
    return (props.material.metadata as any).name;
  });

  // 下载界面行为
  const downLoadActionId = useComputed(() => {
    return (props.material.metadata as any).downloadactionid;
  });

  // 下载文件
  const downloadFile = (event: MouseEvent) => {
    const mateData: any = props.material.metadata;
    const extendToolbarClick = props.controller.opts.extendToolbarClick;
    if (extendToolbarClick && typeof extendToolbarClick === 'function') {
      // 行为标识
      const actionID = mateData.downloadactionid;
      if (!downLoadActionId) {
        throw new Error('downloadactionid不能为空');
      }
      // 应用标识
      const appId = mateData.downloadAppId;
      // 扩展上下文,abc:123;cde:456转化为对象
      const downloadContext: any = { ...props.controller.context };
      if (mateData.downloadContext) {
        try {
          const contextPairs = mateData.downloadContext.split(';');
          const expandContext = contextPairs.reduce(
            (acc: Record<string, string>, pair: string) => {
              if (pair.trim()) {
                const [key, value] = pair.split(':');
                if (key && value) {
                  acc[key.trim()] = value.trim();
                }
              }
              return acc;
            },
            {},
          );
          if (expandContext && Object.keys(expandContext).length > 0) {
            Object.assign(downloadContext, expandContext);
          }
        } catch (error) {
          throw new Error(
            'downloadContext参数解析异常，正确格式如:abc:123;cde:456,',
          );
        }
      }

      extendToolbarClick(
        event,
        {
          id: actionID,
          // 是否是插件应用(建议里面定义appid认为是插件应用的界面行为)
          isPluginApp: !!appId,
          appId: appId || downloadContext.srfappid,
        },
        downloadContext,
        props.controller.params,
        {},
      );
    }
  };

  return (
    <div className={ns.b()}>
      <div className={ns.b('left')}>
        {targetToolbarItem && targetToolbarItem.icon ? (
          typeof targetToolbarItem.icon === 'function' ? (
            targetToolbarItem.icon()
          ) : (
            targetToolbarItem.icon?.showIcon && (
              <>
                {targetToolbarItem.icon?.cssClass ? (
                  <i className={targetToolbarItem.icon.cssClass} />
                ) : targetToolbarItem.icon?.imagePath ? (
                  isSvg(targetToolbarItem.icon.imagePath) ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: targetToolbarItem.icon.imagePath,
                      }}
                    />
                  ) : (
                    <img src={targetToolbarItem.icon.imagePath} />
                  )
                ) : null}
              </>
            )
          )
        ) : (
          <DefaultMaterialSvg></DefaultMaterialSvg>
        )}
      </div>
      <div className={ns.b('right')}>
        <div className={ns.e('name')} title={content}>
          {content}
        </div>
        <div className={ns.b('metadata')}>
          <div>{targetToolbarItem?.label || '素材资源'}</div>
          {downLoadActionId && (
            <div
              className={ns.be('metadata', 'img')}
              title='预览'
              onClick={downloadFile}
            >
              <DownLoadSvg />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
