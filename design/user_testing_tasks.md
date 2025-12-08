# User Testing Task List

## Overview
This document outlines the tasks for user testing sessions. Each session should last approximately 1 hour, with 40 minutes for task completion and 20 minutes for debrief. Participants should be encouraged to think aloud throughout the process.

## Task List

| Task # | Task Title                                   | User Instruction                                                                                                                                                                                    | Rationale                                                                                                                                                                                                                                                                                                                                                    |
| ------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0      | Create an account                            | Create a new user account and log in.                                                                                                                                                               | Tests the user authentication concept.                                                                                                                                                                                                                                                                                                                       |
| 1      | Discover Music from a New Country            | Navigate to a country on the globe that you've never visited before and explore a music recommendation for that country.                                                                            | Tests the core interaction with the globe interface and the CountryRecommendation concept. Evaluates whether users understand the primary purpose of the app and can successfully navigate the main discovery mechanism.                                                                                                                                     |
| 2      | Compare Community and System Recommendations | For the same country, view both a community-recommended song and a system-generated (AI) recommendation. Identify which is which and explain the difference. Add a community recommendation.        | Tests users' understanding of the dual recommendation system and whether the distinction between community and AI recommendations is clear. Evaluates the CountryRecommendation concept's complexity and whether users can navigate between different recommendation sources. Tests comprehension of the app's core purpose.                                 |
| 3      | Build a Personal Playlist                    | Create a new playlist, explore 2-3 different countries, and add at least one song from each country to your playlist. Then reorder the songs in your playlist.                                      | Tests the Playlist concept and its integration with CountryRecommendation. Evaluates whether users understand how to save and organize discovered music. Tests drag-and-drop functionality and whether the connection between discovery and saving is intuitive. This is a more complex task involving multiple concepts working together.                   |
| 4      | Track Your Musical Passport                  | After exploring several countries, navigate to your passport and review your exploration history. Find a specific country you visited earlier and view the songs you listened to from that country. | Tests the Passport concept and whether users understand how their exploration is being tracked. Evaluates discoverability of the passport feature and whether the metaphor makes sense. Tests whether users can successfully retrieve their listening history and understand the gamification aspect of cultural exploration.                                |
| 5      | Navigate Between Different Sections          | Starting from the globe view, navigate to your playlists, then to your passport, and finally back to the globe to discover music from a new country.                                                | Tests the overall navigation structure and whether users can move fluidly between the three main sections of the app using the floating action buttons. Evaluates whether the navigation paradigm is intuitive and whether users understand the relationship between different parts of the app. Tests spatial memory and mental model of the app structure. |
| 6      | Report Inappropriate Content                 | While exploring country recommendations, imagine you encounter a song that seems culturally inappropriate or offensive. Attempt to flag or report this recommendation.                              | Tests the Reporting concept and whether the safety mechanisms are discoverable. Evaluates whether users understand how to maintain platform quality and whether reporting functionality is accessible when needed. Tests the app's ethical design response to non-targeted use and inappropriate content.                                                    |

## Debrief Questions (Final 20 Minutes)

1. What was your overall impression of the app?
2. What was the most confusing or frustrating part of your experience?
3. What did you enjoy most about using the app?
4. Did you understand the purpose of the app? What would you use it for?
5. How did you feel about the navigation between different sections?
6. Did the passport feature make sense to you? Would it motivate you to explore more countries?
7. Was there anything you tried to do that you couldn't figure out how to accomplish?
8. What improvements would you suggest?

# User 1: Lawrence Long

The user was able to complete most tasks: login, discover music, use community/system recommendations, build a personal playlist, track musical passport, report inappropriate content, and overall navigate between different sections. Some interesting observations include:
1. The user initially thought the button for the playlists was the one for passport and vice versa. The user preferred a nav bar instead of buttons for navigation.
2. The user had to click twice on a country to generate a recommendation sometimes.
3. When the user first tried to add a song to a playlist, they were unable to because there were no playlists in their account yet. 

Overall, the user found that website navigation was alright but could be improved by a nav bar. They thought the globe feature was interesting and interactive. However, they weren't entirely sure what the purpose of the app was after using it.

## Opportunities for Improvement

**Navigation**
The user thought that navigation through floating action buttons alone was less intuitive than having a nav bar at the top of the page. We could reconsider our website design to make navigation more intuitive by either re-including the nav bar or having text buttons rather than icons for navigation.

**Playlists**
When a new user starts getting song recommendations, there is no playlist to add to. They have to first go to the playlists tab and create a playlist before adding songs to a playlist, even though the intuitive first action on the website is to explore songs rather than create a playlist. We could add a default Liked playlist upon account generation to address this.

**Passports**
Although the user was able to use the passport feature as intended, they didn't feel that the feature gamified the experience of discovering new countries. We could add more visual indications or animations when a user "visits" a new country, eg. a notification saying "check your passport" or "new country added to passport" whenever a user listens to music from a new country.

# User 2: Lynn Jung

## Overview
The user was able to complete all major tasks and provided several insights about usability, navigation, and onboarding. Their feedback not only highlighted specific friction points but also revealed deeper issues in how first time users understand the structure of the interface.

---

## Key Observations and Analysis

### 1. First Impressions and Visual Design
The user responded positively to the overall look of the app. They described the interface as clean and appreciated the hover animations and other small interaction details. These visual elements seemed to signal polish and care.

**Deeper insight:**  
While the minimalist aesthetic helped the app feel modern, it also removed cues that help guide user attention. The user’s later navigation challenges show that the design may lean too far toward minimalism at the cost of clarity. This tension between aesthetics and usability surfaced repeatedly across tasks.

---

### 2. Difficulty Finding the Login Flow
The user had trouble figuring out where to log in because the landing page does not include a visible login button. They eventually located it, but not without scanning the interface and hesitating.

**Underlying cause:**  
Because the landing page does not indicate how to get started, the user is forced to guess what to do next. This is especially risky for onboarding, where early confusion can disrupt the formation of a mental model for the rest of the app.

**Evidence:**  
The user explicitly mentioned wanting fewer minimalist choices and more tooltips or indicators that explain what each element does. This suggests that the current design does not meet user expectations for discoverability.

---

### 3. Issues Logging a Community Recommendation
The user attempted to add a community recommendation but encountered a backend bug that prevented it. They tried multiple times before concluding that something was wrong.

**Underlying cause:**  
Although the root problem is a technical issue, the interface did not provide feedback to explain why the action failed. Without error messaging, the user is left unsure whether they misunderstood the feature or the system malfunctioned.

**Insight for design:**  
Users expect confirmation when contributing content. Lack of response undermines trust in interactive features and can discourage participation.

---

### 4. Music Discovery Experience
The user enjoyed exploring songs from countries they had never listened to before. They commented that this was one of the most engaging parts of the session. They also said the purpose of the app felt “very clear,” which confirms that the core value proposition communicates itself effectively once users reach the globe interaction.

---

### 5. Navigation Between Sections
The user generally understood the navigation structure, but they briefly hesitated when trying to locate the playlist button. They also struggled again with the login page, reinforcing that unlabeled icons can be difficult to interpret without prior exposure.

**Underlying cause:**  
The reliance on icon-only buttons assumes that the icons are intuitive. For this user, several were not. This indicates that iconography alone may not support rapid comprehension, especially for new users.

---

### 6. Passport Feature
The user liked the passport feature and said it “fits into the global theme of the app well.” They reached it without difficulty and seemed to understand its purpose.

**Deeper insight:**  
Although the feature made sense, the session did not reveal evidence that it added motivation or excitement. This suggests room to strengthen the sense of progression and reward.

---

### 7. Ability to Complete Tasks
The user eventually succeeded at everything they attempted. When friction occurred, it was due to missing labels, unclear entry points, or the backend bug.

**Underlying insight:**  
The app’s conceptual model is strong enough that users can recover even after moments of confusion. Improving surface level cues would likely make the overall experience feel smoother.

---

## Opportunities for Improvement

### 1. Add Clear Labels and Tooltips
The user repeatedly expressed a desire for labels on buttons and more guidance throughout the interface. This would reduce guesswork and make early navigation more intuitive.

### 2. Improve Onboarding on the Landing Page
A visible login button or a short onboarding message would help new users understand how to begin. This small change directly addresses the user’s initial confusion.

### 3. Provide Feedback for Community Contribution Actions
When adding a recommendation fails, the interface should inform the user. Even once the backend issue is fixed, a confirmation flow will improve trust and clarity.

### 4. Strengthen the Passport Experience
Although the user understood the feature, there is an opportunity to increase its emotional impact. Notifications or subtle animations could reinforce the feeling of embarking on a global journey.

---
