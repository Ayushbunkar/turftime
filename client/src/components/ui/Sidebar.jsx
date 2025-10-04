import React from "react";

const Sidebar = ({ isOpen, onClose, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4">
        <button onClick={onClose} className="mb-4 text-red-500 font-bold">✖ Close</button>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
