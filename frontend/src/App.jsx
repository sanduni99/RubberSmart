import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to RubberSmart
            </h1>
            <p className="text-gray-600 mt-2">
              AI-Powered Rubber Yield Prediction
            </p>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;