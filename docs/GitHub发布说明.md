# 能不能上传到 GitHub？—— 能，已经传完了

**仓库地址：https://github.com/15266/DMC_V2-pixelstreaming**（Public）

结论：**代码进了仓库，610 MB 游戏包走 Release 附件。**
但"别人点开链接就玩"依然做不到，原因见第五节。

---

## 一、为什么游戏包不能提交进仓库

| 限制 | 数值 | 本包实际情况 |
|---|---|---|
| 仓库单文件硬限制 | **100 MB** | `Content/Paks/DMC_V2-Windows.ucas` **378 MB** ❌ |
| | | `Binaries/Win64/DMC_V2-Win64-Shipping.exe` **148 MB** ❌ |
| Release 附件单文件上限 | **2 GB** | 整包压缩后 **471 MiB** ✅ |

所以分工是：**仓库放代码和文档，Release 放游戏包。**

---

## 二、仓库里有什么（23 个文件，844 KB）

```
PSDeploy/
├── README.md                        完整部署说明
├── .gitignore                       排除 node_modules / logs / release / Packaged
├── docs/
│   ├── 崩溃修复报告.md              ActorSequenceComponent ensure 崩溃定位过程
│   ├── 重新打包命令.txt             RunUAT 命令行 + BuildConfiguration.xml 覆盖
│   ├── GPU云主机选型.md
│   └── GitHub发布说明.md            本文件
├── infra/
│   ├── package.json                 4 个 @epicgames-ps 依赖
│   ├── package-lock.json
│   └── signalling-server.mjs        信令服务器（8080 网页+玩家 / 8888 UE）
├── scripts/
│   ├── 01_setup_infra.bat           npm 安装 + esbuild 打包前端
│   ├── 02_start_signalling.bat
│   ├── 03_start_game.bat
│   ├── 04_start_all.bat
│   ├── 06_repackage.bat
│   ├── 07_make_release_zip.bat      生成 Release 用的压缩包
│   ├── 08_publish_release.mjs       调 GitHub API 上传 Release 附件
│   ├── test_player.mjs              假玩家，不用浏览器就能验证能出流
│   ├── test_stun.mjs
│   └── test_nat.mjs                 NAT 类型判定（对称/锥形）
└── web/
    ├── play.html                    中文游玩页
    └── lib/
        ├── entry.mjs
        └── frontend.js              esbuild 产物 678 KB（已入库，克隆即可用）
```

`frontend.js` 是构建产物但故意入库：克隆下来不用 `npm install` 就能起服务。

---

## 三、踩过的坑：curl 在这台机器上会说谎

排查过程中一度以为 GitHub 完全不通，因为：

```
curl https://github.com        -> 000
curl https://api.github.com    -> 000
```

**这是假阴性。** 实际原因：

1. 环境变量里有 `HTTPS_PROXY=http://127.0.0.1:52502`，那是沙箱残留的出口代理，早已失效，返回 `502`。
2. 即使绕过它，本机 `curl`（schannel 后端）在 TLS 握手的重协商阶段会卡住：
   `schannel: remote party requests renegotiation`。

换成别的客户端立刻正常：

| 客户端 | 结果 |
|---|---|
| `curl` | ❌ 000 / TLS 重协商卡死 |
| `git ls-remote` | ✅ 正常返回分支 |
| `node https` | ✅ `api.github.com` → 200、`uploads.github.com` → 302 |

**教训：判断"能不能连外网"不要只用 curl。至少用 `git ls-remote` 或 `node https` 复核一遍。**

另外代理要分清两个：

| 端口 | 是什么 | 能用吗 |
|---|---|---|
| `127.0.0.1:7890` | 你的 Clash（Edge 走的就是它） | ✅ 真正有效 |
| `127.0.0.1:52502` | 环境变量里残留的沙箱代理 | ❌ 502 |

git 需要显式指定走 7890：

```bat
git config http.proxy  http://127.0.0.1:7890
git config https.proxy http://127.0.0.1:7890
```

---

## 四、认证是怎么过的

GitHub 现在不接受账号密码推送，只有三条路：

| 方式 | 是否需要人工 | 本次结果 |
|---|---|---|
| Personal Access Token | 要，且创建时会触发 **sudo 模式**（需邮箱验证码） | 未采用 |
| GCM 浏览器 OAuth | 只需在浏览器点一次 **Authorize** | ✅ 用这个 |
| SSH key | 要先上传公钥 | 未采用 |

本次用的是 Git Credential Manager 的浏览器 OAuth：

```bat
git-credential-manager github login --browser --force
```

它会拉起一个 GitHub 授权页（`client_id=0120e057bd645470c1ed`，scope 固定为 `repo gist workflow`），
点 Authorize 后凭据存进 Windows 凭据管理器，之后 `git push` 不再询问。

验证凭据确实存好了：

```bat
printf "protocol=https\nhost=github.com\n\n" | git credential fill
```

预期看到 `username=15266` 和一行 `password=`（那就是 OAuth token，别外泄）。

> 想让令牌失效：GitHub → Settings → Applications → **Git Credential Manager** → Revoke。
> 之后重启对话重新授权即可。

---

## 五、上传 610 MB 附件

```bat
:: 1. 打压缩包（7-Zip 大约 35 秒）
scripts\07_make_release_zip.bat

:: 2. 取令牌到环境变量
for /f "delims=" %t in ('git credential fill ^< nul') do @echo %t

:: 3. 上传（脚本做了流式传输，不把 471 MB 读进内存）
set GH_TOKEN=<上一步的 password 值>
node scripts\08_publish_release.mjs release\DMC_V2_Windows_Shipping.zip v1.0.0 15266/DMC_V2-pixelstreaming
```

脚本行为：

- 仓库不可写 → 直接退出
- Release 已存在 → 复用，不报错
- 同名附件已存在 → 跳过，不重复占用配额
- 上传失败 → 最多重试 3 次
- 全程显示百分比进度

网络实在不稳时，退化方案：仓库页 → Releases → 编辑 → 直接把 zip 拖进浏览器。

---

## 六、为什么 GitHub 给不了"点开就玩"

GitHub Pages 是**静态托管**，只能发 HTML/CSS/JS。
`DMC_V2-Win64-Shipping.exe` 是 Win64 原生程序，依赖 DirectX 12 和显卡驱动，
浏览器没有能力执行它——把链接发出去，别人的浏览器只会下载到一个 exe。

跑游戏必须有一台**一直开着的 Windows + GPU 机器**在背后渲染。GitHub 不提供算力。

所以 GitHub 在这件事里的定位是：

- ✅ 代码托管与协作
- ✅ 游戏包分发（Release）
- ✅ 版本备份
- ❌ 在线游玩

## 七、真想给别人一个能玩的链接

两条路，都绕不开"一台有公网地址的 GPU 机器"：

1. **云 GPU 主机 + 像素流送**（推荐）
   阿里云/腾讯云抢占式 GPU 实例，把 `Packaged/Windows` 和 `PSDeploy` 一起搬上去，
   公网 IP + 放行 8080，得到 `http://<公网IP>:8080/`。
   选型见 `docs/GPU云主机选型.md`。

2. **现有机器 + 自建 TURN 中继**
   本机实测是对称 NAT（同一个 socket 对三个 STUN 分别映射 2847 / 2848 两个端口），
   WebRTC 点对点必失败，必须 TURN 转发媒体流。
   一台 1 核 2G 按流量计费的云服务器跑 coturn 就够，但 1080p60 每路约 8～15 Mbps。
   Cloudflare Tunnel / ngrok 这类只代理 HTTP 与信令，**救不了媒体流**。

---

## 八、上传前检查清单

- [x] `node_modules/` 已排除（否则 50 MB）
- [x] `infra/logs/` 已排除
- [x] `release/*.zip` 已排除
- [x] `../Packaged/` 已排除
- [x] 无 `.env`、无硬编码 token
- [x] `ICE_SERVERS` 走环境变量，未硬编码密钥
- [x] 全部 `.bat` 为纯 ASCII（Windows cmd 用 GBK 读，UTF-8 会破坏 `^` 续行）
