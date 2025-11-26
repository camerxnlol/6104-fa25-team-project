**principle**
1. user views country A that has no stored recommendations  
    - system calls getSystemRecs for country A (LLM called)  
    - system calls getCommunityRecs for country A  
2. user adds community recommendation for country A
3. user views country B with stored recommendations  
    - system calls getSystemRecs for country B  
    - system calls getCommunityRecs for country B  
4. user goes back to view country A
    - system calls getSystemRecs for country A (call LLM)  
    - system calls getCommunityRecs for country A     

**getSystemRecs**  
getSystemRecs with empty database (call LLM) [tested in principle]  
getSystemRecs with some stored data less than baseline multiplier (call LLM) [tested in principle]  

**getCommunityRecs**  
getCommunityRecs with no stored recs (returns empty list) [tested in principle]  
getCommunityRecs with stored recs less than QUERY_QUANTITY (return list with all stored recs) [tested in principle]  
getCommunityRecs with stored recs greater than QUERY_QUANTITY (return list with QUERY_QUANTITY amount)  

**addCommunityRec**  
addCommunityRec with exact duplicate (returns existing recId)  

**removeCommunityRec**  
removeCommunityRec with valid COMMUNITY rec (successfully removes)  
removeCommunityRec with non-existent recId (returns error)  
removeCommunityRec with SYSTEM rec (returns error, cannot remove SYSTEM recs)  
