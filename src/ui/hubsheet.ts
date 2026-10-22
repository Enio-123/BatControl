// Folha do Bluetooth: conecta num hub com firmware Pybricks, envia o programa e mostra a saída.
import { t } from '../i18n';
import { bluetoothAvailable, compile, HubError, multiMpy, PybricksHub, STATUS_RUNNING } from '../ble/hub';
import { ConsoleView } from './console';
import { buzz, fill, h, icon, openSheet } from './dom';

let hub: PybricksHub | null = null;

const errText = (e: unknown) => {
  if (e instanceof HubError) {
    const detail = e.code === 'compile' || e.code === 'tooBig' ? e.message : '';
    return t(`hub.err.${e.code}`, { detail });
  }
  return t('hub.err.other', { detail: String((e as Error)?.message ?? e) });
};

export function openHub(getCode: () => string, cons: ConsoleView, showOut: () => void) {
  const status = h('p', { class: 'hub-status', role: 'status' });
  const bar = h('div', { class: 'meter thin', hidden: true }, h('span', { style: 'width:0%' }));
  const actions = h('div', { class: 'hub-actions' });
  let busy = false;

  const setBar = (f: number | null) => {
    bar.hidden = f === null;
    (bar.firstElementChild as HTMLElement).style.width = `${Math.round((f ?? 0) * 100)}%`;
  };

  const render = () => {
    const on = !!hub?.connected;
    const running = on && !!(hub!.status & STATUS_RUNNING);
    if (!bluetoothAvailable()) status.textContent = t('hub.unsupported');
    else if (!on) status.textContent = t('hub.disconnected');
    else status.textContent = running ? t('hub.running', { name: hub!.name }) : t('hub.connected', { name: hub!.name });
    status.className = `hub-status ${on ? 'on' : ''}`;
    fill(actions,
      !on
        ? h('button', { type: 'button', class: 'btn primary', disabled: busy || !bluetoothAvailable(), onclick: connect }, icon('bluetooth', 16), t('hub.connect'))
        : h('button', { type: 'button', class: 'btn primary', disabled: busy, onclick: send }, icon('upload', 16), t('hub.send')),
      on ? h('button', { type: 'button', class: 'btn ghost', disabled: busy || !running, onclick: () => hub!.stop().catch(fail) }, icon('stop', 16), t('hub.stop')) : null,
      on ? h('button', { type: 'button', class: 'btn ghost', disabled: busy, onclick: () => { hub!.disconnect(); hub = null; render(); } }, t('hub.disconnect')) : null,
    );
  };

  const fail = (e: unknown) => {
    busy = false;
    setBar(null);
    status.textContent = errText(e);
    status.className = 'hub-status err';
    buzz('bad');
    actions.querySelectorAll('button').forEach((b) => (b.disabled = false));
  };

  async function connect() {
    busy = true;
    render();
    status.textContent = t('hub.connecting');
    try {
      const next = new PybricksHub();
      next.onStdout = (text) => text.split('\n').filter((l) => l.length).forEach((l) => cons.append(l, 'out'));
      next.onStatus = () => render();
      next.onDisconnect = () => { if (hub === next) hub = null; cons.append(t('hub.lost'), 'warn'); render(); };
      await next.connect();
      hub = next;
      busy = false;
      buzz('ok');
      render();
    } catch (e) {
      fail(e);
      if (e instanceof HubError && e.code === 'cancelled') { status.textContent = t('hub.disconnected'); status.className = 'hub-status'; }
    }
  }

  async function send() {
    if (!hub) return;
    busy = true;
    render();
    try {
      status.textContent = t('hub.compiling');
      const blob = multiMpy(await compile(getCode()));
      status.textContent = t('hub.sending');
      setBar(0);
      await hub.download(blob, setBar);
      await hub.start();
      setBar(null);
      busy = false;
      cons.clear(t('hub.consoleStart', { name: hub.name }));
      showOut();
      buzz('ok');
      render();
    } catch (e) {
      fail(e);
    }
  }

  render();
  openSheet(t('hub.title'), [
    h('p', { class: 'muted small' }, t('hub.desc')),
    status,
    bar,
    actions,
    h('details', { class: 'hub-help' },
      h('summary', {}, t('hub.reqTitle')),
      h('ul', { class: 'small' },
        h('li', {}, t('hub.req1')),
        h('li', {}, t('hub.req2')),
        h('li', {}, t('hub.req3')),
        h('li', {}, t('hub.req4')))),
  ]);
}
