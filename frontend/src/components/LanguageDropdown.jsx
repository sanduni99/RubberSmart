import { useState, useRef, useEffect } from "react";
import i18n from "../i18n";
import styles from "./LanguageDropdown.module.css";

const LanguageDropdown = () => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    console.log("Current language:", i18n.language);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                console.log("Clicked outside dropdown, closing it");
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLang = (lang, e) => {
        e.stopPropagation(); 
        console.log("Changing language to:", lang);
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        setOpen(false);
        console.log("Dropdown closed after changing language");
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                className={styles.langButton}
                onClick={(e) => {
                    e.stopPropagation(); // prevent document click from closing immediately
                    setOpen(!open);
                    console.log("Dropdown toggled. Open =", !open);
                }}
            >
                {i18n.language === "si" ? "සි" : "EN"} ▼
            </button>

            {open && (
                <div
                    className={styles.dropdown}
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                >
                    <button onClick={(e) => changeLang("en", e)}>EN</button>
                    <button onClick={(e) => changeLang("si", e)}>සි</button>
                </div>
            )}
        </div>

    );
};

export default LanguageDropdown;
