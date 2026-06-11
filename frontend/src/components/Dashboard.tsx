import React, { useState } from 'react';
import { useTeamAnalytics } from '../hooks/useTeamAnalytics';
import '../assets/css/Dashboard.css';

interface Strength {
    Title: string;
    Domain: string;
    Description?: string;
}

interface UserData {
    timestamp?: string;
    top_5_results?: Strength[]; // Το σωστό key από το Python backend
    user_info?: {
        username: string;
        age: number;
        gender: string;
        specialty?: string;
    };
    // Διατηρούμε τα παλιά για συμβατότητα αν χρειαστεί
    username?: string;
    name?: string;
    strengths?: Strength[];
}

interface DashboardProps {
    data: UserData[]; 
    onClose: () => void;
    onUserDeleted?: (username: string) => void; 
}

const Dashboard: React.FC<DashboardProps> = ({ data, onClose, onUserDeleted }) => {
    const { groups, totalUsers, topDomain } = useTeamAnalytics(data);
    const [activeTab, setActiveTab] = useState<'overview' | 'user-results'>('overview');

    // Helper συνάρτηση για να δίνουμε class χρώματος ανάλογα με το Domain
    const getDomainClass = (domain: string) => {
        switch (domain?.toLowerCase()) {
            case 'executing': return 'domain-executing';
            case 'influencing': return 'domain-influencing';
            case 'relationship building': return 'domain-relationship';
            case 'strategic thinking': return 'domain-strategic';
            default: return 'domain-default';
        }
    };

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Domain,Member Name\n";
        Object.entries(groups).forEach(([domain, members]) => {
            members.forEach(member => {
                csvContent += `${domain},${member}\n`;
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nexus_team_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteUser = async (username: string) => {
        if (!window.confirm(`Είσαι σίγουρος ότι θέλεις να διαγράψεις τον χρήστη ${username};`)) return;
        try {
            const response = await fetch('http://localhost:5000/api/delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (response.ok) {
                alert("Ο χρήστης διαγράφηκε!");
                if (onUserDeleted) {
                    onUserDeleted(username); 
                } else {
                    onClose(); 
                }
            } else {
                alert("Η διαγραφή απέτυχε. Παρακαλώ προσπαθήστε ξανά.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Σφάλμα κατά τη σύνδεση με τον διακομιστή.");
        }
    };

    return (
        <div className="dashboard-fullscreen">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">NX</div>
                    <span>Nexus Hr</span>
                </div>
                
                <nav className="sidebar-menu">
                    <div className="menu-label">Analytics</div>
                    <button 
                        className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="icon">📊</span> Επισκόπηση Ομάδας
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'user-results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('user-results')}
                    >
                        <span className="icon">📥</span> Αποτελέσματα ανά χρήστη
                    </button>
                    <button className="menu-item" onClick={downloadCSV}>
                        <span className="icon">📥</span> Εξαγωγή σε CSV
                    </button>
                </nav>

                <div className="sidebar-status">
                    <div className="status-indicator">
                        <span className="pulse"></span>
                        Live Database
                    </div>
                    <p>{totalUsers} καταγεγραμμένοι χρήστες</p>
                </div>
            </aside>

            <main className="main-viewport">
                <header className="top-nav">
                    <div className="search-placeholder">Admin Management Console</div>
                    <button className="exit-btn" onClick={onClose}>Έξοδος από το Dashboard</button>
                </header>

                <div className="content-container">
                    <section className="welcome-banner">
                        <h1>Team Capabilities Report</h1>
                        <p>Ανάλυση στρατηγικής κατανομής ταλέντων βάσει των 4 Domains.</p>
                    </section>

                    {/* --- VIEW 1: ΕΠΙΣΚΟΠΗΣΗ ΟΜΑΔΑΣ --- */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="metrics-grid">
                                <div className="metric-card primary">
                                    <label>Dominant Domain</label>
                                    <h3>{topDomain || "Calculating..."}</h3>
                                </div>
                                <div className="metric-card">
                                    <label>Total Participants</label>
                                    <h3>{totalUsers}</h3>
                                </div>
                                <div className="metric-card">
                                    <label>Database Status</label>
                                    <h3>Synchronized</h3>
                                </div>
                            </div>

                            <div className="data-grid">
                                {Object.entries(groups).map(([domain, members]) => (
                                    <div key={domain} className="data-panel">
                                        <div className="panel-header">
                                            <h3>{domain}</h3>
                                            <span className="count-pill">{members.length}</span>
                                        </div>
                                        <div className="table-wrapper">
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Ονοματεπώνυμο</th>
                                                        <th>Ειδικότητα</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {members.length > 0 ? (
                                                        members.map((name, i) => {
                                                            const userFullData = data.find(u => 
                                                                u.username === name || 
                                                                u.name === name || 
                                                                u.user_info?.username === name
                                                            );
                                                            const userSpecialty = userFullData?.user_info?.specialty || "Candidate";

                                                            return (
                                                                <tr key={i}>
                                                                    <td>{name}</td>
                                                                    <td>
                                                                        <span className="status-tag">{userSpecialty}</span>
                                                                    </td>
                                                                    <td className="actions-cell">
                                                                        <button className="delete-row-btn" onClick={() => deleteUser(name)}>🗑️</button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr><td colSpan={3} className="empty">No entries found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- VIEW 2: ΑΠΟΤΕΛΕΣΜΑΤΑ ΑΝΑ ΧΡΗΣΤΗ --- */}
                    {activeTab === 'user-results' && (
                        <div className="user-strengths-panel">
                            <div className="panel-header">
                                <h3>Λίστα Χρηστών & Top 5 Strengths</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table user-strengths-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '25%' }}>Ονοματεπώνυμο</th>
                                            <th style={{ width: '65%' }}>Κυρίαρχα Δυνατά Σημεία (Top 5)</th>
                                            <th style={{ width: '10%', textAlign: 'center' }}>Ενέργειες</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from(new Set(Object.values(groups).flat())).map((username, idx) => {
                                            
                                            // 🔍 Αναζήτηση με βάση το nested username
                                            const userFullData = data.find(u => 
                                                u.username === username || 
                                                u.name === username ||
                                                u.user_info?.username === username
                                            );
                                            
                                            // 🎯 Στόχευση στο σωστό backend key
                                            const userStrengths = userFullData?.top_5_results || [];

                                            return (
                                                <tr key={idx}>
                                                    <td className="user-name-cell">
                                                        <strong>{username}</strong>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                                                            <div>💼 {userFullData?.user_info?.specialty || "Candidate"}</div>
                                                            <div>🎂 {userFullData?.user_info?.age} ετών • {userFullData?.user_info?.gender === 'Male' ? 'Άνδρας' : userFullData?.user_info?.gender === 'Female' ? 'Γυναίκα' : userFullData?.user_info?.gender}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="strengths-inline-list">
                                                            {userStrengths.length > 0 ? (
                                                                userStrengths.map((s: any, sIdx: number) => {
                                                                    const title = s.Title || s.title || "Unknown";
                                                                    const domain = s.Domain || s.domain || "default";

                                                                    return (
                                                                        <React.Fragment key={sIdx}>
                                                                            <span 
                                                                                className={`strength-inline-badge ${getDomainClass(domain)}`}
                                                                                title={`Domain: ${domain}`}
                                                                            >
                                                                                {/* 1. Ο αριθμός αφαιρέθηκε από εδώ */}
                                                                                {title}
                                                                            </span>
                                                                            {/* 2. Προσθήκη κόμματος αν υπάρχουν επόμενα στοιχεία */}
                                                                            {sIdx < userStrengths.length - 1 && <span className="comma-separator">, </span>}
                                                                        </React.Fragment>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span className="no-data-text">Δεν βρέθηκαν strengths για τον χρήστη</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button 
                                                            className="delete-row-btn" 
                                                            onClick={() => deleteUser(username)}
                                                            title="Διαγραφή Χρήστη"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        
                                        {Object.values(groups).flat().length === 0 && (
                                            <tr><td colSpan={3} className="empty">Δεν βρέθηκαν χρήστες στο σύστημα.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;