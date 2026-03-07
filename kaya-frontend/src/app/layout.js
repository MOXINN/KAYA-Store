import "./globals.css";
import Navbar from "./components/Navbar"; 
import { Toaster } from "react-hot-toast";

// Fixed the import path so it looks in the correct folder
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata = {
  title: "Kaya Collection",
  description: "Authentic Handloom Store | Kalpi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white transition-colors duration-300" suppressHydrationWarning>

        {/* Everything is wrapped cleanly inside the ThemeProvider ONCE */}
        <ThemeProvider>
          
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <footer className="bg-white dark:bg-[#111] border-t border-gray-200 dark:border-white/5 text-gray-500 py-12 text-center text-xs tracking-widest uppercase transition-colors duration-300">
              <p>&copy; 2026 KAYA | Handcrafted in Kalpi</p>
          </footer>

        </ThemeProvider>

      </body>
    </html>
  );
}