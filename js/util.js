'use strict'

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max, isInclusive = false) {
    const inclusive = isInclusive ? 1 : 0
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + inclusive) + min)
}


function drawNum(nums) {
    var randIdx = getRandomInt(0, nums.length)
    return nums.splice(randIdx, 1)[0]
}