import React, { useState, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from "../assets/images/start.json";
import recruitmentAnimation from "../assets/images/Recruitment.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { QRCodeSVG } from 'qrcode.react'; // Import το QR
import '../assets/css/Login.css';
import { UserData } from '../types';



// ΑΥΤΑ ΤΑ IMPORTS ΕΙΝΑΙ ΚΡΙΣΙΜΑ - ΑΝ ΛΕΙΠΟΥΝ, ΤΑ SLIDES ΦΑΙΝΟΝΤΑΙ ΟΛΑ ΜΑΖΙ

import "../assets/css/Welcome.css";

interface WelcomeProps {
  onStart: (data: UserData) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    username: '',
    age: 25,
    gender: 'Other'
  });

  const handleFinalStart = () => {
    if (formData.username.trim() && formData.age > 0) {
        onStart(formData);
    } else {
        alert("Παρακαλώ συμπληρώστε τα στοιχεία σας.");
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">

        {/* ΚΟΥΜΠΙ QR (Πάνω δεξιά στην κάρτα) */}
        {isFirstSlide && (
            <button className="qr-trigger-btn" onClick={() => setShowQR(true)}>
                📱 Σύνδεση με κινητό
            </button>
)}


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

                {/* Slide 3: Η Φόρμα (Login Logic) */}
            <SwiperSlide>
                <div className="slide-content login-slide">
                    <div className="login-card-embedded">
                        <h2 className="login-title">Λίγα στοιχεία για εσάς</h2>
                        <p className="login-subtitle">Βοηθήστε μας να προσαρμόσουμε την εμπειρία σας.</p>
                        
                        <div className="login-form-minimal">
                            <div className="input-group">
                                <label>Ονοματεπώνυμο</label>
                                <input 
                                    type="text" 
                                    placeholder="π.χ. Γιάννης Παπαδόπουλος"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Ηλικία</label>
                                    <input 
                                        type="number" 
                                        min="10" max="99"
                                        value={formData.age}
                                        onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Φύλο</label>
                                    <select 
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="Male">Άνδρας</option>
                                        <option value="Female">Γυναίκα</option>
                                        <option value="Other">Άλλο</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* MODAL ΓΙΑ ΤΟ QR CODE */}
        {showQR && (
          <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
            <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowQR(false)}>×</button>
              <h3>Σκανάρετε για κινητό</h3>
              <div className="qr-code-container">
                <QRCodeSVG value={`http://`} size={200} />
              </div>
              <p>Ανοίξτε την κάμερα του κινητού σας για να συνεχίσετε την εμπειρία φορητά.</p>
            </div>
          </div>
        )}

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
              <button className="nav-btn start-btn" onClick={handleFinalStart}>
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