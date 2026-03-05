import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: {
      home: await fetch("/locales/en/home.json").then(res => res.json()),
      about: await fetch("/locales/en/about.json").then(res => res.json()),
      features: await fetch("/locales/en/features.json").then(res => res.json()),
      tapping: await fetch("/locales/en/tapping.json").then(res => res.json()),
      footer: await fetch("/locales/en/footer.json").then(res => res.json()),
      navbar: await fetch("/locales/en/navbar.json").then(res => res.json()),
      signup: await fetch("/locales/en/signup.json").then(res => res.json()),
      login: await fetch("/locales/en/login.json").then(res => res.json()),
    },
    si: {
      home: await fetch("/locales/si/home.json").then(res => res.json()),
      about: await fetch("/locales/si/about.json").then(res => res.json()),
      features: await fetch("/locales/si/features.json").then(res => res.json()),
      tapping: await fetch("/locales/si/tapping.json").then(res => res.json()),
      footer: await fetch("/locales/en/footer.json").then(res => res.json()),
      navbar: await fetch("/locales/si/navbar.json").then(res => res.json()),
      signup: await fetch("/locales/en/signup.json").then(res => res.json()),
      login: await fetch("/locales/en/login.json").then(res => res.json()),
    }
  }
});

export default i18n;
