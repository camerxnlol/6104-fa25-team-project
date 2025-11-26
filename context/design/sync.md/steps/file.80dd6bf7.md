---
timestamp: 'Tue Nov 25 2025 20:52:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205220.4783c4a6.md]]'
content_id: 80dd6bf7184634dc92d1f65cf279c9d7a832111b733a7e87ea4aff53d3ccae4f
---

# file: src/syncs/app.sync.ts

```typescript
import {
  CountryRecommendation,
  Passport,
  Playlist,
  Reporting,
  Requesting,
  Sessioning,
  UserAuthentication,
} from "@concepts";
import { actions, Sync } from "@engine";

// --- UserAuthentication Syncs ---
// These routes are for unauthenticated users, so they don't check for a session.

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

export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

export const LoginResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Sessioning Syncs ---
// These actions are the core of session management.

export const CreateSessionRequest: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/create", user }, { request }],
  ),
  then: actions([Sessioning.create, { user }]),
});

export const CreateSessionResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/create" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

export const DeleteSessionRequest: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete", session }, { request }],
  ),
  then: actions([Sessioning.delete, { session }]),
});

export const DeleteSessionResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request }]),
});

export const GetUserFromSessionRequest: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/_getUser", session }, { request }],
  ),
  then: actions([Sessioning._getUser, { session }]),
});

export const GetUserFromSessionResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/_getUser" }, { request }],
    [Sessioning._getUser, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

// --- Passport Syncs ---
// Actions require a valid session to identify the user.

export const LogExplorationRequest: Sync = ({ request, session, user, country, notes }) => ({
  when: actions([
    Requesting.request,
    { path: "/Passport/logExploration", session, country, notes },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Passport.logExploration, { user, country, notes }]),
});

export const LogExplorationResponse: Sync = ({ request, exploration }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { exploration }],
  ),
  then: actions([Requesting.respond, { request, exploration }]),
});

export const LogExplorationResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- Playlist Syncs ---
// All playlist modifications require a valid session to identify the owner.

export const CreatePlaylistRequest: Sync = ({ request, session, user, name, description }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/createPlaylist", session, name, description },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Playlist.createPlaylist, { owner: user, name, description }]),
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


export const DeletePlaylistRequest: Sync = ({ request, session, user, playlist }) => ({
  when: actions([
    Requesting.request,
    { path: "/Playlist/deletePlaylist", session, playlist },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Playlist.deletePlaylist, { user, playlist }]),
});

export const DeletePlaylistResponse: Sync = ({ request, playlist }) => ({
    when: actions(
      [Requesting.request, { path: "/Playlist/deletePlaylist" }, { request }],
      [Playlist.deletePlaylist, {}, { playlist }],
    ),
    then: actions([Requesting.respond, { request, playlist }]),
  });

export const DeletePlaylistResponseError: Sync = ({ request, error }) => ({
    when: actions(
      [Requesting.request, { path: "/Playlist/deletePlaylist" }, { request }],
      [Playlist.deletePlaylist, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
  });

// ... Similar request/response/error syncs for:
// renamePlaylist, addSong, removeSong, reorderSongs

// --- Reporting Syncs ---
// Reporting actions require a valid session to identify the reporter.

export const ReportRequest: Sync = ({ request, session, user, item, reason }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Report", session, item, reason },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Reporting.Report, { reporter: user, item, reason }]),
});

export const ReportResponse: Sync = ({ request, report }) => ({
    when: actions(
      [Requesting.request, { path: "/Reporting/Report" }, { request }],
      [Reporting.Report, {}, { report }],
    ),
    then: actions([Requesting.respond, { request, report }]),
  });

export const ReportResponseError: Sync = ({ request, error }) => ({
    when: actions(
      [Requesting.request, { path: "/Reporting/Report" }, { request }],
      [Reporting.Report, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
  });


export const UnreportRequest: Sync = ({ request, session, user, item }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Unreport", session, item },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Reporting.Unreport, { reporter: user, item }]),
});

export const UnreportResponse: Sync = ({ request, report }) => ({
    when: actions(
      [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
      [Reporting.Unreport, {}, { report }],
    ),
    then: actions([Requesting.respond, { request, report }]),
  });

export const UnreportResponseError: Sync = ({ request, error }) => ({
    when: actions(
      [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
      [Reporting.Unreport, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
  });


// --- CountryRecommendation Syncs ---
// These actions all require a logged-in user.

export const AddCommunityRecRequest: Sync = ({ request, session, user, country, reason }) => ({
    when: actions([
        Requesting.request,
        { path: "/CountryRecommendation/addCommunityRec", session, country, reason },
        { request },
    ]),
    where: async (frames) =>
        frames.query(Sessioning._getUser, { session }, { user }),
    then: actions([CountryRecommendation.addCommunityRec, { user, country, reason }]),
});

export const AddCommunityRecResponse: Sync = ({ request, recommendation }) => ({
    when: actions(
        [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, { request }],
        [CountryRecommendation.addCommunityRec, {}, { recommendation }],
    ),
    then: actions([Requesting.respond, { request, recommendation }]),
});

export const AddCommunityRecResponseError: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, { request }],
        [CountryRecommendation.addCommunityRec, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// ... This same request/response/error pattern would be repeated for all other
// excluded CountryRecommendation routes:
// - getCountryEntry, getNewRecs, llmFetch, createPrompt,
// - getSystemRecs, getCommunityRecs, removeCommunityRec
```
