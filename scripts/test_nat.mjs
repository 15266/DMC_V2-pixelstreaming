// 同一本地 socket 打多个 STUN 服务器：
//   映射端口一致  -> Cone NAT（锥形），P2P 有机会直连
//   映射端口不同  -> Symmetric NAT（对称），P2P 基本无解，必须 TURN 中继
import dgram from 'dgram';
import crypto from 'crypto';

const targets = [
    ['stun.miwifi.com', 3478],
    ['stun.chat.bilibili.com', 3478],
    ['stun.hitv.com', 3478],
];

const sock = dgram.createSocket('udp4');
const pending = new Map(); // tid hex -> resolve

function bind(sock) {
    return new Promise((res) => sock.bind(0, () => res(sock.address().port)));
}

function query(host, port, timeoutMs = 4000) {
    return new Promise((resolve) => {
        const tid = crypto.randomBytes(12);
        const req = Buffer.alloc(20);
        req.writeUInt16BE(0x0001, 0);
        req.writeUInt16BE(0x0000, 2);
        req.writeUInt32BE(0x2112a442, 4);
        tid.copy(req, 8);
        const key = tid.toString('hex');
        const timer = setTimeout(() => {
            pending.delete(key);
            resolve({ ok: false, why: 'timeout' });
        }, timeoutMs);
        pending.set(key, (r) => {
            clearTimeout(timer);
            resolve(r);
        });
        sock.send(req, 0, req.length, port, host, (err) => {
            if (err) {
                clearTimeout(timer);
                pending.delete(key);
                resolve({ ok: false, why: err.code });
            }
        });
    });
}

sock.on('message', (buf) => {
    const key = buf.subarray(8, 20).toString('hex');
    const handler = pending.get(key);
    if (!handler) return;
    pending.delete(key);

    let off = 20;
    while (off + 4 <= buf.length) {
        const type = buf.readUInt16BE(off);
        const len = buf.readUInt16BE(off + 2);
        if (type === 0x0020 || type === 0x0001) {
            const raw = buf.subarray(off + 8, off + 12);
            let ip;
            if (type === 0x0020) {
                const cookie = buf.subarray(4, 8);
                ip = Array.from(raw).map((b, i) => b ^ cookie[i]).join('.');
            } else {
                ip = Array.from(raw).join('.');
            }
            const p = buf.readUInt16BE(off + 6) ^ (type === 0x0020 ? 0x2112 : 0);
            return handler({ ok: true, mapped: `${ip}:${p}` });
        }
        off += 4 + len + ((4 - (len % 4)) % 4);
    }
    handler({ ok: false, why: 'no mapped addr' });
});

const localPort = await bind(sock);
console.log('本地 socket 端口:', localPort, '\n');

const seen = [];
for (const [h, p] of targets) {
    const r = await query(h, p);
    console.log(`${h}:${p}`.padEnd(32), r.ok ? 'mapped=' + r.mapped : 'FAIL ' + r.why);
    if (r.ok) seen.push(r.mapped);
}

const ports = new Set(seen.map((s) => s.split(':')[1]));
const ips = new Set(seen.map((s) => s.split(':')[0]));

console.log('\n公网 IP 数:', ips.size, [...ips].join(','));
console.log('映射端口数:', ports.size, [...ports].join(','));
if (ports.size <= 1) {
    console.log('判定: Cone NAT（锥形） -> 公网玩家有直连可能');
} else {
    console.log('判定: Symmetric NAT（对称） -> 点对点直连基本不可行，必须 TURN 中继');
}
sock.close();
