const modals = () => {
    function bindModal(triggerSelector, modalSelector, closeSelector) {
        const trigger = document.querySelectorAll(triggerSelector),
        modal = document.querySelector(modalSelector),
        close = document.querySelector(closeSelector),
        scroll = calcScroll();

        trigger.forEach(item =>{
            item.addEventListener("click", (e) => {
                if (e.target) {
                    e.preventDefault();
                    console.log(e.target.classList.value)
                }
    
                modal.style.display = "block";
                document.body.style.overflow = "hidden";
                document.body.style.marginRight = `${scroll}px`;
            });
        })

        close.addEventListener("click", () =>{
            modal.style.display = "none";
            document.body.style.overflow = "";
            document.body.style.marginRight = `0px`;
        });

        modal.addEventListener("click", (e) =>{
            if (e.target === modal){
                modal.style.display = "none";
                document.body.style.overflow = "";
                document.body.style.marginRight = `0px`;
            }
        })
    }

    function showModalByTime(selector, time){
        setTimeout(function(){
            document.querySelector(selector).style.display = "block";
            document.body.style.overflow = "hidden";
        }, time)
    }

    function calcScroll(){
        let div = document.createElement("div");

        div.style.width = "50px";
        div.style.height = "50px";
        div.style.overflowY = "scroll";
        div.style.visibility = "hidden";

        document.body.appendChild(div);

        let scrollWidth = div.offsetWidth - div.clientWidth;
        div.remove();

        return scrollWidth;
    }

    bindModal(".order-button", ".popup", ".popup_close");
    bindModal(".question", ".popup-question", ".popup-question .popup_close");
    showModalByTime(".popup", 60000);
}

export default modals;