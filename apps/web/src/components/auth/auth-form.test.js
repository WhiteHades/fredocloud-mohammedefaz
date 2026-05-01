const { fireEvent, render, screen, waitFor } = require("@testing-library/react");

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSetUser = jest.fn();

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector) => selector({ setUser: mockSetUser }),
}));

const { AuthForm } = require("./auth-form");

describe("AuthForm", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: "user_1",
          email: "new@notfredohub.test",
          displayName: "New User",
        },
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders register-specific fields and redirects on success", async () => {
    render(<AuthForm mode="register" />);

    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "new@notfredohub.test" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@notfredohub.test" }),
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders login form with correct fields", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });
});
