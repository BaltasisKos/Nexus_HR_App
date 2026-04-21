export interface Question {
    id: number;
    statement_a: string;
    statement_b: string;
    domain: string;
}

export interface Answer {
    questionId: number;
    choice: 'A' | 'B';
}