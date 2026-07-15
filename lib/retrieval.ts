import fs from "fs";
import path from "path";

export type Tier = "company" | "regulatory";

export interface KnowledgeChunk {
  id: string;
  docTitle: string;
  sourceLabel: string;
  sourceUrl?: string;
  tier: Tier;
  heading: string;
  text: string;
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

const KNOWLEDGE_ROOT = path.join(process.cwd(), "lib", "knowledge");
const TIERS: Tier[] = ["company", "regulatory"];

const DIACRITIC_MAP: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
};

// Bridges English queries to German-labelled concepts (and vice versa) so a
// question in either language can still find the right chunk.
const SYNONYMS: Record<string, string[]> = {
  piano: ["klavier", "fluegel"],
  klavier: ["piano"],
  move: ["umzug", "umzuege", "moving"],
  umzug: ["move", "moving"],
  insurance: ["versicherung", "haftung", "liability"],
  versicherung: ["insurance", "liability"],
  price: ["preis", "kosten", "pricing"],
  preis: ["price", "cost", "pricing"],
  cancel: ["stornieren", "kuendigung", "cancellation"],
  stornieren: ["cancel", "cancellation"],
  weekend: ["wochenende", "samstag", "sonntag"],
  parking: ["parkplatz", "halteverbot", "halteverbotszone"],
  customs: ["zoll", "eori"],
  deadline: ["frist"],
  crew: ["team", "umzugshelfer"],
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "is", "are",
  "was", "were", "be", "this", "that", "with", "we", "you", "our", "your",
  "can", "do", "does", "it", "at", "as", "by", "from",
  "der", "die", "das", "und", "oder", "fuer", "zu", "von", "im", "ist",
  "sind", "ein", "eine", "mit", "auf", "wir", "ich", "sie", "es", "wie",
  "was", "kann", "koennen", "uns", "euch", "den", "dem", "des",
]);

let cachedChunks: KnowledgeChunk[] | null = null;
let cachedIdf: Map<string, number> | null = null;
let cachedTf: Map<string, Map<string, number>> | null = null;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const [, fmBlock, body] = match;
  const meta: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const m = line.match(/^(\w+):\s*"?([^"]*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body };
}

function chunkMarkdown(body: string): { heading: string; text: string }[] {
  const lines = body.split("\n");
  const chunks: { heading: string; text: string }[] = [];
  let currentHeading = "Overview";
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) chunks.push({ heading: currentHeading, text });
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return chunks;
}

function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;
  const chunks: KnowledgeChunk[] = [];

  for (const tier of TIERS) {
    const dir = path.join(KNOWLEDGE_ROOT, tier);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      const docChunks = chunkMarkdown(body);
      docChunks.forEach((c, i) => {
        chunks.push({
          id: `${tier}/${file}#${i}`,
          docTitle: meta.title ?? file,
          sourceLabel: meta.sourceLabel ?? meta.title ?? file,
          sourceUrl: meta.sourceUrl || undefined,
          tier,
          heading: c.heading,
          text: c.text,
        });
      });
    }
  }

  cachedChunks = chunks;
  return chunks;
}

function normalize(text: string): string {
  let out = text.toLowerCase();
  for (const [from, to] of Object.entries(DIACRITIC_MAP)) {
    out = out.split(from).join(to);
  }
  return out.replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const t of tokens) {
    for (const syn of SYNONYMS[t] ?? []) expanded.add(syn);
  }
  return Array.from(expanded);
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function buildIndex(): { idf: Map<string, number>; tf: Map<string, Map<string, number>> } {
  if (cachedIdf && cachedTf) return { idf: cachedIdf, tf: cachedTf };

  const chunks = loadKnowledgeBase();
  const tfByChunk = new Map<string, Map<string, number>>();
  const df = new Map<string, number>();

  for (const chunk of chunks) {
    const tokens = tokenize(`${chunk.heading} ${chunk.text}`);
    const tf = termFrequency(tokens);
    tfByChunk.set(chunk.id, tf);
    for (const token of tf.keys()) df.set(token, (df.get(token) ?? 0) + 1);
  }

  const idf = new Map<string, number>();
  const n = chunks.length;
  for (const [token, count] of df.entries()) {
    idf.set(token, Math.log((n + 1) / (count + 0.5)) + 1);
  }

  cachedIdf = idf;
  cachedTf = tfByChunk;
  return { idf, tf: tfByChunk };
}

export function retrieve(query: string, topK = 6): RetrievedChunk[] {
  const chunks = loadKnowledgeBase();
  const { idf, tf: tfByChunk } = buildIndex();
  const queryTokens = expandSynonyms(tokenize(query));

  if (queryTokens.length === 0) return [];

  const scored: RetrievedChunk[] = chunks.map((chunk) => {
    const tf = tfByChunk.get(chunk.id) ?? new Map();
    let score = 0;

    for (const qt of queryTokens) {
      const direct = tf.get(qt);
      if (direct) {
        score += direct * (idf.get(qt) ?? 1);
        continue;
      }
      // Partial/prefix match for German compound words (e.g. "fracht" vs "frachtvertrag").
      if (qt.length >= 4) {
        for (const [token, count] of tf.entries()) {
          if (token.length >= 4 && (token.startsWith(qt) || qt.startsWith(token))) {
            score += 0.4 * count * (idf.get(token) ?? 1);
          }
        }
      }
    }

    // Company knowledge is the primary layer; regulatory is the fallback.
    if (chunk.tier === "company") score *= 1.15;

    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export interface SourceRef {
  id: string;
  title: string;
  sourceLabel: string;
  sourceUrl?: string;
  tier: Tier;
}

export function toSourceRefs(chunks: RetrievedChunk[]): SourceRef[] {
  const seen = new Map<string, SourceRef>();
  for (const c of chunks) {
    const key = `${c.tier}/${c.docTitle}`;
    if (!seen.has(key)) {
      seen.set(key, {
        id: c.id,
        title: c.docTitle,
        sourceLabel: c.sourceLabel,
        sourceUrl: c.sourceUrl,
        tier: c.tier,
      });
    }
  }
  return Array.from(seen.values());
}
