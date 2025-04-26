import { combineReducers, configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/authSlice"
import { apiSlice } from "./services/apiSlice"
import globalReducer from "./state"
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  global: globalReducer,
})

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  })
}

// Keep existing types
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
