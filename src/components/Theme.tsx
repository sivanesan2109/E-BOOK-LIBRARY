import { useEffect, useState } from "react";

export default function Theme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    
    <button
    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-gray-700 hidden md:flex"
  >
    {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
  </button>
    
  );
}
