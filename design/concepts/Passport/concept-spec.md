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