import { useApp } from '../state/AppContext';

export default function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;
  return <div className="toast">{state.toast}</div>;
}
