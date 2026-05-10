#!/usr/bin/env node
/**
 * Mandatomat KB Retrieval Helper
 * Usage:
 *   node spec/index/retrieve.mjs --tag wizard
 *   node spec/index/retrieve.mjs --agent backend
 *   node spec/index/retrieve.mjs --search "stripe"
 *   node spec/index/retrieve.mjs --chunk T09_backend_api_generate_scoring
 *   node spec/index/retrieve.mjs --task "build landing hero"
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const idx = JSON.parse(readFileSync(join(__dirname, 'chunks_index.json'), 'utf-8'));
const tagIdx = JSON.parse(readFileSync(join(__dirname, 'tag_index.json'), 'utf-8'));
const agentIdx = JSON.parse(readFileSync(join(__dirname, 'agent_index.json'), 'utf-8'));

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};

function loadChunk(id) {
  const meta = idx.chunks.find(c => c.chunk_id === id);
  if (!meta) return null;
  const body = readFileSync(join(ROOT, '..', meta.path), 'utf-8');
  return { meta, body };
}

function listChunkIds(ids) {
  return ids.map(id => {
    const m = idx.chunks.find(c => c.chunk_id === id);
    return m ? `  - ${id} (${(m.size_bytes/1024).toFixed(1)} KB) — ${m.title}` : `  - ${id} (NOT FOUND)`;
  }).join('\n');
}

const tag = get('--tag');
const agent = get('--agent');
const search = get('--search');
const chunk = get('--chunk');
const task = get('--task');

if (chunk) {
  const c = loadChunk(chunk);
  if (!c) { console.error(`Chunk ${chunk} not found`); process.exit(1); }
  console.log(c.body);
} else if (tag) {
  const ids = tagIdx[tag] || [];
  console.log(`# Chunks with tag "${tag}" (${ids.length}):\n${listChunkIds(ids)}`);
} else if (agent) {
  const ids = agentIdx[agent] || [];
  console.log(`# Chunks for agent "${agent}" (${ids.length}):\n${listChunkIds(ids)}`);
} else if (search) {
  const q = search.toLowerCase();
  const matches = idx.chunks.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.tags.some(t => t.includes(q)) ||
    c.chunk_id.toLowerCase().includes(q)
  );
  console.log(`# Search "${search}" (${matches.length} matches):\n${listChunkIds(matches.map(c => c.chunk_id))}`);
} else if (task) {
  // Heurystyka task → tagi
  const t = task.toLowerCase();
  const tagHits = new Set();
  Object.keys(tagIdx).forEach(tg => { if (t.includes(tg.replace('_',' ')) || t.includes(tg)) tagHits.add(tg); });
  const chunkHits = new Set();
  tagHits.forEach(tg => tagIdx[tg].forEach(c => chunkHits.add(c)));
  console.log(`# Task: "${task}"\n# Matched tags: ${[...tagHits].join(', ') || '(none — refine query)'}\n# Suggested chunks (${chunkHits.size}):\n${listChunkIds([...chunkHits])}`);
} else {
  console.log(`# Mandatomat KB — ${idx.total} chunks
Available tags (${Object.keys(tagIdx).length}): ${Object.keys(tagIdx).slice(0,20).join(', ')}...
Available agents: ${Object.keys(agentIdx).join(', ')}

Usage:
  --tag <tag>          List chunks with given tag
  --agent <agent>      List chunks for given agent role
  --search <query>     Search title/tags/id
  --chunk <id>         Print full chunk content
  --task <description> Auto-suggest chunks for task description`);
}
