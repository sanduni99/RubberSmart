// frontend/src/pages/dashboard/PriceIntelligence.jsx
import React, { useState, useEffect } from 'react';

const PriceIntelligence = () => {
  const [months, setMonths] = useState(6);
  const [predictions, setPredictions] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load historical data and initial predictions
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both historical prices (most recent first) and predictions
      const [historicalResponse, predictionsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/prices?skip=0&limit=12'),  // Get latest 12 records
        fetch(`http://localhost:8000/api/predictions/price?months=${months}`)
      ]);

      if (!historicalResponse.ok || !predictionsResponse.ok) {
        throw new Error('Failed to load data');
      }

      const historical = await historicalResponse.json();
      const pricePredictions = await predictionsResponse.json();

      // Sort historical data by year and month (most recent first)
      const sortedHistorical = historical.sort((a, b) => {
        if (b.Year !== a.Year) {
          return b.Year - a.Year; // Sort by year descending
        }
        // If same year, sort by month
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.Month) - months.indexOf(a.Month);
      });

      // Debug: Log the first item to see field names
      if (sortedHistorical.length > 0) {
        console.log('Most recent price data:', sortedHistorical[0]);
      }

      setHistoricalData(sortedHistorical);
      setPredictions(pricePredictions);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/predictions/price?months=${months}`);
      
      if (!response.ok) {
        throw new Error('Failed to get predictions');
      }

      const result = await response.json();
      console.log('Price prediction result:', result);
      setPredictions(result);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonths) => {
    setMonths(newMonths);
  };

  // Calculate statistics
  const getAveragePrice = () => {
    if (!predictions?.predictions || predictions.predictions.length === 0) return 0;
    const sum = predictions.predictions.reduce((acc, p) => acc + Number(p.predicted_price_lkr), 0);
    return (sum / predictions.predictions.length).toFixed(2);
  };

  const getHighestPrice = () => {
    if (!predictions?.predictions || predictions.predictions.length === 0) return 0;
    return Math.max(...predictions.predictions.map(p => Number(p.predicted_price_lkr))).toFixed(2);
  };

  const getLowestPrice = () => {
    if (!predictions?.predictions || predictions.predictions.length === 0) return 0;
    return Math.min(...predictions.predictions.map(p => Number(p.predicted_price_lkr))).toFixed(2);
  };

  const getPriceRange = () => {
    if (!predictions?.predictions || predictions.predictions.length === 0) return 0;
    const highest = parseFloat(getHighestPrice());
    const lowest = parseFloat(getLowestPrice());
    return (highest - lowest).toFixed(2);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Price Intelligence 💰
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        AI-powered rubber price forecasting and market analysis
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #ef4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Forecast Period Selector */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Forecast Period
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              onClick={() => handleMonthChange(m)}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: months === m ? '#3b82f6' : 'white',
                color: months === m ? 'white' : '#374151',
                border: months === m ? 'none' : '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
            >
              {m} months
            </button>
          ))}
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            padding: '0.875rem 2rem',
            background: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Generating Forecast...' : 'Generate Forecast'}
        </button>
      </div>

      {/* Model Info */}
      {predictions?.model_info && (
        <div style={{
          background: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          border: '1px solid #bfdbfe'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
            📊 Model Performance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>R² Score</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.r2_score}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Explains variance in prices</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Average Error</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.mae}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Mean Absolute Error</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Model Type</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.model_type}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Time series model</p>
            </div>
          </div>
          
          {predictions.market_context && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                📈 {predictions.market_context.trend}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {predictions.market_context.note}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Historical Prices */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Recent Historical Prices
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
            Latest 8 months from database
          </p>

          {historicalData.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {historicalData.slice(0, 8).map((item, index) => {
                // Try different possible field names
                const price = item['Price per Liter (LKR)'] || 
                              item.Price_per_Liter_LKR || 
                              item['Price_per_Liter_LKR'] ||
                              item.price || 
                              item.Price || 
                              0;
                
                return (
                  <div key={index} style={{
                    padding: '0.75rem',
                    background: index % 2 === 0 ? '#f9fafb' : 'white',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {item.Month} {item.Year}
                      </span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '1rem' }}>
                      LKR {typeof price === 'number' ? price.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</p>
              <p>No historical data available</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            💡 Forecast Statistics
          </h3>

          {predictions?.predictions && predictions.predictions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '0.5rem',
                color: 'white'
              }}>
                <p style={{ fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.9 }}>
                  Average Predicted Price
                </p>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  LKR {getAveragePrice()}
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '0.5rem' }}>
                  <p style={{ color: '#166534', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Highest
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#166534' }}>
                    LKR {getHighestPrice()}
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
                  <p style={{ color: '#991b1b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Lowest
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#991b1b' }}>
                    LKR {getLowestPrice()}
                  </p>
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
                <p style={{ color: '#92400e', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Price Range
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e' }}>
                  LKR {getPriceRange()}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</p>
              <p>Generate forecast to see statistics</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Predictions Table */}
      {loading ? (
        <div style={{
          background: 'white',
          padding: '4rem 2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</p>
          <p>Generating price predictions...</p>
        </div>
      ) : predictions?.predictions && predictions.predictions.length > 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              Predicted Prices for Next {months} Months
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              All prices in LKR per Liter
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Period
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                    Predicted Price (LKR/L)
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                    Trend
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.predictions.map((pred, index) => {
                  const currentPrice = Number(pred.predicted_price_lkr);
                  const previousPrice = index > 0 ? Number(predictions.predictions[index - 1].predicted_price_lkr) : currentPrice;
                  const change = currentPrice - previousPrice;
                  const isIncrease = change > 0;
                  const isDecrease = change < 0;

                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: index % 2 === 0 ? 'white' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <p style={{ fontWeight: '600' }}>
                          {pred.month} {pred.year}
                        </p>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#3b82f6'
                        }}>
                          LKR {currentPrice.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {index > 0 && (
                          <span style={{
                            fontSize: '0.875rem',
                            color: isIncrease ? '#10b981' : isDecrease ? '#ef4444' : '#6b7280',
                            fontWeight: '500'
                          }}>
                            {isIncrease ? '↗' : isDecrease ? '↘' : '→'} 
                            {Math.abs(change).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {pred.confidence_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div style={{ 
            padding: '1.5rem', 
            background: '#f9fafb', 
            borderTop: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Forecast Period
              </p>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                {months} months
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Average Price
              </p>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                LKR {getAveragePrice()}
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Expected Volatility
              </p>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                {getPriceRange() > 10 ? 'Moderate' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '4rem 2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</p>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No predictions yet</p>
          <p style={{ fontSize: '0.875rem' }}>Click "Generate Forecast" to see price predictions</p>
        </div>
      )}
    </div>
  );
};

export default PriceIntelligence;