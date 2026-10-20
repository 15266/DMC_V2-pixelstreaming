# DMC_V2 在线游玩部署套件（像素流送 / Pixel Streaming）

本目录用于把 `DMC_V2` 这个 **UE 5.5 Windows 原生程序** 通过网页让别人实时游玩。
信令与前端全部通过 npm（npmmirror 镜像）获取，**不需要访问 github.com**。

## 当前状态：本地链路已全程验证通过

| 环节 | 结果 |
|---|---|
| 信令服务器 `signalling-server.mjs` | ✅ 监听 8080（网页+玩家 ws）与 8888（UE 接入） |
| 网页服务 | ✅ `GET /` → 200 / 9335 B，`/lib/frontend.js` → 200 / 694607 B |
| 游戏接入 | ✅ 连上信令，识别为 `DefaultStreamer`，ping/pong 正常 |
| 玩家订阅 | ✅ 模拟玩家拿到真实 `offer`（SDP 2965 B） |
| 游戏启动崩溃 | ✅ 已消除（改为 Shipping 打包，见下） |

实测 `/api/status` 返回 `{"ok":true,"streamers":1,"players":0,...}`。

> 注意：为保证 cook 通过，当前包是 **`-clientconfig=Shipping`** 打的。
> Shipping 会关闭 UE 日志文件，所以 `-log` 不再产生 `Saved\Logs\*.log`；
> 排查请用信令服务器控制台和 `/api/status`。
> 细节与取舍见 `docs/崩溃修复报告.md`。

---

## 一、原理：为什么不是"上传到网站"

`DMC_V2_Windows.zip` 里是 Win64 原生可执行文件，依赖 DirectX 12 与 Windows 图形驱动。
浏览器无法加载执行它；UE5 也**没有**官方 HTML5 导出（4.24 起移除）。

浏览器实时游玩的唯一官方路径是 **Pixel Streaming（像素流送）**：

```
   浏览器 ──WebRTC 视频+输入──▶ 云端 Windows GPU 主机
      ▲                              │
      └──── 低延迟 H.264 编码 ◀──── DMC_V2.exe 原样运行
```

画面在云主机渲染并实时编码推流，键鼠事件反向回传。**在网址里玩，游戏本体跑在云端 GPU 上。**

---

## 二、端口规划

| 端口 | 用途 | 谁连 |
|---|---|---|
| **8080** | 玩家网页 + 玩家 WebSocket（共用同一端口） | 浏览器 |
| **8888** | UE 流送端接入信令 | DMC_V2.exe |

自定义信令服务器 `infra/signalling-server.mjs` 基于 Epic 官方
`@epicgames-ps/lib-pixelstreamingsignalling-ue5.5`，把 Express 静态托管与玩家
WebSocket 合并在 8080，UE 端单独走 8888。

---

## 三、目录结构

```
PSDeploy/
├── scripts/
│   ├── 01_setup_infra.bat       npm 安装依赖 + esbuild 打包前端库
│   ├── 02_start_signalling.bat  启动信令服务器（http://:8080 + ws://:8888）
│   ├── 03_start_game.bat        以像素流送模式启动 DMC_V2.exe
│   ├── 04_start_all.bat         一键：信令 + 游戏
│   ├── 06_repackage.bat         带 PixelStreaming2 重新打包游戏
│   ├── 07_make_release_zip.bat  生成 Release 附件用的 610MB 压缩包
│   ├── test_player.mjs          假玩家：验证流送端能出流（不需要浏览器）
│   ├── test_stun.mjs            单个 STUN 连通性探测
│   └── test_nat.mjs             NAT 类型判定（对称 / 锥形）
├── web/
│   ├── play.html                自定义中文游玩页（入口）
│   └── lib/
│       ├── entry.mjs            前端库打包入口
│       └── frontend.js          esbuild 产物（约 680 KB）
├── infra/
│   ├── package.json             npm 依赖清单（4 个 @epicgames-ps 包）
│   ├── signalling-server.mjs    自定义信令服务器
│   └── node_modules/            已安装（135 个包）
└── docs/
    ├── 崩溃修复报告.md
    ├── 重新打包命令.txt
    ├── GPU云主机选型.md
    └── GitHub发布说明.md         能不能传 GitHub / 传什么 / 怎么传
```

> 想把这套东西备份或分享到 GitHub？看 `docs/GitHub发布说明.md`。
> 一句话：**代码可以进仓库（仅 844 KB），610 MB 游戏包必须走 Releases（单文件上限 2 GB）。**

---

## 四、使用流程

### 第 1 步：安装依赖与打包前端库

```bat
scripts\01_setup_infra.bat
```

用 npmmirror 镜像安装信令服务器依赖，并用 esbuild 把浏览器端库打成
`web\lib\frontend.js`（暴露 `window.pixelstreaming`）。

### 第 2 步：确认游戏包已带 PixelStreaming2

Shipping 是**单体构建**，插件模块直接链进 `DMC_V2-Win64-Shipping.exe`，
**不会产生 `PixelStreaming*.dll`**。判断插件是否真的生效，看插件内容是否被 cook：

```bat
dir "E:\ue_test\mt\DMC_V2\Packaged\Windows\DMC_V2\Samples\PixelStreaming2"
```

有 `WebServers` 目录即说明插件已启用。若缺失则重新打包：

```bat
scripts\06_repackage.bat
```

> 首次启用插件需编译 PixelStreaming2 与 WebRTC 模块。
> 本机实测整包约 20 分钟（编译链接 ~4 min + cook 2 min + stage 75 s）。
> **本机必须保留 `BuildConfiguration.xml` 里的三项覆盖**，否则 Shipping 会因
> MSVC `C1056 / CVT1111 / LNK1123`（确定性构建写时间戳被拒）而失败，
> 详见 `docs/重新打包命令.txt`。

### 第 3 步：启动

```bat
scripts\04_start_all.bat
```

或分步：`02_start_signalling.bat` → `03_start_game.bat`。

### 第 4 步：访问

浏览器打开 `http://<服务器IP>:8080/`，点"进入游戏"。

覆盖信令地址（一般不需要，默认与页面同源）：

```
http://<服务器IP>:8080/?ws=ws://203.0.113.10:8080
```

---

## 五、对外网开放

云主机安全组 / 防火墙放行 **8080**（网页+玩家信令）与 **8888**（UE 接入）。

> 8888 只需要云主机本机访问，可以只对内网/本机开放；8080 必须对玩家开放。

| 端口 | 协议 | 是否必须公网 |
|---|---|---|
| 8080 | TCP（HTTP + WebSocket） | **是** |
| 8888 | TCP（WebSocket） | 否（仅 UE 本机/内网） |
| UDP 动态端口 | WebRTC 媒体 | 否（缺失会回落 TURN 中继，延迟变高） |

### 最大的拦路虎：NAT 类型（不是 HTTPS）

先跑一次实测，别猜：

```bat
cd PSDeploy\scripts
node test_nat.mjs
```

它用**同一个本地 socket**去问多个 STUN 服务器，比对映射端口：

| 结果 | 含义 |
|---|---|
| 映射端口一致（Cone NAT） | 公网玩家有机会直连，STUN 足够 |
| 映射端口不同（Symmetric NAT） | **点对点无法建立，必须 TURN 中继** |

本机（办公网 10.12.21.138）实测：

```
stun.miwifi.com:3478          mapped=103.91.179.102:57316
stun.chat.bilibili.com:3478   mapped=103.91.179.102:57317
stun.hitv.com:3478            mapped=103.91.179.102:57318
判定: Symmetric NAT（对称） -> 必须 TURN 中继
```

结论：这台机器**不能**直接对外提供公网游玩链接。
隧道（花生壳 / ngrok / Cloudflare Tunnel）只能代理网页与信令，
视频流是浏览器与游戏之间的 WebRTC 直连，对称 NAT 下必然失败，
且隧道挡不住这一点。要么换到有公网 IP 的云主机，要么自建 TURN。

### 关于 HTTPS

HTTPS 不是能否连上的原因（`RTCPeerConnection` 在 http 源下可用），
但仍然建议上 TLS，原因有两个：

1. 若页面是 `https://`，浏览器会禁止连 `ws://`（混合内容），必须改 `wss://`
   —— `play.html` 已按 `location.protocol` 自动切换，隧道/反代做了 TLS 就不用改代码。
2. 麦克风、剪贴板等能力确实只在安全上下文开放（本项目不用这些，但以后加语音会需要）。

### ICE / NAT 穿透

`signalling-server.mjs` 默认 `ICE_SERVERS` 为空（适合云主机有公网 IP 的场景）。
若客户端处于对称 NAT 后导致连不上，自建 coturn 并通过环境变量注入：

```bat
set ICE_SERVERS=[{"urls":"stun:1.2.3.4:3478"},{"urls":"turn:1.2.3.4:3478","username":"u","credential":"p"}]
```

---

## 六、可调参数

`03_start_game.bat` 命令行（UE 5.5 `PixelStreaming2` 解析）：

| 参数 | 作用 |
|---|---|
| `-PixelStreamingSignallingURL=ws://host:8888` | 信令服务器地址 |
| `-RenderOffScreen` | 不在本机开窗口（无显示器服务器必需） |
| `-Unattended` | 不接受本地键鼠，纯串流模式 |
| `-AllowPixelStreamingCommands` | 允许浏览器控制台下发 exec |
| `-ResX=1920 -ResY=1080` | 云端渲染分辨率 |

常用控制台变量：

- `PixelStreaming2.Encoder.QualityPreset` / `QualityScale`
- `PixelStreaming2.Encoder.LatencyMode`（`LowLatency` / `Balanced` / `HighQuality`）
- `PixelStreaming2.WebRTC.NegotiateCodecs`

---

## 七、常见问题

**Q：页面一直"正在连接…"**
A：游戏没起来或没连上信令。
先看信令服务器控制台：正常应出现 `New streamer connection` 并在
`http://<host>:8080/api/status` 里看到 `"streamers":1`。
再跑 `node PSDeploy\scripts\test_player.mjs` 确认能拿到 `offer`。
Shipping 包不写日志文件，所以不要指望 `Saved\Logs\DMC_V2.log`。

**Q：打包报 `C1056` / `CVT1111` / `LNK1123`**
A：Shipping 默认开确定性构建（`/experimental:deterministic` + `/Brepro`），
本机对 COFF 时间戳重写返回 ACCESS_DENIED。
在 `%APPDATA%\Unreal Engine\UnrealBuildTool\BuildConfiguration.xml` 里加
`<bDeterministic>false</bDeterministic>` 即可，详见 `docs/重新打包命令.txt`。

**Q：游戏启动即崩（precompiled movie scene）**
A：见 `docs/崩溃修复报告.md`：`BH_BP_Player` 里的 `ActorSequenceComponent`
会让 `MovieSceneSequence.cpp` 的 ensure 触发。当前用 Shipping 打包绕开
（该 ensure 在 `#if DO_CHECK` 内）。想在 Development 下也正常，需要手动在编辑器里
删掉该组件和随之悬空的 3 个节点。

**Q：画面卡顿 / 延迟大**
A：检查上行带宽（建议 ≥ 20 Mbps）；降低 `-ResX/-ResY` 与 `QualityScale`，或部署 TURN 中继。

**Q：能不能上传到 GitHub，让别人点链接就玩？**
A：分两件事。
**传代码可以**：`PSDeploy/` 去掉 `node_modules` 只有 **844 KB**，正常 push 即可。
**点链接就玩不行**：GitHub Pages 只能托管静态文件，浏览器无法执行
`DMC_V2-Win64-Shipping.exe`；而且仓库单文件硬限制 100 MB，
本包的 `.ucas` 有 378 MB、`.exe` 有 148 MB，**提交不进去**。
610 MB 整包只能作为 **Release 附件**（上限 2 GB），别人下载后在本机跑。
详见 `docs/GitHub发布说明.md`。

**Q：提示"前端库未加载"**
A：`web\lib\frontend.js` 缺失，重跑 `01_setup_infra.bat`。
