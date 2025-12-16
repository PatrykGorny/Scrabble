import { AuthProvider } from "@/app/lib/AuthContext";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Scrabble",
  description: "Aplikacja z Firebase Authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
