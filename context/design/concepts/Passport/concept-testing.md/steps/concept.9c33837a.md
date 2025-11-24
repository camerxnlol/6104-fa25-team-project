---
timestamp: 'Mon Nov 24 2025 10:36:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_103620.727aee01.md]]'
content_id: 9c33837a5283ae2e697d3571550b1f34d6abd79413c477493200ee1458ff3537
---

# concept: Passport

* **concept**: Passport \[User, Song]
* **purpose**: track a user's musical exploration across different countries to encourage broader cultural discovery
* **principle**: if a user listens to a song from a country they haven't explored before, then that country is added to their passport, which they can view as a list of explored countries
* **state**:
  * a set of HistoryEntries with
    * a user User
    * a song Song
    * a country String
    * a date Date
* **actions**:
  * `logExploration (user: User, song: Song, country: String): (entry: HistoryEntry)`
    * **requires**: true
    * **effects**: creates a new HistoryEntry `e` with the given `user`, `song`, and `country`, sets its `date` to the current time, and returns the ID of `e` as `entry`
* **queries**:
  * `_getExploredCountries (user: User): (country: String)`
    * **requires**: user has one or more HistoryEntries
    * **effects**: returns the set of unique countries from all HistoryEntries associated with the given user
  * `_getHistoryForCountry (user: User, country: String): (entry: {song: Song, date: Date})`
    * **requires**: user has one or more HistoryEntries for the given country
    * **effects**: returns all song and date pairs from HistoryEntries associated with the given user and country, ordered by most recent date first
