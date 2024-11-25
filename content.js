// Constants
const tableSelector = "#scorecard"
const messageSelector = "#messageBox"
const totalSelector = "#total-score"

/**
 * Update the players' scorecards
 */
function getScorecards(table) {
    const tableRows = table.querySelectorAll('tr')
    let scorecards = { "Player 1": [], "Player 2": [] }

    tableRows.forEach((tableRow, _) => {
        const cells = tableRow.querySelectorAll('th, td')
        if (cells.length >= 3) {
            scorecards["Player 1"].push(tableRow.cells[1].textContent.trim())
            scorecards["Player 2"].push(tableRow.cells[2].textContent.trim())
        }
    })

    console.log("Got scorecards ", scorecards)
    return scorecards
}

/**
 * Send a request to the AI server to evaulate the game position.
 */
function requestEvaluation(scorecards) {
    fetch('http://localhost:2763', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scorecards)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Data from server:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


/**
 * A callback that triggers an evaluation.
 */
function evaluationCallback(mutationsList) {
    for (const mutation of mutationsList) {
        let messageNode = document.querySelector(messageSelector)
        const paragraphs = messageNode.querySelectorAll('p')
        paragraphs.forEach(pElement => {
            if (pElement.textContent == "") {
                let tableNode = document.querySelector(tableSelector)
                scorecards = getScorecards(tableNode)
                requestEvaluation(scorecards)
            }
        })
    }
}

/**
 * Attach to all elements from some selector, triggering some callback.
 */
function observeTarget(selector, callback) {
    let targetNode = document.querySelector(selector)

    if (targetNode) {
        console.log("Target element found:", targetNode)

        const observer = new MutationObserver(callback)

        const config = {
            attributes: true,
            childList: true,
            subtree: true
        }

        observer.observe(targetNode, config)
        console.log("Started observing:", selector)
    } else {
        console.warn("Target element not found. Watching for DOM changes...")
        waitForTarget(selector)
    }
}

observeTarget(messageSelector, evaluationCallback)