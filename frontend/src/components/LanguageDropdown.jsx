import { useState, useRef, useEffect } from "react";
import i18n from "../i18n";
import styles from "./LanguageDropdown.module.css";

const LanguageDropdown = () => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);


    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLang = (lang, e) => {
        e.stopPropagation(); 
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        setOpen(false);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                className={styles.langButton}
                onClick={(e) => {
                    e.stopPropagation(); 
                    setOpen(!open);
                }}
            >
                {i18n.language === "si" ? "සි" : "EN"} ▼
            </button>

            {open && (
                <div
                    className={styles.dropdown}
                    onClick={(e) => e.stopPropagation()} 
                >
                    <button onClick={(e) => changeLang("en", e)}>EN</button>
                    <button onClick={(e) => changeLang("si", e)}>සි</button>
                </div>
            )}
        </div>

    );
};

export default LanguageDropdown;
