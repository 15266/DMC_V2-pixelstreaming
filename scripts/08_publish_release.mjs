#!/usr/bin/env node
/**
 * 08_publish_release.mjs —— 把打包产物作为 GitHub Release 附件上传
 *
 * 为什么需要这个脚本：
 *   GitHub 仓库里单个文件硬限制 100 MB，而 DMC_V2 的 .ucas 有 378 MB、
 *   Shipping.exe 有 148 MB，**提交不进仓库**。Release 附件允许 2 GB/文件，
 *   所以 610 MB 的整包只能走 Release。
 *
 * 令牌从哪来：
 *   不要写死在文件里。用环境变量 GH_TOKEN。
 *   若本机已用 Git Credential Manager 授权过，可以直接这样取：
 *     export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | sed -n 's/^password=//p')
 *
 * 用法：
 *   node 08_publish_release.mjs <压缩包路径> [tag] [owner/repo]
 *   node 08_publish_release.mjs release/DMC_V2_Windows_Shipping.zip v1.0.0 15266/DMC_V2-pixelstreaming
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const API_HOST = 'api.github.com';
const UPLOAD_HOST = 'uploads.github.com';

const [, , fileArg, tagArg, repoArg] = process.argv;
const FILE = fileArg && path.resolve(fileArg);
const TAG = tagArg || 'v1.0.0';
const REPO = repoArg || '15266/DMC_V2-pixelstreaming';
const TOKEN = process.env.GH_TOKEN;

if (!TOKEN) {
  console.error('[FATAL] 缺少 GH_TOKEN 环境变量');
  process.exit(1);
}
if (!FILE || !fs.existsSync(FILE)) {
  console.error(`[FATAL] 文件不存在: ${FILE}`);
  process.exit(1);
}

const SIZE = fs.statSync(FILE).size;
const NAME = path.basename(FILE);

function fmt(n) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`;
}

/** 通用 JSON 请求（走 api.github.com） */
function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = https.request(
      {
        host: API_HOST,
        path: urlPath,
        method,
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'DMC_V2-release',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {})
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            /* 非 JSON 响应 */
          }
          resolve({ status: res.statusCode, json, text });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/** 流式上传附件，不做整文件读入内存 */
function uploadAsset(releaseId, attempt = 1) {
  return new Promise((resolve) => {
    const labels = { 'Content-Type': 'application/zip', 'Content-Length': SIZE };
    const q = `?name=${encodeURIComponent(NAME)}`;
    const req = https.request(
      {
        host: UPLOAD_HOST,
        path: `/repos/${REPO}/releases/${releaseId}/assets${q}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'DMC_V2-release',
          ...labels
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            /* ignore */
          }
          resolve({ status: res.statusCode, json, text });
        });
      }
    );

    let sent = 0;
    let lastPct = -1;
    const stream = fs.createReadStream(FILE);
    stream.on('data', (chunk) => {
      sent += chunk.length;
      const pct = Math.floor((sent / SIZE) * 100);
      if (pct !== lastPct && pct % 5 === 0) {
        lastPct = pct;
        console.log(`  上传中 ${String(pct).padStart(3)}%  ${fmt(sent)} / ${fmt(SIZE)}`);
      }
    });
    stream.on('error', (e) => {
      console.error('[上传失败] 读文件出错:', e.message);
      req.destroy();
      resolve({ status: 0, error: e.message });
    });
    req.on('error', (e) => {
      console.error(`[上传失败] 第 ${attempt} 次: ${e.message}`);
      resolve({ status: 0, error: e.message });
    });
    stream.pipe(req);
  });
}

const main = async () => {
  console.log(`仓库 : ${REPO}`);
  console.log(`标签 : ${TAG}`);
  console.log(`文件 : ${NAME}  (${fmt(SIZE)})`);
  console.log('');

  // 1. 仓库是否存在
  const repo = await api('GET', `/repos/${REPO}`);
  if (repo.status !== 200) {
    console.error(`[FATAL] 读不到仓库 ${REPO}: HTTP ${repo.status} ${repo.text.slice(0, 200)}`);
    process.exit(1);
  }
  console.log(`✓ 仓库可写: ${repo.json.full_name} (${repo.json.private ? '私有' : '公开'})`);

  // 2. 建 Release（已存在则复用）
  let release = await api('POST', `/repos/${REPO}/releases`, {
    tag_name: TAG,
    name: `DMC_V2 Windows Shipping (${TAG})`,
    body: [
      '## DMC_V2 像素流送版 Windows 包',
      '',
      'UE 5.5.4 `-clientconfig=Shipping` 打包，已启用 PixelStreaming2 插件。',
      '',
      '### 使用',
      '1. 解压本压缩包',
      '2. 双击 `DMC_V2.exe` 直接本机玩',
      '3. 想做网页串流：配合仓库里的 `scripts/04_start_all.bat` 使用',
      '',
      '### 注意',
      '- 需要支持 DirectX 12 的 Windows 10/11 与独立显卡',
      '- 若要对外提供网页游玩链接，服务端需有公网 IP；对称 NAT 下必须自建 TURN 中继'
    ].join('\n'),
    draft: false,
    prerelease: false
  });

  if (release.status === 422) {
    console.log('  标签已存在，复用现有 Release');
    release = await api('GET', `/repos/${REPO}/releases/tags/${TAG}`);
  }
  if (release.status >= 300) {
    console.error(`[FATAL] 建 Release 失败: HTTP ${release.status} ${release.text.slice(0, 300)}`);
    process.exit(1);
  }

  const releaseId = release.json.id;
  console.log(`✓ Release id=${releaseId}  ${release.json.html_url}`);

  // 3. 已传过同名附件则跳过
  const assets = await api('GET', `/repos/${REPO}/releases/${releaseId}/assets`);
  if (assets.status === 200) {
    const exist = assets.json.find((a) => a.name === NAME);
    if (exist) {
      console.log(`✓ 附件已存在，跳过上传: ${exist.browser_download_url}`);
      return;
    }
  }

  // 4. 上传（最多 3 次）
  for (let i = 1; i <= 3; i++) {
    console.log(`\n上传附件（第 ${i} 次尝试）...`);
    const r = await uploadAsset(releaseId, i);
    if (r.status === 201) {
      console.log(`\n✓ 上传完成: ${r.json.browser_download_url}`);
      console.log(`  下载地址：${r.json.browser_download_url}`);
      return;
    }
    console.error(`  HTTP ${r.status} ${(r.text || '').slice(0, 200)}`);
    if (i < 3) console.log('  2 秒后重试...'), await new Promise((s) => setTimeout(s, 2000));
  }
  console.error('\n[FATAL] 三次都失败。');
  console.error('提示：网络不稳时可改用浏览器上传 —— 仓库页 → Releases → 编辑 Release → 拖入文件。');
  process.exit(1);
};

main().catch((e) => {
  console.error('[FATAL]', e);
  process.exit(1);
});
