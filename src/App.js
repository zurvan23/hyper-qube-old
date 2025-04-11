import {useState} from 'react';

function Square({number, value, onSquareClick}) {

    return (
        <button className={value ? "square" : "square-number"} onClick={onSquareClick}>
            {value ? value : number}
        </button>
    )
}


function Board({xIsNext, squares, boardSize, onPlay}) {

    // check if next move can happen:
    function handleClick(i) {
        if (squares[i] || calculateWinner(squares, boardSize)) {
            return;
        }

        const nextSquares = squares.slice();

        nextSquares[i] = xIsNext ? 'X' : 'O';
        
        onPlay(nextSquares);
    }

    const winner = calculateWinner(squares, boardSize);

    let status = '';

    if (winner) {
        status = `And the winner is: ${winner}!`;
    } else {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }

    const boardRows = [...Array(boardSize.rows).keys()];
    const boardColumns = [...Array(boardSize.columns).keys()];

    return (
        <>
            {boardRows.map(row => 
                    <div key={row} className="board-row">
                        {   
                            boardColumns.map(col => 
                                {
                                    const pos = row * boardSize.columns + col
                                    return <Square key={col} number={pos} value={squares[pos]} onSquareClick={() => handleClick(pos)}/>
                                }
                            )
                        }
                    </div>
                )
            }
            <div className="status">{status}</div>
        </>
    );
}

function calculateWinner(squares, boardSize) {

    let winningLines = [];

    // winning rows
    let winningRows = [];
    for (let el = 0; el < boardSize.rows; el++) {
        winningRows[el] = []
        for (let col = 0; col < boardSize.columns; col++) {
            winningRows[el].push(el * boardSize.columns + col)
        }
    }
    winningLines = [...winningLines, ...winningRows];

    let winningColumns = [];
    for (let el = 0; el < (boardSize.columns); el++) {
        winningColumns[el] = []
        for (let row = 0; row < boardSize.rows; row++) {
            winningColumns[el].push(el + row * boardSize.columns)
        }
    }
    winningLines = [...winningLines, ...winningColumns];

    let winningDiagonals = [];
    let slope = 1;

    for (let colStart = 0; colStart < boardSize.columns; colStart++) {
        let colPos = colStart;
        let rowPos = 0;

        winningDiagonals[colStart] = [];
        while(colPos < boardSize.columns && rowPos < boardSize.rows) {
            const squareNumber = (rowPos * (boardSize.columns + slope)) + colStart;
            winningDiagonals[colStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let rowStart = 1; rowStart < boardSize.rows; rowStart++) {
        let colPos = 0;
        let rowPos = rowStart;

        winningDiagonals[boardSize.columns + rowStart] = [];

        while(rowPos < boardSize.rows && colPos < boardSize.columns) {
            const squareNumber = (rowPos * boardSize.columns) + (colPos * slope);
            winningDiagonals[boardSize.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let colStart = boardSize.columns-1; colStart >= 0; colStart--) {
        let colPos = colStart;
        let rowPos = 0;

        winningDiagonals[boardSize.columns + boardSize.rows -1 + colStart] = [];
        while(colPos >= 0 && rowPos < boardSize.rows) {
            const squareNumber = ((rowPos) * (boardSize.columns - slope)) + colStart;
            winningDiagonals[boardSize.columns + boardSize.rows -1 + colStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    for (let rowStart = 1; rowStart < boardSize.rows; rowStart++) {
        let colPos = boardSize.columns-1;
        let rowPos = rowStart;

        winningDiagonals[boardSize.columns + boardSize.rows + boardSize.columns + rowStart] = [];

        while(rowPos < boardSize.rows && colPos >= 0) {
            const squareNumber = (rowPos * boardSize.columns + (colPos * slope));
            winningDiagonals[boardSize.columns + boardSize.rows + boardSize.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    winningDiagonals = winningDiagonals.filter(arr => arr.length > 2);
    console.log(winningDiagonals, "winning diagonals");
    // console.log(winningDiagonals, 'diagonals');
    
    winningLines = [...winningLines, ...winningDiagonals];
    
    console.log(winningLines, "linves")


    
    for (let i = 0; i < winningLines.length; i++) {
        let checkSquares = winningLines[i].map(l => squares[l])
        const lined = checkSquares.every((sq, i, squares) => sq === squares[0]);
        if (checkSquares[0] && lined) {
            return checkSquares[0];
        }
    }
    console.log(squares, "squares");
    return calculateDraw(squares) ? 'neither' : null;
}

function calculateDraw(squares) {
    return squares.every(sq => sq !== null)
}

function getRandomSize() {
    return Math.floor(Math.random() * (2)) + 3;
  }

export default function Game() {
    const [boardSize, setBoardSize] = useState({
        rows: getRandomSize(),
        columns: getRandomSize()
    })
 
    const [history, setHistory] = useState([Array(boardSize.rows * boardSize.columns).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
        description = 'Go to move #' + move;
    } else {
        description = 'Go to game start';
    }
    return (
        <li key={move}>
            {move === currentMove ? 
            <p>You are at move {currentMove}</p> :
            <button onClick={() => jumpTo(move)}>{description}</button>
            }
        </li>
    )
})
    
    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} boardSize={boardSize} onPlay={handlePlay}/>
            </div>
            <div className="game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    )
}