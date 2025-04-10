import {useState} from 'react';

function Square({value, onSquareClick}) {

    return (
        <button className="square" onClick={onSquareClick}>
            {value}
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
                                    return <Square key={col} value={squares[pos]} onSquareClick={() => handleClick(pos)}/>
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

    const lines = [];

    // winning rows
    for (let el = 0; el < boardSize.rows; el++) {
        lines[el] = []
        for (let col = 0; col < boardSize.columns; col++) {
            lines[el].push(el * boardSize.columns + col)
        }
    }

    // winning columns
    for (let el = boardSize.rows; el < (boardSize.rows + boardSize.columns); el++) {
        lines[el] = []
        for (let row = 0; row < boardSize.rows; row++) {
            lines[el].push((el - boardSize.rows) + (row * boardSize.columns))
        }
    }
    console.log(lines, "linves")


    
    for (let i = 0; i < lines.length; i++) {
        let checkSquares = lines[i].map(l => squares[l])
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
    return Math.floor(Math.random() * (4)) + 3;
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