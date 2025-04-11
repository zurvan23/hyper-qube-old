import {useState} from 'react';

type SquareProps = {
    number: number;
    value: string | null;
    onSquareClick: () => void;
}


function Square({number, value, onSquareClick}: SquareProps) {

    return (
        <button className={value ? "square bg-white text-gray-700" : "square-number bg-white hover:bg-gray-200 text-gray-100"} onClick={onSquareClick}>
            {value ? value : number}
        </button>
    )
}

type BoardSize = {
    rows: number;
    columns: number;
}

type BoardProps = {
    xIsNext: boolean;
    squares: (string | null)[];
    boardSize: BoardSize;
    onPlay: (nextSquares: (string | null)[]) => void;
}

function Board({xIsNext, squares, boardSize, onPlay}: BoardProps) {

    // check if next move can happen:
    function handleClick(i: number) {
        if (squares[i] || calculateWinner(squares, boardSize)) {
            return;
        }

        const nextSquares = squares.slice();

        nextSquares[i] = xIsNext ? 'X' : 'O';
        
        onPlay(nextSquares);
    }

    const winner = calculateWinner(squares, boardSize);

    let status: string;

    if (winner) {
        status = `And the winner is: ${winner}!`;
    } else {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }

    const boardRows = [...Array(boardSize.rows).keys()];
    const boardColumns = [...Array(boardSize.columns).keys()];

    return (
        <>
            { boardRows.map(row => 
                    <div key={row} className="board-row">
                        { boardColumns.map(col => 
                            {
                                const pos = row * boardSize.columns + col
                                return <Square key={col} number={pos} value={squares[pos]} onSquareClick={() => handleClick(pos)}/>
                            }
                        )}
                    </div>
                )
            }
            <div className="status">{status}</div>
        </>
    );
}

function calculateWinner(squares: (string|null)[], boardSize: BoardSize): string | null {

    let winningLines: number[][] = [];

    // winning rows
    let winningRows: number[][] = [];
    for (let el:number = 0 ; el < boardSize.rows; el++) {
        winningRows[el] = []
        for (let col = 0; col < boardSize.columns; col++) {
            winningRows[el].push(el * boardSize.columns + col)
        }
    }
    winningLines = [...winningLines, ...winningRows];

    let winningColumns: number[][] = [];
    for (let el = 0; el < (boardSize.columns); el++) {
        winningColumns[el] = []
        for (let row = 0; row < boardSize.rows; row++) {
            winningColumns[el].push(el + row * boardSize.columns)
        }
    }
    winningLines = [...winningLines, ...winningColumns];

    let winningDiagonals: number[][] = [];
    let slope: number = 1;

    for (let colStart: number = 0; colStart < boardSize.columns; colStart++) {
        let colPos: number = colStart;
        let rowPos:number = 0;

        winningDiagonals[colStart] = [];
        while(colPos < boardSize.columns && rowPos < boardSize.rows) {
            const squareNumber: number = (rowPos * (boardSize.columns + slope)) + colStart;
            winningDiagonals[colStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let rowStart: number = 1; rowStart < boardSize.rows; rowStart++) {
        let colPos: number = 0;
        let rowPos: number = rowStart;

        winningDiagonals[boardSize.columns + rowStart] = [];

        while(rowPos < boardSize.rows && colPos < boardSize.columns) {
            const squareNumber: number = (rowPos * boardSize.columns) + (colPos * slope);
            winningDiagonals[boardSize.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let colStart: number = boardSize.columns-1; colStart >= 0; colStart--) {
        let colPos: number = colStart;
        let rowPos: number = 0;

        winningDiagonals[boardSize.columns + boardSize.rows -1 + colStart] = [];
        while(colPos >= 0 && rowPos < boardSize.rows) {
            const squareNumber: number = ((rowPos) * (boardSize.columns - slope)) + colStart;
            winningDiagonals[boardSize.columns + boardSize.rows -1 + colStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    for (let rowStart: number = 1; rowStart < boardSize.rows; rowStart++) {
        let colPos: number = boardSize.columns-1;
        let rowPos: number = rowStart;

        winningDiagonals[boardSize.columns + boardSize.rows + boardSize.columns + rowStart] = [];

        while(rowPos < boardSize.rows && colPos >= 0) {
            const squareNumber: number = (rowPos * boardSize.columns + (colPos * slope));
            winningDiagonals[boardSize.columns + boardSize.rows + boardSize.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    const minimumSize: number = Math.min(boardSize.columns, boardSize.rows);
    const filterOut: number = minimumSize > 3 ? 1 : 2;
    winningDiagonals = winningDiagonals.filter(arr => arr.length > filterOut);
    
    winningLines = [...winningLines, ...winningDiagonals];
    
    for (let i: number = 0; i < winningLines.length; i++) {
        let checkSquares = winningLines[i].map(l => squares[l])
        const lined = checkSquares.every((sq, _i, squares) => sq === squares[0]);
        if (checkSquares[0] && lined) {
            return checkSquares[0];
        }
    }
    return calculateDraw(squares) ? 'neither' : null;
}

function calculateDraw(squares: (string|null)[]): boolean {
    return squares.every(sq => sq !== null)
}

function getRandomSize(): number {
    return Math.floor(Math.random() * (4)) + 3;
  }

export default function Game() {
    const [boardSize, _setBoardSize] = useState<(BoardSize)>({
        rows: getRandomSize(),
        columns: getRandomSize()
    })
 
    const [history, setHistory] = useState<(string | null)[][]>([Array(boardSize.rows * boardSize.columns).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares: (string|null)[]) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove: number) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((_squares, move) => {
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
