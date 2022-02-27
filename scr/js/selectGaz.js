const selectGaz = () => {
    function select() {
        const divSelect = document.querySelector(".select_gaz__buttons")
        const allButtons = divSelect.querySelectorAll("BUTTON");


        allButtons.forEach(el => {
            el.addEventListener("click", (e) => {
                for (let i = 0; i <= allButtons.length - 1; i++) {
                    allButtons[i].classList.value = "unselect";
                }
                if (e.target.tagName === "BUTTON") {
                    e.target.classList.remove("unselect");
                    e.target.classList.add("select");
                    changeImg()
                }
                if (e.target.parentNode.tagName === "BUTTON") {
                    e.target.parentNode.classList.remove("unselect");
                    e.target.parentNode.classList.add("select");
                    changeImg()
                }

            })
        });

        function changeImg() {
            let buttonSelected = document.querySelector(".select")
            let buttonImg = document.querySelector(".select_gaz__order img")

            switch (buttonSelected.value) {
                case "2000":
                    buttonImg.setAttribute("src", "./img/main_img/select_gaz/01_1.png")
                    break;
                case "6000":
                    buttonImg.setAttribute("src", "./img/main_img/select_gaz/02_2.png")
                    break;
                case "10000":
                    buttonImg.setAttribute("src", "./img/main_img/select_gaz/03_3.png")
                    break;
                case "40000":
                    buttonImg.setAttribute("src", "./img/main_img/select_gaz/04_4.png")
                    break;
            }

        }
    }
    select()

}

export default selectGaz;