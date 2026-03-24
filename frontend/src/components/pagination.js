import { useEffect, useState } from "react";

export default function Pagination({ itemsPagination, onChange }) {
  const [pages, setPages] = useState([]);

  const goNext = () => {
    onChange(itemsPagination.pageNumber + 1);
  };

  const goPrevious = () => {
    onChange(itemsPagination.pageNumber - 1);
  };

  const goToPageNumber = (page) => {
    onChange(page);
  };

  useEffect(() => {
    const arr = [...Array(itemsPagination.totalPages)].map((_, i) => i + 1);
    setPages(arr);
  }, [itemsPagination]);

  return (
    <div className="pagination">
      {itemsPagination.canGoPrevious && (
        <p className="pagination-item" onClick={goPrevious}>
          {"<"}
        </p>
      )}
      {pages.map((page) => (
        <p
          className={`pagination-item ${itemsPagination.pageNumber === page ? "active" : ""}`}
          key={page}
          onClick={() => goToPageNumber(page)}
        >
          {page}
        </p>
      ))}
      {itemsPagination.canGoNext && (
        <p className="pagination-item" onClick={goNext}>
          {">"}
        </p>
      )}
    </div>
  );
}
