const Forms = {
    /**
     * Показать список ошибок после обработки формы
     *
     * Используется в контроллерах при отправке форм через remote: true
     *
     * @param {string} modelName название модели
     * @param {Array<string>} list список ошибок
     */
    showErrors: function (modelName, list) {
        const form = document.getElementById(modelName + "-form");
        if (form) {
            let errors = form.querySelector("ol.errors");
            let data = "";

            if (!errors) {
                errors = document.createElement("ol");
                errors.classList.add("errors");
            }

            list.forEach(function (message) {
                data += "<li>" + message + "</li>";
            });

            errors.innerHTML = data;

            form.prepend(errors);

            errors.scrollIntoView();
        }
    },
    /**
     * Hide and show elements in form with given id
     *
     * Toggles class "hidden" for elements with selectors
     * hideSelector and showSelector for form children
     *
     * @param {String} formId
     * @param {String} hideSelector elements to hide
     * @param {String} showSelector elements to show
     */
    switchElements: function (formId, hideSelector, showSelector) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll(showSelector).forEach(function (element) {
                element.classList.remove("hidden");
            });
            form.querySelectorAll(hideSelector).forEach(function (element) {
                element.classList.add("hidden");
            });
        } else {
            console.log("Cannot find element with id " + formId)
        }
    },
    showError: function (formId, message) {
        if (formId.length > 0) {
            const form = document.getElementById(formId);
            if (form) {
                let container = form.querySelector(".message-box.error");
                if (!container) {
                    container = document.createElement("div");
                    container.classList.add("message-box");
                    container.classList.add("error");
                    form.prepend(container);
                }
                container.innerHTML = message;
            } else {
                console.log("Cannot find form " + formId);
            }
        }
    }
}

export default Forms;
