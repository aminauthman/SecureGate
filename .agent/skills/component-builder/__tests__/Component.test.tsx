import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

// Replace with your component import
import { Button } from "../templates/Button"

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("applies primary variant classes by default", () => {
    render(<Button>Submit</Button>)
    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-blue-600")
  })

  it("shows spinner and disables when loading", () => {
    render(<Button loading>Submit</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("fires onClick when clicked", async () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    const user = userEvent.setup()
    await user.click(screen.getByRole("button"))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not fire onClick when disabled", async () => {
    const handler = vi.fn()
    render(<Button onClick={handler} disabled>Click</Button>)
    const user = userEvent.setup()
    await user.click(screen.getByRole("button"))
    expect(handler).not.toHaveBeenCalled()
  })
})
