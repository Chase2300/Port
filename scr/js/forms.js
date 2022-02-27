const forms = () => {
    const form = document.querySelectorAll("form"),
        inputs = document.querySelectorAll("input"),
        nameInputs = document.querySelectorAll("input[name='name']"),
        phoneInputs = document.querySelectorAll("input[name='phone']");

    nameInputs.forEach(item => {
        item.addEventListener("input", () => {
            item.value = item.value.replace(/\d/, "");
        })
    });

    phoneInputs.forEach(item => {
        item.addEventListener("input", () => {
            item.value = item.value.replace(/\D/, "");
        })
    })


    const message = {
        loading: "Загрузка...",
        success: "Спасибо! Скоро мы с вами свяжемся",
        fail: "Что-то пошло не так..."
    };

    const postData = async (url, data) => {
        document.querySelector(".color-msg").textContent = message.loading;
        let res = await fetch(url, {
            method: "POST",
            body: data
        });

        return await res.text();
    }

    const clearInputs = () => {
        inputs.forEach(item => {
            item.value = "";
        })
    }

    form.forEach(item => {
        item.addEventListener("submit", (e) => {
            e.preventDefault();

            let p_form_remove = document.querySelectorAll(".form_notice")

            let statusMessage = document.createElement("div");
            statusMessage.classList.add("color-msg");
            p_form_remove.forEach(item => {
                item.style.display = "none";
            })
            item.appendChild(statusMessage);

            const formData = new FormData(item);

            postData("./server.php", formData)
                .then(res => {
                    console.log(res);
                    statusMessage.textContent = message.success;
                })
                .catch(() => {
                    statusMessage.textContent = message.fail;
                })
                .finally(() => {
                    clearInputs();
                    setTimeout(() => {
                        statusMessage.remove();
                        p_form_remove.forEach(item => {
                            item.style.display = "block";
                        })
                    }, 10000);
                })
        })
    })
};

export default forms;