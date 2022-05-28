$(function(){
    $('.main-slider').slick({
        dots: true,
    });
})

$(function(){
    $('.small-slider').slick({
        dots: true,
    });
});

$('.news-slider').slick({
    slidesToShow: 4,
    centerPadding: "50px",
  });


const faces = document.querySelectorAll("[value='topButton']");
const fl = document.querySelectorAll(".dropbtn");
const panelFl = document.querySelector(".header-logo");
const panelYr = document.querySelector(".yr");
const topButton1 = document.querySelector(".dropdown[id='1']");
const topButton2 = document.querySelector(".dropdown[id='2']");
const yr1 = document.querySelector(".dropbtn[id='yr1']")

faces.forEach(el => {
    el.addEventListener("mouseover", () => {
        fl.forEach(e => {
            e.classList.add("hold_border_radius")
        })
    })
})

faces.forEach(el => {
    el.addEventListener("mouseout", () => {
        fl.forEach(e => {
            e.classList.remove("hold_border_radius")
        })
    })
})

const topButtons = faces.forEach(el => {
    el.querySelector(".dropbtn[value='yr']").addEventListener("click", () => {
        panelFl.style.display = "none"
        panelYr.style.display = "flex"
    })

    el.querySelector(".dropbtn[value='fiz']").addEventListener("click", () => {
        panelFl.style.display = "flex"
        panelYr.style.display = "none"
    })
});







