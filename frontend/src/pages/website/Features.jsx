import React from 'react';
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import style from "./Features.module.css";

const Features = () => {
  const { t } = useTranslation("features")
 const features = t("features", { returnObjects: true })
  return (
    <div id='features'>
      <div className={style.featuresContainer} id='features'>
        <section className={style.featuresHeader}>
          <h1 className={style.featuresTitle}>{t("title")}
          </h1>
          <p className={style.featuresSubtitle}>{t("subtitle")}
          </p>
        </section>

        <section className={style.featuresContent}>
          <div className={style.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} style={{
                      padding: '0.5rem 0',
                      color: '#10b981',
                      fontWeight: '500'
                    }}>
                      ✓ {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section >
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Features;