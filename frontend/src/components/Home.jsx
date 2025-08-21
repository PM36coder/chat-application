import { useState, useEffect } from "react";
import Message from "./home/Message.jsx";
import Sidebar from "./home/Sidebar.jsx";

export const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const handleResize = () => setIsMobile(window.innerWidth < 640);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div
      id="home"
      className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
    >
    <div className="w-full max-w-6xl h-full min-h-[60vh] bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 flex gap-6 items-center justify-center sm:items-start sm:justify-start">

        {/* Sidebar */}
        {(isMobile && !selectedUser) || !isMobile ? (
          <div className="w-full sm:w-1/3 md:flex bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]">
            <Sidebar onSelectUser={handleSelectUser} />
          </div>
        ) : null}

        {/* Message */}
        {(isMobile && selectedUser) || !isMobile ? (
          <div className="w-full sm:w-2/3 flex-auto">
            <Message className="bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]" onBack={handleBack} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
