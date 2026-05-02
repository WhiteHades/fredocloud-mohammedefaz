const { render, screen } = require("@testing-library/react");

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn(), theme: "light" }),
  ThemeProvider: ({ children }) => children,
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: () => null,
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }) => children,
  TooltipContent: () => null,
  TooltipProvider: ({ children }) => children,
  TooltipTrigger: ({ children }) => children,
}));

jest.mock("@/components/DotGrid", () => () => null);
jest.mock("@/components/CircularGallery", () => () => null);
jest.mock("@/components/Carousel", () => () => null);
jest.mock("@/components/MagicBento", () => () => null);
jest.mock("@/components/RotatingText", () => ({ texts }) => <span>{texts?.[0]}</span>);

const { LandingPage } = require("./landing-page");

describe("LandingPage", () => {
  it("renders the public product narrative and primary app links", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: /notfredohub/i })).toBeInTheDocument();
    expect(screen.getAllByText(/collaborative team hub/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /open the app/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
  });

  it("renders login and register buttons when not authenticated", () => {
    render(<LandingPage />);

    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });
});
