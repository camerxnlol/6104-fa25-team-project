---
timestamp: 'Tue Nov 25 2025 20:51:36 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205136.957eecdb.md]]'
content_id: cb892b6b846af10c173b681f10102d1a432a6f9d5235443c9597f7475acda9af
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/LikertSurvey/_getSurveyQuestions": "this is a public query",
  "/api/LikertSurvey/_getSurveyResponses": "responses are public",
  "/api/LikertSurvey/_getRespondentAnswers": "answers are visible",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",
  "/api/CountryRecommendation/_getCountryStatus": "this is a public query",
  "/api/Passport/_getExploredCountries": "this is a public query",
  "/api/Passport/_getHistoryForCountry": "this is a public query",
  "/api/Playlist/_getPlaylistsForUser": "this is a public query",
  "/api/Playlist/_getPlaylist": "this is a public query",
  "/api/Reporting/_getReportCount": "this is a public query",
  "/api/Reporting/_getReporters": "this is a public query",
  "/api/UserAuthentication/_getUserByUsername": "this is a public query",
  "/api/UserAuthentication/_getUsername": "this is a public query",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",

  "/api/CountryRecommendation/getCountryEntry",
  "/api/CountryRecommendation/getNewRecs",
  "/api/CountryRecommendation/llmFetch",
  "/api/CountryRecommendation/createPrompt",
  "/api/CountryRecommendation/getSystemRecs",
  "/api/CountryRecommendation/getCommunityRecs",
  "/api/CountryRecommendation/addCommunityRec",
  "/api/CountryRecommendation/removeCommunityRec",

  "/api/Passport/logExploration",

  "/api/Playlist/createPlaylist",
  "/api/Playlist/deletePlaylist",
  "/api/Playlist/renamePlaylist",
  "/api/Playlist/addSong",
  "/api/Playlist/removeSong",
  "/api/Playlist/reorderSongs",

  "/api/Reporting/InitializeObject",
  "/api/Reporting/Report",
  "/api/Reporting/Unreport",

  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  "/api/UserAuthentication/register",
  "/api/UserAuthentication/login",
];

```
