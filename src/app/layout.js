import { Provider } from "react-redux";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Task Management System",
  description: "A comprehensive task management application",
  keywords: "task management, productivity, project management",
  authors: [{ name: "Just Me Myself and I " }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
