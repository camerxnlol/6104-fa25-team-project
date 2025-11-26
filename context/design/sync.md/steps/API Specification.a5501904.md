---
timestamp: 'Tue Nov 25 2025 20:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205706.63a66186.md]]'
content_id: a5501904f6491575f34fe838bb16e60587750356746f13bffd09a632bb605024
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a given user.

**Requirements:**

* true.

**Effects:**

* creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.

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

***

### POST /api/Sessioning/delete

**Description:** Deletes an existing session.

**Requirements:**

* the given `session` exists.

**Effects:**

* removes the session `s`.

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

***

### POST /api/Sessioning/\_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**

* the given `session` exists.

**Effects:**

* returns the user associated with the session.

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

***
