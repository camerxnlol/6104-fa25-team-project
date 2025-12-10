# Project Report
## Design Summary
On the backend, the main changes in our project were in the CountryRecommendation concept. This concept went through many stages in the course of our development due to us learning that certain things jut couldnʻt work as they were. For example, we learned that it isnʻt possible for an LLM to return good links to youtube videos. It will always hallucinate them. We went through a lot of approaches to fix this issue. In the end, we landed on an approach that used an LLM-Youtube API-Spotify API-LLM pipeline to get artists, find songs, and validate them. This was able to yield good results, as all of our system generated recommendations were able to be both accurate and exist. Another small change we made to CountryRecommendations was making genre a required field like the other fields. This made things much easier and simpler for us.

## Reflection
### Cameron
**Manual Changes and Updating Context**
- I occasionally made manual edits to files without updating Context afterward. Because Context assumes that the current file state matches its last known output, this created desynchronization issues. Some of its bug fixes failed simply because it was unaware of my local changes. If Context could automatically read updated TypeScript files into its working state, it would prevent this problem. This experience taught me how vital shared context and consistent synchronization are when working with agentic coding systems.

**Leveraging Multiple AI Tools**
- A major takeaway was learning how to combine tools based on their strengths. I used v0 to generate layout inspiration and initial structures for pages. This taught me that success with AI-assisted development is not about using one tool for everything, but rather about orchestrating specialized tools to work together effectively.

**Working on a Team**
- It was good experience to work on a software project with a team. I learned lots of good practices that I will carry with me: reducing scope, user testing, effective communication, time management.


### Nicholas


### Sinjin


### Xuan
