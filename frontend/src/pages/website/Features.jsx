// src/pages/website/Features.jsx
import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🌱',
      title: 'AI Yield Prediction',
      description: 'Advanced machine learning models predict your rubber yield based on weather patterns, soil conditions, and tree health.',
      benefits: ['95% accuracy', 'Real-time updates', 'Historical data analysis']
    },
    {
      icon: '💰',
      title: 'Price Intelligence',
      description: 'Stay ahead of market trends with real-time price tracking and intelligent selling recommendations.',
      benefits: ['Live market data', 'Price alerts', 'Trend analysis']
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into your plantation performance with beautiful visualizations and reports.',
      benefits: ['Custom reports', 'Performance metrics', 'Export capabilities']
    },
    {
      icon: '🌤️',
      title: 'Weather Integration',
      description: 'Get accurate weather forecasts and alerts specific to your plantation location.',
      benefits: ['7-day forecast', 'Rainfall tracking', 'Temperature alerts']
    },
    {
      icon: '📱',
      title: 'Mobile Access',
      description: 'Access your dashboard anywhere, anytime with our responsive mobile interface.',
      benefits: ['iOS & Android', 'Offline mode', 'Push notifications']
    },
    {
      icon: '🔐',
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with enterprise-grade security measures.',
      benefits: ['Data encryption', 'Regular backups', 'Privacy controls']
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Powerful Features
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          Everything you need to manage your rubber plantation efficiently
        </p>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
                {feature.description}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {feature.benefits.map((benefit, i) => (
                  <li key={i} style={{ 
                    padding: '0.5rem 0', 
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    ✓ {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Features;