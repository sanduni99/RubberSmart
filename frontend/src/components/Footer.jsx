import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";


const Footer = () => {
    const { t } = useTranslation("footer");
    return (
        <footer style={{ background: '#f8f8f8', padding: '2rem 1rem', textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
                &copy; {new Date().getFullYear()} RubberSmart. All rights reserved.
            </p>

            <div style={{ marginTop: '1rem' }}>
                <a href="/about" style={{ margin: '0 1rem', color: '#10b981', textDecoration: 'none' }}>{t("about")}</a>
                <a href="/features" style={{ margin: '0 1rem', color: '#10b981', textDecoration: 'none' }}>{t("features")}</a>
                <a href="/tapping" style={{ margin: '0 1rem', color: '#10b981', textDecoration: 'none' }}>{t("tapping")}</a>
                <a href="/contact" style={{ margin: '0 1rem', color: '#10b981', textDecoration: 'none' }}>{t("contact")}</a>
            </div>
            <div style={{ marginTop: "1rem" }}>
                <a
                    href="https://twitter.com/RubberSmart"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: "0 10px", color: "#10b981", fontSize: "22px" }}
                >
                    <FaTwitter />
                </a>

                <a
                    href="https://facebook.com/RubberSmart"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: "0 10px", color: "#10b981", fontSize: "22px" }}
                >
                    <FaFacebook />
                </a>

                <a
                    href="https://linkedin.com/company/RubberSmart"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: "0 10px", color: "#10b981", fontSize: "22px" }}
                >
                    <FaLinkedin />
                </a>
            </div>
        </footer>
    );
}
export default Footer;