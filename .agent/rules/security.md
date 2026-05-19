1. Authentication
Data Scrambling: All plaintext passwords must undergo structural transformation via Bcrypt (using bcryptjs) prior to storage.

Latency Profile Tuning: Computational parameters must be calibrated (e.g., utilizing standard Bcrypt salt rounds) to mitigate hardware-accelerated attacks.

Session Integrity & Verification: Client session management is natively and securely handled by NextAuth.js. Secure JWTs or database-backed session strategies must be used as configured in NextAuth, replacing manual token hashing or raw SQL session management.

Enumeration Mitigation: Server login routes use constant-time execution paths and return identical generic payloads ("Invalid email or password") for both valid and invalid accounts to prevent identity discovery.

Session Expiry: NextAuth.js configuration must enforce an absolute timeout of 24 hours and an idle timeout of 30 minutes where applicable.

2. Secrets and Configuration
Externalized Configuration: All operational secrets, infrastructure URIs, and cryptographic tuning properties must be strictly injected using system environment variables (.env).

Environment Separation: Hardcoded credentials or fallback production secrets within the codebase are prohibited.

Least Privilege Access: Database strings injected via configuration must use unique personas limited strictly to SELECT, INSERT, UPDATE, and DELETE execution rights on required application tables.

3. Input Validation
Boundary Checks: All incoming payload fields must be strongly typed and filtered against strict format whitelists before parsing.

Email Constraints: Inbound email strings must be parsed using RFC 5322 regex validation rules, stripped of leading/trailing whitespace, and permanently transformed to lowercase characters before reaching logical handlers.

Password Boundaries: Registration parameters must explicitly reject inputs failing to satisfy a minimum length constraint of 12 characters, alongside composition structural arrays (requiring upper, lower, numeric, and symbolic characters).

4. SQL Injection Prevention
Parameterized Compilation: All interaction boundaries touching the persistence layer must exclusively use parameterized queries or strictly prepared statements.

Dynamic Query Banning: The runtime generation of data commands via raw string concatenation, string interpolation, or unescaped variables is strictly prohibited across all data drivers.

Typed Storing: Structural identification identifiers mapping to table relations must be bounded explicitly to strong native variables (UUIDv4).

5. Cross-Site Scripting (XSS) Prevention
Transport Directives: Inbound session tokens are dispatched back to user clients exclusively inside transactional server set-cookie directives utilizing strict isolation parameters:

HttpOnly: Completely blocks extraction scripts from reading cookie assets via frontend JavaScript engine vectors.

Data Context Sanitization: Any client-supplied identity variables (e.g., account profiles or names) must be completely context-encoded or escaped on the server side prior to being structured into responses.

Content Security Policy (CSP): All pages must serve a strict CSP header blocking inline scripts unless accompanied by a nonce. Minimum directive:
```
default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';
```

6. Cross-Site Request Forgery (CSRF) Protection
Cookie Flags: Explicit transport session cookie variables must enforce the SameSite=Strict directive attribute header to strip automatic cross-site browser credential emissions.

State-Changing Constraints: Content mutations, login verification calls, or lifecycle terminations are prohibited from executing inside standard HTTP GET handling wrappers, forcing strict verification against POST or explicit payload structures.

CSRF Token Requirement: All state-changing API routes (POST, PUT, PATCH, DELETE) must additionally validate an anti-forgery token submitted in the request body or header, independent of SameSite cookie protection.

7. Rate Limiting
Infrastructure Check (IP Target): Limit /signup and /forgot-password routes to 5 calls per minute per IP address.

Identity Target (Email Tracking): Limit /login routes to 5 attempts per minute using a combined tracking marker of the user's IP and email address.

Breach Action: Instantly drop incoming traffic exceeding these limits, skip database checks, and issue an HTTP 429 payload alongside a descriptive Retry-After header.

Account Lockout: After 10 consecutive failed login attempts on the same email, lock the account for 15 minutes. Lockout state clears on successful login or timer expiry.

Password Reset Token Expiry: Password reset tokens must expire after 15 minutes from issuance and be invalidated on first use.

8. Logging
Sensitive Value Invalidation: Raw user payloads containing fields labeled password, token, or secret must be programmatically scrubbed before passing into output system data streams.

Trace Parameters: Operations involving credential lifecycle mutations, account locks, or rate limitation breaches must write structured, auditable audit records detailing timestamp, context path, anonymized indices, and status actions.

Diagnostic Security: Application exception outputs must not route raw backend diagnostic errors or database system stack traces to users.

9. Dependency Management
Decoupled Architecture Verification: To preserve the isolation posture of SecureGate, external software inclusions must be restricted to vetted architectural components within the ecosystem (e.g., Next.js, NextAuth.js, Prisma, Zod, and foundational cryptographic libraries like bcryptjs).

Vulnerability Scanning: External code trees must continuously pass automated vulnerability checks to locate and remediate known CVE entries before integration deployment.

10. HTTP Security Headers
Every response must include the following headers:

| Header | Value |
|---|---|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| Content-Security-Policy | (see section 5) |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| Set-Cookie (session) | `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400` |

HTTPS Enforcement: All traffic must be redirected to HTTPS at the edge (Vercel/Fastly). HTTP requests must return 301 or 308 to the HTTPS equivalent.

11. CORS Configuration
Cross-origin requests to SecureGate API routes must be explicitly allowlisted:

```text
Access-Control-Allow-Origin: <deployed-origin>           # never *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 7200
```

Preflight (OPTIONS) requests must be handled before any auth logic.
