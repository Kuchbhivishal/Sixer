import { Link, useLocation } from "wouter";

interface BottomNavigationProps {
  currentPage: "home" | "market" | "contests" | "profile";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, navigate] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-muted z-40">
      <div className="grid grid-cols-5 h-16">
        <div 
          className={`flex flex-col items-center justify-center cursor-pointer ${
            currentPage === "home" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/")}
        >
          <i className={`ri-home-${currentPage === "home" ? "5-fill" : "line"} text-xl`}></i>
          <span className="text-xs mt-1">Home</span>
        </div>
        
        <div 
          className={`flex flex-col items-center justify-center cursor-pointer ${
            currentPage === "market" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/market")}
        >
          <i className={`ri-line-chart-${currentPage === "market" ? "fill" : "line"} text-xl`}></i>
          <span className="text-xs mt-1">Market</span>
        </div>
        
        <div 
          className="flex flex-col items-center justify-center cursor-pointer"
          onClick={() => navigate("/market")}
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
            <i className="ri-exchange-line text-xl"></i>
          </div>
        </div>
        
        <div 
          className={`flex flex-col items-center justify-center cursor-pointer ${
            currentPage === "contests" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/contests")}
        >
          <i className={`ri-trophy-${currentPage === "contests" ? "fill" : "line"} text-xl`}></i>
          <span className="text-xs mt-1">Contest</span>
        </div>
        
        <div 
          className={`flex flex-col items-center justify-center cursor-pointer ${
            currentPage === "profile" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/profile")}
        >
          <i className={`ri-user-${currentPage === "profile" ? "fill" : "line"} text-xl`}></i>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </div>
    </nav>
  );
}
