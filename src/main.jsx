// local
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import store from "./redux/store";
import App from "./App.jsx";

// react
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// toastify
import { ToastContainer } from "react-toastify";

// redux
import { Provider } from "react-redux";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <App />
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 99999999 }}
            />
        </Provider>
    </StrictMode>
);
