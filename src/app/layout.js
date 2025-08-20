// import "./globals.css";
import { ToastContainer } from "react-toastify";
// import StoreProvider from "@/redux/StoreProvider";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

export const metadata = {
  title: "Task Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>Task Management</title>

        <link
          rel="icon"
          type="image/png"
          href="task-management-assignment/src/app/favicon.ico"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="task-management-assignment/src/app/favicon.ico"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        {/* <StoreProvider> */}
        <ToastContainer style={{ zIndex: 999999 }} />
        {children}
        {/* </StoreProvider> */}
      </body>
    </html>
  );
}
