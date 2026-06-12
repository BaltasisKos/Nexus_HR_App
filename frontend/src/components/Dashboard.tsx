import React, { useState } from 'react';
import { useTeamAnalytics } from '../hooks/useTeamAnalytics';
import '../assets/css/Dashboard.css';

interface Strength {
    Title: string;
    Domain: string;
    Description?: string;
    Score?: number;
    score?: number;
    Value?: number;
    value?: number;
    percentage?: number;
}

interface UserData {
    timestamp?: string;
    top_5_results?: Strength[];
    user_info?: {
        username: string;
        age: number;
        gender: string;
        specialty?: string;
    };
    username?: string;
    name?: string;
    strengths?: Strength[];
}

interface DashboardProps {
    data: UserData[]; 
    onClose: () => void;
    onUserDeleted?: (username: string) => void; 
}

const Dashboard: React.FC<DashboardProps> = ({ data: initialData, onClose, onUserDeleted }) => {
    // Μετατρέπουμε τα αρχικά δεδομένα σε τοπικό state για να μπορούμε να τα φιλτράρουμε άμεσα μετά τη διαγραφή
    const [currentData, setCurrentData] = useState<UserData[]>(initialData);
    
    // Πλέον περνάμε το currentData στο hook ώστε να ανανεώνονται αυτόματα τα γραφήματα και οι μετρήσεις
    const { groups, totalUsers, topDomain } = useTeamAnalytics(currentData);
    const [activeTab, setActiveTab] = useState<'overview' | 'user-results'>('overview');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const toggleExpandUser = (username: string) => {
        setExpandedUser(prev => prev === username ? null : username);
    };

    const getDomainClass = (domain: string) => {
        switch (domain?.toLowerCase()) {
            case 'executing': return 'domain-executing';
            case 'influencing': return 'domain-influencing';
            case 'relationship building': return 'domain-relationship';
            case 'strategic thinking': return 'domain-strategic';
            default: return 'domain-default';
        }
    };

    // 1. Καθολικό Export για ΟΛΟΥΣ τους χρήστες (με τα Top 5 Strengths τους)
    const downloadAllUsersCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF για σωστά Ελληνικά στο Excel
        csvContent += "Όνομα Χρήστη,Ειδικότητα,Ηλικία,Φύλο,Strength Title,Domain,Percentage\n";

        const allUsernames = Array.from(new Set(Object.values(groups).flat()));
        
        allUsernames.forEach(username => {
            const userFullData = currentData.find(u => u.username === username || u.name === username || u.user_info?.username === username);
            const userStrengths = userFullData?.top_5_results || [];
            const specialty = userFullData?.user_info?.specialty || "Candidate";
            const age = userFullData?.user_info?.age || "";
            const gender = userFullData?.user_info?.gender || "";

            const totalScore = userStrengths.reduce((sum, current) => {
                const val = current.Score || current.score || current.Value || current.value || current.percentage || 0;
                return sum + Number(val);
            }, 0);

            userStrengths.forEach(s => {
                const title = s.Title || s.Title || "Unknown";
                const domain = s.Domain || s.Domain || "Unknown";
                const rawScore = Number(s.Score || s.score || s.Value || s.value || s.percentage || 0);
                const percentage = totalScore > 0 ? Math.round((rawScore / totalScore) * 100) : 0;

                csvContent += `"${username}","${specialty}",${age},"${gender}","${title}","${domain}",${percentage}%\n`;
            });
        });

        triggerDownload(csvContent, "all_users_analytics_report.csv");
    };

    // 2. Μεμονωμένο Export για ΕΝΑΝ συγκεκριμένο χρήστη
    const downloadSingleUserCSV = (username: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Αποφυγή ανοιγοκλεισίματος του Row
        const userFullData = currentData.find(u => u.username === username || u.name === username || u.user_info?.username === username);
        const userStrengths = userFullData?.top_5_results || [];
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Strength Title,Domain,Percentage\n";

        const totalScore = userStrengths.reduce((sum, current) => {
            const val = current.Score || current.score || current.Value || current.value || current.percentage || 0;
            return sum + Number(val);
        }, 0);

        userStrengths.forEach(s => {
            const title = s.Title || s.Title || "Unknown";
            const domain = s.Domain || s.Domain || "Unknown";
            const rawScore = Number(s.Score || s.score || s.Value || s.value || s.percentage || 0);
            const percentage = totalScore > 0 ? Math.round((rawScore / totalScore) * 100) : 0;

            csvContent += `"${title}","${domain}",${percentage}%\n`;
        });

        triggerDownload(csvContent, `${username}_strengths_report.csv`);
    };

    const triggerDownload = (content: string, fileName: string) => {
        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteUser = async (username: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (!window.confirm(`Είσαι σίγουρος ότι θέλεις να διαγράψεις τον χρήστη ${username};`)) return;
        try {
            const response = await fetch('http://localhost:5000/api/delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (response.ok) {
                alert("Ο χρήστης διαγράφηκε!");
                
                // Φιλτράρουμε το τοπικό state ώστε ο χρήστης να εξαφανιστεί αμέσως χωρίς reload
                setCurrentData(prevData => 
                    prevData.filter(u => u.username !== username && u.name !== username && u.user_info?.username !== username)
                );

                // Ενημερώνουμε και το parent component αν χρειάζεται, χωρίς όμως να τρέχουμε onClose()
                if (onUserDeleted) {
                    onUserDeleted(username); 
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
                        <span className="icon">👥</span> Αποτελέσματα ανά χρήστη
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
                    
                    {/* --- ΠΑΡΑΘΥΡΟ 1: ΕΠΙΣΚΟΠΗΣΗ ΟΜΑΔΑΣ --- */}
                    {activeTab === 'overview' && (
                        <div className="tab-windowview-fade">
                            <section className="welcome-banner">
                                <h1>Επισκόπηση Ομάδας</h1>
                                <p>Ανάλυση στρατηγικής κατανομής ταλέντων βάσει των 4 Domains.</p>
                            </section>

                            

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
                                                            const userFullData = currentData.find(u => u.username === name || u.name === name || u.user_info?.username === name);
                                                            const userSpecialty = userFullData?.user_info?.specialty || "Candidate";

                                                            return (
                                                                <tr key={i}>
                                                                    <td>{name}</td>
                                                                    <td>
                                                                        <span className="status-tag">{userSpecialty}</span>
                                                                    </td>
                                                                    <td className="actions-cell">
                                                                        <button className="delete-row-btn" onClick={(e) => deleteUser(name, e)}>🗑️</button>
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
                        </div>
                    )}

                    {/* --- ΠΑΡΑΘΥΡΟ 2: ΑΠΟΤΕΛΕΣΜΑΤΑ ΑΝΑ ΧΡΗΣΤΗ --- */}
                    {activeTab === 'user-results' && (
                        <div className="tab-windowview-fade">
                            <section className="welcome-banner">
                                <h1>Αποτελέσματα χρήστών</h1>
                                <p>Διαχείριση, προβολή προφίλ και εξαγωγή δεδομένων ανά εξεταζόμενο χρήστη.</p>
                            </section>

                            <div className="user-strengths-panel">
                                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>Λίστα Χρηστών & Top 5 Strengths</h3>
                                    <button className="export-all-btn" onClick={downloadAllUsersCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>
                                        📥 Εξαγωγή Όλων σε CSV
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table className="admin-table user-strengths-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Ονοματεπώνυμο</th>
                                                <th style={{ width: '60%' }}>Κυρίαρχα Δυνατά Σημεία (Top 5)</th>
                                                <th style={{ width: '15%', textAlign: 'center' }}>Ενέργειες</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from(new Set(Object.values(groups).flat())).map((username, idx) => {
                                                const userFullData = currentData.find(u => u.username === username || u.name === username || u.user_info?.username === username);
                                                const userStrengths = userFullData?.top_5_results || [];
                                                const isExpanded = expandedUser === username;

                                                const totalScore = userStrengths.reduce((sum, current) => {
                                                    const val = current.Score || current.score || current.Value || current.value || current.percentage || 0;
                                                    return sum + Number(val);
                                                }, 0);

                                                return (
                                                    <React.Fragment key={idx}>
                                                        <tr 
                                                            onClick={() => toggleExpandUser(username)} 
                                                            style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f8fafc' : 'transparent' }}
                                                            className="clickable-user-row"
                                                        >
                                                            <td className="user-name-cell">
                                                                <strong>{isExpanded ? '' : ''} {username}</strong>
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
                                                                            const rawScore = Number(s.Score || s.score || s.Value || s.value || s.percentage || 0);
                                                                            const percentage = totalScore > 0 ? Math.round((rawScore / totalScore) * 100) : 0;

                                                                            return (
                                                                                <React.Fragment key={sIdx}>
                                                                                    <span className={`strength-inline-badge ${getDomainClass(domain)}`}>
                                                                                        {title} ({percentage}%)
                                                                                    </span>
                                                                                    {sIdx < userStrengths.length - 1 && <span className="comma-separator">, </span>}
                                                                                </React.Fragment>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <span className="no-data-text">Δεν βρέθηκαν strengths</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                                    <button 
                                                                        className="export-row-btn" 
                                                                        onClick={(e) => downloadSingleUserCSV(username, e)}
                                                                        title="Εξαγωγή Χρήστη σε CSV"
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                                                    >
                                                                        📥
                                                                    </button>
                                                                    <button 
                                                                        className="delete-row-btn" 
                                                                        onClick={(e) => deleteUser(username, e)}
                                                                        title="Διαγραφή Χρήστη"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {isExpanded && (
                                                            <tr className="expanded-details-row" style={{ backgroundColor: '#fdfefe' }}>
                                                                <td colSpan={3} style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>
                                                                    <div className="expanded-info-container">
                                                                        <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                                                            Analyτική Κατανομή Απαντήσεων & Ταλέντων
                                                                        </h4>
                                                                        <div style={{ gridTemplateColumns: '1fr', display: 'grid', gap: '10px' }}>
                                                                            {userStrengths.map((s: any, sIdx: number) => (
                                                                                <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                                        <strong style={{ color: '#0f172a' }}>{s.Title || s.title}</strong>
                                                                                        <span className={`status-tag ${getDomainClass(s.Domain || s.domain)}`} style={{ fontSize: '0.75rem' }}>
                                                                                            {s.Domain || s.domain}
                                                                                        </span>
                                                                                    </div>
                                                                                    {s.Description && (
                                                                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                                                                                            {s.Description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;