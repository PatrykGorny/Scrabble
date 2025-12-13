import { AuthProvider } from "@/app/lib/AuthContext";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Scrabble",
  description: "Aplikacja z Firebase Authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Sidebar po lewej stronie */}
            <Sidebar />
            
            {/* Główna zawartość */}
            <div className="flex flex-col flex-1">
              {/* Górny pasek */}
              <TopBar />
              
              {/* Treść strony */}
              <main className="flex-1 p-6 bg-gray-50">
                {children}
              </main>
              
              {/* Stopka */}
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}