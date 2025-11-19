# Concept Design & Syncs

## CountryRecommendation

### concept: CountryRecommendation

- **purpose**: provide Users with song recommendations from a specific country
- **principle**: maintain, update, and deliver curated (system) and user-added
  (community) song recommendations for each country, fetching new
  recommendations from an LLM when needed.
- **state**:
  - a set of Countries with
    - a countryName String
    - a set of Recs
  - a set of Recs with
    - a recId ID
    - a songTitle String
    - an artist String
    - a genre String?
    - a language String
    - a youtubeURL String
    - a type String (“System” | “Community”)
- **actions**:
  - `createCountry (countryName: String)`
    - **effects**: if name not in Countries, create new Country with empty recs
  - `getNewRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**:
      - call LLM for 3 new song recommendations from countryName
      - for each returned recommendation
        - if not already in country.recs (same title + artist)
          - create new Rec with new recId, type=“System”, and remaining data
            corresponding to LLM output
          - add recId to country.recs
    - **returns**: list of 3 recIds
  - `getSystemRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**: filter recs of type “System”, return 3 randomly chosen rec
      IDs
  - `getCommunityRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**: filter recs of type “Community”, return 3 randomly chosen IDs
  - `addCommunityRec (countryName, title, artist, genre?, language, url): (recId: ID)`
    - **requires**: country exists
    - **effects**:
      - create new Rec with new recId, type="Community", and remaining data as
        provided
      - add recId to country.recs
    - **returns**: recId
  - `removeCommunityRec (recId)`
    - **requires**: recId exists, rec.type == “Community”
    - **effects**: remove recId from recs

## UserAuthentication

### concept: UserAuthentication \[User]

- **purpose**: To securely verify a user's identity based on credentials.
- **principle**: If you register with a unique username and a password, and
  later provide the same credentials to log in, you will be successfully
  identified as that user.
- **state**:
  - a set of `User`s with
    - a `username` String (unique)
    - a `passwordHash` String
- **actions**:
  - `register (username: String, password: String): (user: User)`
    - **requires**: no User exists with the given `username`.
    - **effects**: creates a new User `u`; sets their `username` and a hash of
      their `password`; returns `u` as `user`.
  - `register (username: String, password: String): (error: String)`
    - **requires**: a User already exists with the given `username`.
    - **effects**: returns an error message.
  - `login (username: String, password: String): (user: User)`
    - **requires**: a User exists with the given `username` and the `password`
      matches their `passwordHash`.
    - **effects**: returns the matching User `u` as `user`.
  - `login (username: String, password: String): (error: String)`
    - **requires**: no User exists with the given `username` or the `password`
      does not match.
    - **effects**: returns an error message.
- **queries**:
  - `_getUserByUsername (username: String): (user: User)`
    - **requires**: a User with the given `username` exists.
    - **effects**: returns the corresponding User.

## Sessioning

### concept: Sessioning [User, Session]

- **purpose**: To maintain a user's logged-in state across multiple requests
  without re-sending credentials.
- **principle**: After a user is authenticated, a session is created for them.
  Subsequent requests using that session's ID are treated as being performed by
  that user, until the session is deleted (logout).
- **state**:
  - a set of `Session`s with
    - a `user` User
- **actions**:
  - `create (user: User): (session: Session)`
    - **requires**: true.
    - **effects**: creates a new Session `s`; associates it with the given
      `user`; returns `s` as `session`.
  - `delete (session: Session): ()`
    - **requires**: the given `session` exists.
    - **effects**: removes the session `s`.
- **queries**:
  - `_getUser (session: Session): (user: User)`
    - **requires**: the given `session` exists.
    - **effects**: returns the user associated with the session.

## Reporting

## Passport

### concept: Passport \[User, Song]

- **purpose**: track a user's musical exploration across different countries to
  encourage broader cultural discovery
- **principle**: if a user listens to a song from a country they haven't
  explored before, then that country is added to their passport, which they can
  view as a list of explored countries
- **state**:
  - a set of HistoryEntries with
    - a user User
    - a song Song
    - a country String
    - a date Date
- **actions**:
  - `logExploration (user: User, song: Song, country: String): (entry: HistoryEntry)`
    - **requires**: true
    - **effects**: creates a new HistoryEntry `e` with the given `user`, `song`,
      and `country`, sets its `date` to the current time, and returns the ID of
      `e` as `entry`
- **queries**:
  - `_getExploredCountries (user: User): (country: String)`
    - **requires**: user has one or more HistoryEntries
    - **effects**: returns the set of unique countries from all HistoryEntries
      associated with the given user
  - `_getHistoryForCountry (user: User, country: String): (entry: {song: Song, date: Date})`
    - **requires**: user has one or more HistoryEntries for the given country
    - **effects**: returns all song and date pairs from HistoryEntries
      associated with the given user and country, ordered by most recent date
      first

### Notes

**Q:** Why do we not just have User as the outer object of this concept?

**A:**

- **Separation of Concerns:** The `Passport` concept's sole purpose is to "track
  a user's musical exploration." Its state should therefore represent that
  exploration history as directly as possible. The primary "thing" in this
  concept is a `HistoryEntry`. A `User` is simply an attribute _of_ that entry,
  indicating who performed the action.
- **Concept Independence:** If we were to nest the history _inside_ a `User`
  document, it would imply that the `Passport` concept is responsible for
  managing or modifying the `User` object. A different concept, like
  `UserAuthentication` or `UserProfile`, should be the sole owner of the `User`
  entity. By keeping the history as a separate collection of `HistoryEntry`
  documents that simply _reference_ a `User`, we maintain a clean separation.
  The `Passport` concept doesn't need to know anything about a `User` other than
  its ID.

## Playlist

### concept: Playlist \[User, Song]

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

## Syncs
