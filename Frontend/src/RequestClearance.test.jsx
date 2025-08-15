import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RequestClearance from "./RequestClearance";
import { MemoryRouter } from "react-router-dom";

// Create a mock navigate function
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("RequestClearance Component", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();

    // Mock localStorage.getItem
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "studentName") return "John Doe";
      return null;
    });

    // Mock localStorage.removeItem
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  });

  it("renders the student name in the header and a greeting", () => {
    render(
      <MemoryRouter>
        <RequestClearance />
      </MemoryRouter>
    );

    // Check the header name only (span)
    expect(screen.getByText("John Doe", { selector: "span" })).toBeInTheDocument();

    // Check greeting text with name
    expect(
      screen.getByRole("heading", {
        name: /Good morning, John Doe|Good Afternoon, John Doe|Good Evening, John Doe/i,
      })
    ).toBeInTheDocument();
  });

  it("calls navigate('/') and removes studentName on logout", () => {
    render(
      <MemoryRouter>
        <RequestClearance />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith("studentName");
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});
