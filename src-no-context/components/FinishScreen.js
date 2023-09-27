function FinishScreen({ points, maxPossiblePoints, highscore, dispatch }) {
    const percentage = Math.ceil((points / maxPossiblePoints) * 100);

    let emoji;
    if (percentage === 100) {
        emoji = "🥇";
    } else if (percentage >= 80) {
        emoji = "🥳";
    } else if (percentage >= 50) {
        emoji = "🙃";
    } else if (percentage >= 1) {
        emoji = "🤔";
    } else if (percentage === 0) {
        emoji = "🤦‍♂️";
    }

    return (
        <>
            <p className="result">
                <span>{emoji}</span> You scored <strong>{points}</strong> out of{" "}
                {maxPossiblePoints} ({percentage}%)
            </p>
            <p className="highscore">(Highscore: {highscore} points)</p>
            <button
                className="btn btn-ui"
                onClick={() => dispatch({ type: "restart" })}
            >
                Restart quiz
            </button>
        </>
    );
}

export default FinishScreen;
