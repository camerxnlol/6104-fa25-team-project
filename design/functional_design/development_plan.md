# Development Plan

We identified several essential (P0) backend concepts: **CountryRecommendations, UserAuthentication, Sessioning, Reporting, UserProfile, Playlist**. We also have a few stretch goals: **Cultural Deep Dive, Friending**. Below is a timeline, an assignment of tasks, and a discussion of key risks.

## Timeline & Feature Milestones

Key dates:
* **11/25 – Checkpoint Alpha**: All essential backend concepts, syncs, and minimal frontend implemented
* **12/02 – Checkpoint Beta**: Stretch-goal concepts implemented and polished frontend.
* **12/07 – User Testing complete**
* **12/09 – Final demo & report**

### 1.1 Milestone Table

| Date                                    | Milestone                   | Backend & Syncs                                                                                                                                                                                                                                                | Frontend / UX                                                                                                                                                            |
| --------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **11/18–11/20**                         | Project setup & scaffolding | Integrate existing **UserAuthentication** and **Sessioning** to app skeleton, finalize concept specs.                                                                                                                                                          | N/A                                                                                                                                                                      |
| **11/21–11/23**                         | P0 backend complete         | Implement core logic for **CountryRecommendations**, **Reporting**, **UserProfile/Passport**, **Playlist**, as well as syncs and unit tests.                                                                                                                   | N/A                                                                                                                                                                      |
| **11/24–11/25**<br>**Checkpoint Alpha** | End-to-end P0 working       | All P0 concepts integrated with a viable user journey: login → session → country → system/community recs → flag/report → passport history → playlists. System recommendations via LLM + verified YouTube URLs; community rec submission flow fully functional. | Minimal UI implemented: globe or list of countries, recs (system vs community), basic passport/playlist views, reporting                                                 |
| **11/26–11/28**                         | Integration & UX polish 1   | Finalize sync logic with correct sessioning, handle rate-limiting/logging around LLM + YouTube calls if necessary.                                                                                                                                             | Improve layout and spacing, and visually handle all states (loading/error/empty); visual differentiation of system vs community recs, revise globe/passport if necessary |
| **11/29–12/01**                         | Stretch features            | Implement **Cultural Deep Dive** backend (static or semi-static content per country) and **Friending** backend (friend graph, basic follow/unfollow).                                                                                                          | UI for cultural pages (text + links), friends list, view friends’ public playlists/passports;                                                                            |
| **12/02**<br>**Checkpoint Beta**        | Polished MVP                | All P0 + stretch features available in UI; API stable; error handling in place  with graceful fallbacks if LLM/YouTube fails                                                                                                                                   | UI close to final: consistent styling, responsive layout, accessible controls; refined copy and tooltips.                                                                |
| **12/03–12/07**                         | User testing & iteration    | Address any unhandled backend errors discovered during user testing.                                                                                                                                                                                           | Polish UI based on user feedback, address any unhandled frontend errors discovered during user testing.                                                                  |
| **12/08–12/09**                         | Final polish & demo         | Clean up data (remove test accounts/recs), ensure safety/reporting mechanisms are robust; final checks on sessions/auth.                                                                                                                                       | Final UI polish, copy editing, loading states; rehearse demo flow.                                                                                                       |

---

## 2. Responsibilities by Team Member

**Cameron**
  * **Playlist** concept
  * Implement tests for Playlist concept
  * Implement playlist UI
  * Stretch: Implement **Friending** concept backend, tests, frontend

**Sinjin**
  * **Reporting** concept
  * Implement tests for ReportingConcepts
  * Implement reporting UI

**Xuan**
  * **CountryRecommendations** concept, including LLM prompts that generate system recs
  * Implement tests for CountryRecommendations concept
  * Implement CountryRecommendations UI
  * Stretch: Implement **CulturalDeepDive** concept backend, tests, frontend

**Nicholas**
* **UserProfile** concept
* Implement tests for UserProfile
* Integrate existing **UserAuthentication** and **Sessioning** concepts
* Implement UserProfile/Passport UI

**All**
* Polish frontend
* Implement syncs
## 3. Key Risks, Mitigations, and Fallbacks
### 3.1 External APIs & LLM Reliability

**Risk**: LLM (e.g., Gemini) may return invalid or low-quality YouTube links, or calls may be slow/limited; YouTube API quotas or regional restrictions could break the “play this song” experience.

**Mitigations**
* Add a validation layer: check that returned URLs are valid YouTube links; optionally prefetch metadata (title, channel) to confirm.
* Cache recommendations by country to avoid regenerating too often and to protect against rate limits.
* Time-out LLM calls and show a friendly message while falling back to cached or static content.

**Fallbacks**
* If YouTube embedding is unstable or if a Youtube video is unavailable, show song metadata and links only, letting users find/open them externally.
* If the LLM returns low-quality data, this would became major roadblock in our project, but we could start by hand-picking songs while trying to improve our song search prompt.

### 3.2 Frontend Complexity & Performance (Globe, Visualizations)

**Risk**: Globe or map UI and passport visualization may be time-consuming or slow on some devices.

**Mitigations**
* Start with a simple country list/grid, then layer on a globe visualization
* Look for existing code on interactive globe UIs

**Fallbacks**: If the globe cannot be displayed for a user, a country list/grid or a 2D map should exist as a fallback

### 3.3 Abuse of the Reporting System

**Risk**: The reporting/flagging system could be abused (e.g., coordinating against certain genres/countries, or users mass-reporting songs they personally dislike)

**Mitigations**
* Explore rate-limit reporting actions by user
* Group reports by type/reason (e.g., “offensive content”, “misleading/incorrect country”, “low quality”)
* Use a combination of signals to hide content (e.g., # of unique reporters, diversity of reporters, severity reason) instead of a simple raw count.

**Fallbacks**: In the scope of this class project, it's not very realistic that the reporting system could be abused, but if this were a real-world app, reporting could be a two-stage model where content is first marked as “under review” (soft warning), but only removed from default views once a human/moderation pass verifies the reports.

### 3.4 Cultural Sensitivity & Perceived Stereotyping in Recommendations

**Risk**:  Country-based recommendations and cultural deep dives might inadvertently reinforce stereotypes or only recommend Westernized global music, which might make users from those regions may feel misrepresented or offended

**Mitigations**
* Emphasize diversity (both music type and popularity vs. underground) within each country in the prompt design
* Provide transparent descriptions/disclaimers that recommendations are a starting point rather than an authoritative representation of a culture.
* The reporting system when used properly can help refine country-level recs over time.
* 
**Fallbacks**: If we lack confidence in certain countries’ coverage, start with a smaller “featured countries” set where we have stronger, more vetted recommendations, and clearly label others as “experimental”.
