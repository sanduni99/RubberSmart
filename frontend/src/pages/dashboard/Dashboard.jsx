// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalYield: 0,
    currentPrice: 0,
    avgYield: 0,
    latestMonth: '',
    predictedYield: 0,
    predictedPrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple endpoints in parallel
      const [productionRes, pricesRes, yieldPredRes, pricePredRes] = await Promise.all([
        fetch('http://localhost:8000/api/production?skip=0&limit=12'),
        fetch('http://localhost:8000/api/prices?skip=0&limit=1'),
        fetch('http://localhost:8000/api/predictions/yield?months=12'),
        fetch('http://localhost:8000/api/predictions/price?months=12')
      ]);

      if (!productionRes.ok || !pricesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const production = await productionRes.json();
      const prices = await pricesRes.json();
      const yieldPred = await yieldPredRes.json();
      const pricePred = await pricePredRes.json();

      // Sort production by year/month to get most recent
      const sortedProduction = production.sort((a, b) => {
        if (b.Year !== a.Year) return b.Year - a.Year;
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.Month) - months.indexOf(a.Month);
      });

      // Calculate statistics
      const latestProduction = sortedProduction[0];
      const totalYield = latestProduction?.['Total (MT)'] || 0;
      const avgYield = production.length > 0
        ? production.reduce((sum, p) => sum + (p['Total (MT)'] || 0), 0) / production.length
        : 0;

      const currentPrice = prices[0]?.['Price per Liter (LKR)'] || 
                          prices[0]?.Price_per_Liter_LKR || 0;

      // Calculate trend (compare latest with previous month)
      const yieldTrend = sortedProduction.length > 1
        ? ((sortedProduction[0]['Total (MT)'] - sortedProduction[1]['Total (MT)']) / 
           sortedProduction[1]['Total (MT)'] * 100)
        : 0;

      setStats({
        totalYield: totalYield,
        currentPrice: currentPrice,
        avgYield: avgYield,
        latestMonth: `${latestProduction?.Month} ${latestProduction?.Year}`,
        predictedYield: yieldPred?.predictions?.[0]?.predicted_yield_mt || 0,
        predictedPrice: pricePred?.predictions?.[0]?.predicted_price_lkr || 0,
        yieldTrend: yieldTrend,
        recentProduction: sortedProduction.slice(0, 6)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</p>
        <p style={{ color: '#666' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          padding: '1rem', 
          background: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: '0.5rem',
          border: '1px solid #ef4444'
        }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p style={{ color: '#666' }}>
          Here's what's happening with Sri Lankan rubber production
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Latest Production */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          color: 'white'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.9 }}>
            Latest Production
          </h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {stats.totalYield.toLocaleString()} MT
          </p>
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {stats.latestMonth}
          </span>
          {stats.yieldTrend !== undefined && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {stats.yieldTrend > 0 ? '↗' : stats.yieldTrend < 0 ? '↘' : '→'} 
              {' '}{Math.abs(stats.yieldTrend).toFixed(1)}% vs previous month
            </div>
          )}
        </div>

        {/* Current Price */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Current Price
          </h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            LKR {stats.currentPrice.toFixed(2)}
          </p>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>per Liter</span>
        </div>

        {/* Average Production */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            12-Month Average
          </h3>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            {stats.avgYield.toFixed(0)} MT
          </p>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>monthly average</span>
        </div>

        {/* Next Month Prediction */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔮</div>
          <h3 style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Next Month Forecast
          </h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
            {stats.predictedYield.toLocaleString()} MT
          </p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
            @ LKR {stats.predictedPrice.toFixed(2)}/L
          </span>
        </div>
      </div>

      {/* Recent Production Trend */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Recent Production Trend
        </h2>
        
        {stats.recentProduction && stats.recentProduction.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Period
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Total Production (MT)
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Sheet
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Crepe TSR
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProduction.map((prod, index) => {
                  const prevProd = index < stats.recentProduction.length - 1 
                    ? stats.recentProduction[index + 1] 
                    : null;
                  const change = prevProd 
                    ? ((prod['Total (MT)'] - prevProd['Total (MT)']) / prevProd['Total (MT)'] * 100)
                    : 0;

                  return (
                    <tr key={index} style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      background: index % 2 === 0 ? 'white' : '#fafafa'
                    }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {prod.Month} {prod.Year}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                        {prod['Total (MT)']?.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {prod.Sheet?.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {prod['Crepe T.S.R.']?.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {index < stats.recentProduction.length - 1 && (
                          <span style={{ 
                            color: change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {Math.abs(change).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No recent production data available
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <a href="/dashboard/yield-prediction" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌱</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
              Yield Predictions
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              View AI-powered production forecasts
            </p>
          </div>
        </a>

        <a href="/dashboard/price-intelligence" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
              Price Intelligence
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Explore market price forecasts
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;