---
timestamp: 'Mon Nov 24 2025 19:15:48 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_191548.d748ddcc.md]]'
content_id: 56b73456b4513a2ea0303df084c44593d37ec2b819d3a9004aff4774965b6f3c
---

# response:

```typescript
  /**
   * _getReportCount (objectId: string): (count: Number)
   *
   * @requires a report for objectId exists
   * @effects returns the count of the report
   */
  async _getReportCount({ objectId }: { objectId: ObjectId }): Promise<Array<{ count: number }>> {
    const report = await this.reports.findOne({ _id: objectId });

    if (!report) {
      return [];
    }

    return [{ count: report.count }];
  }

  /**
   * _getReporters (objectId: string): (reporters: a set of User)
   *
   * @requires a report for objectId exists
   * @effects returns the reporters of the objectId
   */
  async _getReporters({ objectId }: { objectId: ObjectId }): Promise<Array<{ reporters: UserId[] }>> {
    const report = await this.reports.findOne({ _id: objectId });

    if (!report) {
      return [];
    }

    return [{ reporters: report.reporters }];
  }
```
