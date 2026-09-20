import './index.scss';
import { registerAiChatLocale } from './locale';

registerAiChatLocale();
export { ChatContainer } from './components';
export { chat } from './controller';
export type { IChatToolbarItem } from './interface';
export { t as aiChatT, registerAiChatLocale } from './locale';
