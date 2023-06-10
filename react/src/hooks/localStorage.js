import { useState, useEffect } from "react";

export default function useStorage() {
  const [storage, setStorage] = useState(
    JSON.parse(localStorage.getItem("data")) || {}
  );

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(storage));
  }, [storage]);

  const saveToStorage = (item, value) => {
    setStorage((prevStorage) => ({ ...prevStorage, [item]: value }));
  };

  return {
    storage,
    saveToStorage
  };
}