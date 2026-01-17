// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalYield: 1234,
    currentPrice: 2.50,
    revenue: 3085,
    trees: 450
  });

  useEffect(() => {
    // TODO: Fetch real data from your API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // fetchDashboardData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: '#666' }}>
          Here's what's happening with your rubber plantation today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Yield Card */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Yield</h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            {stats.totalYield} kg
          </p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>↑ +12% from last month</span>
        </div>

        {/* Current Price Card */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Price</h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            ${stats.currentPrice}/kg
          </p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>↑ +5% from last week</span>
        </div>

        {/* Revenue Card */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Revenue</h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            ${stats.revenue}
          </p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>↑ +8% from last month</span>
        </div>

        {/* Active Trees Card */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌳</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Trees</h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            {stats.trees}
          </p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>↑ +2% from last year</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Recent Activity
        </h2>
        <p style={{ color: '#666' }}>
          Your plantation analytics and insights will appear here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;