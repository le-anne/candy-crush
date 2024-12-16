import React, { useEffect, useState } from "react";
import ScoreBoard from "./components/ScoreBoard";
import blueCandy from "./images/Maddie4.png";
import greenCandy from "./images/Baxter5.png";
import orangeCandy from "./images/alien2.png";
import purpleCandy from "./images/flower.png";
import redCandy from "./images/lips3.png";
import yellowCandy from "./images/pizza3.png";
import blank from "./images/blank.png";

const width = 8;
const candyColors = [
  blueCandy,
  greenCandy,
  orangeCandy,
  purpleCandy,
  redCandy,
  yellowCandy,
];

const App = () => {
  const [currentColorArrangement, setCurrentColorArrangement] = useState([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState(null);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  const createBoard = () => {
    const randomColorArrangement = Array.from({ length: width * width }, () =>
      candyColors[Math.floor(Math.random() * candyColors.length)]
    );
    setCurrentColorArrangement(randomColorArrangement);
  };

  const checkMatches = (pattern, scoreIncrement) => {
    let matches = false;
    pattern.forEach(([index, ...checkOffsets]) => {
      const decidedColor = currentColorArrangement[index];
      const isBlank = decidedColor === blank;

      if (
        checkOffsets.every((offset) =>
          currentColorArrangement[index + offset] === decidedColor && !isBlank
        )
      ) {
        setScoreDisplay((score) => score + scoreIncrement);
        [index, ...checkOffsets.map((offset) => index + offset)].forEach(
          (matchIndex) => (currentColorArrangement[matchIndex] = blank)
        );
        matches = true;
      }
    });
    return matches;
  };

  const checkForRowOfThree = () =>
    checkMatches(
      Array.from({ length: 64 }, (_, i) => [i, 1, 2]).filter(
        ([index]) => ![6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63].includes(index)
      ),
      3
    );

  const checkForRowOfFour = () =>
    checkMatches(
      Array.from({ length: 64 }, (_, i) => [i, 1, 2, 3]).filter(
        ([index]) => ![5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 62, 63].includes(index)
      ),
      4
    );

  const checkForColumnOfThree = () =>
    checkMatches(
      Array.from({ length: 48 }, (_, i) => [i, width, 2 * width]),
      3
    );

  const checkForColumnOfFour = () =>
    checkMatches(
      Array.from({ length: 40 }, (_, i) => [i, width, 2 * width, 3 * width]),
      4
    );

  const moveIntoSquareBelow = () => {
    for (let i = 0; i < 56; i++) {
      if (currentColorArrangement[i + width] === blank) {
        currentColorArrangement[i + width] = currentColorArrangement[i];
        currentColorArrangement[i] = blank;
      }
    }
    for (let i = 0; i < width; i++) {
      if (currentColorArrangement[i] === blank) {
        currentColorArrangement[i] = candyColors[Math.floor(Math.random() * candyColors.length)];
      }
    }
  };

  const dragStart = (e) => setSquareBeingDragged(e.target);

  const dragDrop = (e) => setSquareBeingReplaced(e.target);

  const dragEnd = () => {
    const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute("data-id"));
    const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute("data-id"));

    const validMoves = [
      squareBeingDraggedId - 1,
      squareBeingDraggedId - width,
      squareBeingDraggedId + 1,
      squareBeingDraggedId + width,
    ];

    const validMove = validMoves.includes(squareBeingReplacedId);

    currentColorArrangement[squareBeingReplacedId] = squareBeingDragged.getAttribute("src");
    currentColorArrangement[squareBeingDraggedId] = squareBeingReplaced.getAttribute("src");

    if (
      squareBeingReplacedId &&
      validMove &&
      (checkForRowOfThree() || checkForRowOfFour() || checkForColumnOfThree() || checkForColumnOfFour())
    ) {
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
    } else {
      currentColorArrangement[squareBeingReplacedId] = squareBeingReplaced.getAttribute("src");
      currentColorArrangement[squareBeingDraggedId] = squareBeingDragged.getAttribute("src");
      setCurrentColorArrangement([...currentColorArrangement]);
    }
  };

  useEffect(() => createBoard(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      checkForRowOfThree();
      checkForRowOfFour();
      checkForColumnOfThree();
      checkForColumnOfFour();
      moveIntoSquareBelow();
      setCurrentColorArrangement([...currentColorArrangement]);
    }, 100);
    return () => clearInterval(timer);
  }, [currentColorArrangement]);

  return (
    <div className="app">
      <div className="score-board">
        <ScoreBoard score={scoreDisplay} />

      </div>
      
      <div className="game">
        {currentColorArrangement.map((candyColor, index) => (
          <img
            key={index}
            src={candyColor}
            alt={`Candy ${index}`}
            data-id={index}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
          />
        ))}
      </div>
    </div>
  );
  
};

export default App;
