import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import tasksSlice from "./task/taskSlice";

const RootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksSlice,
});

export default RootReducer;
