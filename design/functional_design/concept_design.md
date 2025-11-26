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

### concept: Reporting

- **purpose**: to create and keep track of reports made on objects
- **principle**: the user can initialize objects to be reported. Any time they
  would like to, they can report objects, which stores the report for later use
- **state**:
  - a set of Reports with
    - an objectId of type string
    - a count of type Number
    - a reporters set of userId string
- **actions**:
  - `InitializeObject (objectId: string): (objectId: string)`
    - **requires**: a report containing objectId doesn’t already exist
    - **effects**: Creates a new report with objectId. Set the report’s count=0
      and reporters set to empty. Return objectId
  - `Report (objectId: string, userId: string)`
    - **requires**: a report for objectId exists and userId isn’t in its
      reporters set
    - **effects**: increment the count of the report that contains objectId. Add
      userId to its reporters set
  - `Unreport (objectId: string, userId: string)`
    - **requires**: a report for objectId exists and userId is in its reporters
      set
    - **effects**: decrement the count for the report. Remove userId from its
      reporters set.
- **queries**:
  - `_getReportCount (objectId: string): (count: Number)`
    - **requires**: a report for objectId exists
    - **effects**: returns the count of the report
  - `_getReporters (objectId: string): (reporters: a set of User)`
    - **requires**: a report for objectId exists
    - **effects**: returns the reporters of the objectId

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
**sync** LoginCreatesSession
*purpose*: Automatically create a session for a user upon successful login.
```sync
when
    UserAuthentication.login (username, password): (user)
then
    Sessioning.create (user)
```

---
**sync** LogoutDeletesSession\
*purpose*: Terminate a user's session when they request to log out.
```sync
when
    Requesting.request (path: "/logout", session)
where
    in Sessioning: _getUser (session) gets user
then
    Sessioning.delete (session)
```

---
**sync** InitializeReportForNewCommunityRec\
*purpose*: Ensure every new community-submitted recommendation can be reported on.
```sync
when
    CountryRecommendation.addCommunityRec (): (recId)
then
    Reporting.InitializeObject (objectId: recId)
```

---
**sync** RemoveRecommendationOnHighReports\
*purpose*: Automatically remove a community recommendation if it receives too many reports (e.g., more than 5).
```sync
when
    Reporting.Report (objectId, userId)
where
    in Reporting: _getReportCount (objectId) gets count
    count > 5
then
    CountryRecommendation.removeCommunityRec (recId: objectId)
```

---
**sync** AuthorizeAndCreatePlaylist\
*purpose*: A representative example of the authorization pattern. It checks for a valid session before allowing a user to create a playlist. This pattern would be replicated for all actions requiring an authenticated user.
```sync
when
    Requesting.request (path: "/playlists/create", name, session)
where
    in Sessioning: _getUser (session) gets user
then
    Playlist.createPlaylist (owner: user, name)
```

### Additional Auth Syncs
**sync** HandleRegisterRequest\
*purpose*: Trigger the user registration process when a request is made to the register endpoint.
```sync
when
    Requesting.request (path: "/register", username, password)
then
    UserAuthentication.register (username, password)
```

---
**sync** RegisterSuccessResponse\
*purpose*: Respond to the original registration request with the new user's ID upon success.
```sync
when
    Requesting.request (path: "/register", username): (request)
    UserAuthentication.register (username): (user)
then
    Requesting.respond (request, user, status: "registered")
```

---
**sync** RegisterErrorResponse\
*purpose*: Respond to a failed registration attempt with an error message (e.g., username taken).
```sync
when
    Requesting.request (path: "/register", username): (request)
    UserAuthentication.register (username): (error)
then
    Requesting.respond (request, error)
```

---
**sync** HandleLoginRequest\
*purpose*: Trigger the user login process when a request is made to the login endpoint.
```sync
when
    Requesting.request (path: "/login", username, password)
then
    UserAuthentication.login (username, password)
```

---
**sync** LoginSuccessResponse\
*purpose*: Respond to a successful login request with the newly created session ID. This sync relies on `LoginCreatesSession` firing first.
```sync
when
    Requesting.request (path: "/login"): (request)
    Sessioning.create (): (session)
then
    Requesting.respond (request, session)
```

---
**sync** LoginErrorResponse\
*purpose*: Respond to a failed login attempt with an error message.
```sync
when
    Requesting.request (path: "/login"): (request)
    UserAuthentication.login (): (error)
then
    Requesting.respond (request, error)
```
### Additional Syncs For Checking if User has Valid Session
**sync** LogSongExplorationInPassport\
*purpose*: When a user listens to a song (proxied by a request for its details), log this activity in their passport to track their musical journey.
```sync
when
    Requesting.request (path: "/songs/details", song, country, session)
where
    in Sessioning: _getUser (session) gets user
then
    Passport.logExploration (user, song, country)
```

---
**sync** GetExploredCountries\
*purpose*: Allow a user to retrieve the list of all countries they have explored from their passport.
```sync
when
    Requesting.request (path: "/passport/countries", session): (request)
where
    in Sessioning: _getUser (session) gets user
    in Passport: _getExploredCountries (user) gets countries
then
    Requesting.respond (request, countries)
```

---
**sync** HandleAddCommunityRecRequest\
*purpose*: Authorize and process a user's request to add a new community song recommendation.
```sync
when
    Requesting.request (path: "/recommendations/add", countryName, title, artist, language, url, session)
where
    in Sessioning: _getUser (session) gets user
then
    CountryRecommendation.addCommunityRec (countryName, title, artist, language, url)
```

---
**sync** AddCommunityRecResponse\
*purpose*: Confirm the successful addition of a community recommendation by responding with its new ID.
```sync
when
    Requesting.request (path: "/recommendations/add"): (request)
    CountryRecommendation.addCommunityRec (): (recId)
then
    Requesting.respond (request, recId)
```

---
**sync** HandleReportRequest\
*purpose*: Authorize and process a user's request to report a piece of content.
```sync
when
    Requesting.request (path: "/report", objectId, session)
where
    in Sessioning: _getUser (session) gets user
then
    Reporting.Report (objectId, userId: user)
```
