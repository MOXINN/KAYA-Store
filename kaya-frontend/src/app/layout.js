import "./globals.css";
import Navbar from "./components/Navbar"; 

export const metadata = {
  title: "Kaya Collection",
  description: "Authentic Handloom Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* EXACTLY ONE BODY TAG HERE */}
      <body className="bg-[#0a0a0a] text-white" suppressHydrationWarning>
        
        <Navbar />

        {children}

        <footer className="bg-[#111] border-t border-white/5 text-gray-500 mt-12 py-8 text-center text-sm">
            <p>&copy; 2026 KAYA | Kalpi</p>
        </footer>

      </body>
    </html>
  );
}