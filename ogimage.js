export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ img: null });

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FashionBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await r.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const img = m ? m[1] : null;
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.json({ img });
  } catch {
    res.json({ img: null });
  }
}
