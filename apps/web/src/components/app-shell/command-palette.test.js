const { fireEvent, render, screen } = require("@testing-library/react");

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/components/ui/command", () => ({
  CommandDialog: ({ children, open }) =>
    open ? <div data-testid="command-dialog">{children}</div> : null,
  CommandEmpty: ({ children }) => <div>{children}</div>,
  CommandGroup: ({ children }) => <div>{children}</div>,
  CommandInput: (props) => <input {...props} />,
  CommandItem: ({ children, onSelect }) => (
    <button onClick={onSelect}>{children}</button>
  ),
  CommandList: ({ children }) => <div>{children}</div>,
}));

const { CommandPalette } = require("./command-palette");

describe("CommandPalette", () => {
  it("opens with ctrl+k and shows command dialog", () => {
    render(<CommandPalette />);

    expect(screen.queryByTestId("command-dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });

    expect(screen.getByTestId("command-dialog")).toBeInTheDocument();
  });

  it("closes on escape", () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });
    expect(screen.getByTestId("command-dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });
    expect(screen.queryByTestId("command-dialog")).not.toBeInTheDocument();
  });
});
