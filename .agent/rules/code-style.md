---
trigger: always_on
---

# CODE-STYLE.md - SecureGate Technical Design Rules

## 1. Framework Abstraction & Language

While SecureGate is a reference blueprint, this implementation uses **TypeScript** to provide strict type safety. While utilizing **React** for the interface layer, logic must remain decoupled from specific UI components wherever possible.

---

## 2. Naming Conventions

### 2.1 Database Objects

* **Tables:** Use plural lowercase `snake_case` (e.g., `users`, `sessions`).


* **Columns:** Use singular lowercase `snake_case` (e.g., `user_id`, `token_hash`).


* **Keys:** Primary keys are named `id`. Foreign keys follow the format `target_singular_id`.



### 2.2 TypeScript & React Standards

* **Files:** Use `PascalCase` for React components (`LoginForm.tsx`) and `kebab-case` for utility or logic files (`crypto-service.ts`).
* **Components:** Use functional components with named exports and `PascalCase`.


* **Interfaces & Types:** Use `PascalCase` and name them descriptively (e.g., `AuthStatus`, `UserProfile`). Do not prefix with `I`.


* **Variables & Functions:** Use `camelCase` for all local variables, state hooks, and standard functions (e.g., `rawPassword`, `setSessionToken`).


* **Hooks:** Custom hooks must start with the prefix `use` (e.g., `useAuthSession`).


* **Constants:** Use `UPPER_SNAKE_CASE` for global configuration values and environment variables.



### 2.3 Directory & File Organization

* **Component grouping:** Group by domain under `components/{domain}/` (e.g., `components/auth/LoginForm.tsx`).
* **Route handlers:** Place in `app/api/{resource}/route.ts`.
* **Server Actions:** Place in `lib/actions/{resource}.ts`.
* **Shared types:** Place in `types/{domain}.ts`.
* **Utility functions:** Place in `lib/{kebab-case}.ts`.

---

## 3. Import Ordering

All files must group imports in this exact order, separated by blank lines:

1. **External / framework** (e.g., `next`, `react`, `next-auth`, `prisma`, `bcryptjs`)
2. **Internal types** (e.g., `types/auth.ts`)
3. **Internal utilities / lib** (e.g., `lib/crypto-service.ts`)
4. **Internal components** (e.g., `components/auth/FormField.tsx`)
5. **Styles / CSS** (not used with Tailwind)

```tsx
import { signIn } from "next-auth/react"
import { z } from "zod"

import type { AuthStatus } from "@/types/auth"
import { hashPassword } from "@/lib/crypto-service"

import { FormField } from "@/components/auth/FormField"
```

---

## 4. Structural Security Requirements

* **Timing Uniformity:** Avoid short-circuit loops in authentication logic; ensure identical cryptographic paths for real and fake accounts.


* **Resource Cleansing:** Nullify references to secure string containers (like plaintext passwords) upon operational return so the Node.js/V8 garbage collector can clear them from memory.


* **Type Safety:** Never use the `any` type. Every data structure must have a strictly defined Interface or Type to prevent runtime logic errors.


* **Error Patterns:** Return generic state payloads to the UI. Never expose TypeScript stack traces or raw database error objects to the user.

---

## 5. Testing Conventions

* **Test framework:** Vitest + Testing Library (React components) or Vitest (pure logic).
* **File placement:** Co-locate tests in `__tests__/` next to the source file (e.g., `components/auth/__tests__/LoginForm.test.tsx`).
* **Naming:** `{ModuleName}.test.ts` or `{ModuleName}.test.tsx`.
* **Structure:** Use `describe` / `it` blocks. One `describe` per component or function.
* **Coverage target:** All error states, loading states, and success paths must be tested.
* **Mocks:** Mock external dependencies at the module boundary (e.g., `vi.mock("next-auth/react")`).
