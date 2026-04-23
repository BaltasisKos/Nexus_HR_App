import React, { useState, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from "../assets/images/start.json";
import recruitmentAnimation from "../assets/images/Recruitment.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// ΑΥΤΑ ΤΑ IMPORTS ΕΙΝΑΙ ΚΡΙΣΙΜΑ - ΑΝ ΛΕΙΠΟΥΝ, ΤΑ SLIDES ΦΑΙΝΟΝΤΑΙ ΟΛΑ ΜΑΖΙ

import "../assets/css/Welcome.css";

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isFirstSlide, setIsFirstSlide] = useState(true);

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        {/* Προσθήκη style={{ height: '100%' }} για να μην "τρώει" το footer */}
        <div style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0} // Μηδένισε το κενό για να μην "φεύγουν" τα slides
            slidesPerView={1}
            allowTouchMove={true} // Επιτρέπει το σύρσιμο με το ποντίκι/δάχτυλο
            pagination={{ clickable: true, el: '.custom-pagination' }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setIsFirstSlide(swiper.isBeginning);
              setIsLastSlide(swiper.isEnd);
            }}
            className="welcome-swiper"
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="slide-content">
                <div className="lottie-wrapper">
                  <DotLottieReact data={animationData} loop autoplay />
                </div>
                <h2 className="welcome-title">Καλώς ορίσατε στο Nexus HR</h2>
                <p className="welcome-subtitle">
                  Μέσα από μια σειρά επιλογών, θα ανακαλύψετε τα στρατηγικά σας πλεονεκτήματα.
                </p>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
                <div className="slide-content description-slide">
                    <div className="description-text">
                    <h3>Τι είναι το Nexus HR;</h3>
                    
                    <div className="lottie-wrapper-small">
                        <DotLottieReact data={recruitmentAnimation} loop autoplay />
                    </div>

                    <p className="description-p">
                        Το <strong>Nexus HR</strong> είναι ένας ψηφιακός σύμβουλος ανάπτυξης. 
                        Μέσω ενός εξειδικευμένου ερωτηματολογίου, χαρτογραφούμε τα μοναδικά σας 
                        ταλέντα για να μετατρέψουμε την ατομική ικανότητα σε συλλογική υπεροχή.
                    </p>
                    
                    <p className="description-highlight">
                        Είστε έτοιμοι να γνωρίσετε τον καλύτερο επαγγελματικό σας εαυτό;
                    </p>
                    </div>

                    <h4 className="bottom-call-to-action">Πάμε να ξεκινήσουμε;</h4>
                </div>
                </SwiperSlide>
          </Swiper>
        </div>

        {/* FOOTER - ΕΞΩ ΑΠΟ ΤΟ SWIPER DIV */}
        <div className="swiper-footer">
          <div className="footer-left">
            {!isFirstSlide && (
              <button className="nav-btn" onClick={() => swiperRef.current?.slidePrev()}>
                Back
              </button>
            )}
          </div>
          <div className="custom-pagination"></div>
          <div className="footer-right">
            {isLastSlide ? (
              <button className="nav-btn start-btn" onClick={onStart}>
                Start
              </button>
            ) : (
              <button className="nav-btn" onClick={() => swiperRef.current?.slideNext()}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;