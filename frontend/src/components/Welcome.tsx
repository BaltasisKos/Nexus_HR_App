import React, { useState, useRef} from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from "../assets/images/teams.json"; // Το JSON που κατέβασες
import "../assets/css/Welcome.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination} from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper styles
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
        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
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
          <SwiperSlide>
            <div className="slide-content">
              <h2>Καλώς ήρθατε στο Nexus HR</h2>
              <div className="lottie-wrapper">
                <DotLottieReact data={animationData} loop autoplay />
              </div>
            </div>
          </SwiperSlide>


          <SwiperSlide>
            <div className="slide-content">
              <p>Καλώς ορίσατε στο <strong>Nexus HR</strong><br/>
            Μέσα από μια σειρά επιλογών, θα ανακαλύψετε τα 5 κυρίαρχα 
            στρατηγικά σας πλεονεκτήματα.</p>
            <h3>Έτοιμοι για εκκίνηση;</h3>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Custom Navigation Bar στο κάτω μέρος */}
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