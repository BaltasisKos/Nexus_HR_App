// src/components/Results.tsx
import React from 'react';
import { Strength } from '../types';
import '../assets/css/Results.css';

interface ResultsProps {
    username: string;
    strengths: Strength[];
}

const Results: React.FC<ResultsProps> = ({ username, strengths }) => {
    // Συνάρτηση για να παίρνουμε το χρώμα ή το class βάσει Domain
    const getDomainClass = (domain: string) => {
        switch (domain.toLowerCase()) {
            case 'executing': return 'domain-executing';
            case 'influencing': return 'domain-influencing';
            case 'relationship building': return 'domain-relationship';
            case 'strategic thinking': return 'domain-strategic';
            default: return '';
        }
    };

    return (
        <div className="results-container">
            <header className="results-header">
                <div className="header-badge">Προφίλ Ταλέντων</div>
                <h1>Γεια σου, {username}!</h1>
                <p>Με βάση τις απαντήσεις σου, αυτά είναι τα 5 κυρίαρχα δυνατά σου σημεία:</p>
            </header>

            <div className="strengths-grid">
                {strengths.map((s, index) => (
                    <div key={index} className={`strength-card ${getDomainClass(s.Domain)}`}>
                        <div className="card-top">
                            <span className="rank-badge">#{index + 1}</span>
                            <span className="domain-label">{s.Domain}</span>
                        </div>
                        
                        <div className="strength-info">
                            <h3>{s.Title}</h3>
                            <div className="divider"></div>
                            <p className="strength-description">{s.Description}</p>
                        </div>
                        
                        <div className="card-footer">
                            <small>Nexus HR Talent Assessment</small>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="results-footer">
                <button 
                    className="restart-btn" 
                    onClick={() => window.location.reload()}
                >
                    <span className="icon">↺</span> Επανάληψη Τεστ
                </button>
            </footer>
        </div>
    );
};

export default Results;