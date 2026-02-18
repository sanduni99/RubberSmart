import React from "react";
import Footer from "../../components/Footer";
import style from "./Tapping.module.css";
import { useTranslation } from "react-i18next";

const Tapping = () => {
      const { t } = useTranslation("tapping")
    return (
        <div>
            <div id='tapping'>
                <section className={style.tappinghead}>
                    <h1 className={style.tappingTitle}>{t("title")}
                    </h1>
                </section>

            </div>
            <section className={style.tappingContent}>
                <h2 className={style.tappingContentTitle}>{t("subtitle")}
                </h2>

                <iframe
                    src="https://www.youtube.com/embed/eeHJNQBBKPs?si=OgZFTvwjKK8xkKLe"
                    title="Video"
                    width="100%"
                    height="400"
                    style={{ border: "none", borderRadius: "20px" }}
                    allowFullScreen
                ></iframe>

            </section>
            <section >
                <Footer />
            </section>
        </div>
    );
}

export default Tapping;