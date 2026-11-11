/* global document, getComputedStyle, innerWidth */
// Run against a built documentation site; see --root/--base/--playwright/--browser/--out arguments.
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

const opt = (name) => {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}
const root = opt('--root')
const label = opt('--label')
const out = opt('--out')
const prefix = opt('--base') || '/'
const { chromium } = require(opt('--playwright'))
const executablePath = opt('--browser')
const requireShared = process.argv.includes('--shared-sidebar')
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}
const sha = (p) =>
  crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (!rel.startsWith(prefix)) {
      res.writeHead(404).end()
      return
    }
    rel = rel.slice(prefix.length)
    if (rel.endsWith('/') || !rel) rel += 'index.html'
    const target = path.resolve(root, rel)
    if (
      !target.startsWith(path.resolve(root) + path.sep) ||
      !fs.existsSync(target) ||
      !fs.statSync(target).isFile()
    ) {
      res.writeHead(404).end()
      return
    }
    res.setHeader(
      'Content-Type',
      mime[path.extname(target)] || 'application/octet-stream',
    )
    res.end(fs.readFileSync(target))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}${prefix}`
  let browser
  const report = {
    time: new Date().toISOString(),
    label,
    root,
    base,
    pages: [],
  }
  try {
    browser = await chromium.launch({ executablePath, headless: true })
    report.browser = browser.version()
    for (const route of (
      opt('--routes') || 'index.html,upgrade/global/upgrade_global_cluster.html'
    ).split(',')) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      })
      const errors = []
      const sidebarRequests = []
      page.on('pageerror', (error) => errors.push(String(error)))
      page.on('console', (message) => {
        if (
          message.type() === 'error' &&
          /hydrat|Minified React|Uncaught/.test(message.text())
        )
          errors.push(message.text())
      })
      page.on('response', (r) => {
        if (r.url().includes('/static/sidebar'))
          sidebarRequests.push({
            path: new URL(r.url()).pathname,
            status: r.status(),
          })
      })
      const response = await page.goto(base + route, {
        waitUntil: 'networkidle',
      })
      await page.waitForTimeout(1200)
      const measure = await page.evaluate(() => {
        const box = (selector) => {
          const e = document.querySelector(selector)
          if (!e) return null
          const r = e.getBoundingClientRect()
          const c = getComputedStyle(e)
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            display: c.display,
            position: c.position,
          }
        }
        return {
          container: box('.rp-doc-layout__container'),
          sidebar: box('.rp-doc-layout__sidebar'),
          doc: box('.rp-doc-layout__doc'),
          outline: box('.rp-doc-layout__outline'),
          sidebarLinks: document.querySelectorAll('.rp-doc-layout__sidebar a')
            .length,
          installHeadings: [...document.querySelectorAll('main h2')].filter(
            (e) => e.textContent.replace(/#/g, '').trim() === 'Install',
          ).length,
          activeLinks: [
            ...document.querySelectorAll('.rp-doc-layout__sidebar a'),
          ]
            .filter((e) => e.className.includes('active'))
            .map((e) => e.textContent),
          activeVisible: [
            ...document.querySelectorAll('.rp-doc-layout__sidebar a'),
          ]
            .filter((e) => e.className.includes('active'))
            .every((e) => {
              for (let p = e.parentElement; p; p = p.parentElement) {
                if (
                  getComputedStyle(p).overflow === 'hidden' &&
                  p.getBoundingClientRect().height < 1
                )
                  return false
              }
              return true
            }),
          htmlWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }
      })
      const screenshot = path.join(
        out,
        `${label}-${route === 'index.html' ? 'home' : 'deep'}-full.png`,
      )
      await page.screenshot({ path: screenshot, fullPage: true })
      const { container: c, sidebar: s, doc: d, outline: o } = measure
      const checks = {
        threeColumns: !!(
          c &&
          s &&
          d &&
          o &&
          c.display === 'flex' &&
          s.width > 200 &&
          o.width > 150 &&
          d.x >= s.x + s.width - 1 &&
          o.x >= d.x + d.width - 1 &&
          o.y < 250
        ),
        singleInstall: route !== 'index.html' || measure.installHeadings === 1,
        noPageErrors: errors.length === 0,
        sidebarMounted: measure.sidebarLinks > 0,
        activeVisible: measure.activeLinks.length > 0 && measure.activeVisible,
        sharedSidebar:
          !requireShared ||
          sidebarRequests.some(
            (r) =>
              /sidebar\.[0-9a-f]{64}\.json$/.test(r.path) && r.status === 200,
          ),
      }
      report.pages.push({
        route,
        status: response.status(),
        htmlSha256: sha(path.join(root, route)),
        measure,
        errors,
        sidebarRequests,
        checks,
        screenshot,
        screenshotSha256: sha(screenshot),
      })
      console.log(
        label,
        route,
        JSON.stringify({ measure, errors, sidebarRequests, checks }),
      )
      await page.close()
    }
  } finally {
    if (browser) await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
  const reportFile = path.join(out, `${label}-layout.json`)
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n')
  for (const page of report.pages)
    for (const [check, passed] of Object.entries(page.checks))
      assert.ok(passed, `${page.route}: ${check}`)
})().catch((e) => {
  console.error(e)
  process.exitCode = e.code === 'ERR_ASSERTION' ? 1 : 2
})
