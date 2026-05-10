# Backup Strategy — Mandatomat

**Task:** T5-DEV-049 — Strategia backupów (Supabase PITR + R2 daily exports)
**RPO target:** 5 minut (Supabase PITR)
**RTO target:** 1 godzina (przywrócenie z PITR), 24h (cold restore z R2)

---

## 1. Zakres backupów

| Zasób                     | Co backupujemy                                                            | Metoda                             | Częstotliwość |
| ------------------------- | ------------------------------------------------------------------------- | ---------------------------------- | ------------- |
| **Supabase Postgres**     | wszystkie tabele (users, cases, documents, payments, audit_log, sessions) | Supabase PITR + nightly dump       | ciągły / 24h  |
| **Supabase Storage**      | uploaded PDFs/dokumenty userów                                            | Rsync do R2 (CF) co 24h            | 24h           |
| **Generated PDFs (R2)**   | gotowe dokumenty wygenerowane przez Claude                                | Cross-region R2 replication        | real-time     |
| **Stripe** (faktury, sub) | trzymane przez Stripe — backup _referencji_ w Postgres                    | implicit przez Postgres backup     | n/a           |
| **AI prompts (DB)**       | wersje promptów w `ai_prompts` table                                      | Postgres backup + git mirror       | 24h + on push |
| **Audit log**             | tabela `audit_log` (immutable append-only)                                | Postgres backup + long retention   | 24h, 7 lat    |
| **Sekrety (.env)**        | Vercel env vars + Supabase secrets                                        | Vercel CLI export → R2 (encrypted) | 7 dni         |
| **Repo + CI config**      | GitHub repo                                                               | GitHub native + mirror do GitLab   | real-time     |

---

## 2. Supabase PITR (Point-in-Time Recovery)

**Pro plan** ma włączone PITR z retencją **7 dni** (rozszerzalne do 28 dni za $100/mies).

- **RPO:** 5 minut (WAL flush)
- **RTO:** ~30-60 min (Supabase support ticket → restore do nowej DB)

**Procedura restore:**

1. Supabase Dashboard → Project → **Settings → Database → Backups → PITR**
2. Wybierz timestamp (UTC)
3. Restore do **nowego projektu** (NIE nadpisuj produkcji)
4. Smoke-test connection string
5. Po weryfikacji — DNS swap / Vercel env update na nowy DB URL
6. Old DB → zostaw w read-only przez 7 dni, potem archive

**Test restore:** raz na kwartał (kalendarz on-call).

---

## 3. Nightly Logical Dumps → Cloudflare R2

Niezależny od Supabase — **defense in depth**. Gdyby Supabase miał incydent, mamy
własne `pg_dump`.

### 3.1 GitHub Action (`.github/workflows/db-backup.yml`)

```yaml
name: Nightly DB Backup
on:
  schedule:
    - cron: '0 2 * * *' # 02:00 UTC every day
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - name: Install pg_dump 16
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client-16

      - name: Dump database
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DB_URL_RO }} # read-only role!
        run: |
          TS=$(date -u +%Y%m%d_%H%M%S)
          pg_dump --no-owner --no-acl --format=custom \
            --exclude-table-data='public.audit_log_raw' \
            "$DATABASE_URL" > backup_${TS}.dump
          gzip backup_${TS}.dump

      - name: Encrypt (age)
        env:
          AGE_PUBLIC_KEY: ${{ secrets.AGE_BACKUP_PUBKEY }}
        run: |
          curl -L https://github.com/FiloSottile/age/releases/latest/download/age-linux-amd64.tar.gz | tar xz
          ./age/age -r "$AGE_PUBLIC_KEY" -o backup.dump.gz.age backup_*.dump.gz

      - name: Upload to R2
        uses: shallwefootball/s3-upload-action@master
        with:
          aws_key_id: ${{ secrets.R2_ACCESS_KEY }}
          aws_secret_access_key: ${{ secrets.R2_SECRET_KEY }}
          aws_bucket: mandatomat-backups
          source_dir: '.'
          destination_dir: 'postgres/$(date -u +%Y/%m)'
          endpoint: ${{ secrets.R2_ENDPOINT }}
```

### 3.2 R2 Retention Policy

```jsonc
// Cloudflare R2 lifecycle rule
{
  "rules": [
    {
      "id": "daily-7d",
      "prefix": "postgres/daily/",
      "expiration": { "days": 7 },
    },
    {
      "id": "weekly-90d",
      "prefix": "postgres/weekly/",
      "expiration": { "days": 90 },
    },
    {
      "id": "monthly-7y",
      "prefix": "postgres/monthly/",
      "expiration": { "days": 2555 }, // 7 lat (audyt RODO)
    },
  ],
}
```

Cron promotion: niedzielny dump kopiowany do `postgres/weekly/`, 1-szy każdego miesiąca do `postgres/monthly/`.

---

## 4. Encryption

- **In transit:** TLS 1.3 (Supabase → GH Action → R2)
- **At rest:** R2 SSE-S3 (Cloudflare-managed) + **age** envelope encryption (klucz prywatny w 1Password vault `mandatomat-ops`)
- Age public key w GitHub secrets, **prywatny tylko w 1Password** — nikt z teamu nie może odszyfrować backupu bez approval (2-of-3 quorum).

---

## 5. Storage backupy (uploadowane PDFy)

Supabase Storage → daily rsync do R2 bucket `mandatomat-storage-mirror`.

```bash
# scripts/backup-storage.sh (cron on Vercel cron functions / Hetzner box)
supabase storage download --recursive documents /tmp/storage/
aws s3 sync /tmp/storage/ s3://mandatomat-storage-mirror/ \
  --endpoint-url $R2_ENDPOINT \
  --delete
```

Retention: 30 dni (PDF-y są też regenerowalne z `cases` w DB).

---

## 6. Disaster Recovery Runbook

### Scenariusz A: korupcja danych w produkcji

1. Zatrzymaj zapisy: Vercel → flip env `READ_ONLY_MODE=true` (middleware blokuje POST/PUT/DELETE)
2. Sentry/Slack incident channel
3. Supabase PITR → restore do nowej bazy na timestamp PRZED korupcją
4. Smoke-test na staging
5. Vercel env swap → `DATABASE_URL` na nową bazę
6. `READ_ONLY_MODE=false`
7. Post-mortem w ciągu 48h

### Scenariusz B: Supabase region outage (eu-central)

1. Sprawdź status.supabase.com
2. Jeśli > 1h: provision **nowy projekt Supabase w eu-west**
3. Pobierz najnowszy R2 dump: `aws s3 cp s3://mandatomat-backups/postgres/daily/$(ls latest) .`
4. Decrypt: `age --decrypt -i ~/.age/key.txt backup.dump.gz.age | gunzip > backup.dump`
5. `pg_restore --no-owner --no-acl -d $NEW_DB_URL backup.dump`
6. Vercel env swap

### Scenariusz C: cały Vercel down

1. Postgres + R2 backup nadal działa
2. Fallback: deploy do **Cloudflare Pages** (config już istnieje w `wrangler.jsonc` w submodule)
3. DNS swap na Cloudflare (TTL 60s)

---

## 7. Testy DR

| Test                            | Częstotliwość | Owner    |
| ------------------------------- | ------------- | -------- |
| PITR restore (do staging)       | kwartalnie    | DevOps   |
| R2 dump → fresh DB restore      | kwartalnie    | DevOps   |
| Decrypt age envelope            | półrocznie    | Security |
| Full DR drill (region failover) | rocznie       | CTO      |

Wynik każdego testu logowany w `docs/launch/DR_TEST_LOG.md` (data, RTO, RPO, issues).

---

## 8. Monitoring backupów

- **GitHub Action status:** Slack webhook on failure → `#mandatomat-alerts`
- **R2 bucket size monitoring:** Cloudflare Analytics → alert jeśli daily delta < 50 % poprzedniego (oznacza, że dump się popsuł)
- **Sentry breadcrumb** w `db-backup.yml` przy success/failure

---

## 9. RODO / Compliance

- Backup zawiera PII (PESEL, email, adresy) → retention max **7 lat** dla audit_log, **2 lata** dla pozostałych (zgodnie z polityką prywatności).
- Right to be forgotten: gdy user wystąpi o usunięcie, **GDPR purge job** propaguje delete do wszystkich backupów < 30 dni (starsze są encrypted at rest i pseudonimizowane po retention period).
- DPA z Cloudflare (R2) i Supabase — w `docs/legal/dpa.md`.

---

## 10. Kontakty Eskalacyjne

| Rola           | Kanał                         |
| -------------- | ----------------------------- |
| On-call DevOps | PagerDuty `mandatomat-oncall` |
| Supabase Pro   | support@supabase.io (SLA 4h)  |
| Cloudflare     | dashboard ticket (SLA 24h)    |
| Security lead  | security@mandatomat.pl        |

---

**Last review:** 2026-05-10
**Next review:** 2026-08-10 (kwartalnie)
