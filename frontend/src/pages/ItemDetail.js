import { useEffect, useState } from "react";
import { useData } from "../state/DataContext";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/loader";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();
  const { items, fetchItems } = useData();

  useEffect(() => {
    let isMounted = true;

    const loadItem = async () => {
      try {
        await fetchItems(true, 1, "");
        const foundItem = items?.find(
          (entry) => String(entry.id) === String(id),
        );

        if (!foundItem) {
          navigate("/");
          return;
        }

        if (isMounted) {
          setItem(foundItem);
        }
      } catch (err) {
        navigate("/");
      }
    };

    loadItem();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!item) return <Loader />;

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p>
        <strong>Category:</strong> {item.category}
      </p>
      <p>
        <strong>Price:</strong> ${item.price}
      </p>
    </div>
  );
}

export default ItemDetail;
