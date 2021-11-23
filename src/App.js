import React from "react";
import { useEffect, useState } from "react";
import blueCandy from "./images/blue-candy.png";
import greenCandy from "./images/green-candy.png";
import orangeCandy from "./images/orange-candy.png";
import purpleCandy from "./images/purple-candy.png";
import redCandy from "./images/red-candy.png";
import yellowCandy from "./images/yellow-candy.png";

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

  const checkForColumnOfThree = () => {
    for (let i = 0; i < 47; i++) {
      const columnOfThree = [i, i + width, 1 + width * 2];
    }
  };

  const createBoard = () => {
    const randomColorArrangement = [];
    for (let i = 0; i < width * width; i++) {
      const randomColor =
        candyColors[Math.floor(Math.random() * candyColors.length)];
      randomColorArrangement.push(randomColor);
    }
    setCurrentColorArrangement(randomColorArrangement);
  };

  useEffect(() => {
    createBoard();
  }, []);

  console.log(currentColorArrangement);

  return (
    <div className="app">
      <div className="game">
        {currentColorArrangement.map((candyColor, index) => (
          <img
            key={index}
            style={{ backgroundColor: candyColor }}
            src={candyColor}
            alt={candyColor}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
