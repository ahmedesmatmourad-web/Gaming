# Pharaoh's Empire — Web Validation MVP

## Setup
```
npm install
```

## Development
```
npm run dev
```

## Tests
```
npm test
```

## Production build
```
npm run build
npm run preview   # verify the built bundle locally before uploading
```

## Deploying for web validation
Zip the contents of `dist/` and upload according to the target portal's submission process (e.g., Poki, CrazyGames). Before submitting to a real portal:
- Replace `MockAdService` with the portal's actual rewarded-ad SDK (implements the same `AdService` interface — no game-logic changes needed).
- Replace `ConsoleAnalyticsService` with the portal's analytics SDK, or a real analytics backend (implements the same `AnalyticsService` interface).
- Swap placeholder graphics (colored rectangles + tier-number labels) for final Gemini-generated art.
