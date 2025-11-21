import { useState } from 'react';

function Square(
  { value, onSquareClick, isWinning }: { value: string | null; onSquareClick?: () => void; isWinning?: boolean }
) {
  return (
    <button
      className={`square ${isWinning ? 'square-winning' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

type Squares = (string | null)[];
type WinnerInfo = {
  winner: string;
  line: [number, number, number];
} | null;
type HistoryEntry = {
  squares: Squares;
  location: { row: number; col: number} | null;
}

function Board({ xIsNext, squares, onPlay } : { xIsNext: boolean | null; squares: Squares; onPlay:  (nextSquares: Squares, index: number) => void}) {
  const winnerInfo = calculateWinner(squares)
  const winner = winnerInfo?.winner ?? null;
  const winningLine = winnerInfo?.line ?? null;

  function handleClick(i : number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  let status : string;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (!squares.includes(null)) {
    status = 'Draw! No more moves.';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const rows: Squares = []
  for (let i = 0; i < 3; i++) {
    const rowSquares = []
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      const isWinningSquare = winningLine ? winningLine.includes(index) : false;
      rowSquares.push(
        <Square key={index} value={squares[index]} onSquareClick={() => handleClick(index)} isWinning={isWinningSquare} />
      );
    }
    rows.push(
      <div key={i} className='board-row'>
        {rowSquares}
      </div>
    )
  }

  return (
    <>
      <div className='status'>{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { squares: Array(9).fill(null), location: null }
  ])
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: Squares, i: number) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, location: { row, col } }
    ];

    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove : number) {
    setCurrentMove(nextMove);
  }

  const moveIndices = history.map((_, move) => move);
  const orderedMoveIndices = isAscending ? moveIndices : [...moveIndices].reverse();

  const moves = orderedMoveIndices.map((move) => {
    const entry = history[move];
    const loc = entry.location;

    let description;
    if (move > 0) {
      description = `Go to move #${move} (${loc!.row}, ${loc!.col})`;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        {currentMove === move ? (
          <span>You are at move #{move} ({loc?.row}, {loc?.col})</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  return (
    <div className='game'>
      <div className='game-board'>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className='game-info'>
        <button onClick={() => setIsAscending((prev) => !prev)}>
          Sort {isAscending ? 'descending' : 'ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares : Squares): WinnerInfo {
  const lines: [number, number, number][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a] as string,
        line: [a, b, c]
      }
    }
  }
  return null;
}