import { useMemo } from 'react';

export const useTeamAnalytics = (data: any[]) => {
    return useMemo(() => {
        if (!data || data.length === 0) {
            return { 
                groups: { 'Executing': [], 'Influencing': [], 'Relationship Building': [], 'Strategic Thinking': [] }, 
                totalUsers: 0, 
                topDomain: '' 
            };
        }

        const groups: { [key: string]: string[] } = {
            'Executing': [],
            'Influencing': [],
            'Relationship Building': [],
            'Strategic Thinking': []
        };

        const domainTotals: { [key: string]: number } = {
            'Executing': 0,
            'Influencing': 0,
            'Relationship Building': 0,
            'Strategic Thinking': 0
        };

        data.forEach(user => {
            const scores: { [key: string]: number } = {
                'Executing': 0,
                'Influencing': 0,
                'Relationship Building': 0,
                'Strategic Thinking': 0
            };
            
            // 1. Άθροισε τα πραγματικά Scores του κάθε χρήστη
            user.top_5_results.forEach((s: any) => {
                const currentScore = Number(s.Score || s.score || 0);
                scores[s.Domain] = (scores[s.Domain] || 0) + currentScore;
            });

            // 2. Βρες το κυρίαρχο domain του χρήστη με βάση τους πόντους
            const dominant = Object.keys(scores).reduce((a, b) => 
                scores[a] > scores[b] ? a : b
            );

            // 3. Πρόσθεσε τον χρήστη στο σωστό group (χρησιμοποιώντας το σωστό path για το username)
            const username = user.user_info?.username || user.username || user.name;
            if (groups[dominant] && username) {
                groups[dominant].push(username);
            }

            // 4. Ενημέρωσε τα συνολικά σκορ της ομάδας για το topDomain card
            Object.keys(scores).forEach(domain => {
                domainTotals[domain] += scores[domain];
            });
        });

        // 5. Βρες ποιο domain επικρατεί συνολικά στην ομάδα
        const teamDominant = Object.keys(domainTotals).reduce((a, b) => 
            domainTotals[a] > domainTotals[b] ? a : b
        , 'Executing');

        return {
            groups,
            totalUsers: data.length,
            topDomain: teamDominant,
            domainTotals
        };
    }, [data]);
};