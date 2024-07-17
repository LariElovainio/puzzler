(function() {
	const app = {}

	function init() {
		app.dimension = 4;
		app.pieceCount = app.dimension * app.dimension;
		app.board = document.querySelector('.board');
		app.state = [];
		app.moveCount = 0;
		app.gameDuration = 0;
		createBoard();
		randomizePieces();
		document.addEventListener('click', clickHandler);
	}

	function createBoard() {
		let count = app.pieceCount;
		for( let i=0; i<count; i++ ) {
			let piece = createPiece(i);
			app.board.appendChild(piece);
			let row = 1 + Math.floor(i / app.dimension);
			piece.dataset.goalRow = row;
			piece.dataset.goalColumn = (i+1) - (row-1) * app.dimension;
			piece.style.setProperty('--row', row);
			piece.style.setProperty('--column', piece.dataset.goalColumn);
			piece.style.setProperty('--order', Number(i + 1));
		}
	}

	function createPiece(number) {
		let piece = document.createElement('button');
		number = Number(number + 1);
		piece.type = 'button';
		piece.classList.add('piece');
		piece.textContent = number;
		if( number == app.pieceCount ) {
			piece.classList.add('empty');
			app.empty = piece;
		}
		return piece;
	}

	function randomizePieces() {
		let pieces = document.querySelectorAll('.piece');
		for( let i=0; i<pieces.length; i++ ) {
			let position = getRandomPosition();
			pieces[i].style.setProperty('--row', position.row);
			pieces[i].style.setProperty('--column', position.column);
		}
	}

	function verifyPosition(position) {
		for( let piece in app.state ) {
			if( app.state[piece].row == position.row &&  app.state[piece].column == position.column ) {
				position = getRandomPosition();
			}
		}
		app.state.push(position);
		return position;
	}

	function getRandomPosition() {
		let row = Math.floor(1 + Math.random() * app.dimension);
		let column = Math.floor(1 + Math.random() * app.dimension);
		let position = {
			row: row,
			column: column
		};
		position = verifyPosition(position);
		return position;
	}

	function getPosition(piece) {
		let position = {
			row: piece.style.getPropertyValue('--row'),
			column: piece.style.getPropertyValue('--column'),
		}
		return position;
	}

	function isMovable(piece) {
		let movable = false;
		let emptyPosition = getPosition(app.empty);
		let piecePosition = getPosition(piece);
		if( emptyPosition.row == piecePosition.row ) {
			if( Math.abs(emptyPosition.column - piecePosition.column) == 1 ) {
				movable = true;
			}
		} else if( emptyPosition.column == piecePosition.column ) {
			if( Math.abs(emptyPosition.row - piecePosition.row) == 1 ) {
				movable = true;
			}
		}
		if( movable ) {
			movable = {empty: emptyPosition, piece: piecePosition};
		}
		return movable;
	}

	function clickHandler(e) {
		if( e.target.tagName == 'BUTTON' ) {
			let move = isMovable(e.target);
			if( move ) {
				makeMove(e, move);
				app.moveCount++;
			}
		}
		app.gameDuration = performance.now();
		console.log('Dur', app.gameDuration, 'mvs', app.moveCount);
	}

	function makeMove(e, move) {
		let oldPosition = getPosition(e.target);
		let direction = '';
		if( oldPosition.row < move.empty.row ) {
			direction = 'down';
		} else if( oldPosition.row > move.empty.row ) {
			direction = 'up';
		} else if( oldPosition.column < move.empty.column ) {
			direction = 'right';
		} else if( oldPosition.column > move.empty.column ) {
			direction = 'left';
		}
		e.target.classList.add('slide-' + direction);
		console.info('Direction', direction);
		e.target.ontransitionend = function() {
			e.target.classList.remove('slide-' + direction);
			e.target.style.setProperty('--row', move.empty.row);
			e.target.style.setProperty('--column', move.empty.column);
			app.empty.style.setProperty('--row', move.piece.row);
			app.empty.style.setProperty('--column', move.piece.column);
			checkState();
		};
	}

	function checkState() {
		let pieces = document.querySelectorAll('.piece');
		for( let i=0; i<pieces.length; i++ ) {
			let position = getPosition(pieces[i]);
			if( position.row != pieces[i].dataset.goalRow || position.column != pieces[i].dataset.goalColumn ) {
				return false;
			}
		}
		winGame();
	}

	function winGame() {
		let name = prompt('You won! Name:');
		let scoreBoard = localStorage.getItem('scoreboard');
		if( scoreBoard ) {
			scoreBoard = JSON.parse(scoreBoard);
		} else {
			scoreBoard = [];
		}
		scoreBoard.push({
			name: name,
			duration: app.gameDuration,
			moves: app.moveCount,
		});
		localStorage.setItem('scoreboard', scoreBoard);
		newGame();
	}

	function newGame() {
		window.location = '';
	}

	init();
})();
