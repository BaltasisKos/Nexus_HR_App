import { useMemo } from 'react';

export const useTeamAnalytics = (data: any[]) => {
    return useMemo(() => {
        if (!data || data.length === 0) return { groups: {}, totalUsers: 0, topDomain: '' };

        const groups: { [key: string]: string[] } = {
            'Executing': [],
            'Influencing': [],
            'Relationship Building': [],
            'Strategic Thinking': []
        };

        const domainTotals: { [key: string]: number } = {};

        data.forEach(user => {
            const counts: { [key: string]: number } = {};
            
            // Μέτρησε τα domains στο top_5 του κάθε χρήστη
            user.top_5_results.forEach((s: any) => {
                counts[s.Domain] = (counts[s.Domain] || 0) + 1;
                domainTotals[s.Domain] = (domainTotals[s.Domain] || 0) + 1;
            });

            // Βρες το κυρίαρχο domain του χρήστη
            const dominant = Object.keys(counts).reduce((a, b) => 
                counts[a] > counts[b] ? a : b
            );

            if (groups[dominant]) {
                groups[dominant].push(user.user_info.username);
            }
        });

        // Βρες ποιο domain επικρατεί σε όλη την ομάδα
        const teamDominant = Object.keys(domainTotals).reduce((a, b) => 
            domainTotals[a] > domainTotals[b] ? a : b
        , '');

        return {
            groups,
            totalUsers: data.length,
            topDomain: teamDominant,
            domainTotals // Χρήσιμο αν θέλεις να φτιάξεις γράφημα αργότερα
        };
    }, [data]);
};