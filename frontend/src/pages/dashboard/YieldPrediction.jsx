// frontend/src/pages/dashboard/YieldPrediction.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const YieldPrediction = () => {
  const [months, setMonths] = useState(6);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-load predictions on mount
  useEffect(() => {
    handlePredict();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.predictions.predictYield(months);
      console.log('Yield prediction result:', result);
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

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Yield Prediction 🌱
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        AI-powered forecast of rubber production for the upcoming months
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
              style={{
                padding: '0.75rem 1.5rem',
                background: months === m ? '#10b981' : 'white',
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
            background: loading ? '#9ca3af' : '#10b981',
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
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Accuracy</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.accuracy}
              </p>
            </div>
            {predictions.model_info.mae && (
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Mean Absolute Error
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                  {predictions.model_info.mae}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictions Table */}
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
              Predicted Yield for Next {months} Months
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
                    Predicted Yield (MT)
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
                      <div>
                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {pred.month} {pred.year}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 'bold', 
                        color: '#10b981' 
                      }}>
                        {pred.predicted_yield_mt?.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: '#dcfce7',
                        color: '#166534',
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

          {/* Summary Stats */}
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
                Average Predicted Yield
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                {(predictions.predictions.reduce((sum, p) => sum + p.predicted_yield_mt, 0) / 
                  predictions.predictions.length).toFixed(2)} MT
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Total Predicted Yield
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                {predictions.predictions.reduce((sum, p) => sum + p.predicted_yield_mt, 0)
                  .toFixed(2)} MT
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Highest Month
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                {predictions.predictions.reduce((max, p) => 
                  p.predicted_yield_mt > max.predicted_yield_mt ? p : max
                ).month}
              </p>
            </div>
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
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
            <p>Click "Generate Forecast" to see yield predictions</p>
          </div>
        )
      )}
    </div>
  );
};

export default YieldPrediction;