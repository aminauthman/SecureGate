# SKILL: db-migration-runner

## 1. Objective

Generate and execute SQL migration scripts for the SecureGate PostgreSQL schema. Every migration must be atomic (single transaction), reversible (up + down), and conform to the naming conventions in `code-style.md`.

---

## 2. Workflow

```
1. REQUIREMENT  →  Read the schema change request
2. DRAFT        →  Write up.sql and down.sql in schema/
3. VALIDATE     →  Check naming, types, security rules
4. REVIEW       →  Verify down script exactly reverses up
5. APPLY        →  Run up.sql against target database
```

---

## 3. Naming Conventions (from code-style.md)

| Object | Rule | Example |
|---|---|---|
| Table names | plural `snake_case` | `users`, `sessions`, `verification_tokens` |
| Column names | singular `snake_case` | `user_id`, `token_hash`, `email_verified` |
| Primary key | `id` (UUID) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Foreign key | `{target_singular}_id` | `user_id UUID REFERENCES users(id)` |
| Timestamps | `TIMESTAMP WITH TIME ZONE` | `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` |

---

## 4. Migration File Format

Each migration is a pair of files in `schema/`:

```text
schema/
├── migration.sql              # accumulated full-schema reference
├── 001_create_users.sql       # up
├── 001_create_users.down.sql  # down
├── 002_add_columns.sql
├── 002_add_columns.down.sql
└── ...
```

### up.sql template

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

COMMIT;
```

### down.sql template

```sql
BEGIN;

DROP TABLE IF EXISTS sessions;

COMMIT;
```

---

## 5. Constraints & Rules

### Required
- Wrap every migration in `BEGIN;` ... `COMMIT;` (single atomic transaction)
- Every FK referencing `users(id)` must use `ON DELETE CASCADE`
- All PKs must be `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Every table must include `created_at` and `updated_at` (`TIMESTAMPTZ`)
- Use `IF NOT EXISTS` / `IF EXISTS` guards for idempotency
- Add indexes for all FK columns and lookup columns (`email`, `token_hash`)

### Prohibited
- `SERIAL` / `BIGSERIAL` / auto-increment integers for PKs
- Raw string concatenation or dynamic SQL in application code
- `NULL`able FK columns referencing `users(id)` unless explicitly justified
- `ON DELETE SET NULL` on user FKs (lifecycle cascade required)

---

## 6. Supported Tables Reference

| Table | Purpose | Key FK |
|---|---|---|
| `users` | Core identity records | — |
| `sessions` | NextAuth session store | `user_id → users(id)` |
| `verification_tokens` | Email verify + password reset tokens | `user_id → users(id)` |

---

## 7. Verification Checklist

After writing a migration, confirm:

- [ ] Wrapped in `BEGIN;` / `COMMIT;`
- [ ] Down script exists and exactly reverses the up script
- [ ] All table names are plural `snake_case`
- [ ] All column names are singular `snake_case`
- [ ] All PKs use `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] All FKs to `users` use `ON DELETE CASCADE`
- [ ] `created_at` and `updated_at` present on every new table
- [ ] `TIMESTAMP WITH TIME ZONE` (not `TIMESTAMP` or `DATETIME`)
- [ ] Indexes on all FK columns and lookup columns
- [ ] `IF NOT EXISTS` / `IF EXISTS` for idempotency
- [ ] No `SERIAL`, no auto-increment, no `NULL` user FKs
- [ ] Migration applied cleanly against a fresh PostgreSQL instance
