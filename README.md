# OpenAlex Search

A web-based interface for searching the OpenAlex academic database.

## Features

- Search by publication date (date range)
- Search by topic with autocomplete
- Filter by document type (Journal, Preprint, Conference, Proceedings, Book, Other)
- Download articles (PDF) when available
- Export results as XML or PDF

## Development

```bash
npm install
npm run dev
```

## CLI Usage

```bash
./openalex-search
```

## API

The app uses the OpenAlex API with the following endpoints:
- Search: `https://api.openalex.org/works`

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```
