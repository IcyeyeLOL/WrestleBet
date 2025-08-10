import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./React/globals.css";

// Import the optimized FrontPage component
import FrontPageOptimized from "./components/FrontPageOptimized";

export default function Home() {
  return (
    <main>
      <FrontPageOptimized />
    </main>
  );
}
