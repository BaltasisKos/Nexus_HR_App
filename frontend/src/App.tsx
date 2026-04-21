// src/App.tsx
import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Quiz from './components/Quiz'; // Προσοχή στο κεφαλαίο Q
import axios from 'axios';
import { UserData, Strength } from './types';
import Results from './components/Results';

type Step = 'welcome' | 'login' | 'quiz' | 'results';

const App: React.FC = () => {
    const [step, setStep] = useState<Step>('welcome');
    const [user, setUser] = useState<UserData | null>(null);
    const [results, setResults] = useState<Strength[]>([]);

    const handleLogin = (data: UserData) => {
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
            {/* 1. Αρχική Σελίδα */}
            {step === 'welcome' && (
                <Welcome onStart={() => setStep('login')} />
            )}
            
            {/* 2. Σελίδα Login */}
            {step === 'login' && (
                <Login onLogin={handleLogin} />
            )}

            {/* 3. Σελίδα Quiz - ΕΔΩ ΕΓΙΝΕ Η ΑΛΛΑΓΗ */}
            {step === 'quiz' && user && (
    <Quiz 
        key={Date.now()} // Αυτό αναγκάζει το Quiz να ξαναξεκινήσει από το μηδέν
        user={user} 
        onComplete={handleQuizComplete} 
    />
)}

            {/* 4. Σελίδα Αποτελεσμάτων (Placeholder) */}
            {step === 'results' && user && (
    <Results username={user.username} strengths={results} />
)}
        </div>
    );
}

export default App;