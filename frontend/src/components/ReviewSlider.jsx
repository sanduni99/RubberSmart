import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import styles from "./ReviewSlider.module.css";

import "swiper/css";

const reviews = [
  {
    name: "Kamal Perera",
    location: "Kalawana",
    text: "RubberSmart helped me decide the best time to sell. Profits increased within 3 months.",
  },
  {
    name: "Sunil Fernando",
    location: "Kegalle",
    text: "The price forecasts are accurate and easy to understand.",
  },
  {
    name: "Nimal Silva",
    location: "Ratnapura",
    text: "Very useful system for small farmers. I trust the AI predictions.",
  },
];


const ReviewSlider = () => {
  return (
    <div className={styles.reviewSliderWrapper}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className={styles.reviewCard}>
              <p className={styles.reviewText}>
                “{review.text}”
              </p>

              <h4 className={styles.reviewName}>
                {review.name}
              </h4>

              <span className={styles.reviewLocation}>
                {review.location}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewSlider;
