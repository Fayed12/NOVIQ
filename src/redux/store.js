// local
import themeReducer from "./themeSlice";

// redux
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        theme: themeReducer,
    },
});

export default store;
