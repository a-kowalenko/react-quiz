import { createContext, useContext, useEffect, useReducer } from "react";

const initialState = {
    // 'loading', 'error', 'ready', 'active', 'finished'
    status: "loading",
    questions: [],
    index: 0,
    answer: null,
    points: 0,
    highscore: 0,
    secondsRemaining: null,
};

const BASE_URL = "http://localhost:9000";
const SECONDS_PER_QUESTION = 30;

function reducer(state, action) {
    switch (action.type) {
        case "dataReceived":
            return {
                ...state,
                questions: action.payload,
                status: "ready",
            };
        case "dataFailed":
            return {
                ...state,
                status: "error",
            };
        case "start":
            return {
                ...state,
                status: "active",
                secondsRemaining: state.questions.length * SECONDS_PER_QUESTION,
            };
        case "newAnswer":
            const question = state.questions[state.index];
            const isCorrect = question.correctOption === action.payload;
            return {
                ...state,
                answer: action.payload,
                points: isCorrect
                    ? state.points + question.points
                    : state.points,
            };
        case "nextQuestion":
            return {
                ...state,
                answer: null,
                index: state.index + 1,
            };
        case "finish":
            return {
                ...state,
                status: "finished",
                highscore:
                    state.points > state.highscore
                        ? state.points
                        : state.highscore,
            };
        case "restart":
            return {
                ...initialState,
                questions: state.questions,
                highscore: state.highscore,
                status: "ready",
            };
        case "tick":
            return {
                ...state,
                secondsRemaining: state.secondsRemaining - 1,
                status: state.secondsRemaining < 1 ? "finished" : state.status,
            };
        default:
            throw new Error("Unknown action type.");
    }
}

const QuizContext = createContext();

function QuizProvider({ children }) {
    const [
        {
            questions,
            status,
            index,
            answer,
            points,
            highscore,
            secondsRemaining,
        },
        dispatch,
    ] = useReducer(reducer, initialState);

    const numQuestions = questions.length;
    const maxPossiblePoints = questions.reduce(
        (acc, cur) => acc + cur.points,
        0
    );

    useEffect(function () {
        fetch(`${BASE_URL}/questions`)
            .then((res) => res.json())
            .then((data) => dispatch({ type: "dataReceived", payload: data }))
            .catch((err) => dispatch({ type: "dataFailed" }));
    }, []);

    return (
        <QuizContext.Provider
            value={{
                questions,
                status,
                index,
                answer,
                points,
                highscore,
                secondsRemaining,
                numQuestions,
                maxPossiblePoints,
                dispatch,
            }}
        >
            {children}
        </QuizContext.Provider>
    );
}

function useQuiz() {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error(
            "QuizContext cannot be used outside of the QuizProvider"
        );
    }

    return context;
}

export { QuizProvider, useQuiz };
