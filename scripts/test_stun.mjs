// 测 STUN：能否拿到 server-reflexive 候选（决定公网玩家能否建立媒体通道）
import dgram from 'dgram';
import crypto from 'crypto';

const servers = [
    ['stun.miwifi.com', 3478],
    ['stun.chat.bilibili.com', 3478],
    ['stun.hitv.com', 3478],
    ['stun.l.google.com', 19302],
];

function test(host, port, timeoutMs = 4000) {
    return new Promise((resolve) => {
        const sock = dgram.createSocket('udp4');
        const tid = crypto.randomBytes(12);
        const req = Buffer.alloc(20);
        req.writeUInt16BE(0x0001, 0);       // Binding Request
        req.writeUInt16BE(0x0000, 2);       // length
        req.writeUInt32BE(0x2112a442, 4);   // magic cookie
        tid.copy(req, 8);

        let done = false;
        const finish = (r) => {
            if (done) return;
            done = true;
            try { sock.close(); } catch {}
            resolve(r);
        };

        sock.on('message', (buf) => {
            // 找 XOR-MAPPED-ADDRESS (0x0020) 或 MAPPED-ADDRESS (0x0001)
            let off = 20;
            while (off + 4 <= buf.length) {
                const type = buf.readUInt16BE(off);
                const len = buf.readUInt16BE(off + 2);
                if (type === 0x0020 || type === 0x0001) {
                    const fam = buf[off + 5];
                    let ip;
                    if (fam === 0x01) {
                        const raw = buf.subarray(off + 8, off + 12);
                        if (type === 0x0020) {
                            const cookie = buf.subarray(4, 8);
                            ip = Array.from(raw).map((b, i) => b ^ cookie[i]).join('.');
                        } else {
                            ip = Array.from(raw).join('.');
                        }
                        const p = buf.readUInt16BE(off + 6) ^ (type === 0x0020 ? 0x2112 : 0);
                        return finish({ ok: true, mapped: `${ip}:${p}` });
                    }
                }
                off += 4 + len + ((4 - (len % 4)) % 4);
            }
            finish({ ok: false, why: 'no mapped address in reply' });
        });

        sock.on('error', (e) => finish({ ok: false, why: e.code || e.message }));
        sock.send(req, 0, req.length, port, host, (err) => {
            if (err) finish({ ok: false, why: err.code || err.message });
        });
        setTimeout(() => finish({ ok: false, why: 'timeout (UDP blocked?)' }), timeoutMs);
    });
}

for (const [h, p] of servers) {
    const r = await test(h, p);
    console.log(`${h}:${p}  ->  ${r.ok ? 'OK  mapped=' + r.mapped : 'FAIL ' + r.why}`);
}
