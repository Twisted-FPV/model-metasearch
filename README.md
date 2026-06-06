# Model Metasearch

A working MVP for searching multiple 3D model marketplaces in one place.

## Included sources

- MakerWorld
- Thangs
- MyMiniFactory
- Printables
- STLFinder
- Cults3D

This MVP uses public search pages and metadata parsing where official search APIs are unavailable or require authentication. Respect each site's robots.txt, terms, API limits, and licensing before production deployment.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment

Optional:

```bash
SEARCH_TIMEOUT_MS=8000
USER_AGENT="ModelMetasearchBot/0.1 contact@example.com"
```

## Production notes

For production, replace individual adapters with official APIs where available:

- MyMiniFactory has API documentation and OAuth/client-based access.
- Cults3D provides GraphQL API access after account/API-key setup.
- Some sites do not clearly offer public search APIs and may require partnership, browser-based use, or a compliant third-party integration.
