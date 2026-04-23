// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

export const getQuestions = async () => {
    const response = await axios.get(`${API_BASE_URL}/questions`);
    return response.data;
};