import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google fonts and Remixicon for the UI
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const iconLink = document.createElement("link");
iconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css";
iconLink.rel = "stylesheet";
document.head.appendChild(iconLink);

// Set page title
document.title = "SixerGame - Cricket Fantasy Stock Trading";

createRoot(document.getElementById("root")!).render(<App />);
