import React, { useEffect } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import Loader from "../components/loader";
import Pagination from "../components/pagination";
import Input from "../components/input";

function Items() {
  const { items, fetchItems, itemsPagination } = useData();

  const paginationHandler = async (page) => {
    await loadItems(true, page, "");
  };

  const loadItems = async (isMounted, page, query) => {
    try {
      await fetchItems(isMounted, page, query);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadItems(isMounted, 1, "");

    return () => {
      isMounted = false;
    };
  }, [fetchItems]);

  if (!items.length) return <Loader />;

  return (
    <div className="content-area">
      {/* Search */}
      <div className="search">
        <Input
          placeholder="Enter search query and click anywhere to search"
          onChange={async (e) => {
            await loadItems(true, 1, e);
          }}
        />
      </div>

      {/* List */}
      <div className="grid grid-6 gap">
        {items.map((item) => (
          <div className="item" key={item.id}>
            <div className="default-image"></div>
            <Link to={"/items/" + item.id}>{item.name}</Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        itemsPagination={itemsPagination}
        onChange={paginationHandler}
      />
    </div>
  );
}

export default Items;
