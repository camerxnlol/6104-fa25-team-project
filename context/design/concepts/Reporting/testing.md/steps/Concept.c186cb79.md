---
timestamp: 'Mon Nov 24 2025 19:23:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_192316.aac54a98.md]]'
content_id: c186cb79c1a0406007c918c5c59df02614e0ee3eb8970ff00bc10d4048e97db4
---

# Concept: Reporting

* **purpose**: to create and keep track of reports made on objects
* **principle**: the user can initialize objects to be reported. Any time they
  would like to, they can report objects, which stores the report for later use
* **state**:
  * a set of Reports with
    * an objectId of type string
    * a count of type Number
    * a reporters set of userId string
* **actions**:
  * `InitializeObject (objectId: string): (objectId: string)`
    * **requires**: a report containing objectId doesn’t already exist
    * **effects**: Creates a new report with objectId. Set the report’s count=0
      and reporters set to empty. Return objectId
  * `Report (objectId: string, userId: string)`
    * **requires**: a report for objectId exists and userId isn’t in its
      reporters set
    * **effects**: increment the count of the report that contains objectId. Add
      userId to its reporters set
  * `Unreport (objectId: string, userId: string)`
    * **requires**: a report for objectId exists and userId is in its reporters
      set
    * **effects**: decrement the count for the report. Remove userId from its
      reporters set.
* **queries**:
  * `_getReportCount (objectId: string): (count: Number)`
    * **requires**: a report for objectId exists
    * **effects**: returns the count of the report
  * `_getReporters (objectId: string): (reporters: a set of User)`
    * **requires**: a report for objectId exists
    * **effects**: returns the reporters of the objectId
