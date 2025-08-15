import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Login from "./Login";

// Mock useNavigate so we can spy on it
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("Login Component", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  it("calls navigate on submit", () => {
  render(<Login />);

  fireEvent.change(
    screen.getByPlaceholderText(/registration number or email/i),
    {
      target: { value: "john@example.com" },
    }
  );
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password123" },
  });

  // Only target the button with name "Login"
  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  expect(mockedNavigate).toHaveBeenCalledWith("/clearance");
});
});
