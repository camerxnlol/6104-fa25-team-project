---
timestamp: 'Mon Nov 24 2025 19:14:04 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_191404.7baaf023.md]]'
content_id: d46073c4d21b53b9c6560f43ec9fd531b47700e0e0ef770fe3431bc56e8eda2b
---

# API Specification: Labeling Concept

**Purpose:** Manages the association of labels with generic items, enabling items to be categorized and retrieved by their labels.

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label in the system with a unique name.

**Requirements:**

* The provided `name` for the label is not empty.

**Effects:**

* A new `Label` entity is created and stored, associated with the provided `name`.

**Request Body:**

```json
{
  "name": "string"
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

### POST /api/Labeling/addLabel

**Description:** Associates an existing label with a given item.

**Requirements:**

* The `item` and `label` entities must exist.
* The `item` is not already associated with this `label`.

**Effects:**

* The specified `label` is added to the set of labels associated with the `item`.

**Request Body:**

```json
{
  "item": "string",
  "label": "string"
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

### POST /api/Labeling/deleteLabel

**Description:** Removes an association between a label and an item.

**Requirements:**

* The `item` and `label` entities must exist.
* The `item` must currently have the specified `label` associated with it.

**Effects:**

* The specified `label` is removed from the set of labels associated with the `item`.

**Request Body:**

```json
{
  "item": "string",
  "label": "string"
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
