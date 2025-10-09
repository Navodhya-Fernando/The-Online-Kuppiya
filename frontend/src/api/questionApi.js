import api from './axios';

const QUESTION_URL = '/questions';

// --- Question CRUD ---
export const fetchAllQuestions = () => {
  return api.get(QUESTION_URL);
};

export const postNewQuestion = (questionData) => {
  // questionData should contain { title, body, courseCode, tags }
  return api.post(QUESTION_URL, questionData);
};

export const fetchQuestionDetails = (questionId) => {
  return api.get(`${QUESTION_URL}/${questionId}`);
};

// --- Answer CRUD ---
export const postNewAnswer = (questionId, answerData) => {
  // answerData should contain { body }
  return api.post(`${QUESTION_URL}/${questionId}/answers`, answerData);
};