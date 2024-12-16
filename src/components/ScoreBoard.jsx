import React from "react";
import '../index.css';


const ScoreBoard = ({ score }) => {
  return (
    <div className="score-board">
      <p> SCORE </p>
      <p>{score}</p>
    </div>
  );
};
export default ScoreBoard;
