import React from "react";
import Sidebar from "./Sidebar";

const LayoutMain: React.FC<{ children: any }> = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />

            <main className="content-area">
                {children}
            </main>
        </div>
    );
};

export default LayoutMain;
