const ImageRemover = {
    id: "imageRemover",
    initialized: false,
    selector: ".js-image-remover",
    buttons: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (button) {
        ImageRemover.buttons.push(button);
        button.addEventListener("click", ImageRemover.handler);
    },
    handler: function (event) {
        const button = event.target;
        const container = document.getElementById(button.getAttribute("data-container"));

        if (container && confirm(button.getAttribute("data-text"))) {
            const image = container.querySelector("img");
            const url = button.getAttribute("data-url");
            const request = Biovision.jsonAjaxRequest("delete", url, function () {
                const response = JSON.parse(this.responseText);
                if (response.hasOwnProperty("meta")) {
                    const meta = response.meta;
                    if (meta.hasOwnProperty("result") && meta.result) {
                        image.src = button.getAttribute("data-blank-url");
                        button.remove();

                        const link = image.closest("a");
                        if (link) {
                            link.href = "#";
                        }
                    }
                }
            });

            button.disabled = true;
            request.send();
        }
    }
};

export default ImageRemover;
