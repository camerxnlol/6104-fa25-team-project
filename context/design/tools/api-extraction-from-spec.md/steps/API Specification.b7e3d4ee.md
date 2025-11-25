---
timestamp: 'Mon Nov 24 2025 19:19:15 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_191915.674638ff.md]]'
content_id: b7e3d4ee05a8c34cee311fa246782e22840c56fb0bc8c7521711ae0db6b520b6
---

# API Specification: CountryRecommendation Concept

**Purpose:** provide Users with song recommendations from a specific country

***

## API Endpoints

### POST /api/CountryRecommendation/createCountry

**Description:** Creates a new country entry for recommendations.

**Requirements:**

* true

**Effects:**

* if name not in Countries, create new Country with empty recs

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

***

### POST /api/CountryRecommendation/getNewRecs

**Description:** Fetches and adds 3 new system-generated song recommendations for a country using an LLM.

**Requirements:**

* country exists

**Effects:**

* call LLM for 3 new song recommendations from countryName
* for each returned recommendation
  * if not already in country.recs (same title + artist)
    * create new Rec with new recId, type=“System”, and remaining data corresponding to LLM output
    * add recId to country.recs
* returns list of 3 recIds

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

***

### POST /api/CountryRecommendation/getSystemRecs

**Description:** Retrieves 3 randomly chosen system-generated song recommendations for a country.

**Requirements:**

* country exists

**Effects:**

* filter recs of type “System”
* return 3 randomly chosen rec IDs

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

***

### POST /api/CountryRecommendation/getCommunityRecs

**Description:** Retrieves 3 randomly chosen community-submitted song recommendations for a country.

**Requirements:**

* country exists

**Effects:**

* filter recs of type “Community”
* return 3 randomly chosen IDs

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

***

### POST /api/CountryRecommendation/addCommunityRec

**Description:** Adds a new community-submitted song recommendation to a country.

**Requirements:**

* country exists

**Effects:**

* create new Rec with new recId, type="Community", and remaining data as provided
* add recId to country.recs
* returns recId

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

***

### POST /api/CountryRecommendation/removeCommunityRec

**Description:** Removes a community-submitted song recommendation.

**Requirements:**

* recId exists
* rec.type == “Community”

**Effects:**

* remove recId from recs

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

***
