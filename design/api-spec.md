# API Specification: CountryRecommendation Concept

**Purpose:** provide Users with song recommendations from a specific country

---

## API Endpoints

### POST /api/CountryRecommendation/createCountry

**Description:** Creates a new country entry for recommendations.

**Requirements:**
- true

**Effects:**
- if name not in Countries, create new Country with empty recs

**Request Body:**
```json
{
  "countryName": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CountryRecommendation/getNewRecs

**Description:** Fetches and adds 3 new system-generated song recommendations for a country using an LLM.

**Requirements:**
- country exists

**Effects:**
- call LLM for 3 new song recommendations from countryName
- for each returned recommendation
  - if not already in country.recs (same title + artist)
    - create new Rec with new recId, type=“System”, and remaining data corresponding to LLM output
    - add recId to country.recs
- returns list of 3 recIds

**Request Body:**
```json
{
  "countryName": "string"
}
```

**Success Response Body (Action):**
```json
{
  "recs": ["string", "string", "string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CountryRecommendation/getSystemRecs

**Description:** Retrieves 3 randomly chosen system-generated song recommendations for a country.

**Requirements:**
- country exists

**Effects:**
- filter recs of type “System”
- return 3 randomly chosen rec IDs

**Request Body:**
```json
{
  "countryName": "string"
}
```

**Success Response Body (Action):**
```json
{
  "recs": ["string", "string", "string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CountryRecommendation/getCommunityRecs

**Description:** Retrieves 3 randomly chosen community-submitted song recommendations for a country.

**Requirements:**
- country exists

**Effects:**
- filter recs of type “Community”
- return 3 randomly chosen IDs

**Request Body:**
```json
{
  "countryName": "string"
}
```

**Success Response Body (Action):**
```json
{
  "recs": ["string", "string", "string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CountryRecommendation/addCommunityRec

**Description:** Adds a new community-submitted song recommendation to a country.

**Requirements:**
- country exists

**Effects:**
- create new Rec with new recId, type="Community", and remaining data as provided
- add recId to country.recs
- returns recId

**Request Body:**
```json
{
  "countryName": "string",
  "title": "string",
  "artist": "string",
  "genre": "string",   // Optional
  "language": "string",
  "url": "string"
}
```

**Success Response Body (Action):**
```json
{
  "recId": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CountryRecommendation/removeCommunityRec

**Description:** Removes a community-submitted song recommendation.

**Requirements:**
- recId exists
- rec.type == “Community”

**Effects:**
- remove recId from recs

**Request Body:**
```json
{
  "recId": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: UserAuthentication Concept

**Purpose:** To securely verify a user's identity based on credentials.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**
- no User exists with the given `username`. (for success)
- a User already exists with the given `username`. (for error)

**Effects:**
- creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`. (for success)
- returns an error message. (for error)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with their username and password.

**Requirements:**
- a User exists with the given `username` and the `password` matches their `passwordHash`. (for success)
- no User exists with the given `username` or the `password` does not match. (for error)

**Effects:**
- returns the matching User `u` as `user`. (for success)
- returns an error message. (for error)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/_getUserByUsername

**Description:** Retrieves a user by their username.

**Requirements:**
- a User with the given `username` exists.

**Effects:**
- returns the corresponding User.

**Request Body:**
```json
{
  "username": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

---

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a given user.

**Requirements:**
- true.

**Effects:**
- creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{
  "session": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Sessioning/delete

**Description:** Deletes an existing session.

**Requirements:**
- the given `session` exists.

**Effects:**
- removes the session `s`.

**Request Body:**
```json
{
  "session": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Sessioning/_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**
- the given `session` exists.

**Effects:**
- returns the user associated with the session.

**Request Body:**
```json
{
  "session": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Reporting Concept

**Purpose:** to create and keep track of reports made on objects

---

## API Endpoints

### POST /api/Reporting/InitializeObject

**Description:** Initializes a new report entry for a given object ID.

**Requirements:**
- a report containing objectId doesn’t already exist

**Effects:**
- Creates a new report with objectId. Set the report’s count=0 and reporters set to empty. Return objectId

**Request Body:**
```json
{
  "objectId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "objectId": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Reporting/Report

**Description:** Reports an object by a specific user, incrementing the report count.

**Requirements:**
- a report for objectId exists and userId isn’t in its reporters set

**Effects:**
- increment the count of the report that contains objectId. Add userId to its reporters set

**Request Body:**
```json
{
  "objectId": "string",
  "userId": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Reporting/Unreport

**Description:** Unreports an object by a specific user, decrementing the report count.

**Requirements:**
- a report for objectId exists and userId is in its reporters set

**Effects:**
- decrement the count for the report. Remove userId from its reporters set.

**Request Body:**
```json
{
  "objectId": "string",
  "userId": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Reporting/_getReportCount

**Description:** Retrieves the current report count for a given object.

**Requirements:**
- a report for objectId exists

**Effects:**
- returns the count of the report

**Request Body:**
```json
{
  "objectId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "count": "number"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Passport Concept

**Purpose:** track a user's musical exploration across different countries to encourage broader cultural discovery

---

## API Endpoints

### POST /api/Passport/logExploration

**Description:** Logs a user's musical exploration of a song from a specific country.

**Requirements:**
- true

**Effects:**
- creates a new HistoryEntry `e` with the given `user`, `song`, and `country`, sets its `date` to the current time, and returns the ID of `e` as `entry`

**Request Body:**
```json
{
  "user": "string",
  "song": "string",
  "country": "string"
}
```

**Success Response Body (Action):**
```json
{
  "entry": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Passport/_getExploredCountries

**Description:** Retrieves the set of unique countries a user has explored.

**Requirements:**
- user has one or more HistoryEntries

**Effects:**
- returns the set of unique countries from all HistoryEntries associated with the given user

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "country": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Passport/_getHistoryForCountry

**Description:** Retrieves the song and date history for a specific country explored by a user.

**Requirements:**
- user has one or more HistoryEntries for the given country

**Effects:**
- returns all song and date pairs from HistoryEntries associated with the given user and country, ordered by most recent date first

**Request Body:**
```json
{
  "user": "string",
  "country": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "song": "string",
    "date": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Playlist Concept

**Purpose:** organize collections of songs for personal use or sharing

---

## API Endpoints

### POST /api/Playlist/createPlaylist

**Description:** Creates a new playlist for a given user with a specified name.

**Requirements:**
- `name` is not an empty string
- the `owner` does not already have a playlist with that `name`

**Effects:**
- creates a new `Playlist` `p`
- sets `owner` of `p` to `owner`
- sets `name` of `p` to `name`
- sets `songs` of `p` to an empty sequence
- returns `p` as `playlist`

**Request Body:**
```json
{
  "owner": "string",
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{
  "playlist": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/deletePlaylist

**Description:** Deletes an existing playlist owned by the specified user.

**Requirements:**
- a `Playlist` with id `playlist` exists
- the `owner` of `playlist` is `user`

**Effects:**
- deletes the `Playlist` `playlist`

**Request Body:**
```json
{
  "playlist": "string",
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/renamePlaylist

**Description:** Renames an existing playlist owned by the specified user.

**Requirements:**
- a `Playlist` with id `playlist` exists
- the `owner` of `playlist` is `user`
- `newName` is not an empty string
- the `user` does not already have another playlist with `newName`

**Effects:**
- updates the `name` of `playlist` to `newName`

**Request Body:**
```json
{
  "playlist": "string",
  "newName": "string",
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/addSong

**Description:** Adds a song to an existing playlist owned by the specified user.

**Requirements:**
- a `Playlist` with id `playlist` exists
- the `owner` of `playlist` is `user`

**Effects:**
- appends `song` to the `songs` sequence of `playlist`

**Request Body:**
```json
{
  "playlist": "string",
  "song": "string",
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/removeSong

**Description:** Removes all occurrences of a song from an existing playlist owned by the specified user.

**Requirements:**
- a `Playlist` with id `playlist` exists
- the `owner` of `playlist` is `user`
- `song` exists in the `songs` sequence of `playlist`

**Effects:**
- removes all occurrences of `song` from the `songs` sequence of `playlist`

**Request Body:**
```json
{
  "playlist": "string",
  "song": "string",
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/reorderSongs

**Description:** Reorders the songs within an existing playlist owned by the specified user.

**Requirements:**
- a `Playlist` with id `playlist` exists
- the `owner` of `playlist` is `user`
- the multiset of `songs` in the new sequence is identical to the multiset of songs currently in the playlist

**Effects:**
- updates the `songs` sequence of `playlist` to be the new `songs` sequence

**Request Body:**
```json
{
  "playlist": "string",
  "songs": ["string"],
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/_getPlaylistsForUser

**Description:** Retrieves the IDs and names of all playlists owned by a specified user.

**Requirements:**
- true

**Effects:**
- returns a set of records, each containing the id and name of a playlist owned by `user`

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "playlist": "string",
    "name": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Playlist/_getPlaylist

**Description:** Retrieves all details for a given playlist.

**Requirements:**
- `playlist` exists

**Effects:**
- returns all information for the given `playlist`

**Request Body:**
```json
{
  "playlist": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "name": "string",
    "owner": "string",
    "songs": ["string"]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---