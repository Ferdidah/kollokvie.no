# Data Flow - Kollokvie.no

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant EmneDetail
    participant Supabase
    participant Database
    
    User->>Dashboard: Login
    Dashboard->>Supabase: Authenticate
    Supabase-->>Dashboard: Session
    Dashboard->>Database: Fetch emner
    Database-->>Dashboard: Emner list
    Dashboard-->>User: Display emner
    
    User->>EmneDetail: Click on emne
    EmneDetail->>Database: Fetch emne data
    Database-->>EmneDetail: Emne details
    EmneDetail->>Database: Fetch meetings
    Database-->>EmneDetail: Meetings list
    EmneDetail-->>User: Display emne dashboard
    
    User->>EmneDetail: Create meeting
    EmneDetail->>Database: Insert meeting
    Database-->>EmneDetail: Meeting created
    EmneDetail-->>User: Display new meeting
```


