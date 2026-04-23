import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Question, UserData } from '../types';
import { getQuestions } from '../services/api.questions';

// CSS Imports
import '../assets/css/Quiz.css';
import '../assets/css/Welcome.css'; // Επαναχρησιμοποίηση των nav-btn styles

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
    const score: [number, number] = choice === 'A' ? [1, 0] : [0, 1];
    setAnswers(prev => ({ ...prev, [questionId]: score }));

    // Αυτόματο Next slide μετά την επιλογή (προαιρετικό αλλά βελτιώνει το UX)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        swiperRef.current?.slideNext();
      }
    }, 300);
  };

  const handleFinalSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Παρακαλώ απαντήστε σε όλες τις ερωτήσεις πριν την υποβολή.");
      return;
    }
    onComplete(answers);
  };

  if (loading) return <div className="quiz-container">Φόρτωση ερωτήσεων...</div>;

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="welcome-container"> {/* Χρήση ίδιου container για ομοιομορφία */}
      <div className="welcome-card quiz-card-full">
        
        {/* Header με Progress */}
        <div className="quiz-header" style={{ padding: '20px' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="quiz-counter">
            Ερώτηση <strong>{currentIndex + 1}</strong> από {questions.length}
          </p>
        </div>

        {/* Swiper για τις Ερωτήσεις */}
        <div style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            allowTouchMove={false} // Κλειδώνουμε το swipe για να αναγκάσουμε χρήση κουμπιών/επιλογών
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

        {/* Footer (Ίδιο Styling με το Welcome) */}
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
            {isLastQuestion ? (
              <button 
                className="nav-btn start-btn" 
                onClick={handleFinalSubmit}
                disabled={Object.keys(answers).length < questions.length}
              >
                Finish
              </button>
            ) : (
              <button 
                className="nav-btn" 
                onClick={() => swiperRef.current?.slideNext()}
                disabled={!answers[questions[currentIndex].id]} // Κλείδωμα αν δεν απαντήθηκε
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;