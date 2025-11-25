## Playlist

**concept** Playlist \[User, Song]

- **purpose**: organize collections of songs for personal use or sharing
- **principle**: If a user creates a playlist, names it "Road Trip Jams", and
  adds several songs, they can later retrieve that specific list of songs. If
  they then remove a song, reorder the remaining songs, and rename the playlist
  to "Classic Rock", the playlist will reflect all of these changes.
- **state**:
  - a set of Playlists with
    - owner: User
    - name: String
    - songs: sequence of Song
- **actions**:
  - `createPlaylist (owner: User, name: String): (playlist: Playlist)`
    - **requires**: `name` is not an empty string; the `owner` does not already
      have a playlist with that `name`
    - **effects**: creates a new `Playlist` `p`; sets `owner` of `p` to `owner`;
      sets `name` of `p` to `name`; sets `songs` of `p` to an empty sequence;
      returns `p` as `playlist`
  - `deletePlaylist (playlist: Playlist, user: User)`
    - **requires**: a `Playlist` with id `playlist` exists; the `owner` of
      `playlist` is `user`
    - **effects**: deletes the `Playlist` `playlist`
  - `renamePlaylist (playlist: Playlist, newName: String, user: User)`
    - **requires**: a `Playlist` with id `playlist` exists; the `owner` of
      `playlist` is `user`; `newName` is not an empty string; the `user` does
      not already have another playlist with `newName`
    - **effects**: updates the `name` of `playlist` to `newName`
  - `addSong (playlist: Playlist, song: Song, user: User)`
    - **requires**: a `Playlist` with id `playlist` exists; the `owner` of
      `playlist` is `user`
    - **effects**: appends `song` to the `songs` sequence of `playlist`
  - `removeSong (playlist: Playlist, song: Song, user: User)`
    - **requires**: a `Playlist` with id `playlist` exists; the `owner` of
      `playlist` is `user`; `song` exists in the `songs` sequence of `playlist`
    - **effects**: removes all occurrences of `song` from the `songs` sequence
      of `playlist`
  - `reorderSongs (playlist: Playlist, songs: sequence of Song, user: User)`
    - **requires**: a `Playlist` with id `playlist` exists; the `owner` of
      `playlist` is `user`; the multiset of `songs` in the new sequence is
      identical to the multiset of songs currently in the playlist
    - **effects**: updates the `songs` sequence of `playlist` to be the new
      `songs` sequence
- **queries**:
  - `_getPlaylistsForUser (user: User): (playlist: Playlist, name: String)`
    - **requires**: true
    - **effects**: returns a set of records, each containing the id and name of
      a playlist owned by `user`
  - `_getPlaylist (playlist: Playlist): (playlist: { _id: Playlist, name: String, owner: User, songs: sequence of Song })`
    - **requires**: `playlist` exists
    - **effects**: returns all information for the given `playlist`