# Data Insights

A founder intelligence platform that turns public technology, startup, research, security, and industry signals into daily and weekly decision briefs.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product surfaces

- `/portal` — MSN-style headline river **without licensed full text** (headlines, capped feed teasers, our classification, outbound links)
- `/` — platform overview, source registry, topic map
- `/report` — daily 5W1H report
- `/weekly` — weekly synthesis with themes, momentum, opportunities, risks, and experiments
- `/weekly/print` — print-optimized weekly report; use **Print → Save as PDF**
- `/command-center` — search and filter workspace with analyst recommendations
- `/history` — persisted daily report archive
- `/sources/{id}` — source assessment and availability history
- `/topics/{slug}` — topic deep dive and current signals

## Agent interfaces

JSON APIs:

```text
GET /api/portal
GET /api/report
GET /api/weekly
GET /api/analyst
GET /api/history
GET /api/capabilities
```

CLI (requires the app to be running):

```bash
npm run cli -- daily
npm run cli -- weekly
npm run cli -- analyst
npm run cli -- search robotics
npm run cli -- capabilities
```

Set `DATA_INSIGHTS_URL` when the app is not on localhost:

```bash
DATA_INSIGHTS_URL=https://your-host.example npm run cli -- weekly
```

MCP stdio adapter:

```bash
DATA_INSIGHTS_URL=http://localhost:3000 node scripts/mcp-server.mjs
```

The MCP server exposes:

- `get_daily_report`
- `get_weekly_report`
- `get_analyst_recommendations`
- `search_signals`

Example MCP client configuration:

```json
{
  "mcpServers": {
    "data-insights": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "cwd": "/absolute/path/to/data-insights",
      "env": { "DATA_INSIGHTS_URL": "http://localhost:3000" }
    }
  }
}
```

The analyst engine is explainable by default and optionally LLM-enriched when `OPENAI_API_KEY` is configured. Without credentials, the deterministic fallback remains active. Agents can consume all structured evidence without losing source provenance.

## Without a publisher license

This is an aggregator, not a reprint site.

**Shipped:** headlines, canonical URLs, timestamps, public API metadata (Hacker News, GitHub), RSS/Atom teasers capped at 280 characters, **feed/API thumbnails the publisher already attached**, and original 5W1H classification.

**Not stored or shown:** article HTML, `content:encoded`, ArXiv abstracts, scraped `og:image` from article pages, or paywalled bodies.

The river is `/portal`. Refresh the live feed with the **Refresh** button (also `POST /api/refresh`). The machine-readable form is `GET /api/portal`.

