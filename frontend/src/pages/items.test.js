import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Items from "./Items";
import { useData } from "../state/DataContext";

jest.mock("../state/DataContext", () => ({
  useData: jest.fn(),
}));

jest.mock("../components/loader", () => () => <div>Loading...</div>);

jest.mock("../components/pagination", () => (props) => (
  <div>
    <button onClick={() => props.onChange(2)}>Go to page 2</button>
    <div data-testid="pagination-props">
      {JSON.stringify(props.itemsPagination)}
    </div>
  </div>
));

jest.mock("../components/input", () => (props) => (
  <input
    placeholder={props.placeholder}
    onChange={(e) => props.onChange(e.target.value)}
  />
));

describe("Items", () => {
  const mockFetchItems = jest.fn();

  const mockItems = [
    { id: 1, name: "Laptop Pro" },
    { id: 2, name: "Standing Desk" },
  ];

  const mockPagination = {
    canGoNext: true,
    canGoPrevious: false,
    totalPages: 3,
    pageSize: 10,
    pageNumber: 1,
    totalCount: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderComponent() {
    return render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
  }

  it("shows loader when there are no items", () => {
    useData.mockReturnValue({
      items: [],
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("calls fetchItems on mount with page 1 and empty query", async () => {
    useData.mockReturnValue({
      items: mockItems,
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith(true, 1, "");
    });
  });

  it("renders the list of items", () => {
    useData.mockReturnValue({
      items: mockItems,
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Standing Desk")).toBeInTheDocument();
  });

  it("calls fetchItems when pagination changes", async () => {
    const user = userEvent.setup();

    useData.mockReturnValue({
      items: mockItems,
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith(true, 2, "");
    });
  });

  it("calls fetchItems when search input changes", async () => {
    const user = userEvent.setup();

    useData.mockReturnValue({
      items: mockItems,
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    const input = screen.getByPlaceholderText(
      "Enter search query and click anywhere to search",
    );

    await user.type(input, "laptop");

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith(true, 1, "laptop");
    });
  });

  it("logs an error when fetchItems fails on mount", async () => {
    const error = new Error("Failed to fetch");
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockFetchItems.mockRejectedValueOnce(error);

    useData.mockReturnValue({
      items: mockItems,
      fetchItems: mockFetchItems,
      itemsPagination: mockPagination,
    });

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
  });
});
