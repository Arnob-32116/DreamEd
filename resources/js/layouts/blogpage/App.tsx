import { useState } from "react";
import Sidebar from "./components/Sidebar";
import BlogPage from "./components/BlogPage";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <BlogPage />
    </div>
  );
}

export default App;
