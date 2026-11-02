// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver; Bing feeds
// ChatGPT search) about engjellrraklli.com pages, so new or changed pages are
// crawled within minutes instead of on the next sitemap visit.
//
// Run after a deploy, from anywhere with Node 18+:
//   node scripts/indexnow.mjs                       # every URL in sitemap.xml
//   node scripts/indexnow.mjs /invest /journal/x    # just these
//
// The key is public by design: IndexNow checks ownership by fetching
// https://engjellrraklli.com/<key>.txt, which is served from public/.
// Changing the key means renaming that file too.

const HOST = 'engjellrraklli.com'
const KEY = 'b399a61af271914b026230659489e9c3'
const ORIGIN = `https://${HOST}`

async function sitemapUrls() {
  const response = await fetch(`${ORIGIN}/sitemap.xml`)
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`)
  const xml = await response.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
}

const args = process.argv.slice(2)
const urlList = args.length > 0
  ? args.map((path) => new URL(path, ORIGIN).toString())
  : [...(await sitemapUrls()), `${ORIGIN}/llms.txt`]

if (urlList.length === 0) throw new Error('No URLs to submit')
if (urlList.some((url) => new URL(url).host !== HOST)) throw new Error(`Every URL must be on ${HOST}`)

const keyCheck = await fetch(`${ORIGIN}/${KEY}.txt`)
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  throw new Error(`${ORIGIN}/${KEY}.txt is not serving the key; deploy it before submitting`)
}

// IndexNow accepts up to 10,000 URLs per request.
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
})
// 200 = accepted, 202 = accepted and the key is still being verified.
console.log(`IndexNow: ${response.status} ${response.statusText} for ${urlList.length} URLs`)
if (response.status >= 300) {
  console.log(await response.text())
  process.exit(1)
}
