/**
 * Quiz Adapter
 * 
 * This module provides adapter functions to convert between API quiz models (QuizDto, QuestionDto, etc.)
 * and UI quiz models (Quiz, QuizQuestion, etc.)
 */
import {QuestionType as UIQuestionType, Quiz, QuizOption, QuizQuestion, QuizSettings} from '@/types/lecture';
import {AnswerDto, QuestionDto, QuestionType as APIQuestionType, QuizDto} from '@/types/quiz';
// Import LessonType as a type, not a value
/**
 * Maps the API question type to UI question type
 */
const questionTypeToUI = (apiType: APIQuestionType): UIQuestionType => {
  switch(apiType) {
    case APIQuestionType.SINGLE_CHOICE:
      return 'single_choice';
    case APIQuestionType.MULTIPLE_CHOICE:
      return 'multiple_choice';
    case APIQuestionType.TRUE_FALSE:
      return 'true_false';
    default:
      return 'single_choice';
  }
};
/**
 * Converts an answer DTO (API) to quiz option (UI)
 */
const answerDtoToQuizOption = (answer: AnswerDto): QuizOption => {
  return {
    id: answer.id,
    text: answer.answerText,
    isCorrect: answer.isCorrect || false
  };
};
/**
 * Converts a question DTO (API) to quiz question (UI)
 */
const questionDtoToQuizQuestion = (question: QuestionDto): QuizQuestion => {
  console.log('Converting QuestionDto to QuizQuestion:', question);
  
  // Convert each answer to options
  const options = question.answers?.map(answerDtoToQuizOption);
  
  const uiQuestion: QuizQuestion = {
    id: question.id,
    text: question.questionText,
    type: questionTypeToUI(question.questionType),
    options: options,
    explanation: question.explanation || '',
    points: question.point,
    isRequired: true // Default value as API doesn't store this
  };
  
  console.log('Converted to QuizQuestion:', uiQuestion);
  return uiQuestion;
};
/**
 * Converts an API quiz DTO to UI quiz model
 * @param quizDto The API quiz DTO
 */
export const quizDtoToQuiz = (quizDto: QuizDto): Quiz => {
  const settings: QuizSettings = {
    randomizeQuestions: quizDto.randomizeQuestions,
    showCorrectAnswers: quizDto.showCorrectAnswers,
    allowRetake: quizDto.allowRetake,
    requirePassingScore: quizDto.requirePassingScore,
    passingScore: quizDto.passingScore,
    timeLimit: quizDto.timeLimit
  };

  const questions = quizDto.questions.map(questionDtoToQuizQuestion);
  questions.reduce((sum, q) => sum + q.points, 0);
  return {
    title: quizDto.title,
    questions: questions,
    settings: settings,
    totalPoints: quizDto.totalPoints,
    timeLimit: quizDto.timeLimit
  };
};