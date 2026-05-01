const { render, screen } = require("@testing-library/react");

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: () => null,
}));

const { LandingPage } = require("./landing-page");

describe("LandingPage", () => {
  it("renders the public product narrative and primary app links", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "notFredoHub" })).toBeInTheDocument();
    expect(screen.getByText(/Collaboration primitives/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the App/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Register/i })).toHaveAttribute("href", "/register");
  });

  it("renders login and register buttons when not authenticated", () => {
    render(<LandingPage />);

    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });
});
