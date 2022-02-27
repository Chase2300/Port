import modals from "./modals";
import selectGaz from "./selectGaz";
import forms from "./forms";

window.addEventListener("DOMContentLoaded", () => {
    modals();
    selectGaz();
    forms();

    $(document).ready(function () {
        $(".slider").slick({
            dots: true,
            adaptiveHeight: true,
            speed: 900,
            autoplay: false,
            autoplaySpeed: 10000,
        })
    })

});



