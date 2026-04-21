// src/components/Results.tsx
import React from 'react';
import { Strength } from '../types';
import '../assets/css/Results.css';

interface ResultsProps {
    username: string;
    strengths: Strength[];
}

const Results: React.FC<ResultsProps> = ({ username, strengths }) => {
    return (
        <div className="results-container">
            <div className="results-header">
                <h1>Συγχαρητήρια, {username}!</h1>
                <p>Αυτά είναι τα 5 κυρίαρχα ταλέντα σου:</p>
            </div>

            <div className="strengths-grid">
                {strengths.map((s, index) => (
                    <div key={index} className="strength-card">
                        <div className="strength-info">
                            <h3>{index + 1}. {s.Title}</h3>
                            <span className="strength-domain">{s.Domain}</span>
                            <p className="strength-description">{s.Description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                className="start-button" 
                style={{ marginTop: '3rem' }}
                onClick={() => window.location.reload()}
            >
                Επαναλήψη Τεστ
            </button>
        </div>
    );
};

export default Results;