"use client";
import { PuffLoader } from "react-spinners";
const Loading = () => {
  const override = {
    display: "block",
    margin: "200px auto",
  };
  return (
    <PuffLoader
      color="#3b82f6"
      cssOverride={override}
      size={80}
      aria-label="Loading Spinner"
    />
  );
};

export default Loading;
