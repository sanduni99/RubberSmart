// frontend/src/pages/dashboard/PriceIntelligence.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
      
      // Load both historical prices and predictions
      const [historical, pricePredictions] = await Promise.all([
        api.prices.getAll(0, 10),
        api.predictions.predictPrice(months)
      ]);

      setHistoricalData(historical);
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
      const result = await api.predictions.predictPrice(months);
      console.log('Price prediction result:', result);
      setPredictions(result);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
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
              onClick={() => setMonths(m)}
              style={{
                padding: '0.75rem 1.5rem',
                background: months === m ? '#3b82f6' : 'white',
                color: months === m ? 'white' : '#374151',
                border: months === m ? 'none' : '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Accuracy</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
              {predictions.model_info.accuracy}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Historical Prices */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Historical Prices
          </h3>
          
          {historicalData.length > 0 ? (
            <div>
              {historicalData.slice(0, 5).map((item, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '500' }}>{item.Year}</span>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                    LKR {item.Price_per_Liter_LKR?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No historical data available
            </p>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Quick Stats
          </h3>
          
          {predictions?.predictions && predictions.predictions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Average Predicted Price
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  LKR {(predictions.predictions.reduce((sum, p) => sum + p.predicted_price_lkr, 0) / 
                    predictions.predictions.length).toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Highest Expected Price
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  LKR {Math.max(...predictions.predictions.map(p => p.predicted_price_lkr)).toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Lowest Expected Price
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                  LKR {Math.min(...predictions.predictions.map(p => p.predicted_price_lkr)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Predictions Table */}
      {predictions?.predictions && predictions.predictions.length > 0 ? (
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
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.predictions.map((pred, index) => (
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
                        LKR {pred.predicted_price_lkr?.toFixed(2)}
                      </span>
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
                        {pred.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div style={{ 
            background: 'white', 
            padding: '4rem 2rem', 
            borderRadius: '0.75rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</p>
            <p>Click "Generate Forecast" to see price predictions</p>
          </div>
        )
      )}
    </div>
  );
};

export default PriceIntelligence;