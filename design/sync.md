[@concept-background](tools/concept-background.md)

[@sync-background](tools/sync-background.md)

[@passthroughs](../src/concepts/Requesting/passthrough.ts)

[@sample-syncs](../src/syncs/sample.sync.ts)

[@concepts](../src/concepts/concepts.ts)

[@api-spec](api-spec.md)


# prompt: Create syncs for the routes that are specified by the passthroughs file as being "excluded" with the exception of the Sessioning routes. the front end should never try to call these routes. Instead, when a login route is called, you should use the Sessioning concept to generate a session id. Similarly, when a log out happens, you should use Sessioning to delete the session id. You should refer to the concept background and sync background for instructions on how to construct syncs in this manner. DO NOT create any syncs involving LikertSurvey routes, but refer to the sample sync file to see that you need a request and response for each sync. The excluded routes require the user being logged in (i.e. they can only do something if they are authenticated and have a valid session). You should write syncs accordingly to take in session ids for the excluded routes (with the exception of login, which cannot take in a session id as the user hasnʻt logged in yet). Use the concepts file for imports.

# response:

# file: src/syncs/auth.sync.ts
```typescript
import { Requesting, Sessioning, UserAuthentication } from "@concepts";
import { actions, Sync } from "@engine";

// --- Registration ---
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

export const RegisterResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Login ---
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

// On successful login, create a new session for the user.
export const LoginSuccessCreatesSession: Sync = ({ user }) => ({
  when: actions([UserAuthentication.login, {}, { user }]),
  then: actions([Sessioning.create, { user }]),
});

// Once the session is created, respond to the original login request with the user and session info.
export const LoginResponse: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
    [Sessioning.create, { user }, { session }],
  ),
  then: actions([Requesting.respond, { request, user, session }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Logout ---
// We define a custom /logout route that uses the Sessioning.delete action.
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/logout", session },
      { request },
    ],
  ),
  then: actions(
    [Sessioning.delete, { session }],
  ),
});

export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request, status: "logged_out" }],
  ),
});

export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});
```
# file: src/syncs/countryRecommendation.sync.ts
```typescript
import { CountryRecommendation, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// Note: All requests are authenticated by checking for a valid session.

// --- Get New Recommendations ---
export const GetNewRecsRequest: Sync = ({ request, session, user, countryName }) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getNewRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getNewRecs, { countryName }]),
});

export const GetNewRecsResponse: Sync = ({ request, recs }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getNewRecs" }, { request }],
    [CountryRecommendation.getNewRecs, {}, { recs }],
  ),
  then: actions([Requesting.respond, { request, recs }]),
});

export const GetNewRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getNewRecs" }, { request }],
    [CountryRecommendation.getNewRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Get System Recommendations ---
export const GetSystemRecsRequest: Sync = ({ request, session, user, countryName }) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getSystemRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getSystemRecs, { countryName }]),
});

export const GetSystemRecsResponse: Sync = ({ request, recs }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getSystemRecs" }, { request }],
    [CountryRecommendation.getSystemRecs, {}, { recs }],
  ),
  then: actions([Requesting.respond, { request, recs }]),
});

export const GetSystemRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getSystemRecs" }, { request }],
    [CountryRecommendation.getSystemRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Get Community Recommendations ---
export const GetCommunityRecsRequest: Sync = ({ request, session, user, countryName }) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getCommunityRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getCommunityRecs, { countryName }]),
});

export const GetCommunityRecsResponse: Sync = ({ request, recs }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getCommunityRecs" }, { request }],
    [CountryRecommendation.getCommunityRecs, {}, { recs }],
  ),
  then: actions([Requesting.respond, { request, recs }]),
});

export const GetCommunityRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getCommunityRecs" }, { request }],
    [CountryRecommendation.getCommunityRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Add Community Recommendation ---
export const AddCommunityRecRequest: Sync = ({ request, session, user, countryName, title, artist, genre, language, url }) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/addCommunityRec", session, countryName, title, artist, genre, language, url },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.addCommunityRec, { countryName, title, artist, genre, language, url }]),
});

export const AddCommunityRecResponse: Sync = ({ request, recId }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, { request }],
    [CountryRecommendation.addCommunityRec, {}, { recId }],
  ),
  then: actions([Requesting.respond, { request, recId }]),
});

export const AddCommunityRecResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, { request }],
    [CountryRecommendation.addCommunityRec, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Remove Community Recommendation ---
export const RemoveCommunityRecRequest: Sync = ({ request, session, user, recId }) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/removeCommunityRec", session, recId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.removeCommunityRec, { recId }]),
});

export const RemoveCommunityRecResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/removeCommunityRec" }, { request }],
    [CountryRecommendation.removeCommunityRec, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveCommunityRecResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/removeCommunityRec" }, { request }],
    [CountryRecommendation.removeCommunityRec, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
# file: src/syncs/passport.sync.ts
```typescript
import { Passport, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Log Exploration ---
export const LogExplorationRequest: Sync = ({ request, session, user, song, country }) => ({
  when: actions([
    Requesting.request,
    { path: "/Passport/logExploration", session, song, country },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Passport.logExploration, { user, song, country }]),
});

export const LogExplorationResponse: Sync = ({ request, entry }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { entry }],
  ),
  then: actions([Requesting.respond, { request, entry }]),
});

export const LogExplorationResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
# file: src/syncs/playlist.sync.ts
```typescript
import { Playlist, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Create Playlist ---
export const CreatePlaylistRequest: Sync = ({ request, session, user, name }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/createPlaylist", session, name },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.createPlaylist, { owner: user, name }]),
});

export const CreatePlaylistResponse: Sync = ({ request, playlist }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/createPlaylist" }, { request }],
    [Playlist.createPlaylist, {}, { playlist }],
  ),
  then: actions([Requesting.respond, { request, playlist }]),
});

export const CreatePlaylistResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/createPlaylist" }, { request }],
    [Playlist.createPlaylist, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Delete Playlist ---
export const DeletePlaylistRequest: Sync = ({ request, session, user, playlist }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/deletePlaylist", session, playlist },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.deletePlaylist, { user, playlist }]),
});

export const DeletePlaylistResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/deletePlaylist" }, { request }],
    [Playlist.deletePlaylist, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeletePlaylistResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/deletePlaylist" }, { request }],
    [Playlist.deletePlaylist, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Rename Playlist ---
export const RenamePlaylistRequest: Sync = ({ request, session, user, playlist, newName }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/renamePlaylist", session, playlist, newName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.renamePlaylist, { user, playlist, newName }]),
});

export const RenamePlaylistResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/renamePlaylist" }, { request }],
    [Playlist.renamePlaylist, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RenamePlaylistResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/renamePlaylist" }, { request }],
    [Playlist.renamePlaylist, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Add Song ---
export const AddSongRequest: Sync = ({ request, session, user, playlist, song }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/addSong", session, playlist, song },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.addSong, { user, playlist, song }]),
});

export const AddSongResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/addSong" }, { request }],
    [Playlist.addSong, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddSongResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/addSong" }, { request }],
    [Playlist.addSong, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Remove Song ---
export const RemoveSongRequest: Sync = ({ request, session, user, playlist, song }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/removeSong", session, playlist, song },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.removeSong, { user, playlist, song }]),
});

export const RemoveSongResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/removeSong" }, { request }],
    [Playlist.removeSong, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveSongResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/removeSong" }, { request }],
    [Playlist.removeSong, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Reorder Songs ---
export const ReorderSongsRequest: Sync = ({ request, session, user, playlist, songs }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/reorderSongs", session, playlist, songs },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Playlist.reorderSongs, { user, playlist, songs }]),
});

export const ReorderSongsResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/reorderSongs" }, { request }],
    [Playlist.reorderSongs, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ReorderSongsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Playlist/reorderSongs" }, { request }],
    [Playlist.reorderSongs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
# file: src/syncs/reporting.sync.ts
```typescript
import { Reporting, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Initialize Object ---
export const InitializeObjectRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/InitializeObject", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate the request, even if user ID isn't passed to the action
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Reporting.InitializeObject, { objectId }]),
});

export const InitializeObjectResponse: Sync = ({ request, objectId }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/InitializeObject" }, { request }],
    [Reporting.InitializeObject, {}, { objectId }],
  ),
  then: actions([Requesting.respond, { request, objectId }]),
});

export const InitializeObjectResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/InitializeObject" }, { request }],
    [Reporting.InitializeObject, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Report ---
export const ReportRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Report", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  // Map the 'user' variable from the session to the 'userId' parameter
  then: actions([Reporting.Report, { objectId, userId: user }]),
});

export const ReportResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Report" }, { request }],
    [Reporting.Report, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ReportResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Report" }, { request }],
    [Reporting.Report, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Unreport ---
export const UnreportRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Unreport", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  // Map the 'user' variable from the session to the 'userId' parameter
  then: actions([Reporting.Unreport, { objectId, userId: user }]),
});

export const UnreportResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
    [Reporting.Unreport, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const UnreportResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
    [Reporting.Unreport, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
