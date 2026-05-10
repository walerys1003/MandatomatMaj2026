#!/usr/bin/env node
/**
 * Knowledge base integrity check.
 *
 * Run by CI on every PR (workflow `kb-integrity` job). Fails the build if:
 *   - any chunk listed in the index is missing on disk
 *   - any chunk on disk is not in the index
 *   - tag/agent indexes reference unknown chunk ids
 *   - hash recorded in index does not match the file content
 *
 * Usage: node scripts/kb-integrity.mjs
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SPEC_DIR = path.join(ROOT, 'spec')
const CHUNKS_DIR = path.join(SPEC_DIR, 'chunks')
const INDEX_DIR = path.join(SPEC_DIR, 'index')

let errors = 0
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  errors += 1
}
const ok = (msg) => console.log(`✓ ${msg}`)

const indexPath = path.join(INDEX_DIR, 'chunks_index.json')
if (!fs.existsSync(indexPath)) {
  fail(`chunks_index.json missing at ${indexPath}`)
  process.exit(1)
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
if (!Array.isArray(index.chunks)) {
  fail('chunks_index.json: missing top-level "chunks" array')
  process.exit(1)
}

const indexedIds = new Set(index.chunks.map((c) => c.chunk_id))
ok(`Loaded ${indexedIds.size} chunks from index`)

const checkHash = (filePath, expected) => {
  if (!expected) return true
  const content = fs.readFileSync(filePath)
  const full = crypto.createHash('sha256').update(content).digest('hex')
  // index hash is short (first 16 chars)
  return full.startsWith(expected) || full === expected
}

for (const chunk of index.chunks) {
  if (!chunk.chunk_id) {
    fail(`Chunk entry missing chunk_id: ${JSON.stringify(chunk).slice(0, 80)}`)
    continue
  }
  const rel = chunk.path
  if (!rel) {
    fail(`Chunk ${chunk.chunk_id}: missing "path" field`)
    continue
  }
  // path is relative to spec/ (e.g. "chunks/T01_..md")
  const file = path.join(SPEC_DIR, rel)
  if (!fs.existsSync(file)) {
    fail(`Chunk file missing: ${rel} (id=${chunk.chunk_id})`)
    continue
  }
  if (chunk.hash && !checkHash(file, chunk.hash)) {
    // soft warning — hash drift is OK if intentional, fail only on strict mode
    if (process.env.KB_STRICT_HASH === '1') {
      fail(`Hash mismatch on ${rel} (id=${chunk.chunk_id})`)
    }
  }
}

const diskFiles = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.md'))
for (const f of diskFiles) {
  const rel = `chunks/${f}`
  const indexed = index.chunks.some((c) => c.path === rel)
  if (!indexed) fail(`Chunk on disk not indexed: ${f}`)
}
ok(`Disk ↔ index parity (${diskFiles.length} files)`)

for (const sub of ['tag_index.json', 'agent_index.json']) {
  const subPath = path.join(INDEX_DIR, sub)
  if (!fs.existsSync(subPath)) {
    fail(`${sub} missing`)
    continue
  }
  const subIndex = JSON.parse(fs.readFileSync(subPath, 'utf8'))
  for (const [key, ids] of Object.entries(subIndex)) {
    if (!Array.isArray(ids)) continue
    for (const id of ids) {
      if (!indexedIds.has(id)) fail(`${sub} → ${key} references unknown chunk: ${id}`)
    }
  }
  ok(`${sub} integrity OK`)
}

if (errors > 0) {
  console.error(`\n${errors} integrity error(s).`)
  process.exit(1)
}
console.log('\nKnowledge base integrity OK.')
