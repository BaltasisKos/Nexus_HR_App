// src/components/Quiz.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Question, UserData } from '../types';
import '../assets/css/Quiz.css';

interface QuizProps {
    user: UserData;
    onComplete: (answers: Record<number, [number, number]>) => void;
}

const Quiz: React.FC<QuizProps> = ({ user, onComplete }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, [number, number]>>({});
    const [loading, setLoading] = useState(true);

    // Φόρτωση ερωτήσεων από το Backend
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`http://${window.location.hostname}:5000/api/questions`);
                setQuestions(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                alert("Αποτυχία σύνδεσης με τον server.");
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswer = (choice: 'A' | 'B') => {
        const currentQ = questions[currentIndex];
        const score: [number, number] = choice === 'A' ? [1, 0] : [0, 1];
        
        const newAnswers = { ...answers, [currentQ.id]: score };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    if (loading) return <div className="quiz-container">Φόρτωση ερωτήσεων...</div>;

    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-container">
            <div className="quiz-card">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Ερώτηση {currentIndex + 1} από {questions.length}
                </p>

                <h3 className="question-text">Ποιο σας αντιπροσωπεύει περισσότερο;</h3>

                <div className="options-grid">
                    <button className="option-button" onClick={() => handleAnswer('A')}>
                        <span className="option-label">Α.</span> {questions[currentIndex].statement_a}
                    </button>
                    <button className="option-button" onClick={() => handleAnswer('B')}>
                        <span className="option-label">Β.</span> {questions[currentIndex].statement_b}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quiz;