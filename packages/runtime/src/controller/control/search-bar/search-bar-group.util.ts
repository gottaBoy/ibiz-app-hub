import { IBackendSearchBarGroup } from '../../../interface';

export function mergeBackendSearchGroup(
  target: IBackendSearchBarGroup,
  incoming: IData,
): void {
  const modelCaption = target.caption;
  Object.keys(incoming).forEach(key => {
    if (incoming[key] !== null && incoming[key] !== undefined) {
      (target as IData)[key] = incoming[key];
    }
  });
  if (incoming.ownerType === 'SYSTEM' && modelCaption !== undefined) {
    target.caption = modelCaption;
  }
}
