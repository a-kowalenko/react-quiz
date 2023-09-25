import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";

const initialState = {
    // 'loading', 'error', 'ready', 'active', 'finished'
    status: "loading",
    questions: [],
    index: 12,
    answer: null,
    points: 0,
    highscore: 0,
};

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
            console.log(state);
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
        default:
            throw new Error("Unknown action type.");
    }
}

export default function App() {
    const [{ questions, status, index, answer, points, highscore }, dispatch] =
        useReducer(reducer, initialState);

    const numQuestions = questions.length;
    const maxPossiblePoints = questions.reduce(
        (acc, cur) => acc + cur.points,
        0
    );

    useEffect(function () {
        fetch(`http://localhost:9000/questions`)
            .then((res) => res.json())
            .then((data) => dispatch({ type: "dataReceived", payload: data }))
            .catch((err) => dispatch({ type: "dataFailed" }));
    }, []);

    return (
        <div className="app">
            <Header />
            <Main>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && (
                    <StartScreen
                        numQuestions={numQuestions}
                        dispatch={dispatch}
                    />
                )}
                {status === "active" && (
                    <>
                        <Progress
                            index={index}
                            numQuestions={numQuestions}
                            points={points}
                            maxPossiblePoints={maxPossiblePoints}
                            answer={answer}
                        />
                        <Question
                            question={questions[index]}
                            dispatch={dispatch}
                            answer={answer}
                        />
                        <NextButton
                            dispatch={dispatch}
                            answer={answer}
                            numQuestions={numQuestions}
                            index={index}
                        />
                    </>
                )}
                {status === "finished" && (
                    <FinishScreen
                        points={points}
                        maxPossiblePoints={maxPossiblePoints}
                        highscore={highscore}
                        dispatch={dispatch}
                    />
                )}
            </Main>
        </div>
    );
}
