#!/usr/bin/env bash
# Tworzy 50 issue Tieru 1 na repo MandatomatMaj2026.
# Wymaga: gh CLI zalogowany, jq.
# Idempotent: pomija istniejące (po prefixie title).

set -euo pipefail

REPO="${REPO:-walerys1003/MandatomatMaj2026}"
JSON_FILE="$(dirname "$0")/tier1-issues.json"

if [ ! -f "$JSON_FILE" ]; then
  echo "ERROR: $JSON_FILE not found"
  exit 1
fi

# Pobierz istniejące tytuły (do dedupy)
echo "Pobieram listę istniejących issue..."
EXISTING=$(gh issue list --repo "$REPO" --state all --limit 200 --json title --jq '.[].title' || echo "")

CREATED=0
SKIPPED=0
TOTAL=$(jq 'length' "$JSON_FILE")

echo "Łącznie zadań do utworzenia: $TOTAL"
echo ""

for i in $(seq 0 $((TOTAL - 1))); do
  TASK_ID=$(jq -r ".[$i].task_id" "$JSON_FILE")
  AGENT=$(jq -r ".[$i].agent" "$JSON_FILE")
  TITLE=$(jq -r ".[$i].title" "$JSON_FILE")
  BODY=$(jq -r ".[$i].body" "$JSON_FILE")

  FULL_TITLE="[${TASK_ID}] ${TITLE}"

  # Sprawdź czy już istnieje
  if echo "$EXISTING" | grep -qF "[${TASK_ID}]"; then
    echo "SKIP  ${TASK_ID} (już istnieje)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Mapowanie agenta na label
  case "$AGENT" in
    orchestrator) AGENT_LABEL="" ;;  # orchestrator nie ma labela
    *) AGENT_LABEL="agent-${AGENT}" ;;
  esac

  # Utwórz issue
  if [ -z "$AGENT_LABEL" ]; then
    gh issue create \
      --repo "$REPO" \
      --title "$FULL_TITLE" \
      --body "$BODY" \
      --label "tier-1" >/dev/null
  else
    gh issue create \
      --repo "$REPO" \
      --title "$FULL_TITLE" \
      --body "$BODY" \
      --label "tier-1" \
      --label "$AGENT_LABEL" >/dev/null
  fi

  echo "CREATE ${TASK_ID} → ${AGENT_LABEL:-orchestrator}"
  CREATED=$((CREATED + 1))

  # Throttle żeby nie uderzyć w rate-limit GitHub
  sleep 0.4
done

echo ""
echo "===================="
echo "Utworzono:    $CREATED"
echo "Pominięto:    $SKIPPED"
echo "Razem:        $TOTAL"
echo "===================="
