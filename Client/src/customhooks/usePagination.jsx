import { useState, useMemo, useEffect } from "react";

export const usePagination = (items, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  //memoize total pagescalcualtion
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  //get the items for current page
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, currentPage, itemsPerPage]);

  //function to change current page
  const paginate = (pagenumber) => {
    setCurrentPage(pagenumber);
  };

  //reset first page if items or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [items, itemsPerPage]);

  return {
    currentPage,
    currentItems,
    totalPages,
    paginate,
    itemsPerPage,
  };
};
