# Project Report
## Design Summary
### Backend
On the backend, the main changes in our project were in the CountryRecommendation concept. This concept went through many stages in the course of our development due to us learning that certain things jut couldnʻt work as they were. For example, we learned that it isnʻt possible for an LLM to return good links to youtube videos. It will always hallucinate them. We went through a lot of approaches to fix this issue. In the end, we landed on an approach that used an LLM-Youtube API-Spotify API-LLM pipeline to get artists, find songs, and validate them. This was able to yield good results, as all of our system generated recommendations were able to be both accurate and exist. Another small change we made to CountryRecommendations was making genre a required field like the other fields. This made things much easier and simpler for us.

### Frontend
We listened to our user tests to implement some frontend changes in the last couple days before the final deadline. Firstly, we made the home page the login page. Our users had some trouble finding the login page when the globe UI was the landing page, so we swapped it to the login page. This is also to prevent users from performing any actions that require authentication before being logged in. Secondly, we added some onboarding text as well as brought back our navigation bar. Our users found the button icons unintuitive, so we brought back the navigation bar with text to make swapping between pages seamless. After checkpoint beta, we also did a visual overhaul of the app to unify design choices across the different pages of SongBridge. Until checkpoint beta, we were all working on our own pages, and thus had our own visions of what the app should look like. We sat down and agreed upon a color scheme as well as a general look and feel for the app. We're very satisfied in its turnout!

## Reflection
### Cameron
**Manual Changes and Updating Context**
- I occasionally made manual edits to files without updating Context afterward. Because Context assumes that the current file state matches its last known output, this created desynchronization issues. Some of its bug fixes failed simply because it was unaware of my local changes. If Context could automatically read updated TypeScript files into its working state, it would prevent this problem. This experience taught me how vital shared context and consistent synchronization are when working with agentic coding systems.

**Leveraging Multiple AI Tools**
- A major takeaway was learning how to combine tools based on their strengths. I used v0 to generate layout inspiration and initial structures for pages. This taught me that success with AI-assisted development is not about using one tool for everything, but rather about orchestrating specialized tools to work together effectively.

**Working on a Team**
- It was good experience to work on a software project with a team. I learned lots of good practices that I will carry with me: reducing scope, user testing, effective communication, time management.


### Nicholas
**Using Agents in a Team**
- I found that this was a good experience of what it's like to work in a team where multiple members use AI coding agents. Whereas in my personal project, all the code was either written by myself or a single instance of an LLM, this group project helped me think a lot more about the importance of context. Since each person and their coding agent writes code slightly differently, it was important to make sure that the code that I was producing did not conflict with other components that I wasn't primarily in charge of. We definitely had to look over some of our syncs to resolve some parameter mismatches.

**Using AI for UI Design**
- For my personal project, I designed and revised my UI primarily manually and through text input with an LLM. On the group project, I initially experimented with giving the LLM the UI sketches we drew and a textual description of the sketch. It turned out pretty bad. My conclusion is that it's still difficult to get AI coding agents to adhere to a very specific UI design vision, and they are better at either generating UIs on their own with minimal input, or revising existing UIs.

**Designing an App in a Team**
- Overall, I really enjoyed working on SongBridge with my teammates. For us, dividing up the work by concepts and have each member implement both the backend and frontend for that concept ended up being a successful strategy. Different groups in different settings might have other ways to split up work, but I think what was most important was streamlining the work process so that each member could always work on something without having to wait for an extended period of time for some other component to be finished fist.

### Sinjin


### Xuan
