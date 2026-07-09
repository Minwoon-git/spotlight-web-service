// 빌드 후 실행 — Firestore + 목업 스팟을 읽어와 각 스팟의 정적 HTML을 생성한다.
// 검색엔진 봇이 JS 실행 없이도 스팟 내용을 읽을 수 있게 #root에 콘텐츠를 심고,
// 페이지별 메타 태그(title/description/og)를 주입한다. sitemap.xml도 함께 갱신한다.
import 'dotenv/config'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { mockSpots } from '../src/data/mockSpots.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const SITE = 'https://spotlight-web-service.vercel.app'

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const extractTime = (str) => {
  if (!str) return ''
  const m = String(str).match(/\d{1,2}:\d{2}~\d{1,2}:\d{2}/)
  return m ? m[0] : str
}

function firestoreSpots() {
  const cfg = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }
  if (!cfg.projectId) {
    console.warn('[prerender] Firebase 환경변수 없음 — 목업 스팟만 생성합니다.')
    return Promise.resolve([])
  }
  const db = getFirestore(initializeApp(cfg))
  return getDocs(collection(db, 'spots'))
    .then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })))
    .catch(err => {
      console.warn('[prerender] Firestore 읽기 실패 — 목업만 생성:', err.message)
      return []
    })
}

// #root 안에 심을, 봇이 읽을 수 있는 콘텐츠
function contentHtml(spot) {
  const time = extractTime(spot.bestTime)
  const rows = [
    ['주소', spot.address],
    time && ['최적 촬영 시간', time],
    spot.season && ['추천 계절', spot.season],
    spot.tags?.length && ['태그', spot.tags.join(', ')],
    spot.author && ['등록자', spot.author],
  ].filter(Boolean)
  const imgs = (spot.photos ?? []).slice(0, 5)
    .map((p, i) => `<img src="${esc(p)}" alt="${esc(spot.name)} 촬영 명소 사진 ${i + 1}" />`).join('')
  return `<main>
    <p>${(spot.tags ?? []).map(esc).join(' ')}</p>
    <h1>${esc(spot.name)}</h1>
    <p>${esc(spot.address)}</p>
    ${imgs}
    <h2>장소 소개</h2>
    <p>${esc(spot.description ?? '')}</p>
    <h2>촬영 정보</h2>
    <table><tbody>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
  </main>`
}

function renderPage(template, spot) {
  const url = `${SITE}/spot/${spot.id}`
  const title = `${spot.name} — SpotLight 촬영 명소`
  const desc = `${spot.address} · ${spot.description ?? ''}`.slice(0, 150)
  const image = spot.photos?.[0] ?? `${SITE}/og-image.svg`

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[\s\S]*?(")/, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:image" content=")[\s\S]*?(")/, `$1${esc(image)}$2`)
    .replace(/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${esc(url)}$2`)
    // 봇용 콘텐츠 주입 (React 로드 시 자동 대체됨)
    .replace('<div id="root"></div>', `<div id="root">${contentHtml(spot)}</div>`)
  return html
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')
  const fsSpots = await firestoreSpots()
  const all = [...mockSpots, ...fsSpots]

  for (const spot of all) {
    const dir = join(DIST, 'spot', String(spot.id))
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), renderPage(template, spot), 'utf8')
  }
  console.log(`[prerender] ${all.length}개 스팟 페이지 생성 완료`)

  // sitemap 생성
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', freq: 'daily' },
    { loc: `${SITE}/about`, priority: '0.8', freq: 'monthly' },
    { loc: `${SITE}/explore`, priority: '0.9', freq: 'daily' },
    ...all.map(s => ({ loc: `${SITE}/spot/${s.id}`, priority: '0.7', freq: 'weekly' })),
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
  await writeFile(join(DIST, 'sitemap.xml'), sitemap, 'utf8')
  console.log(`[prerender] sitemap.xml 생성 완료 (${urls.length}개 URL)`)
}

main().catch(err => { console.error(err); process.exit(1) })
