import React, { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const ACTUAL_TOTAL_FIELD = "Total_MT";


const YieldPrediction = () => {
  const [months, setMonths] = useState(6);
  const [predictions, setPredictions] = useState(null);
  const [actualData, setActualData] = useState([]);
  const [typeBreakdown, setTypeBreakdown] = useState(null);
  const [viewMode, setViewMode] = useState('total');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // chartRef lives here so downloadPDF can access the chart instance
  const chartRef = useRef(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const [totalResponse, breakdownResponse, actualResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/predictions/yield?months=${months}`),
        fetch(`http://127.0.0.1:8000/api/predictions/yield/by-type?months=${months}`),
        fetch(`http://127.0.0.1:8000/api/production`),
      ]);

      if (!totalResponse.ok) {
        const errorText = await totalResponse.text();
        console.error('Total prediction error:', errorText);
        throw new Error(`Failed to fetch total predictions: ${totalResponse.status}`);
      }

      if (!breakdownResponse.ok) {
        const errorText = await breakdownResponse.text();
        console.error('Breakdown prediction error:', errorText);
        throw new Error(`Failed to fetch breakdown predictions: ${breakdownResponse.status}`);
      }

      const totalData = await totalResponse.json();
      const breakdownData = await breakdownResponse.json();
      const actualJson = await actualResponse.json();
      console.log("Actual Data from API:", actualJson);

      setPredictions(totalData);
      setTypeBreakdown(breakdownData);
      setActualData(actualJson);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err.message ||
        'Failed to get predictions. Please ensure the backend is running and the model is trained.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonths) => {
    setMonths(newMonths);
  };

  const getReliabilityColor = (reliability) => {
    switch (reliability) {
      case 'High':     return '#10b981';
      case 'Good':     return '#3b82f6';
      case 'Moderate': return '#f59e0b';
      case 'Low':      return '#ef4444';
      default:         return '#6b7280';
    }
  };

  //
  const downloadPDF = async () => {
    if (!predictions?.predictions) {
      alert("Generate prediction first");
      return;
    }

    const doc = new jsPDF();

    // Logo
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });

    const logo = await loadImage("/assets/images/vector_images/logo_1.png");
    if (logo) doc.addImage(logo, "PNG", 14, 10, 30, 15);

    doc.setFontSize(18);
    doc.text("RubberSmart Yield Forecast Report", 50, 20);

    const today = new Date().toLocaleDateString();
    doc.setFontSize(11);
    doc.text(`Generated Date: ${today}`, 14, 35);
    doc.text(`Forecast Period: ${months} months`, 14, 42);

    // Predictions table
    const tableData = predictions.predictions.map((p) => [
      `${p.month} ${p.year}`,
      `${p.predicted_yield_mt?.toLocaleString()} MT`,
      p.confidence_level || "High",
    ]);

    autoTable(doc, {
      head: [["Month", "Predicted Yield (MT)", "Confidence"]],
      body: tableData,
      startY: 50,
    });

    
    const chart = chartRef.current;
    if (chart) {
      const chartImage = chart.toBase64Image();
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Yield Forecast Chart", 14, 20);
      doc.addImage(chartImage, "PNG", 10, 30, 190, 100);
    }

  
    if (typeBreakdown?.predictions) {
      const rubberTypes = ["Sole", "Crepe", "Scrap", "Crepe Latex", "Crepe TSR"];

      const typeRows = typeBreakdown.predictions.map((p) => {
        const row = [`${p.month} ${p.year}`];
        rubberTypes.forEach((type) => {
          row.push(p.types[type] ? p.types[type].toLocaleString() : "-");
        });
        row.push(p.types.Total ? p.types.Total.toLocaleString() : "-");
        return row;
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.text("Rubber Production Forecast by Type", 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Month", ...rubberTypes, "Total"]],
        body: typeRows,
      });
    }

    doc.save(`rubber_yield_forecast_${months}_months.pdf`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Yield Prediction
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        AI-powered forecast of rubber production by type
      </p>

      
      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #ef4444',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ Error</div>
          <div>{error}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <strong>Troubleshooting:</strong>
            <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem' }}>
              <li>Ensure backend is running at http://127.0.0.1:8000</li>
              <li>Check that the prediction model is trained (run train_yield_model.py)</li>
              <li>Check browser console for detailed errors</li>
            </ul>
          </div>
        </div>
      )}

      
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={() => setViewMode('total')}
          style={{
            padding: '0.75rem 1.5rem',
            background: viewMode === 'total' ? '#10b981' : '#f3f4f6',
            color: viewMode === 'total' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Total Production
        </button>
        <button
          onClick={() => setViewMode('breakdown')}
          style={{
            padding: '0.75rem 1.5rem',
            background: viewMode === 'breakdown' ? '#10b981' : '#f3f4f6',
            color: viewMode === 'breakdown' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          By Rubber Type
        </button>
      </div>

     
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Forecast Period
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[3, 6, 12, 24, 36, 48].map((m) => (
            <button
              key={m}
              onClick={() => handleMonthChange(m)}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: months === m ? '#10b981' : 'white',
                color: months === m ? 'white' : '#374151',
                border: months === m ? 'none' : '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {m} months
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            }}
          >
            {loading ? 'Generating Forecast...' : 'Generate Forecast'}
          </button>

          <button
            onClick={downloadPDF}
            disabled={!predictions}
            style={{
              padding: '0.875rem 2rem',
              background: !predictions ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: !predictions ? 'not-allowed' : 'pointer',
            }}
          >
            Download PDF
          </button>
        </div>
      </div>

     
      {loading && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
            Generating predictions...
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            This may take a few moments
          </div>
        </div>
      )}

    
      {!loading && predictions && viewMode === 'total' && (
        <TotalProductionView
          predictions={predictions}
          actualData={actualData}
          getReliabilityColor={getReliabilityColor}
          chartRef={chartRef}
        />
      )}

     
      {!loading && typeBreakdown && viewMode === 'breakdown' && (
        <TypeBreakdownView
          typeBreakdown={typeBreakdown}
          getReliabilityColor={getReliabilityColor}
        />
      )}

     
      {!loading && !error && !predictions && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            No predictions available
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Click "Generate Forecast" to create predictions
          </div>
        </div>
      )}
    </div>
  );
};


const TotalProductionView = ({ predictions, actualData, getReliabilityColor, chartRef }) => {

  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    setShowChart(false);
    const timeout = setTimeout(() => setShowChart(true), 0);
    return () => clearTimeout(timeout);
  }, [predictions]);

  if (!predictions || !predictions.predictions || predictions.predictions.length === 0) {
    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center' }}>
        No prediction data available
      </div>
    );
  }

  const avgYield = (
    predictions.predictions.reduce((sum, p) => sum + (p.predicted_yield_mt || 0), 0) /
    predictions.predictions.length
  ).toFixed(0);

  const totalYield = predictions.predictions
    .reduce((sum, p) => sum + (p.predicted_yield_mt || 0), 0)
    .toFixed(0);

  const highestMonth = predictions.predictions.reduce(
    (max, p) => ((p.predicted_yield_mt || 0) > (max.predicted_yield_mt || 0) ? p : max),
    predictions.predictions[0]
  );


  const hasActual = actualData && actualData.length > 0;

  const lastActualYear = hasActual
    ? Math.max(...actualData.map((d) => d.Year))
    : new Date().getFullYear();


  const filteredActual = hasActual
    ? actualData.filter((d) => d.Year >= lastActualYear - 2)
    : [];

  const actualLabels = filteredActual.map((d) => `${d.Month} ${d.Year}`);


  const actualValues = filteredActual.map((d) => {
    const val =
      d[ACTUAL_TOTAL_FIELD] ??
      d["Total (MT)"] ??
      d["total_mt"] ??
      d["Total"] ??
      null;
    return val !== null ? Number(val) : null;
  });

  const predictedLabels = predictions.predictions.map((p) => `${p.month} ${p.year}`);
  const predictedValues = predictions.predictions.map((p) => p.predicted_yield_mt || 0);

  const labels = [...actualLabels, ...predictedLabels];

  const actualFull = [
    ...actualValues,
    ...Array(predictedValues.length).fill(null),
  ];

  const predictedFull = [
    ...Array(actualValues.length).fill(null),
    ...predictedValues,
  ];


  const pointSize = predictedValues.length > 12 ? 2 : 4;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Actual Yield",
        data: actualFull,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.07)",
        borderWidth: 2,
        pointRadius: pointSize,
        pointHoverRadius: pointSize + 2,
        pointBackgroundColor: "#2563eb",
        tension: 0.2,
        spanGaps: false,
      },
      {
        label: "Predicted Yield",
        data: predictedFull,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.07)",
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: pointSize,
        pointHoverRadius: pointSize + 2,
        pointBackgroundColor: "#16a34a",
        tension: 0.2,
        spanGaps: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y === null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} MT`;
          },
        },
      },
      title: {
        display: true,
        text: "Production Forecast — Actual vs Predicted Yield (MT)",
        font: { size: 15, weight: "bold" },
        padding: { bottom: 16 },
        color: "#1e3a5f",
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          font: { size: 11 },
          maxTicksLimit: 20,
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        title: {
          display: true,
          text: "Yield (MT)",
          font: { size: 12 },
          color: "#6b7280",
        },
        ticks: {
          callback: (val) => val.toLocaleString(),
          font: { size: 11 },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  return (
    <>
      
      {predictions.model_info && (
        <div style={{
          background: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          border: '1px solid #bfdbfe',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
            Model Performance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>R² Score</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.r2_score || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Average Error (MAE)</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {predictions.model_info.mae || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

     
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '420px',
        position: 'relative',
      }}>
        {showChart && (
          <Line
            ref={chartRef}
            data={chartData}
            options={chartOptions}
          />
        )}
      </div>


   
      <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Production Forecast</h3>
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
                    background: index % 2 === 0 ? 'white' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {pred.month} {pred.year}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>
                      {pred.predicted_yield_mt?.toLocaleString() || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}>
                      {pred.confidence_level || 'High'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       
        <div style={{
          padding: '1.5rem',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Average Predicted Yield
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
              {Number(avgYield).toLocaleString()} MT
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Total Predicted Yield
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
              {Number(totalYield).toLocaleString()} MT
            </p>
          </div>
          {highestMonth && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Highest Month
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                {highestMonth.month} {highestMonth.year}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


const TypeBreakdownView = ({ typeBreakdown, getReliabilityColor }) => {
  if (!typeBreakdown || !typeBreakdown.predictions || typeBreakdown.predictions.length === 0) {
    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center' }}>
        No breakdown data available
      </div>
    );
  }

  const rubberTypes = ['Sole', 'Crepe', 'Scrap', 'Crepe Latex', 'Crepe TSR'];

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Production Forecast by Rubber Type
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {typeBreakdown.summary?.note || 'Latex not shown (no production in Sri Lanka)'}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                position: 'sticky',
                left: 0,
                background: '#f9fafb',
                zIndex: 10,
              }}>
                Period
              </th>
              {rubberTypes.map((type) => (
                <th key={type} style={{ padding: '1rem', textAlign: 'right', minWidth: '120px' }}>
                  <div>{type}</div>
                  {typeBreakdown.type_performance?.[type] && (
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 'normal',
                      color: getReliabilityColor(typeBreakdown.type_performance[type].reliability),
                      marginTop: '0.25rem',
                    }}>
                      {typeBreakdown.type_performance[type].reliability}
                    </div>
                  )}
                </th>
              ))}
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', background: '#fef3c7' }}>
                Total (MT)
              </th>
            </tr>
          </thead>
          <tbody>
            {typeBreakdown.predictions.map((pred, index) => {
              const monthTotal = rubberTypes.reduce((sum, type) => sum + (pred.types[type] || 0), 0);

              return (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{
                    padding: '1rem',
                    fontWeight: '600',
                    position: 'sticky',
                    left: 0,
                    background: 'white',
                    zIndex: 5,
                  }}>
                    {pred.month} {pred.year}
                  </td>
                  {rubberTypes.map((type) => (
                    <td key={type} style={{ padding: '1rem', textAlign: 'right' }}>
                      {pred.types[type] ? pred.types[type].toLocaleString() : '-'}
                    </td>
                  ))}
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', background: '#fefce8' }}>
                    {pred.types.Total
                      ? pred.types.Total.toLocaleString()
                      : monthTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    
      {typeBreakdown.type_performance && (
        <div style={{ padding: '1.5rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Model Reliability by Type
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(typeBreakdown.type_performance)
              .filter(([type]) => type !== 'Total' && rubberTypes.includes(type))
              .map(([type, perf]) => (
                <div key={type} style={{
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  borderLeft: `4px solid ${getReliabilityColor(perf.reliability)}`,
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>{type}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Method: {perf.method}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>MAE: {perf.mae}</p>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: getReliabilityColor(perf.reliability),
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}>
                    {perf.reliability} Reliability
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldPrediction;