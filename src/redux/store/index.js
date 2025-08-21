import { configureStore } from "@reduxjs/toolkit";
import RootReducer from "../reducers";

export const makeStore = () => {
  return configureStore({
    reducer: RootReducer,
  });
};
