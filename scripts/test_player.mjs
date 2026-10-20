// 假玩家：走完信令握手，验证流送端真的会回 WebRTC offer
import WebSocket from 'ws';

const url = process.env.WS_URL || 'ws://127.0.0.1:8080';
const ws = new WebSocket(url);
let done = false;

function send(obj) {
    ws.send(JSON.stringify(obj));
    console.log('  >>', JSON.stringify(obj).slice(0, 90));
}

function finish(code, why) {
    if (done) return;
    done = true;
    console.log(why);
    try { ws.close(); } catch {}
    setTimeout(() => process.exit(code), 200);
}

ws.on('open', () => console.log('connected', url));

ws.on('message', (buf) => {
    let m;
    try { m = JSON.parse(buf.toString()); } catch { return; }
    const t = m.type || '?';
    let extra = '';
    if (t === 'offer') extra = ' sdpLen=' + (m.sdp || '').length;
    if (t === 'streamerList') extra = ' ' + JSON.stringify(m.ids);
    console.log('  <<', t + extra);

    if (t === 'config') {
        send({ type: 'listStreamers' });
    } else if (t === 'streamerList') {
        const ids = m.ids || [];
        if (!ids.length) return finish(2, 'FAIL: 没有可用流送端');
        send({ type: 'subscribe', streamerId: ids[0] });
    } else if (t === 'offer') {
        finish(0, 'PASS: 收到 offer，流送端已就绪并能出画面');
    } else if (t === 'subscribeFailed' || t === 'error') {
        finish(3, 'FAIL: ' + JSON.stringify(m));
    }
});

ws.on('error', (e) => finish(4, 'FAIL ws error: ' + e.message));

setTimeout(() => finish(5, 'TIMEOUT: 20s 内没收到 offer'), 20000);
