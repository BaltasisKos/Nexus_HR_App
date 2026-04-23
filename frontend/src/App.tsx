// src/App.tsx
import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Quiz from './components/Quiz';
import Results from './components/Results';
import axios from 'axios';
import { UserData, Strength } from './types';

// Αφαιρέσαμε το 'login' step αφού είναι πλέον μέσα στο Welcome
type Step = 'welcome' | 'quiz' | 'results';

const App: React.FC = () => {
    const [step, setStep] = useState<Step>('welcome');
    const [user, setUser] = useState<UserData | null>(null);
    const [results, setResults] = useState<Strength[]>([]);

    // Αυτή η συνάρτηση καλείται όταν πατηθεί το "Start" στο 3ο slide του Welcome
    const handleStartQuiz = (data: UserData) => {
        setUser(data);
        setStep('quiz');
    };

    const handleQuizComplete = async (finalAnswers: Record<number, [number, number]>) => {
        try {
            const payload = {
                username: user?.username,
                age: user?.age,
                gender: user?.gender,
                answers: finalAnswers
            };

            // Κλήση στο Python Backend (Flask/FastAPI)
            const response = await axios.post('http://localhost:5000/api/submit', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            setResults(response.data.top_5);
            setStep('results');
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Κάτι πήγε λάθος με την αποστολή των αποτελεσμάτων.");
        }
    };

    return (
        <div className="App">
            {/* 1. Αρχική Σελίδα (Περιλαμβάνει πλέον και τη φόρμα στο 3ο slide) */}
            {step === 'welcome' && (
                <Welcome onStart={handleStartQuiz} />
            )}
            
            {/* 2. Σελίδα Quiz */}
            {step === 'quiz' && user && (
                <Quiz 
                    key={user.username} // Χρήση του username για μοναδικότητα
                    user={user} 
                    onComplete={handleQuizComplete} 
                />
            )}

            {/* 3. Σελίδα Αποτελεσμάτων */}
            {step === 'results' && user && (
                <Results username={user.username} strengths={results} />
            )}
        </div>
    );
}

export default App;