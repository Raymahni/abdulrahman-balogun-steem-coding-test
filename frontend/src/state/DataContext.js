import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [itemsPagination, setItemsPagination] = useState({});

  const fetchItems = useCallback(async (isMounted = true, page, query) => {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (query) params.append("q", query);
    params.append("limit", 2);

    const res = await fetch(
      `http://localhost:3001/api/items?${params.toString()}`,
    ); // Bug fixed
    const json = await res.json();

    if (!isMounted) return; // using this to prevent the state update when the component is unmounted

    setItems(json.items);
    setItemsPagination({
      canGoNext: json.canGoNext,
      canGoPrevious: json.canGoPrevious,
      pageNumber: json.pageNumber,
      pageSize: json.pageSize,
      totalCount: json.totalCount,
      totalPages: json.totalPages,
    });
  }, []);

  return (
    <DataContext.Provider value={{ items, itemsPagination, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
