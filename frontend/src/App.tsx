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
        // 1. Μετατρέπουμε τις απαντήσεις από [1,0] σε 'A' ή 'B' 
        // σε περίπτωση που το Python backend περιμένει string χαρακτήρες.
        const formattedAnswers = Object.entries(finalAnswers).reduce((acc, [qId, score]) => {
            acc[Number(qId)] = score[0] === 1 ? 'A' : 'B';
            return acc;
        }, {} as Record<number, 'A' | 'B'>);

        // 2. Χτίζουμε το payload ακριβώς όπως το Interface UserData + το answers
        const payload = {
            username: user?.username || '',
            age: Number(user?.age || 0),
            gender: user?.gender || '',
            specialty: user?.specialty || 'Candidate', // <--- Αυτό έλειπε και έσκαγε το 400!
            answers: formattedAnswers 
        };

        console.log("Sending payload to backend:", payload);

        // Κλήση στο Python Backend
        const response = await axios.post('http://localhost:5000/api/submit', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Έλεγχος για το πού επιστρέφει τα αποτελέσματα ο server (top_5 ή strengths)
        if (response.data && (response.data.top_5 || response.data.strengths)) {
            setResults(response.data.top_5 || response.data.strengths);
            setStep('results');
        } else {
            console.error("Unexpected response structure:", response.data);
            alert("Τα αποτελέσματα επιστράφηκαν με μη έγκυρη δομή.");
        }

    } catch (error: any) {
        console.error("Error submitting quiz:", error);
        
        // Αν ο server στείλει λεπτομέρειες για το λάθος, τις εμφανίζουμε στην κονσόλα
        if (error.response && error.response.data) {
            console.error("Backend Error Details:", error.response.data);
            alert(`Σφάλμα: ${error.response.data.message || error.response.data.error || "400 Bad Request"}`);
        } else {
            alert("Κάτι πήγε λάθος με την αποστολή των απαντήσεων.");
        }
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