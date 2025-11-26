---
timestamp: 'Tue Nov 25 2025 20:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205706.63a66186.md]]'
content_id: d921bbf8a7fc6aff943b2ca304ea12c6af4ff0835194f5a1600e433008057041
---

# API Specification: Playlist Concept

**Purpose:** organize collections of songs for personal use or sharing

***

## API Endpoints

### POST /api/Playlist/createPlaylist

**Description:** Creates a new playlist for a given user with a specified name.

**Requirements:**

* `name` is not an empty string
* the `owner` does not already have a playlist with that `name`

**Effects:**

* creates a new `Playlist` `p`
* sets `owner` of `p` to `owner`
* sets `name` of `p` to `name`
* sets `songs` of `p` to an empty sequence
* returns `p` as `playlist`

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

***

### POST /api/Playlist/deletePlaylist

**Description:** Deletes an existing playlist owned by the specified user.

**Requirements:**

* a `Playlist` with id `playlist` exists
* the `owner` of `playlist` is `user`

**Effects:**

* deletes the `Playlist` `playlist`

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

***

### POST /api/Playlist/renamePlaylist

**Description:** Renames an existing playlist owned by the specified user.

**Requirements:**

* a `Playlist` with id `playlist` exists
* the `owner` of `playlist` is `user`
* `newName` is not an empty string
* the `user` does not already have another playlist with `newName`

**Effects:**

* updates the `name` of `playlist` to `newName`

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

***

### POST /api/Playlist/addSong

**Description:** Adds a song to an existing playlist owned by the specified user.

**Requirements:**

* a `Playlist` with id `playlist` exists
* the `owner` of `playlist` is `user`

**Effects:**

* appends `song` to the `songs` sequence of `playlist`

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

***

### POST /api/Playlist/removeSong

**Description:** Removes all occurrences of a song from an existing playlist owned by the specified user.

**Requirements:**

* a `Playlist` with id `playlist` exists
* the `owner` of `playlist` is `user`
* `song` exists in the `songs` sequence of `playlist`

**Effects:**

* removes all occurrences of `song` from the `songs` sequence of `playlist`

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

***

### POST /api/Playlist/reorderSongs

**Description:** Reorders the songs within an existing playlist owned by the specified user.

**Requirements:**

* a `Playlist` with id `playlist` exists
* the `owner` of `playlist` is `user`
* the multiset of `songs` in the new sequence is identical to the multiset of songs currently in the playlist

**Effects:**

* updates the `songs` sequence of `playlist` to be the new `songs` sequence

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

***

### POST /api/Playlist/\_getPlaylistsForUser

**Description:** Retrieves the IDs and names of all playlists owned by a specified user.

**Requirements:**

* true

**Effects:**

* returns a set of records, each containing the id and name of a playlist owned by `user`

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

***

### POST /api/Playlist/\_getPlaylist

**Description:** Retrieves all details for a given playlist.

**Requirements:**

* `playlist` exists

**Effects:**

* returns all information for the given `playlist`

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

***
