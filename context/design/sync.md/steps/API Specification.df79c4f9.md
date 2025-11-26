---
timestamp: 'Tue Nov 25 2025 20:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205706.63a66186.md]]'
content_id: df79c4f9d024b1dc41d1033dce1ba2ca9cd7cdd2934f34e0cbe57cb97db0b55a
---

# API Specification: Reporting Concept

**Purpose:** to create and keep track of reports made on objects

***

## API Endpoints

### POST /api/Reporting/InitializeObject

**Description:** Initializes a new report entry for a given object ID.

**Requirements:**

* a report containing objectId doesn’t already exist

**Effects:**

* Creates a new report with objectId. Set the report’s count=0 and reporters set to empty. Return objectId

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

***

### POST /api/Reporting/Report

**Description:** Reports an object by a specific user, incrementing the report count.

**Requirements:**

* a report for objectId exists and userId isn’t in its reporters set

**Effects:**

* increment the count of the report that contains objectId. Add userId to its reporters set

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

***

### POST /api/Reporting/Unreport

**Description:** Unreports an object by a specific user, decrementing the report count.

**Requirements:**

* a report for objectId exists and userId is in its reporters set

**Effects:**

* decrement the count for the report. Remove userId from its reporters set.

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

***

### POST /api/Reporting/\_getReportCount

**Description:** Retrieves the current report count for a given object.

**Requirements:**

* a report for objectId exists

**Effects:**

* returns the count of the report

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

***
