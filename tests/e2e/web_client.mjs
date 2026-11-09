// Kiểm thử PC Web thật: mở bản xuất Godot Web trong Chromium, tự đăng ký -> tạo nhân vật -> vào game, chụp màn hình.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://127.0.0.1:8080/play/index.html?autotest=1';
const out = process.argv[3] ?? 'web.png';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => { const t = m.text(); logs.push(t); if (t.includes('AUTOTEST') || /error/i.test(t)) console.log('[console]', t); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const t0 = Date.now();
await page.goto(url);
let result = null;
for (let i = 0; i < 120 && !result; i++) {
  await page.waitForTimeout(1000);
  const line = logs.find((l) => l.includes('KẾT QUẢ'));
  if (line) result = line;
}
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
console.log('thời gian:', Math.round((Date.now() - t0) / 1000), 'giây; kết quả:', result ?? 'không có');
await browser.close();
process.exit(result && result.includes('PASS') ? 0 : 1);
