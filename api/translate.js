import Anthropic from "@anthropic-ai/sdk";

const VOCAB = {
  type: ["tee","hemd","hoodie","sweat","hose","denim","strick","jacke","mantel"],
  fit:  ["oversized","boxy","regular","slim","skinny","straight","relaxed","baggy","wide-leg","cropped","tailored"],
  vibe: ["minimal","workwear","outdoor","archive","military","vintage","technical","elevated-basics","grunge","90s","streetwear"],
  palette:  ["earthtones","schwarz-mono","washed","clean-white","bold"],
  material: ["heavyweight-cotton","wolle","technical","raw-denim","cut-and-sew"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query required" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Du Ã¼bersetzt Mode-Suchanfragen in ein festes Tag-Vokabular. Gib NUR valides JSON zurÃ¼ck â€” kein Markdown, keine ErklÃ¤rung.

Erlaubte Werte (nur diese, nichts erfinden):
type: ${VOCAB.type.join(", ")}
fit: ${VOCAB.fit.join(", ")}
vibe: ${VOCAB.vibe.join(", ")}
palette: ${VOCAB.palette.join(", ")}
material: ${VOCAB.material.join(", ")}

Suchanfrage: "${query.slice(0, 200)}"

Antwort (nur JSON, leere Arrays wenn unklar):
{"type":[],"fit":[],"vibe":[],"palette":[],"material":[]}`,
      },
    ],
  });

  try {
    const text = message.content[0].text.trim();
    const tags = JSON.parse(text);
    // Nur erlaubte Werte durchlassen
    const safe = {};
    for (const cat of Object.keys(VOCAB)) {
      safe[cat] = Array.isArray(tags[cat])
        ? tags[cat].filter((v) => VOCAB[cat].includes(v))
        : [];
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(safe);
  } catch {
    return res.status(500).json({ error: "parse_error" });
  }
}
