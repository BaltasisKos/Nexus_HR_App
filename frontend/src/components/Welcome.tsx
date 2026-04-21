// src/components/Welcome.tsx
import React from 'react';
import '../assets/css/Welcome.css';

interface WelcomeProps {
    onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <span className="welcome-icon">🎯</span>
                <h1 className="welcome-title">Strengths Finder</h1>
                <p className="welcome-text">
                    Ανακάλυψε τα μοναδικά σου ταλέντα και μάθε πώς να τα αξιοποιείς στο μέγιστο.
                </p>
                <button className="start-button" onClick={onStart}>
                    Ξεκινήστε
                </button>
            </div>
        </div>
    );
};

export default Welcome;