const { render, screen } = require("@testing-library/react");

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

const { LandingPage } = require("./landing-page");

describe("LandingPage", () => {
  it("renders the public product narrative and primary app links", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "notFredoHub" })).toBeInTheDocument();
    expect(screen.getByText(/Everything the assignment asked for/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the App/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Register/i })).toHaveAttribute("href", "/register");
  });
});
