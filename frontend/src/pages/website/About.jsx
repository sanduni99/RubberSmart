// src/pages/website/About.jsx
import React from 'react';

const About = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          About RubberSmart
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          Empowering rubber farmers with AI-driven insights and technology
        </p>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Our Mission
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#666', lineHeight: '1.8' }}>
            RubberSmart is dedicated to revolutionizing rubber plantation management through 
            cutting-edge technology and data-driven insights. We help farmers maximize their 
            yields, optimize their operations, and make informed decisions about pricing and 
            market conditions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Our Vision
            </h3>
            <p style={{ color: '#666' }}>
              To be the leading smart agriculture platform for rubber farmers worldwide
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Our Values
            </h3>
            <p style={{ color: '#666' }}>
              Innovation, sustainability, and farmer empowerment drive everything we do
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Our Impact
            </h3>
            <p style={{ color: '#666' }}>
              Helping farmers increase yields by up to 30% through smart technology
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;