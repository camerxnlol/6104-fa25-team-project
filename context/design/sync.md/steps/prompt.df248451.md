---
timestamp: 'Tue Nov 25 2025 20:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205706.63a66186.md]]'
content_id: df24845133440173bef3b019e9c15ad08c94c67c0b3e96a3cde7b4c2acc24014
---

# prompt: Create syncs for the routes that are specified by the passthroughs file as being "excluded" with the exception of the Sessioning routes. the front end should never try to call these routes. Instead, when a login route is called, you should use the Sessioning concept to generate a session id. Similarly, when a log out happens, you should use Sessioning to delete the session id. You should refer to the concept background and sync background for instructions on how to construct syncs in this manner. DO NOT create any syncs involving LikertSurvey routes, but refer to the sample sync file to see that you need a request and response for each sync. The excluded routes require the user being logged in (i.e. they can only do something if they are authenticated and have a valid session). You should write syncs accordingly to take in session ids for the excluded routes (with the exception of login, which cannot take in a session id as the user hasnʻt logged in yet). Use the concepts file for imports.
