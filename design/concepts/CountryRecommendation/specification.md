
# concept: CountryRecommendation

- **purpose**: provide Users with song recommendations from a specific country
- **principle**: maintain, update, and deliver curated (system) and user-added
  (community) song recommendations for each country, fetching new
  recommendations from an LLM when needed.
- **state**:
  - a set of Countries with
    - a countryName String
    - a set of Recs
  - a set of Recs with
    - a recId ID
    - a countryName String
    - a songTitle String
    - an artist String
    - a genre String
    - a language String
    - a youtubeURL String
    - a type String (“System” | “Community”)
- **actions**:
  - `getCountryEntry (countryName: String): (country: Country)`
    - **effects**: if name not in Countries, create new Country with empty recs
  - `getNewRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**:
      - call LLM for 3 new song recommendations from countryName
      - for each returned recommendation
        - if not already in country.recs (same title + artist)
          - create new Rec with new recId, type=“System”, and remaining data
            corresponding to LLM output
          - add recId to country.recs
    - **returns**: list of 3 recIds
  - `getSystemRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**: filter recs of type “System”, return 3 randomly chosen rec
      IDs, call llm to get new recs depending on heuristic
  - `getCommunityRecs (countryName: String): (recs: ID[ ])`
    - **requires**: country exists
    - **effects**: filter recs of type “Community”, return 3 randomly chosen IDs (or less if there are <3 community recs)
  - `addCommunityRec (countryName, title, artist, genre, language, url): (recId: ID)`
    - **requires**: country exists
    - **effects**:
      - create new Rec with new recId, type="Community", and remaining data as
        provided
      - add recId to country.recs
    - **returns**: recId
  - `removeCommunityRec (recId)`
    - **requires**: recId exists, rec.type == “Community”
    - **effects**: remove recId from recs
