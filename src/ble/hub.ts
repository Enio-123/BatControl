// Envio de programas para um hub com firmware Pybricks pelo Web Bluetooth.
// Protocolo: perfil BLE do Pybricks (serviço c5f50001…), o mesmo usado pelo Pybricks Code.
// O programa é compilado no navegador com o mpy-cross oficial (ABI v6) e enviado no
// formato "multi-mpy v6": tamanho (u32) + nome "__main__\0" + bytes do .mpy.

const SERVICE = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
const COMMAND_EVENT = 'c5f50002-8280-46da-89f4-6d8051e4aeef';
const CAPABILITIES = 'c5f50003-8280-46da-89f4-6d8051e4aeef';

const CMD_STOP = 0x00;
const CMD_START = 0x01;
const CMD_WRITE_META = 0x03;
const CMD_WRITE_RAM = 0x04;
const EVT_STATUS = 0x00;
const EVT_STDOUT = 0x01;

const FLAG_MULTI_MPY6 = 2;
export const STATUS_RUNNING = 64;

export class HubError extends Error {
  constructor(public code: 'unsupported' | 'cancelled' | 'firmware' | 'compile' | 'tooBig' | 'lost', detail = '') {
    super(detail || code);
  }
}

// Tipos mínimos do Web Bluetooth (não estão no lib.dom do TypeScript)
interface Char {
  writeValueWithResponse(v: BufferSource): Promise<void>;
  readValue(): Promise<DataView>;
  startNotifications(): Promise<Char>;
  addEventListener(type: string, fn: (e: Event) => void): void;
  value?: DataView;
}

export function bluetoothAvailable() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/** Compila Python para .mpy com o mpy-cross do Pybricks (carregado só quando precisa). */
export async function compile(code: string): Promise<Uint8Array> {
  const [{ compile: mpyCompile }, wasm] = await Promise.all([
    import('@pybricks/mpy-cross-v6'),
    import('@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm?url'),
  ]);
  // O hub é de 32 bits: inteiros pequenos usam 31 bits, como no Pybricks Code.
  const r = await mpyCompile('__main__.py', code, ['-msmall-int-bits=31'], wasm.default);
  if (r.status !== 0 || !r.mpy) throw new HubError('compile', [...r.err, ...r.out].join('\n'));
  return r.mpy;
}

export function multiMpy(mpy: Uint8Array): Uint8Array {
  const name = new TextEncoder().encode('__main__\0');
  const out = new Uint8Array(4 + name.length + mpy.length);
  new DataView(out.buffer).setUint32(0, mpy.length, true);
  out.set(name, 4);
  out.set(mpy, 4 + name.length);
  return out;
}

export class PybricksHub {
  name = '';
  maxWrite = 20;
  maxProgram = 0;
  flags = 0;
  slots: number | null = null;
  status = 0;
  private device: any = null;
  private cmd: Char | null = null;
  onStdout: (text: string) => void = () => {};
  onStatus: (flags: number) => void = () => {};
  onDisconnect: () => void = () => {};
  private decoder = new TextDecoder();

  get connected() { return !!this.device?.gatt?.connected; }

  async connect() {
    if (!bluetoothAvailable()) throw new HubError('unsupported');
    try {
      this.device = await (navigator as any).bluetooth.requestDevice({ filters: [{ services: [SERVICE] }], optionalServices: [SERVICE] });
    } catch (e) {
      throw new HubError('cancelled', String((e as Error)?.message ?? e));
    }
    this.name = this.device.name ?? 'Pybricks Hub';
    this.device.addEventListener('gattserverdisconnected', () => this.onDisconnect());
    const server = await this.device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE);
    this.cmd = await service.getCharacteristic(COMMAND_EVENT);
    try {
      const caps: Char = await service.getCharacteristic(CAPABILITIES);
      const v = await caps.readValue();
      this.maxWrite = v.getUint16(0, true);
      this.flags = v.getUint32(2, true);
      this.maxProgram = v.getUint32(6, true);
      this.slots = v.byteLength >= 11 ? v.getUint8(10) : null;
    } catch {
      // Firmware antigo, sem a característica de capacidades
      throw new HubError('firmware');
    }
    if (!(this.flags & FLAG_MULTI_MPY6)) throw new HubError('firmware');
    await this.cmd!.startNotifications();
    this.cmd!.addEventListener('characteristicvaluechanged', (e) => {
      const v = (e.target as unknown as Char).value!;
      const kind = v.getUint8(0);
      if (kind === EVT_STATUS && v.byteLength >= 5) {
        this.status = v.getUint32(1, true);
        this.onStatus(this.status);
      } else if (kind === EVT_STDOUT) {
        this.onStdout(this.decoder.decode(new Uint8Array(v.buffer, v.byteOffset + 1, v.byteLength - 1), { stream: true }));
      }
    });
  }

  private async write(bytes: Uint8Array) {
    if (!this.cmd || !this.connected) throw new HubError('lost');
    await this.cmd.writeValueWithResponse(bytes as BufferSource);
  }

  async stop() {
    await this.write(new Uint8Array([CMD_STOP]));
  }

  /** Envia o programa para a RAM do hub. `progress` vai de 0 a 1. */
  async download(blob: Uint8Array, progress: (f: number) => void = () => {}) {
    if (this.maxProgram && blob.length > this.maxProgram) throw new HubError('tooBig', String(this.maxProgram));
    if (this.status & STATUS_RUNNING) await this.stop();
    const meta = (size: number) => {
      const b = new Uint8Array(5);
      b[0] = CMD_WRITE_META;
      new DataView(b.buffer).setUint32(1, size, true);
      return b;
    };
    // Zera o tamanho antes de escrever (o hub não roda um programa pela metade)
    await this.write(meta(0));
    const chunk = Math.max(1, this.maxWrite - 5);
    for (let off = 0; off < blob.length; off += chunk) {
      const part = blob.subarray(off, off + chunk);
      const b = new Uint8Array(5 + part.length);
      b[0] = CMD_WRITE_RAM;
      new DataView(b.buffer).setUint32(1, off, true);
      b.set(part, 5);
      await this.write(b);
      progress(Math.min(1, (off + part.length) / blob.length));
    }
    await this.write(meta(blob.length));
  }

  async start() {
    // A partir do protocolo 1.4 o comando leva o número do slot (0 = programa enviado)
    await this.write(this.slots !== null ? new Uint8Array([CMD_START, 0]) : new Uint8Array([CMD_START]));
  }

  disconnect() {
    try { this.device?.gatt?.disconnect(); } catch { /* já desconectado */ }
  }
}
