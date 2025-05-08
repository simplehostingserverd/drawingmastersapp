import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Drawing Masters App" },
    { name: "description", content: "Professional Art Drawing Application" },
  ];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Drawing Masters App</h1>
        <p className="text-gray-600 mb-8 text-center">
          A professional art drawing application for creating stunning digital artwork.
        </p>
        <div className="flex justify-center">
          <Link
            to="/draw"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Drawing
          </Link>
        </div>
      </div>
    </main>
  );
}
