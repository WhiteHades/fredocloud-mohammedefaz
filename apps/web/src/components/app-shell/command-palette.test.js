const { fireEvent, render, screen } = require("@testing-library/react");

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const { CommandPalette } = require("./command-palette");

describe("CommandPalette", () => {
  it("opens with ctrl+k and filters commands", () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });

    expect(screen.getByText("Command Palette")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search commands…"), {
      target: { value: "dash" },
    });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });
});
