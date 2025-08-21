import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StoreProvider from "../redux/StoreProvider";

export const metadata = {
  title: "Task Management System",
  description: "A comprehensive task management application",
  keywords: "task management, productivity, project management",
  authors: [{ name: "Task Management Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 999999 }}
          />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
