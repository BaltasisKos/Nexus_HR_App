import React from 'react';
import { useTeamAnalytics } from '../hooks/useTeamAnalytics';
import '../assets/css/Dashboard.css';

interface DashboardProps {
    data: any[];
    onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onClose }) => {
    const { groups, totalUsers, topDomain } = useTeamAnalytics(data);

    // Λογική για εξαγωγή σε CSV
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
            // Εδώ καλούμε ξανά τη fetchResults του Welcome για να ανανεωθεί η λίστα
            onClose(); // Κλείνουμε το dashboard για να αναγκάσουμε το refresh
        }
    } catch (err) {
        console.error("Delete failed:", err);
    }
};

    return (
        <div className="dashboard-fullscreen">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">NX</div>
                    <span>Nexus Hr </span>
                </div>
                
                <nav className="sidebar-menu">
                    <div className="menu-label">Analytics</div>
                    <button className="menu-item active">
                        <span className="icon">📊</span> Επισκόπηση Ομάδας
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
                    <div className="search-placeholder">
                        Admin Management Console
                    </div>
                    <button className="exit-btn" onClick={onClose}>
                        Έξοδος από το Dashboard 
                    </button>
                </header>

                <div className="content-container">
                    <section className="welcome-banner">
                        <h1>Team Capabilities Report</h1>
                        <p>Ανάλυση στρατηγικής κατανομής ταλέντων βάσει των 4 Domains.</p>
                    </section>

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
                                                <th>Ρόλος / Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.length > 0 ? (
                                                members.map((name, i) => (
                                                    <tr key={i}>
                                                        <td>{name}</td>
                                                        <td className="actions-cell">
                                                            <button 
                                                                className="delete-row-btn" 
                                                                onClick={() => deleteUser(name)}
                                                                title="Διαγραφή Χρήστη"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                        <td><span className="status-tag">Candidate</span></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={2} className="empty">No entries found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;