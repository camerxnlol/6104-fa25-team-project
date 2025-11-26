---
timestamp: 'Tue Nov 25 2025 20:58:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205843.559f3a3a.md]]'
content_id: 830abd605fdbee44c840b56b5f407c2a068d909804cb7f5827adfa9c47e440d0
---

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
