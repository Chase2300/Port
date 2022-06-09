const startButton = document.querySelector(".statusBar__button button")
const allItems = document.querySelectorAll(".main__item");
const statusText = document.querySelector(".statusBar__height__statusText")

startButton.addEventListener("click", e => {

    let i = 0;
    let delay = 500;

    let intervalId = setInterval(() => {

        allItems[i++].classList.add("animate");

        if (i == allItems.length) {
            clearInterval(intervalId)
        }
    }, delay);
})


allItems.forEach(e => {
    e.ontransitionstart = () => {

        function drawDivWithStartText(e) {
            return `<div>Status start ${e.innerText}</div>`
        }
        function progressStart(e) {
            return `<div>------PROGRESS STARTED------</div>`
        }

        if (e.innerText == "1") {
            const progressStarted = progressStart(e);
            statusText.insertAdjacentHTML("beforeend", progressStarted)
        }

        const messageStart = drawDivWithStartText(e)
        statusText.insertAdjacentHTML("beforeend", messageStart)
    }

    e.ontransitionend = () => {
        function drawDivWithEndText(e) {
            return `<div class="end${e.innerText}">Status end ${e.innerText}</div>`
        }
        function progressEnd(e) {
            return `<div">------PROGRESS ENDED------</div>`
        }

        const messageEnd = drawDivWithEndText(e)
        statusText.insertAdjacentHTML("beforeend", messageEnd)

        if (allItems.length == e.innerText) {
            const progressEnded = progressEnd(e);
            statusText.insertAdjacentHTML("beforeend", progressEnded)
            alert("success")
        }
    }
})