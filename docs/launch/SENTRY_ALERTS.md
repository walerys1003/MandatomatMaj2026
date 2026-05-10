# Sentry Alerts Configuration — Mandatomat

**Task:** T5-DEV-047 — Sentry alerts (error rate, latency, AI cost)
**Status:** Config reference (Sentry SDK integration pending — see `Implementation Steps` na końcu).

---

## 1. Cel

Skonfigurować alerty produkcyjne, które wybudzą zespół on-call w przypadku:

1. **Skok error rate** — degradacja jakości serwisu (bugi, padające zależności).
2. **Latency p95 > 3s** — UX poniżej SLA, prawdopodobnie wąskie gardło DB / Claude API.
3. **AI cost spike > $50/dzień** — runaway prompt loop, abuse, brak rate-limitu.
4. **Webhooks Stripe failures** — utracona płatność = utracony klient.

Wszystkie alerty: kanał **Slack `#mandatomat-alerts`** + email do `oncall@mandatomat.pl`.

---

## 2. Sentry Projects

| Project              | Platform              | DSN env var                             |
| -------------------- | --------------------- | --------------------------------------- |
| `mandatomat-web`     | Next.js (browser+SSR) | `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` |
| `mandatomat-edge`    | Vercel Edge runtime   | `SENTRY_DSN_EDGE`                       |
| `mandatomat-workers` | Background jobs       | `SENTRY_DSN_WORKERS`                    |

Wszystkie pod organizacją `mandatomat` w regionie **EU** (RODO).

---

## 3. Alert Rules

### 3.1 Error Rate Spike

**Rule:** `High Error Rate — Production`

```yaml
name: High Error Rate — Production
environment: production
conditions:
  - id: sentry.rules.conditions.event_frequency.EventFrequencyCondition
    interval: 5m
    value: 25 # >25 errors w 5 min
  - id: sentry.rules.conditions.event_attribute.EventAttributeCondition
    attribute: environment
    match: eq
    value: production
filter_match: all
actions:
  - id: sentry.integrations.slack.notify_action
    workspace: mandatomat
    channel: '#mandatomat-alerts'
    tags: 'level,environment,release,url'
  - id: sentry.mail.actions.NotifyEmailAction
    targetType: Team
    targetIdentifier: oncall
frequency: 30 # cooldown 30 min
```

### 3.2 New Issue (regression)

**Rule:** `New issue — Production`

```yaml
name: New Issue — Production
environment: production
conditions:
  - id: sentry.rules.conditions.first_seen_event.FirstSeenEventCondition
actions:
  - id: sentry.integrations.slack.notify_action
    workspace: mandatomat
    channel: '#mandatomat-alerts'
frequency: 1440 # 1× / 24h per issue
```

### 3.3 Latency p95 > 3s (Performance Alert)

**Metric Alert:** `API latency p95 critical`

```yaml
type: metric_alert
name: API latency p95 > 3s
dataset: transactions
query: 'http.method:POST event.type:transaction transaction:/api/*'
aggregate: p95(transaction.duration)
timeWindow: 10 # minut
triggers:
  - label: critical
    alertThreshold: 3000 # ms
    actions:
      - type: slack
        targetType: specific
        targetIdentifier: '#mandatomat-alerts'
  - label: warning
    alertThreshold: 1500
    actions:
      - type: slack
        targetType: specific
        targetIdentifier: '#mandatomat-alerts-warn'
resolveThreshold: 800
thresholdType: 0 # above
```

### 3.4 AI Cost Spike (custom metric)

Mandatomat wystawia metrykę `ai.cost.usd` (tag `model`, `case_type`)
przez `Sentry.metrics.distribution()` w `lib/ai/anthropic-client.ts`
po każdym wywołaniu Claude API.

**Metric Alert:** `AI cost daily > $50`

```yaml
type: metric_alert
name: AI cost > $50/day
dataset: metrics
query: ''
aggregate: sum(ai.cost.usd)
timeWindow: 1440 # 24h rolling
triggers:
  - label: critical
    alertThreshold: 50
    actions:
      - type: slack
        targetType: specific
        targetIdentifier: '#mandatomat-alerts'
      - type: pagerduty
        targetIdentifier: mandatomat-oncall
  - label: warning
    alertThreshold: 30
    actions:
      - type: slack
        targetType: specific
        targetIdentifier: '#mandatomat-alerts-warn'
```

### 3.5 Stripe Webhook Failures

**Rule:** `Stripe webhook failure`

```yaml
name: Stripe webhook failure
conditions:
  - id: sentry.rules.conditions.event_attribute.EventAttributeCondition
    attribute: transaction
    match: eq
    value: /api/webhooks/stripe
  - id: sentry.rules.conditions.event_attribute.EventAttributeCondition
    attribute: level
    match: in
    value: error,fatal
filter_match: all
actions:
  - id: sentry.integrations.slack.notify_action
    workspace: mandatomat
    channel: '#mandatomat-alerts'
  - id: sentry.mail.actions.NotifyEmailAction
    targetType: Member
    targetIdentifier: billing@mandatomat.pl
frequency: 5
```

---

## 4. Severity Matrix

| Alert                | Severity   | Response time | Channel                          |
| -------------------- | ---------- | ------------- | -------------------------------- |
| Error rate > 25/5min | P1 (page)  | < 15 min      | Slack + Email + (PagerDuty opt.) |
| Latency p95 > 3s     | P2 (alert) | < 1h          | Slack                            |
| AI cost > $50/day    | P1 (page)  | < 15 min      | Slack + PagerDuty                |
| AI cost > $30/day    | P3 (warn)  | < 24h         | Slack warn channel               |
| Stripe webhook fail  | P1 (page)  | < 30 min      | Slack + Email billing            |
| New issue            | P3 (info)  | next business | Slack                            |

---

## 5. Sampling Strategy

- `tracesSampleRate`: **0.1** (10 %) na produkcji, 1.0 na staging
- `profilesSampleRate`: **0.05** (5 %)
- `replaysSessionSampleRate`: **0** (RODO — wyłączamy session replay domyślnie)
- `replaysOnErrorSampleRate`: **0.1** (tylko przy errors, z `maskAllText: true`)

---

## 6. PII Scrubbing (RODO)

```ts
// sentry.client.config.ts / sentry.server.config.ts
Sentry.init({
  beforeSend(event) {
    // Wymaż PESEL, email, IP, numery telefonów
    if (event.request?.cookies) delete event.request.cookies
    if (event.user?.ip_address) event.user.ip_address = '0.0.0.0'
    return event
  },
  sendDefaultPii: false,
  // Dodatkowo Sentry "Data Scrubbing" w UI projektu — włącz:
  // - Use default scrubbers
  // - Scrub IP addresses
  // - Custom rules: pesel, email, phone, peselNumber, dowod
})
```

---

## 7. Implementation Steps (do zrobienia przy włączaniu Sentry)

1. `pnpm -F @mandatomat/web add @sentry/nextjs`
2. `npx @sentry/wizard@latest -i nextjs` — wygeneruje `sentry.{client,server,edge}.config.ts`
3. Wkleić powyższe `beforeSend` + `tracesSampleRate: 0.1`
4. W Sentry UI utworzyć alerty wg sekcji 3 (lub via `sentry-cli` z YAML)
5. Slack workspace integration → connect channel `#mandatomat-alerts`
6. (Opcjonalnie) PagerDuty integration dla P1
7. W `lib/ai/anthropic-client.ts` po każdym call:
   ```ts
   Sentry.metrics.distribution('ai.cost.usd', estimatedCost, {
     tags: { model, case_type: caseType },
     unit: 'none',
   })
   ```
8. Smoke-test: ręcznie wrzucić `Sentry.captureException(new Error('test'))` na staging i sprawdzić, że alert wpada do Slack-a.

---

## 8. Cost Awareness

Free plan: 5 000 errors / 10 000 perf events miesięcznie. Przy obecnym ruchu starczy.
Po przekroczeniu 50 % limitu — alert email z Sentry → rozważyć Team plan ($26/mies.).
