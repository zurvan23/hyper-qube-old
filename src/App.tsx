import {useState} from 'react';

type SquareProps = {
    elementNumber: number;
    value: string | null;
    onSquareClick: () => void;
}

function Square({elementNumber, value, onSquareClick}: SquareProps): React.ReactElement {

    return (
        <button className=
            {
                value ? "square rounded-xl  m-2 font-bold text-gray-200/80 border-2 border-emerald-700/80 text-5xl size-20":
                "square-number rounded-xl  bg-indigo-900/10 m-2 hover:bg-gray-900/20 hover:border-violet-300 text-gray-800 border-2  border-violet-600/80 text-5xl size-20"
            }
            onClick={onSquareClick}>
            { value ? value : elementNumber }
        </button>
    )
}

type BoardGrid = {
    rows: number;
    columns: number;
}

type BoardProps = {
    xIsNext: boolean; // @todo: turn into enum for multiple players with larger boards
    squares: (string | null)[];
    boardGrid: BoardGrid;
    onPlay: (nextSquares: (string | null)[]) => void;
}

function Board({xIsNext, squares, boardGrid, onPlay}: BoardProps): React.ReactElement {

    const boardRows = [...Array(boardGrid.rows).keys()];
    const boardColumns = [...Array(boardGrid.columns).keys()];

    const winner = calculateWinner(squares, boardGrid);

    let status: string;

    if (winner) {
        status = `And the winner is: ${winner}!`;
    } else {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }

    // check if next move can happen:
    function handleClick(sqn: number): void {
        if (squares[sqn] || calculateWinner(squares, boardGrid)) {
            return;
        }

        const nextSquares = squares.slice();

        nextSquares[sqn] = xIsNext ? 'X' : 'O';

        onPlay(nextSquares);
    }

    return (
        <>
            { boardRows.map(row => 
                    <div key={row} className="board-row">
                        { boardColumns.map(col => 
                            {
                                const squareNumber = row * boardGrid.columns + col
                                return <Square key={col} elementNumber={squareNumber} value={squares[squareNumber]} onSquareClick={() => handleClick(squareNumber)}/>
                            }
                        )}
                    </div>
                )
            }
            <div className="absolute top-24 right-24 border-1 border-gray-400 bg-gray-900 text-gray-500 w-40 text-center px-2 m-0.5 font-mono">{status}</div>
        </>
    );
}

function calculateWinningRows(boardGrid: BoardGrid): number[][] {
    // determine winning rows
    let winningRows: number[][] = [];
    for (let row = 0; row < boardGrid.rows; row++) {
        winningRows[row] = []
        for (let col = 0; col < boardGrid.columns; col++) {
            winningRows[row].push(row * boardGrid.columns + col)
        }
    }

    return winningRows;
}

function calculateWinningColumns(boardGrid: BoardGrid): number[][] {

    // determine winning columns
    let winningColumns: number[][] = [];
    for (let col = 0; col < boardGrid.columns; col++) {
        winningColumns[col] = []
        for (let row = 0; row < boardGrid.rows; row++) {
            winningColumns[col].push(row * boardGrid.columns + col)
        }
    }

    return winningColumns;
}

function calculateWinningDiagonals(boardGrid: BoardGrid, slope: number = 1, minimumLength: number = 3): number[][] {
    let winningDiagonals: number[][] = [];

    for (let colStart = 0; colStart < boardGrid.columns; colStart++) {
        let colPos: number = colStart;
        let rowPos:number = 0;

        winningDiagonals[colStart] = [];
        while(colPos < boardGrid.columns && rowPos < boardGrid.rows) {
            let squareNumber: number = (rowPos * (boardGrid.columns + slope)) + colStart;
            winningDiagonals[colStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let rowStart = 1; rowStart < boardGrid.rows; rowStart++) {
        let colPos: number = 0;
        let rowPos: number = rowStart;

        winningDiagonals[boardGrid.columns + rowStart] = [];

        while(rowPos < boardGrid.rows && colPos < boardGrid.columns) {
            const squareNumber: number = (rowPos * boardGrid.columns) + (colPos * slope);
            winningDiagonals[boardGrid.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos++;
        }
    }

    for (let colStart = boardGrid.columns-1; colStart >= 0; colStart--) {
        let colPos: number = colStart;
        let rowPos: number = 0;

        winningDiagonals[boardGrid.columns + boardGrid.rows -1 + colStart] = [];
        while(colPos >= 0 && rowPos < boardGrid.rows) {
            const squareNumber: number = ((rowPos) * (boardGrid.columns - slope)) + colStart;
            winningDiagonals[boardGrid.columns + boardGrid.rows -1 + colStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    for (let rowStart = 1; rowStart < boardGrid.rows; rowStart++) {
        let colPos: number = boardGrid.columns-1;
        let rowPos: number = rowStart;

        winningDiagonals[boardGrid.columns + boardGrid.rows + boardGrid.columns + rowStart] = [];

        while(rowPos < boardGrid.rows && colPos >= 0) {
            const squareNumber: number = (rowPos * boardGrid.columns + (colPos * slope));
            winningDiagonals[boardGrid.columns + boardGrid.rows + boardGrid.columns + rowStart].push(squareNumber);
            rowPos++;
            colPos--;
        }
    }

    winningDiagonals = winningDiagonals.filter(arr => arr.length >= minimumLength);

    return winningDiagonals;
}


function calculateWinner(squares: (string|null)[], boardGrid: BoardGrid): string | null {

    let winningRows = calculateWinningRows(boardGrid);
    let winningColumns = calculateWinningColumns(boardGrid);
    let winningDiagonals = calculateWinningDiagonals(boardGrid, 1, 3);
    
    const winningLines: number[][] = [...winningRows, ...winningColumns, ...winningDiagonals];
    
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

export default function Game(): React.ReactElement {
    const boardSize = getRandomSize();
    const [boardGrid, _setBoardGrid] = useState<(BoardGrid)>({
        rows: boardSize,
        columns: boardSize
    })
 
    const [history, setHistory] = useState<(string | null)[][]>([Array(boardGrid.rows * boardGrid.columns).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares: (string|null)[]): void {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove: number): void {
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
            <li key={move} className="mx-5">
                {move === currentMove ? 
                <button className="border-1 border-gray-400 bg-gray-900 text-gray-500 w-40 text-left px-2 m-0.5 font-mono" >You are at move {currentMove}</button> :
                <button className="border-1 border-gray-400  px-2 m-0.5 w-40 text-left bg-gray-900 text-gray-500 hover:bg-gray-700 font-mono" onClick={() => jumpTo(move)}>{description}</button>
                }
            </li>
        )
    })

    return (
        <div className="relative flex justify-center items-center h-screen">
            <div className="game-board rounded-md font-mono">
                <Board xIsNext={xIsNext} squares={currentSquares} boardGrid={boardGrid} onPlay={handlePlay}/>
            </div>
            <div className="absolute top-24 left-24 game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    )
}
