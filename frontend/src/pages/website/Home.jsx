// src/pages/website/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            🌳 Welcome to RubberSmart
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            AI-powered rubber plantation management system. 
            Predict yields, track prices, and optimize your plantation with smart technology.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#10b981',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                Get Started Free
              </button>
            </Link>
            <Link to="/login">
              <button style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
            Why Choose RubberSmart?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Yield Prediction
              </h3>
              <p style={{ color: '#666' }}>
                AI-powered yield forecasting based on weather, soil, and tree conditions
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Price Intelligence
              </h3>
              <p style={{ color: '#666' }}>
                Real-time market prices and insights to maximize your profits
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Analytics Dashboard
              </h3>
              <p style={{ color: '#666' }}>
                Comprehensive analytics and reporting for data-driven decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Transform Your Plantation?
        </h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Join hundreds of farmers using RubberSmart
        </p>
        <Link to="/signup">
          <button style={{
            padding: '1rem 2.5rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Start Free Trial
          </button>
        </Link>
      </section>
    </div>
  );
};

export default Home;