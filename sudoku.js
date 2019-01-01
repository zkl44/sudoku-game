let Sudoku = (function() {
    let puzzleCellCount = 81;
    let optionalVals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let puzzleVals = [];
    let hasStarted = false;
    let hasSolution = false;
    let hintsOn = false;
    let checkStatusOn = false;
    let totalIncompleteCells = null;
    let cloneCalled = false;
    let sudokuContainerClone;
    let expectedVals = [];
    let numsRemaining = [];
    let blocks = [
        [0, 1, 2, 9, 10, 11, 18, 19, 20],
        [3, 4, 5, 12, 13, 14, 21, 22, 23],
        [6, 7, 8, 15, 16, 17, 24, 25, 26],
        [27, 28, 29, 36, 37, 38, 45, 46, 47],
        [30, 31, 32, 39, 40, 41, 48, 49, 50],
        [33, 34, 35, 42, 43, 44, 51, 52, 53],
        [54, 55, 56, 63, 64, 65, 72, 73, 74],
        [57, 58, 59, 66, 67, 68, 75, 76, 77],
        [60, 61, 62, 69, 70, 71, 78, 79, 80]
    ];
    let cols = [
        [0, 9, 18, 27, 36, 45, 54, 63, 72],
        [1, 10, 19, 28, 37, 46, 55, 64, 73],
        [2, 11, 20, 29, 38, 47, 56, 65, 74],
        [3, 12, 21, 30, 39, 48, 57, 66, 75],
        [4, 13, 22, 31, 40, 49, 58, 67, 76],
        [5, 14, 23, 32, 41, 50, 59, 68, 77],
        [6, 15, 24, 33, 42, 51, 60, 69, 78],
        [7, 16, 25, 34, 43, 52, 61, 70, 79],
        [8, 17, 26, 35, 44, 53, 62, 71, 80]
    ];
    let rows = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        [9, 10, 11, 12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, 31, 32, 33, 34, 35],
        [36, 37, 38, 39, 40, 41, 42, 43, 44],
        [45, 46, 47, 48, 49, 50, 51, 52, 53],
        [54, 55, 56, 57, 58, 59, 60, 61, 62],
        [63, 64, 65, 66, 67, 68, 69, 70, 71],
        [72, 73, 74, 75, 76, 77, 78, 79, 80]
    ];
    // Public DOM Elements
    let levelBtn = document.getElementsByClassName("levelBtn");
    let hintsBtn = document.getElementById("hintsBtn");
    let statusBtn = document.getElementById("statusBtn");
    let helpBtn = document.getElementById("helpBtn");
    let solveBtn = document.getElementById("solveBtn");
    let addValueButton = document.getElementsByClassName("btn-addValue");
    let messageSuccess = document.querySelector(".message--success");
    let messageUnsolvable = document.querySelector(".message--unsolvable");
    let messageErrors = document.querySelector(".message--errors");

    let addEventListeners = function() {
        let dataCell = document.getElementsByClassName("dataCell");
        document.addEventListener("click", event => {
            if (!event.target.classList.contains("dataCell") || event.target.classList.contains("dataCell--startClue")) {
                getValue();
            }
        });
        Array.from(dataCell).forEach(element => {
            if (!element.classList.contains("dataCell--startClue")) {
                element.addEventListener("click", getValue);
                element.addEventListener("keypress", event => {
                    if (event.key == "Enter") {
                        element.click();
                    } else {
                        switch (event.key) {
                            case "1":
                            case "2":
                            case "3":
                            case "4":
                            case "5":
                            case "6":
                            case "7":
                            case "8":
                            case "9":
                                let val = event.key;
                                setValue(val);
                            case "0":
                                setValue("clear");
                        }
                    }
                });
            }
        });
    };

    let playSudoku = function(gameOption) {
        let dataCell = document.getElementsByClassName("dataCell");
        switch (gameOption) {
            case "easy":
            case "medium":
                let numberOfLevels = puzzles[gameOption].length;
                let randomNum = Math.floor(Math.random() * numberOfLevels);
                let puzzle = puzzles[gameOption][randomNum];
                // add values from puzzle array to cells
                for (let x = 0; x < dataCell.length; x++) {
                    puzzle[x] != 0 ? (dataCell[x].innerHTML = puzzle[x]) : (dataCell[x].innerHTML = "");
                }
                break;
            case "custom":
                checkDomValues();
                break;
        }
        for (let i = 0; i < levelBtn.length; i++) {
            levelBtn[i].setAttribute("disabled", "disabled");
            levelBtn[i].classList.contains(gameOption) ? levelBtn[i].classList.add("btn--active") : null;
        }
        checkDomValues();
        clone();
    };

    let checkDomValues = function() {
        let dataCell = document.getElementsByClassName("dataCell");
        resetNumsRemaining();
        for (let i = 0; i < puzzleCellCount; i++) {
            let currentCell = dataCell[i];
            let cellVal = currentCell.innerHTML;
            let expectedVal = null;
            let cellBlock = currentCell.getAttribute("data-block");
            let cellCol = currentCell.getAttribute("data-col");
            let cellRow = currentCell.getAttribute("data-row");
            let cellComplete = false;
            let editable = true; // not doing anthing with this yet
            let possibleVals = null;
            if (cellVal == "" || cellVal.length > 1) {
                currentCell.classList.add("incomplete");
                totalIncompleteCells = totalIncompleteCells + 1;
            } else {
                cellComplete = true;
                editable = false;
                currentCell.classList.add("complete");
                currentCell.classList.add("dataCell--startClue");
            }
            if (cloneCalled) {
                expectedVal = expectedVals[i];
            }
            if (!cellComplete) {
                possibleVals = [numsRemaining[0][cellBlock - 1], numsRemaining[1][cellCol - 1], numsRemaining[2][cellRow - 1]];
            }
            // creating a new object for each of the 81 cells/props
            let CellObject = {
                cellIndex: i,
                cellVal: cellVal,
                expectedVal: expectedVal,
                cellBlock: cellBlock,
                cellCol: cellCol,
                cellRow: cellRow,
                cellComplete: cellComplete,
                possibleVals: possibleVals,
                editable: editable
            };
            currentCell.setAttribute("data-index", i);
            puzzleVals.push(CellObject);
            hintsBtn.removeAttribute("disabled");
            statusBtn.removeAttribute("disabled");
            solveBtn.removeAttribute("disabled");
            hasStarted = true;
        }
    };

    let clone = function() {
        let sudokuContainer = document.querySelector(".sudokuContainer");
        let dataCell = document.getElementsByClassName("dataCell");
        sudokuContainerClone = sudokuContainer.cloneNode(true);
        solvePuzzle();
        cloneCalled = true;
        for (let z = 0; z < dataCell.length; z++) {
            expectedVals.push(dataCell[z].innerHTML);
        }
        let parentDiv = sudokuContainer.parentNode;
        parentDiv.replaceChild(sudokuContainerClone, sudokuContainer);
        hintsOn = false;
        addEventListeners();
        puzzleVals = [];
        checkDomValues();
    };

    let resetNumsRemaining = function() {
        numsRemaining = [
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9]
            ],
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9]
            ],
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9]
            ]
        ];
    };

    let getValue = function() {
        let sudokuContainer = document.querySelector(".sudokuContainer");
        let addValueButtonsActive = false;
        let currentEl = event.target;
        if (currentEl.classList.contains("dataCell")) {
            let activeCellBlock = currentEl.getAttribute("data-block");
            let activeCellCol = currentEl.getAttribute("data-col");
            let activeCellRow = currentEl.getAttribute("data-row");
            if (!currentEl.classList.contains("dataCell--active")) {
                document.querySelector(".dataCell--active") !== null
                    ? document.querySelector(".dataCell--active").classList.remove("dataCell--active")
                    : null;
                currentEl.classList.add("dataCell--active");
                sudokuContainer.setAttribute("active-block", activeCellBlock);
                sudokuContainer.setAttribute("active-col", activeCellCol);
                sudokuContainer.setAttribute("active-row", activeCellRow);
                addValueButtonsActive = true;
            } else {
                currentEl.classList.remove("dataCell--active");
                sudokuContainer.removeAttribute("active-block");
                sudokuContainer.removeAttribute("active-col");
                sudokuContainer.removeAttribute("active-row");
            }
        } else {
            if (document.querySelector(".dataCell--active")) {
                document.querySelector(".dataCell--active").classList.remove("dataCell--active");
                sudokuContainer.removeAttribute("active-block");
                sudokuContainer.removeAttribute("active-col");
                sudokuContainer.removeAttribute("active-row");
            }
        }
        for (let i = 0; i < addValueButton.length; i++) {
            addValueButtonsActive ? addValueButton[i].removeAttribute("disabled") : addValueButton[i].setAttribute("disabled", "disabled");
        }
    };

    let setValue = function(val) {
        let sudokuContainer = document.querySelector(".sudokuContainer");
        let activeCell = document.querySelector(".dataCell--active");
        let blankSpace = false;
        if (val == "clear") {
            blankSpace = true;
            val = "";
        }
        if (activeCell) {
            activeCell.innerHTML = val;
            activeCell.classList.remove("dataCell--active");
            if (hasStarted) {
                let activeCellIndex = activeCell.getAttribute("data-index");
                val != puzzleVals[activeCellIndex].expectedVal ? disableHints() : null;
                if (!blankSpace) {
                    activeCell.classList.remove("incomplete");
                    activeCell.classList.add("complete");
                    puzzleVals[activeCellIndex].cellComplete = true;
                } else {
                    activeCell.classList.remove("complete");
                    activeCell.classList.add("incomplete");
                    puzzleVals[activeCellIndex].cellComplete = false;
                }
                puzzleVals[activeCellIndex].cellVal = val;
                update();
            } else {
                levelBtn[0].setAttribute("disabled", "disabled");
                levelBtn[1].setAttribute("disabled", "disabled");
                levelBtn[2].removeAttribute("disabled"); //custom play chosen
            }
            //disabling all add buttons after a selection
            for (let i = 0; i < addValueButton.length; i++) {
                addValueButton[i].setAttribute("disabled", "disabled");
            }
            //add remove active state on click, doubleclick
            if (activeCell.classList.contains("incomplete") && blankSpace != true) {
                activeCell.classList.remove("incomplete");
            }
            sudokuContainer.removeAttribute("active-block");
            sudokuContainer.removeAttribute("active-col");
            sudokuContainer.removeAttribute("active-row");
        }
        checkStatusOn ? checkStatus(null) : null;
    };

    let getRemainingValues = function() {
        let checkListArr = [blocks, cols, rows];
        for (let i = 0; i < checkListArr.length; i++) {
            checkListArr[i].forEach(blockColRow => {
                let cellIndex = checkListArr[i].indexOf(blockColRow);
                for (let x = 0; x < blockColRow.length; x++) {
                    let indexPointer = puzzleVals[checkListArr[i][cellIndex][x]];
                    let pointedPuzzleVal = indexPointer.cellVal * 1;
                    let currentArray = numsRemaining[i][cellIndex];
                    let usedVal = currentArray.indexOf(pointedPuzzleVal);
                    usedVal > -1 ? currentArray.splice(usedVal, 1) : null;
                }
            });
        }
    };

    let updatePossibleVals = function() {
        puzzleVals.forEach(cellObj => {
            if (!cellObj.cellComplete) {
                let remainingNumCounts = {};
                // matches needed in block,col and row
                const matchRequirement = 3;
                cellObj.possibleVals.forEach(remainingArray => {
                    let cellBlock = document.getElementsByClassName("dataCell");
                    let currentCell = cellBlock[cellObj.cellIndex];
                    // reset inner html before adding dups
                    currentCell.innerHTML = "";
                    remainingArray.forEach(remainingVal => {
                        remainingNumCounts[remainingVal] = (remainingNumCounts[remainingVal] || 0) + 1;
                    });
                    for (let i = 0; i <= optionalVals.length; i++) {
                        remainingNumCounts[i] === matchRequirement ? (currentCell.innerHTML += " " + i) : null;
                    }
                });
            }
        });
    };

    let = showHelp = function() {
        let infoMessage = document.querySelector(".message--info");
        infoMessage.classList.remove("hidden");
    };

    let getHints = function() {
        let sudokuContainer = document.querySelector(".sudokuContainer");
        if (hintsOn) {
            hintsOn = false;
            sudokuContainer.classList.remove("hints--on");
            sudokuContainer.classList.add("hints--off");
            hintsBtn.classList.remove("btn--active");
        } else {
            hintsOn = true;
            sudokuContainer.classList.remove("hints--off");
            sudokuContainer.classList.add("hints--on");
            hintsBtn.classList.add("btn--active");
        }
        update();
    };

    let disableHints = function() {
        let sudokuContainer = document.querySelector(".sudokuContainer");
        hintsBtn.setAttribute("disabled", "disabled");
        sudokuContainer.classList.remove("hints--on");
        sudokuContainer.classList.add("hints--off");
        hintsBtn.classList.remove("btn--active");
    };

    let checkStatus = function(e) {
        if (e == "e") {
            checkStatusOn ? (checkStatusOn = false) : (checkStatusOn = true);
            checkStatusOn ? statusBtn.classList.add("btn--active") : statusBtn.classList.remove("btn--active");
        }
        let dataCell = document.getElementsByClassName("dataCell");
        //check if expected val differs from cellVal
        puzzleVals.forEach(cellObj => {
            if (cellObj.cellComplete && checkStatusOn) {
                if (cellObj.cellVal != cellObj.expectedVal) {
                    dataCell[cellObj.cellIndex].classList.add("dataCell--incorrect");
                } else {
                    dataCell[cellObj.cellIndex].classList.remove("dataCell--incorrect");
                }
            } else {
                dataCell[cellObj.cellIndex].classList.remove("dataCell--incorrect");
            }
        });
    };

    let update = function() {
        getRemainingValues();
        updatePossibleVals();
    };

    let closeMessage = function() {
        let messageContainer = document.getElementsByClassName("message-container");
        for (let i = 0; i < messageContainer.length; i++) {
            messageContainer[i].classList.add("hidden");
        }
    };

    let solvePuzzle = function() {
        let dataCell = document.getElementsByClassName("dataCell");
        getValue();

        if (!hasSolution) {
            let loopCount = 0;
            let unsolvableLoopCount = 81;
            hintsBtn.setAttribute("disabled", "disabled");
            solveBtn.setAttribute("disabled", "disabled");
            while (document.querySelector(".incomplete") && loopCount != unsolvableLoopCount) {
                loopCount = loopCount + 1;
                update();
                let checkList = [blocks, cols, rows];
                checkList.forEach(checkListItem => {
                    //loop over all blocks,cols and rows to check for singled out vals
                    checkListItem.forEach(block => {
                        let cellBlock = document.getElementsByClassName("dataCell");
                        let cellsIncomplete = 0;
                        let remainingNumCounts = {};
                        // if only one match is found then this is the only value for that cell
                        const singledOutNumMatch = 1;
                        block.forEach(blockIndex => {
                            let currentBlock = cellBlock[blockIndex];
                            if (currentBlock.classList.contains("incomplete")) {
                                cellsIncomplete = cellsIncomplete + 1;
                                let currentBlockVals = currentBlock.innerHTML;
                                let splitVals = currentBlockVals.split(" ");
                                splitVals.forEach(remainingVal => {
                                    remainingNumCounts[remainingVal] = (remainingNumCounts[remainingVal] || 0) + 1;
                                    remainingNumCounts["v-" + remainingVal] += blockIndex + "";
                                });
                            } else {
                                cellsIncomplete = cellsIncomplete + 0;
                            }
                        });
                        if (cellsIncomplete > 0) {
                            //check the counter for singles out vals with count of 1
                            for (let i = 0; i <= optionalVals.length; i++) {
                                if (remainingNumCounts[i] === singledOutNumMatch) {
                                    block.forEach(blockIndex => {
                                        let currentBlock = cellBlock[blockIndex];
                                        if (currentBlock.innerHTML.indexOf(i) !== -1) {
                                            currentBlock.innerHTML = i;
                                            currentBlock.classList.add("dataCell--active");
                                            totalIncompleteCells = totalIncompleteCells - 1;
                                            setValue(i);
                                        }
                                    });
                                }
                            }
                        }
                    });
                });
            }
            totalIncompleteCells == 0 ? (hasSolution = true) : messageUnsolvable.classList.remove("hidden");
        } else {
            //add the expected vals in
            checkStatusOn = true;
            statusBtn.classList.add("btn--active");
            checkStatus(null);
            if (!document.querySelector(".dataCell--incorrect")) {
                puzzleVals.forEach(cellObj => {
                    if (!cellObj.cellComplete) {
                        dataCell[cellObj.cellIndex].innerHTML = cellObj.expectedVal;
                        dataCell[cellObj.cellIndex].classList.remove("incomplete");
                        dataCell[cellObj.cellIndex].classList.add("complete");
                        cellObj.cellVal = cellObj.expectedVal;
                        cellObj.cellComplete = true;
                    }
                });
                messageSuccess.classList.remove("hidden");
            } else {
                messageErrors.classList.remove("hidden");
            }
        }
    };
    return {
        addEventListeners: addEventListeners,
        playSudoku: playSudoku,
        setValue: setValue,
        getHints: getHints,
        showHelp: showHelp,
        checkStatus: checkStatus,
        closeMessage: closeMessage,
        solvePuzzle: solvePuzzle
    };
})();
Sudoku.addEventListeners();
