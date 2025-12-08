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