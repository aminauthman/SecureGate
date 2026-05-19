import { useState, type FormEvent } from "react"
import { signIn } from "next-auth/react"
import { AuthCard } from "../templates/AuthCard"
import { FormField } from "../templates/FormField"
import { Button } from "../templates/Button"

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export function LoginForm() {
  const [data, setData] = useState<FormData>({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!data.email) e.email = "Email is required"
    if (!data.password) e.password = "Password is required"
    return e
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setServerError(null)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setServerError("Invalid email or password")
      }
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <AuthCard
      title="Sign In"
      subtitle="Welcome back to SecureGate"
      footer={
        <a
          href="/forgot-password"
          className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Forgot your password?
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div
            role="alert"
            className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
          >
            {serverError}
          </div>
        )}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={data.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={errors.password}
          placeholder="Enter your password"
        />

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>
    </AuthCard>
  )
}
