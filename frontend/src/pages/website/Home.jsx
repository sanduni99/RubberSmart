import React from 'react';
import { Link } from 'react-router-dom';
import styles from "./Home.module.css";
import { useTranslation } from "react-i18next";
import ReviewSlider from "../../components/ReviewSlider";
import Footer from "../../components/Footer";


const Home = () => {
  const { t } = useTranslation("home");
  return (
    <div id='home'>
      <section className={styles.header} id="home">
        <video
          className={styles.backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/images/bg_viedo.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay}></div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t("title")}</h1>
          <div className={styles.buttonContainer}>
            <Link to="/signup">
              <button className={styles.ctaButton}>{t("getStarted")}</button>
            </Link>
            <Link to="/features">
              <button className={styles.ctaButton_learn}>{t("learnMore")}</button>
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
            <h3 className={styles.featureTitle}>{t("features.featureTitle")}</h3>
            <p className={styles.featureDescription}>{t("features.featureDescription")}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/business_new.png" alt="Price Intelligence" />
            </div>
            <h3 className={styles.featureTitle}>{t("features.priceTitle")}</h3>
            <p className={styles.featureDescription}>{t("features.priceDesc")}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/report_new.png" alt="Analytics and Reports" />
            </div>
            <h3 className={styles.featureTitle}>{t("features.analyticsTitle")}</h3>
            <p className={styles.featureDescription}>{t("features.analyticsDesc")}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="/assets/images/vector_images/price_new.png" alt="Price Alert Management" />
            </div>
            <h3 className={styles.featureTitle}>{t("features.alertTitle")}</h3>
            <p className={styles.featureDescription}>{t("features.alertDesc")}</p>
          </div>
        </div>
      </section>

      {/* Middle heading */}
      <section className={styles.middleSection}>
        <h2 className={styles.middleTitle}>{t("middleTitle")}</h2>
        <p className={styles.middleDescription}>
          {t("middleDesc")}
        </p>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>{t("howItWorksTitle")}</h2>
        <p className={styles.sectionDescription}>
          {t("howItWorksDesc")}
        </p>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>{t("steps.step1Title")}</h3>
            <p className={styles.stepDescription}>{t("steps.step1Desc")}</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>{t("steps.step2Title")}</h3>
            <p className={styles.stepDescription}>{t("steps.step2Desc")}</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>{t("steps.step3Title")}</h3>
            <p className={styles.stepDescription}>{t("steps.step3Desc")}</p>
          </div>
          <div className={styles.stepCard}>
            <h3 className={styles.stepTitle}>{t("steps.step4Title")}</h3>
            <p className={styles.stepDescription}>{t("steps.step4Desc")}</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>{t("ctaSection.ctaTitle")}</h2>
        <p className={styles.ctaDescription}>{t("ctaSection.ctaDesc")}
        </p>
        <div style={{ maxWidth: "600px", margin: "40px auto" }}>
          <ReviewSlider />
        </div>
        <Link to="/signup">
          <button className={styles.ctaButton}>{t("getStarted")}</button>
        </Link>
      </section>

      <section className={styles.footer}>
        <Footer />
      </section>
    </div>
  );
};

export default Home;