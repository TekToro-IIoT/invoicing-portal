import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress specific accessibility warnings that are flooding the console
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Missing `Description` or `aria-describedby={undefined}` for {DialogContent}')) {
    return;
  }
  originalWarn.apply(console, args);
};

import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);