---
timestamp: 'Mon Nov 24 2025 19:19:15 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_191915.674638ff.md]]'
content_id: 9a727caafb094479f3de92ce8b3dbcb40e055d39b5201e8816f0bba56b474f00
---

# API Specification: UserAuthentication Concept

**Purpose:** To securely verify a user's identity based on credentials.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**

* no User exists with the given `username`. (for success)
* a User already exists with the given `username`. (for error)

**Effects:**

* creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`. (for success)
* returns an error message. (for error)

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

***

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with their username and password.

**Requirements:**

* a User exists with the given `username` and the `password` matches their `passwordHash`. (for success)
* no User exists with the given `username` or the `password` does not match. (for error)

**Effects:**

* returns the matching User `u` as `user`. (for success)
* returns an error message. (for error)

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

***

### POST /api/UserAuthentication/\_getUserByUsername

**Description:** Retrieves a user by their username.

**Requirements:**

* a User with the given `username` exists.

**Effects:**

* returns the corresponding User.

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

***
