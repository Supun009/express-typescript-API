sequenceDiagram
title Node.js Express Request Lifecycle (Success & Error)

    participant C as Client
    participant E as Express App
    participant M as Middleware (Logger/Auth)
    participant R as Router
    participant CTL as Controller (asyncHandler)
    participant S as Service (Business Logic)
    participant P as Prisma ORM
    participant DB as PostgreSQL Database
    participant GEH as Global Error Handler

    C->>E: 1. POST /api/v1/auth/login (Request)
    activate E
    E->>M: 2. Execute Middleware
    activate M
    M-->>E: 3. Request Validated / Logged (next())
    deactivate M
    E->>R: 4. Route Matching
    R->>CTL: 5. Call Controller Function
    activate CTL

    alt Successful Request Flow (User Login)
        CTL->>S: 6. loginUser(credentials)
        activate S
        S->>P: 7. findUnique()
        activate P
        P->>DB: 8. Execute SQL Query
        activate DB
        DB-->>P: 9. Return User Record
        deactivate DB
        P-->>S: 10. User Data
        deactivate P

        S->>S: 11. Business Logic (Hash check, Generate JWT)
        S-->>CTL: 12. Success Result (JWT)
        deactivate S

        CTL-->>E: 13. Send 200 OK Response
        deactivate CTL
        E-->>C: 14. 200 OK Success Response

    else Error Handling Flow (DB Connection Failure)
        CTL->>S: 6. fetchData()
        activate S
        S->>P: 7. Attempt Database Query
        activate P
        P-xD: 8. DB Connection Fails
        deactivate P
        P--xS: 9. Throw Error (e.g., PrismaClientError)
        deactivate S

        CTL->>CTL: 10. asyncHandler catches Exception
        CTL->>GEH: 11. Pass Error to next(err)
        activate GEH
        GEH->>GEH: 12. Format Standardized Error (500)
        GEH-->>E: 13. Send Error Response
        deactivate GEH

        E-->>C: 14. 500 Internal Server Error Response
    end
    deactivate E
