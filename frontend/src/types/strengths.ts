export interface Strength {
    Title: string;
    Domain: string;
    Description: string;
    Score: number;
}

export interface AssessmentResult {
    username: string;
    top_5: Strength[];
}