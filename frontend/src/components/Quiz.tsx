import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Question, UserData } from '../types';
import { getQuestions } from '../services/api.questions';
import Typography from '@mui/material/Typography';
import CircularProgressWithLabel from '@mui/material/CircularProgress'


// CSS Imports
import '../assets/css/Quiz.css';
import '../assets/css/Welcome.css';

interface QuizProps {
  user: UserData;
  onComplete: (answers: Record<number, [number, number]>) => void;
}

const Quiz: React.FC<QuizProps> = ({ user, onComplete }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, [number, number]>>({});
  const [loading, setLoading] = useState(true);
  const [isSliding, setIsSliding] = useState(false); // Lock για γρήγορα clicks

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Αποτυχία σύνδεσης με τον server.");
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectOption = (questionId: number, choice: 'A' | 'B') => {
    // Αν το slide αλλάζει ήδη, αγνοούμε το επιπλέον κλικ
    if (isSliding) return;

    const score: [number, number] = choice === 'A' ? [1, 0] : [0, 1];
    
    // Ενημέρωση των απαντήσεων
    setAnswers(prev => ({ ...prev, [questionId]: score }));

    // Κλείδωμα και αυτόματη αλλαγή slide
    setIsSliding(true);
    
    setTimeout(() => {
      if (swiperRef.current && currentIndex < questions.length - 1) {
        swiperRef.current.slideNext();
      }
      setIsSliding(false);
    }, 400); // 400ms είναι αρκετά για να ολοκληρωθεί το animation του Swiper
  };

  const handleFinalSubmit = () => {
    const totalAnswers = Object.keys(answers).length;
    const totalQuestions = questions.length;

    console.log(`Υποβολή: ${totalAnswers} από ${totalQuestions}`);

    if (totalAnswers < totalQuestions) {
      alert(`Παρακαλώ απαντήστε σε όλες τις ερωτήσεις. (Απαντημένες: ${totalAnswers}/${totalQuestions})`);
      return;
    }
    onComplete(answers);
  };

  if (loading) {
  return (
    <div style={{ 
      position: 'fixed',   // Σπάει τα όρια του welcome-container
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#ffffff', // Ή ό,τι χρώμα έχει το background σου
      zIndex: 9999 
    }}>
        {/* Κρατάμε το welcome-card για να έχει το ίδιο size και στυλ με πριν */}
        <div className="welcome-card" style={{ 
          textAlign: 'center', 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          // Εξασφαλίζουμε ότι δεν θα κληρονομήσει περίεργα margins
          margin: 0 
        }}>
           <Typography variant="h6" sx={{ fontWeight: 500 }}>
             Φόρτωση ερωτήσεων...
           </Typography>

           <CircularProgressWithLabel value={0} /> 
        </div>
    </div>
  );
}

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="welcome-container">
      <div className="welcome-card quiz-card-full">
        
        {/* Header με Progress Bar */}
        <div className="quiz-header" style={{ padding: '20px' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="quiz-counter">
            Ερώτηση <strong>{currentIndex + 1}</strong> από {questions.length}
          </p>
        </div>

        {/* Swiper Container */}
        <div style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            speed={400}
            allowTouchMove={false} // Μόνο μέσω buttons για αποφυγή λαθών
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.activeIndex);
            }}
            className="welcome-swiper"
          >
            {questions.map((q) => (
              <SwiperSlide key={q.id}>
                <div className="slide-content quiz-slide">
                  <h3 className="question-text">Ποιο σας αντιπροσωπεύει περισσότερο;</h3>
                  
                  <div className="options-grid">
                    <button 
                      className={`option-button ${answers[q.id]?.[0] === 1 ? 'selected' : ''}`} 
                      onClick={() => handleSelectOption(q.id, 'A')}
                    >
                      <span className="option-label">Α.</span> {q.statement_a}
                    </button>
                    
                    <button 
                      className={`option-button ${answers[q.id]?.[1] === 1 ? 'selected' : ''}`} 
                      onClick={() => handleSelectOption(q.id, 'B')}
                    >
                      <span className="option-label">Β.</span> {q.statement_b}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Footer Navigation */}
        <div className="swiper-footer">
          <div className="footer-left">
            {currentIndex > 0 && (
              <button className="nav-btn" onClick={() => swiperRef.current?.slidePrev()}>
                Back
              </button>
            )}
          </div>

          <div className="custom-pagination"></div>

          <div className="footer-right">
            {isLastQuestion && (
              <button 
                className="nav-btn start-btn" 
                onClick={handleFinalSubmit}
                // Το κουμπί Finish ενεργοποιείται μόνο αν έχει απαντηθεί και η τελευταία ερώτηση
                disabled={Object.keys(answers).length < questions.length}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;