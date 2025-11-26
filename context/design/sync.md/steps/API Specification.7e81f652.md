---
timestamp: 'Tue Nov 25 2025 20:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205706.63a66186.md]]'
content_id: 7e81f6527727042f309294290bac027f6ffd2f6cbe596104d4c947adec1b755a
---

# API Specification: Passport Concept

**Purpose:** track a user's musical exploration across different countries to encourage broader cultural discovery

***

## API Endpoints

### POST /api/Passport/logExploration

**Description:** Logs a user's musical exploration of a song from a specific country.

**Requirements:**

* true

**Effects:**

* creates a new HistoryEntry `e` with the given `user`, `song`, and `country`, sets its `date` to the current time, and returns the ID of `e` as `entry`

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

***

### POST /api/Passport/\_getExploredCountries

**Description:** Retrieves the set of unique countries a user has explored.

**Requirements:**

* user has one or more HistoryEntries

**Effects:**

* returns the set of unique countries from all HistoryEntries associated with the given user

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

***

### POST /api/Passport/\_getHistoryForCountry

**Description:** Retrieves the song and date history for a specific country explored by a user.

**Requirements:**

* user has one or more HistoryEntries for the given country

**Effects:**

* returns all song and date pairs from HistoryEntries associated with the given user and country, ordered by most recent date first

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

***
