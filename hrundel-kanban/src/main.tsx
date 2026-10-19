import { createRoot } from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
