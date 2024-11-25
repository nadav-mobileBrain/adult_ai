import React, { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        {/* Navbar content */}
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-800 text-white p-4">
        {/* Footer content */}
      </footer>
    </div>
  );
};

export default Layout;
