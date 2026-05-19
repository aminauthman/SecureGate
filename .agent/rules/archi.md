# archi.md - SecureGate System Architecture

## 1. Stack

SecureGate is designed as a standalone identity and access management reference layer. It utilizes a specific ecosystem optimized for modern web development.

* **Runtime Logic:** Next.js application framework using TypeScript, integrating NextAuth.js for core authentication flows.


* **Persistence Layer:** PostgreSQL relational database managed via Prisma ORM enforcing native ACID isolation models.


* **Cryptography Engine:** Bcrypt implementation (via bcryptjs) for credential hashing operations. All hashing must use a minimum of 12 salt rounds to enforce a computational cost of >=200ms per verification.


* **Validation Layer:** Zod schemas for runtime type safety and input boundary enforcement at every API entry point.


* **Caching Layer:** In-memory key-value data structures used to track transient request patterns (e.g., Upstash Redis for rate limit counters).



---

## 2. Directory Layout

```text
securegate/
├── docs/
│   ├── AGENTS.md
│   ├── code-style.md
│   ├── design-system.md
│   └── security.md
├── schema/
│   └── migration.sql
├── middleware/
│   └── rate_limiter.ext
├── controllers/
│   ├── auth_controller.ext
│   ├── session_controller.ext
│   └── verification_controller.ext
├── services/
│   ├── crypto_service.ext
│   └── notification_worker.ext
├── app/
│   └── api/auth/
│       ├── signup/route.ts
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── verify-email/route.ts
│       └── forgot-password/route.ts
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── SignUpForm.tsx
│       └── AuthCard.tsx
└── .env.example
```

---

## 3. Rendering Rules

SecureGate treats user interface presentation strictly as a functional consumer of the authentication layer.

* **Device Independence:** UI structures must remain completely fluid, scaling down to compact viewport sizes of 320px without horizontal overflow bugs.


* **Styling & Framework:** Interface trees leverage Tailwind CSS for styling within a Next.js (React) environment to ensure a modern, visually cohesive design.


* **Interaction Comfort:** Form parameters and command buttons must maintain minimum structural dimensions of 48px to preserve touch-based user accuracy on mobile screens.


* **Keychain Interoperability:** Input tags must include explicit configuration attributes (`type`, `inputmode`, `autocomplete`) to cleanly engage with OS-level credential autofill mechanisms.




---

## 4. Data Flows

The application routes public request parameters through security perimeters before processing transactions or modifying stored user states.

```
                  +-----------------------------------+
                  |        Client Browser/Device      |
                  +-----------------------------------+
                                    |
                                    | HTTPS / Transports
                                    v
                  +-----------------------------------+
                  |      Rate Limiting Middleware     | (IP & Email Keys Check)
                  +-----------------------------------+
                                    |
                                    | Request Validated
                                    v
                  +-----------------------------------+
                  |         App Controller Layer      | (Sign-Up / Login / Reset)
                  +-----------------------------------+
                   /                |                \
                  /                 |                 \
                 v                  v                  v
    +------------------+  +-------------------+  +--------------------+
    |  Bcrypt Hasher   |  | Background Worker |  | Data Storage Layer |
    | (Min 12 rounds)  |  | (Async Enqueuing) |  | (Users, Sessions,  |
    +------------------+  +-------------------+  |  Verification Tkn) |
                                                 +--------------------+
```

### 4.1 Authentication Delivery Sequence

1. **Perimeter Handshake:** The rate-limiting middleware (e.g., Upstash Redis) evaluates request counts from the client IP and targeted credentials.


2. **Validation Gate:** Zod schemas parse and type-check the incoming payload. Malformed requests are rejected with generic errors before any crypto or database work.


3. **Crypto Evaluation:** The NextAuth.js credentials provider or application controller intercepts incoming strings, validating passwords against a Bcrypt hashing pipeline using bcryptjs with >=12 salt rounds.


4. **Decoupled Notification:** Communication commands bypass standard processing threads and drop into a detached background processing worker to prevent timing analysis exploits.

---

## 5. State Management

* **Stateless Transportation:** Application controllers execute transactions without maintaining long-term state data within memory runtimes.
* **Token Verification Strategy:** Session identity is managed natively by NextAuth.js. Client devices track state using secure, HttpOnly, encrypted cookies (JWT) or database-backed session records verified transparently by NextAuth.


* **Lifecycle Destruction Cascade:** Modifying core account variables (such as executing a password recovery update) invalidates active NextAuth sessions to enforce security state cleanups automatically.




---

## 6. Database Access

* **ORM Abstraction:** All database interactions go through Prisma ORM. Raw SQL is prohibited unless explicitly required for migration scripts.
* **Relational Schema Constraints:** Tables maintain structural integrity rules backed by random unique identification strings (`UUIDv4`) serving as primary records.
* **Access Boundary Control:** Data interaction steps are restricted to parameterized queries via Prisma's prepared statement engine to prevent injection risks.
* **Driver Restrictions:** Data access profiles omit dynamic string generation or runtime variable concatenation to defend the system perimeter.

---

## 7. Authentication

* **Account Status Rules:** Access handlers check database indicators (`account_status`) to reject requests from locked profiles instantly, preventing unnecessary resource use.
* **Token Expiration Restrictions:** Temporary verification keys maintain tight time windows (15 minutes for sign-ups and 1 hour for resets). Tokens are rendered invalid after their deadline or immediately following their first validation check.
* **Transport Isolation Parameters:** Generated authentication keys travel to client applications bounded by defensive server headers: `HttpOnly`, `Secure`, and `SameSite=Strict`.




---

## 8. Error Handling

* **Enumeration Defense:** Security-sensitive handlers return non-revealing, identical status text payloads for both operational errors and missing profiles (e.g., `"Invalid email or password"`).
* **Exception Data Protection:** System processing exceptions must never pass technical details or stack traces down to client responses.
* **Input Boundary Termination:** Requests containing invalid parameter sizes or missing types are rejected at the application boundary via Zod before hitting downstream core services.

---

## 9. Environments

The system maintains strict operational isolation across deployment environments by shifting configuration targets out of the code logic.

* **Externalized Settings Configuration:** Infrastructure connection paths, network ports, and cryptographic complexity profiles are injected exclusively via environment variables (`.env`).
* **Isolation Barriers:** Hardcoded fallback values for development environments are prohibited within production deployment branches.
* **Data Layer Isolation:** Each execution tier (Testing, Staging, Production) operates on separate database instances with unique, limited credentials to preserve system isolation.
