---
timestamp: 'Mon Nov 24 2025 19:23:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_192316.aac54a98.md]]'
content_id: 40ce5a3a3a9598a2a4894bd9e3e14303a8cce1611ae82a5729dfab2e435afd69
---

# prompt: given the current state of the test file for the Reporting concept, augment the tests so that they are like playing out a story/journey of actions. You should use all the actions (InitializeObject, Report, Unreport). Use the queries (\_getReportCount and \_getReporters) when necessary instead of directly querying the database. Be sure to make tests that follow the operational principle of the concept specification. Tests should use a sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example. Test sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors. You should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios.
