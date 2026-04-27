import React from 'react';
import { useTeamAnalytics } from '../hooks/useTeamAnalytics';
import '../assets/css/Dashboard.css';

const Dashboard: React.FC<{ data: any[]; onClose: () => void }> = ({ data, onClose }) => {
    // Χρήση του hook
    const { groups, totalUsers, topDomain } = useTeamAnalytics(data);

    return (
        <div className="dashboard-overlay">
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Ομαδικά Αποτελέσματα ({totalUsers} Χρήστες)</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <div className="top-insight">
                    Η ομάδα σας κυριαρχείται από το Domain: <strong>{topDomain}</strong>
                </div>

                <div className="groups-grid">
                    {Object.entries(groups).map(([domain, members]) => (
                        <div key={domain} className="group-column">
                            <h3>{domain}</h3>
                            <div className="count">{members.length} μέλη</div>
                            <ul>
                                {members.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;