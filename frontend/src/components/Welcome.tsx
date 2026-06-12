import React, { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from "../assets/images/start.json";
import recruitmentAnimation from "../assets/images/Recruitment.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { QRCodeSVG } from 'qrcode.react'; 
import '../assets/css/Login.css';
import { UserData } from '../types';

import Dashboard from '../components/Dashboard'; 
import "../assets/css/Welcome.css";

interface WelcomeProps {
  onStart: (data: UserData) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); 
  const [allResults, setAllResults] = useState<any[]>([]); 
  const [serverIP, setServerIP] = useState('');

  const currentHostname = window.location.hostname;
  const backendUrl = `http://${currentHostname}:5000`;

  useEffect(() => {
    fetch(`${backendUrl}/api/get-ip`)
        .then(res => res.json())
        .then(data => setServerIP(data.ip))
        .catch(err => console.error("Could not fetch IP", err));
  }, [backendUrl]);

  const fetchResults = () => {
        fetch(`${backendUrl}/api/results`)
            .then(res => res.json())
            .then(data => {
                setAllResults(data);
                setShowDashboard(true); 
            })
            .catch(err => {
                console.error("Error fetching results:", err);
                alert("Αδυναμία σύνδεσης με το διακομιστή δεδομένων.");
            });
  };

  const [formData, setFormData] = useState<UserData>({
    username: '',
    age: 0,
    gender: '',
    specialty: ''
  });

  const handleFinalStart = () => {
    if (!formData.username.trim()) {
        alert("Παρακαλώ συμπληρώστε το Ονοματεπώνυμό σας.");
        return;
    }
    if (!formData.age || formData.age < 16 || formData.age > 65) {
        alert("Παρακαλώ εισάγετε μια έγκυρη ηλικία μεταξύ 16 και 65 ετών.");
        return;
    }
    if (!formData.gender) {
        alert("Παρακαλώ επιλέξτε το Φύλο σας.");
        return;
    }
    if (!formData.specialty) {
        alert("Παρακαλώ επιλέξτε την Ειδικότητά σας.");
        return;
    }

    // 🚀 ΔΙΟΡΘΩΣΗ: Καλούμε την onStart περνώντας τα δεδομένα της φόρμας
    onStart(formData);
  };

  const reactPort = window.location.port ? `:${window.location.port}` : '';
  const mobileLink = `http://${serverIP}${reactPort}`;

  return (
    <div className="welcome-container">
      <div className="welcome-card">

        {/* ΚΟΥΜΠΙ QR (Πάνω δεξιά στην κάρτα) */}
        {isFirstSlide && (
            <div className="welcome-top-bar">
                <button className="dashboard-trigger-btn" onClick={fetchResults}>
                    📊 Team Dashboard
                </button>
                
                <button className="qr-trigger-btn" onClick={() => setShowQR(true)}>
                    📱 Σύνδεση με κινητό
                </button>
            </div>
        )}

        <div style={{ flex: 1, overflow: 'hidden', width: '100%', }}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0} 
            slidesPerView={1}
            allowTouchMove={true} 
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
                                    required
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Ηλικία</label>
                                    <input 
                                        type="number" 
                                        min="16" max="65"
                                        value={formData.age || ""}
                                        onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Φύλο</label>
                                    <select 
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        required
                                    >
                                        <option value="" hidden>Επιλέξτε Φύλο</option>
                                        <option value="Male">Άνδρας</option>
                                        <option value="Female">Γυναίκα</option>
                                        <option value="Other">Άλλο</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Ειδικότητα</label>
                                    <select 
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                        required
                                    >
                                        <option value="" hidden>Επιλέξτε Ειδικότητα</option>
                                        <option value="Μπάρμαν">Μπάρμαν</option>
                                        <option value="Σερβιτόρος">Σερβιτόρος</option>
                                        <option value="Μάγειρας">Μάγειρας</option>
                                        <option value="Μπαρίστα">Μπαρίστα</option>
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
                {/* 🚀 ΔΙΟΡΘΩΣΗ: Χρήση του δυναμικού mobileLink αντί για καρφωμένο :3000 */}
                <QRCodeSVG value={mobileLink} size={200} />
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

      {showDashboard && (
        <Dashboard 
          data={allResults} 
          onClose={() => setShowDashboard(false)} 
        />
      )}
    </div>
  );
};

export default Welcome;