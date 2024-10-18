"use client";

import { useUser } from "@/hook/useUser";
import React, { createContext, useContext, useEffect, useState } from "react";

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const user = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user.isLoading || user.isFetching) setIsLoading(true);
    else setIsLoading(false);
  }, [user.isLoading, user.isFetching]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {isLoading ? <Loader /> : children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className="spinner"></div> <p>Loading...</p>
    </div>
  );
};
