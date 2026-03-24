import { render, screen, waitFor } from "@testing-library/react";
import ItemDetail from "./ItemDetail";
import { useData } from "../state/DataContext";
import { useParams, useNavigate } from "react-router-dom";

jest.mock("../state/DataContext", () => ({
  useData: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("../components/loader", () => () => <div>Loading...</div>);

describe("ItemDetail", () => {
  const mockNavigate = jest.fn();
  const mockFetchItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: "1" });
  });

  test("renders loader initially", () => {
    useData.mockReturnValue({
      items: [],
      fetchItems: mockFetchItems.mockResolvedValue(),
    });

    render(<ItemDetail />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders item details when item is found", async () => {
    useData.mockReturnValue({
      items: [
        {
          id: 1,
          name: "Test Item",
          category: "Books",
          price: 25,
        },
      ],
      fetchItems: mockFetchItems.mockResolvedValue(),
    });

    render(<ItemDetail />);

    await waitFor(() => {
      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });

    expect(screen.getByText(/Category:/i)).toBeInTheDocument();
    expect(screen.getByText(/Books/i)).toBeInTheDocument();
    expect(screen.getByText(/Price:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25/i)).toBeInTheDocument();
  });

  test("navigates home when item is not found", async () => {
    useData.mockReturnValue({
      items: [
        {
          id: 2,
          name: "Another Item",
          category: "Games",
          price: 40,
        },
      ],
      fetchItems: mockFetchItems.mockResolvedValue(),
    });

    render(<ItemDetail />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
