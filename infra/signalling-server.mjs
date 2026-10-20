// DMC_V2 像素流送信令服务器
// 基于 Epic 官方 @epicgames-ps/lib-pixelstreamingsignalling-ue5.5
// 网页与 WebSocket 共用 8080 端口；UE 流送端连 8888 端口。

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

import {
    Logger,
    InitLogging,
    SignallingServer,
    WebServer
} from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.5';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- 配置 ----------
const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8080); // 玩家网页 / WebSocket
const STREAMER_PORT = Number(process.env.STREAMER_PORT ?? 8888); // UE 连进来
const WEB_ROOT = process.env.WEB_ROOT ?? path.resolve(__dirname, '..', 'web');
const HOME_PAGE = process.env.HOME_PAGE ?? 'play.html';
const MAX_PLAYERS = Number(process.env.MAX_PLAYERS ?? 4);

// ICE 服务器。
// 默认填入国内实测可达的 STUN（stun.l.google.com 在国内通常被墙，别用）。
// 只靠 STUN 只能在"至少一侧是锥形 NAT"时打通；两侧都对称 NAT 必须有 TURN。
// 自建 TURN（coturn）后通过环境变量覆盖：
//   set ICE_SERVERS=[{"urls":"stun:你的IP:3478"},{"urls":"turn:你的IP:3478","username":"u","credential":"p"}]
const DEFAULT_ICE = [
    { urls: 'stun:stun.miwifi.com:3478' },
    { urls: 'stun:stun.chat.bilibili.com:3478' },
    { urls: 'stun:stun.hitv.com:3478' }
];

const ICE_SERVERS = process.env.ICE_SERVERS
    ? JSON.parse(process.env.ICE_SERVERS)
    : DEFAULT_ICE;

// ---------- 日志 ----------
InitLogging({
    logDir: path.resolve(__dirname, 'logs'),
    logMessagesToConsole: 'true',
    logLevelConsole: 'info',
    logLevelFile: 'debug'
});

// ---------- 网页服务 ----------
const app = express();

const webServer = new WebServer(app, {
    httpPort: HTTP_PORT,
    root: WEB_ROOT,
    homepageFile: HOME_PAGE,
    serveStatic: true,
    perMinuteRateLimit: 6000,
    cors: {
        enabled: true,
        allowedOrigins: [] // 空 = 允许全部来源
    }
});

// ---------- 信令服务 ----------
const signalling = new SignallingServer({
    httpServer: webServer.httpServer, // 玩家 ws 复用 8080
    streamerPort: STREAMER_PORT, // UE 端连 8888
    peerOptions: { iceServers: ICE_SERVERS },
    maxSubscribers: MAX_PLAYERS
});

// ---------- 状态 REST ----------
app.get('/api/status', (_req, res) => {
    const streamers = signalling.streamerRegistry.streamers;
    const players = signalling.playerRegistry.players;
    res.json({
        ok: true,
        streamers: Array.isArray(streamers) ? streamers.length : 0,
        players: players && typeof players.size === 'number' ? players.size : 0,
        uptimeSec: Math.round((Date.now() - signalling.startTime.getTime()) / 1000)
    });
});

Logger.info('==================================================');
Logger.info('  DMC_V2 像素流送信令服务器已启动');
Logger.info(`  玩家入口 : http://<本机IP>:${HTTP_PORT}/`);
Logger.info(`  流送端口 : ws://<本机IP>:${STREAMER_PORT}   (UE 启动参数指向这里)`);
Logger.info(`  网页目录 : ${WEB_ROOT}`);
Logger.info('==================================================');

const shutdown = () => {
    Logger.info('正在关闭服务器...');
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
