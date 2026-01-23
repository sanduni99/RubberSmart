import React from 'react';
import { Link } from 'react-router-dom';
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div>
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>RubberSmart - AI powered Yield Predication & Market Intelligent</h1>
          <div className={styles.buttonContainer}>
            <Link to="/signup">
              <button className={styles.ctaButton}>Get Started</button>
            </Link>
            <Link to="/learnmore">
              <button className={styles.ctaButton_learn}>Learn More</button>
            </Link>
          </div>
        </div>
      </section>

      {/* feature section */}
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
             <img src="/assets/images/vector_images/yield_new.png" alt="Yield Forecasting" />
            </div>
            <h3 className={styles.featureTitle}>Yield Forecasting</h3>
            <p className={styles.featureDescription}>Accurency forecast rubber yield for better planting</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/business_new.png" alt="Price Intelligence" />
            </div>
            <h3 className={styles.featureTitle}>Price Intelligence</h3>
            <p className={styles.featureDescription}>Track rubber market to optimized your sale.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/report_new.png" alt="Analytics and Reports" />
            </div>
            <h3 className={styles.featureTitle}>Analytics and Reports</h3>
            <p className={styles.featureDescription}>Analyis Yield data and price data with reports</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/price_new.png" alt="Price Alert Management" />
            </div>
            <h3 className={styles.featureTitle}>Price Alert Management</h3>
            <p className={styles.featureDescription}>Get notified with critical price changes immedialtly</p>
          </div>
        </div>
      </section>

      {/* Middle heading */}
      <section className={styles.middleSection}>
        <h2 className={styles.middleTitle}>Enhance Your Rubber Business with Advanced AI Insights</h2>
        <p className={styles.middleDescription}>
          Get started with RubberSmart today and boost your productivity and profits.
        </p>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How RubberSmart Works</h2>
        <p className={styles.sectionDescription}>
          AI-powered forecasting for rubber prices, types, and yield trends.
        </p>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>AI Market Analysis</h3>
            <p className={styles.stepDescription}>RubberSmart continuously analyzes rubber market and industry data.</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>Price & Yield Forecasting</h3>
            <p className={styles.stepDescription}>Provide your farm and market data for analysis.</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>Market Intelligence</h3>
            <p className={styles.stepDescription}>Understand demand, supply, and price movements across regions.</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>Login to View Forecasts</h3>
            <p className={styles.stepDescription}>Access 3,6,12,24 months forecasts through the dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;