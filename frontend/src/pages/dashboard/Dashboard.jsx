import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

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

     
      const sortedProduction = production.sort((a, b) => {
        if (b.Year !== a.Year) return b.Year - a.Year;
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.Month) - months.indexOf(a.Month);
      });

     
      const latestProduction = sortedProduction[0];
      const totalYield = latestProduction?.['Total (MT)'] || 0;
      const avgYield = production.length > 0
        ? production.reduce((sum, p) => sum + (p['Total (MT)'] || 0), 0) / production.length
        : 0;

      const currentPrice = prices[0]?.['Price per Liter (LKR)'] ||
        prices[0]?.Price_per_Liter_LKR || 0;

     
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
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}></p>
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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className={styles.subtitle}>
          Here's what's happening with Sri Lankan rubber production
        </p>
      </div>

      <div className={styles.grid}>
       
        <div className={styles.cardGradient}>
          <div className={styles.icon}></div>
          <h3 className={styles.cardTitleLight}>Latest Production</h3>
          <p className={styles.cardValueLight}>
            {stats.totalYield.toLocaleString()} MT
          </p>
          <span className={styles.subTextLight}>{stats.latestMonth}</span>

          {stats.yieldTrend !== undefined && (
            <div className={styles.trend}>
              {stats.yieldTrend > 0 ? '↗' : stats.yieldTrend < 0 ? '↘' : '→'}
              {' '}{Math.abs(stats.yieldTrend).toFixed(1)}%
            </div>
          )}
        </div>

        
        <div className={styles.card}>
          <div className={styles.icon}></div>
          <h3 className={styles.cardTitle}>Current Price</h3>
          <p className={styles.cardValue}>
            LKR {stats.currentPrice.toFixed(2)}
          </p>
          <span className={styles.subText}>per Liter</span>
        </div>

        
        <div className={styles.card}>
          <div className={styles.icon}></div>
          <h3 className={styles.cardTitle}>12-Month Average</h3>
          <p className={styles.cardValue}>
            {stats.avgYield.toFixed(0)} MT
          </p>
          <span className={styles.subText}>monthly average</span>
        </div>

       
        <div className={styles.card}>
          <div className={styles.icon}></div>
          <h3 className={styles.cardTitle}>Next Month Forecast</h3>
          <p className={styles.cardValue}>
            {stats.predictedYield.toLocaleString()} MT
          </p>
          <span className={styles.greenText}>
            @ LKR {stats.predictedPrice.toFixed(2)}/L
          </span>
        </div>
      </div>

      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Production Trend</h2>

        {stats.recentProduction?.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th className={styles.right}>Total (MT)</th>
                  <th className={styles.right}>Sheet</th>
                  <th className={styles.right}>Crepe TSR</th>
                  <th className={styles.right}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProduction.map((prod, index) => {
                  const prev = stats.recentProduction[index + 1];
                  const change = prev
                    ? ((prod['Total (MT)'] - prev['Total (MT)']) / prev['Total (MT)'] * 100)
                    : 0;

                  return (
                    <tr key={index} className={index % 2 ? styles.rowAlt : ''}>
                      <td>{prod.Month} {prod.Year}</td>
                      <td className={styles.right}>{prod['Total (MT)']?.toLocaleString()}</td>
                      <td className={styles.right}>{prod.Sheet?.toLocaleString()}</td>
                      <td className={styles.right}>{prod['Crepe T.S.R.']?.toLocaleString()}</td>
                      <td className={styles.right}>
                        {index < stats.recentProduction.length - 1 && (
                          <span className={
                            change > 0 ? styles.green :
                              change < 0 ? styles.red : styles.gray
                          }>
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
          <p className={styles.empty}>No data available</p>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actionsGrid}>
        <a href="/dashboard/yield-prediction">
          <div className={styles.actionCard}>
            <div className={styles.icon}></div>
            <h3>Yield Predictions/අස්වැන්න අනාවැකි</h3>
            <p>View AI-powered production forecasts</p>
          </div>
        </a>

        <a href="/dashboard/price-intelligence">
          <div className={styles.actionCard}>
            <div className={styles.icon}></div>
            <h3>Price Intelligence</h3>
            <p>Explore market price forecasts</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;