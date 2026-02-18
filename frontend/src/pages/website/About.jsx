import React from 'react';
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";
import style from "./About.module.css";

const About = () => {
  const { t } = useTranslation("about")
  return (
    <div id='about'>
    <div className={style.aboutheader}>
      <section className={style.aboutContainer} >
        <h1 className={style.aboutTitle}>{t("title")}
        </h1>
        <p className={style.aboutSubtitle}>{t("desc")}
        </p>
      </section>

      <section className={style.aboutSection}>
        <div className={style.aboutContent}>
          <h2 className={style.aboutContentTitle}>{t("missionTitle")}
          </h2>
          <p className={style.aboutContentText}>{t("missionDesc")}
          </p>
        </div>

        <div className={style.aboutContenttwo}>
          <div className={style.aboutContenttwoTitle}>
            <div className={style.aboutEmoji}></div>
            <h3 className={style.aboutContenttwoSubtitle}>{t("visionTitle")}
            </h3>
            <p className={style.aboutContenttwoText}>{t("visionDesc")}
            </p>
          </div>

          <div className={style.aboutContenttwoValues}>
            <div className={style.aboutEmoji}></div>
            <h3 className={style.aboutContenttwoSubtitle}>{t("valuesTitle")}
            </h3>
            <p className={style.aboutContenttwoText}>{t("valuesDesc")}
            </p>
          </div>

          <div className={style.aboutContenttwoImpact}>
            <div className={style.aboutEmoji}></div>
            <h3 className={style.aboutContenttwoSubtitle}>{t("impactTitle")}
            </h3>
            <p className={style.aboutContenttwoText}>{t("impactDesc")}
            </p>
          </div>
        </div>
      </section>
      <section >
          <Footer />
        </section>
    </div>
    </div>
  );
};

export default About;