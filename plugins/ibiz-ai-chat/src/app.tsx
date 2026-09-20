import { aiChatT } from './utils';
import './app.scss';

export function App() {
  const onClick = () => {};

  return (
    <>
      <button onClick={onClick}>{aiChatT('open')}</button>
    </>
  );
}
