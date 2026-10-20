# 能不能上传到 GitHub？—— 能，但要分清"传什么"

结论先给：**GitHub 可以放这套部署套件（代码+文档），不能让人"点开链接就玩"。**

## 一、三个必须说清的限制

| 想法 | 可行性 | 原因 |
|---|---|---|
| 用 GitHub Pages 挂个链接，别人点开就玩 | ❌ 不可能 | Pages 只能托管**静态文件**，浏览器拿不到也能不执行 `DMC_V2-Win64-Shipping.exe`。跑游戏必须有台一直开着的 Windows + GPU 机器 |
| 把 `Packaged/` 直接提交进仓库 | ❌ 不行 | GitHub 单文件硬限制 **100 MB**。实测有两个文件超标：<br>`Content/Paks/DMC_V2-Windows.ucas` **378 MB**<br>`Binaries/Win64/DMC_V2-Win64-Shipping.exe` **148 MB** |
| 把 610 MB 整包作为 **Release 附件** | ✅ 可以 | Release 单文件上限 **2 GB**，610 MB 完全放得下。别人下载解压后在本机跑 |

所以 GitHub 在这里的角色是 **分发渠道 + 代码备份**，不是游玩平台。

## 二、仓库里放什么（约 26 MB）

`.gitignore` 已排除 `node_modules/`、`logs/`、`Packaged/`、`*.zip`，实际入库内容：

```
PSDeploy/
├── README.md                  完整部署说明
├── .gitignore
├── docs/
│   ├── 崩溃修复报告.md          ActorSequenceComponent ensure 崩溃的定位过程
│   ├── 重新打包命令.txt        RunUAT 命令行 + BuildConfiguration.xml 覆盖
│   └── GitHub发布说明.md       本文件
├── infra/
│   ├── package.json           4 个 @epicgames-ps 依赖
│   ├── package-lock.json
│   └── signalling-server.mjs  自定义信令服务器（8080 网页+玩家 / 8888 UE）
├── scripts/
│   ├── 01_setup_infra.bat      npm 安装 + esbuild 打包前端
│   ├── 02_start_signalling.bat
│   ├── 03_start_game.bat
│   ├── 04_start_all.bat
│   ├── 06_repackage.bat
│   ├── 07_make_release_zip.bat 生成 Release 用的 610 MB 压缩包
│   ├── test_player.mjs         假玩家，不需要浏览器就能验证能出流
│   ├── test_stun.mjs
│   └── test_nat.mjs            NAT 类型判定（对称/锥形）
└── web/
    ├── play.html               中文游玩页
    └── lib/
        ├── entry.mjs
        └── frontend.js         esbuild 产物 695 KB（已入库，克隆即可用）
```

## 三、当前状态：**推不上去**

本机实测（办公网）：

```
github.com         -> 000
api.github.com     -> 000
codeload.github.com-> 000
```

`000` 表示 TCP 连接根本没建立，不是 404/403。`git` 已安装（2.55.0），但网络到不了。
**必须开 VPN/代理才能 push。** 开好后先自测一句：

```bat
curl -o NUL -s -w "%{http_code}\n" https://github.com
```

返回 `200` 才算通。

## 四、VPN 通了之后的完整流程

### 1. 建远程仓库
网页上 https://github.com/new 建一个空仓库（**不要**勾选 README/.gitignore/LICENSE，避免首次冲突），
假设叫 `DMC_V2-pixelstreaming`，账号 `yourname`。

### 2. 本地已初始化好，只差 remote
仓库已经在 `PSDeploy/` 里 ready（见下方"已完成"清单），执行：

```bat
cd /d E:\ue_test\mt\DMC_V2\PSDeploy
git remote add origin https://github.com/yourname/DMC_V2-pixelstreaming.git
git branch -M main
git push -u origin main
```

### 3. 传 610 MB 游戏包（Release 附件）
```bat
scripts\07_make_release_zip.bat
gh release create v1.0 release\DMC_V2_Windows_Shipping.zip --title "DMC_V2 Shipping (PixelStreaming2)"
```
没装 `gh` 就网页操作：仓库 → Releases → Draft a new release → 拖入 zip。

> 上传 610 MB 走 HTTPS 大约 5～20 分钟（取决于上行带宽）。
> 如果中途反复失败，可以先分卷再传：
> `powershell Compress-Archive` 出来的单文件若被墙掐断，改用 7-Zip 分卷 `-v100m`，
> 每个分卷都远小于限制，下载者合并解压即可。

### 4. 别人拿到之后怎么跑
下载 zip → 解压 → 装 VC++ 运行库与 DirectX → 双击 `DMC_V2.exe`。
**这需要对方也有能跑 DX12 的 Windows 机器 + 独立显卡**，不是"点链接就玩"。

## 五、安全提醒（很重要）

上传前确认仓库里**没有**这些东西：

- `DMC_V2/Content/` 里的美术/关卡资产（如果你只传 `PSDeploy/`，天然没有）
- 任何 `.env`、token、私有 STUN/TURN 账号密码
- `infra/logs/`（已在 .gitignore 里，但首次 `git add` 前建议 `git status` 看一眼）

`signture-server.mjs` 里没有硬编码密钥，`ICE_SERVERS` 走环境变量，可以安全公开。

## 六、如果目标是"让别人点开就玩"

GitHub 帮不上，只有两条路：

1. **云 GPU 主机 + 像素流送**（正经方案）
   阿里云/腾讯云 GPU 抢占式实例，把 `Packaged/Windows` 和 `PSDeploy` 一起搬上去，
   公网 IP + 开放 8080，得到 `http://<公网IP>:8080/` 这种真链接。
   选型见 `docs/GPU云主机选型.md`。

2. **自建 TURN 中继**（在现有机器上硬撑）
   本机是对称 NAT，WebRTC 直连必失败，必须有公网 TURN 服务器转发媒体流。
   一台最低配 1 核 2G + 按流量计费的云服务器就够（coturn），
   但带宽成本高：1080p60 大约 8～15 Mbps/人。

这两条都绕不开"一台有公网地址的机器"这个前提。GitHub 提供不了。
