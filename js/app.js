'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'

const GLUE_AUDIO = new Audio('audio/Saba.mp3')
const GLUED_AUDIO = new Audio('audio/pishotoSquiz.mp3')
const BALL_AUDIO = new Audio('audio/pishotoStrong.mp3')

var gGamerGlued
var gBallsInteval
var gGlueInteval
var gGlueTimeOut
var gCurrBallsOnBoard
var gCollectedBallsCount
var gBallsAroundGamer
const gElCollectedBallsCount = document.querySelector('.collected-balls')
const gElResetBtn = document.querySelector('.reset-btn')
const gElBallsAroundGamer = document.querySelector('.balls-around')

// Model:
var gBoard
var gGamerPos

function onInitGame() {
    gGamerGlued = false
    gElResetBtn.style.visibility = 'hidden'
    gCurrBallsOnBoard = 2
    gCollectedBallsCount = 0
    gElCollectedBallsCount.innerText = gCollectedBallsCount
    gBallsAroundGamer = 0
    gElBallsAroundGamer.innerText = gBallsAroundGamer
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gBallsInteval = setInterval(addRandomBall, 1300)
    gGlueInteval = setInterval(addGlue, 5000)
}

function gameOver() {
    clearInterval(gBallsInteval)
    clearInterval(gGlueInteval)
    gElResetBtn.style.visibility = 'visible'
}

function checkBallsAround() {
    var ballsCount = 0
    var iPos = gGamerPos.i
    var jPos = gGamerPos.j

    for (var i = iPos - 1; i <= iPos + 1; i++) {
        for (var j = jPos - 1; j <= jPos + 1; j++) {
            if (gBoard[iPos][jPos].isPassage) {
                if (i < 1) continue
                if (i > 8) continue
                if (j < 1) continue
                if (j > 10) continue
            }

            if (gBoard[i][j].gameElement === BALL) {
                ballsCount++
            }
        }
    }

    gBallsAroundGamer = ballsCount
    gElBallsAroundGamer.innerText = gBallsAroundGamer
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges

    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null, isPassage: false }

            if (i === 0 || i === 9 || j === 0 || j === 11) {
                if ((i === 0 && j === 5) || (i === 5 && j === 0) ||
                    (i === 9 && j === 5) || (i === 5 && j === 11)) {
                    board[i][j].isPassage = true
                    continue
                }
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    console.log(board)
    return board
}

function addGlue() {
    const randomLocation = renderAtRandomLocation(GLUE, GLUE_IMG)
    GLUE_AUDIO.play()
    gGlueTimeOut = setTimeout(() => {
        gBoard[randomLocation.i][randomLocation.j].gameElement = null
        renderCell(randomLocation, '')
    }, 3000);
}

function addRandomBall() {
    renderAtRandomLocation(BALL, BALL_IMG)
    gCurrBallsOnBoard++
    checkBallsAround()
}

function getEmptyLocations() {
    var locations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].gameElement && gBoard[i][j].type === FLOOR) {
                locations.push({ i, j })
            }
        }
    }
    return locations[0] ? locations : null
}

function renderAtRandomLocation(element, img) {
    var locations = getEmptyLocations()
    if (!locations) return
    const randomLocation = drawNum(locations)
    gBoard[randomLocation.i][randomLocation.j].gameElement = element
    renderCell(randomLocation, img)
    return randomLocation
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gGamerGlued) return
    const isPassage = gBoard[gGamerPos.i][gGamerPos.j].isPassage
    if (isPassage) {
        if (i < 0) i = 9
        if (i > 9) i = 0
        if (j < 0) j = 11
        if (j > 11) j = 0
    }
    const targetCell = gBoard[i][j]

    if (targetCell.type === WALL) return
    // if (i < 0)  i = 10

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((isPassage && ((iAbsDiff === 9 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === 11)))
        || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (targetCell.gameElement === BALL) {
            gCollectedBallsCount++
            gElCollectedBallsCount.innerText = gCollectedBallsCount
            gCurrBallsOnBoard--
            BALL_AUDIO.play()
            if (gCurrBallsOnBoard === 0) {
                gameOver()
            }
        } else if (targetCell.gameElement === GLUE) {
            gGamerGlued = true
            GLUED_AUDIO.play()
            clearTimeout(gGlueTimeOut)
            setTimeout(() => {
                gGamerGlued = false
            }, 3000);

        }

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')





        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // console.log('gGamerPos:', gGamerPos)
        checkBallsAround()
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)


    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    // console.log('render', value);
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}