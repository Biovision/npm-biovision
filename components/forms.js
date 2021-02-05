const Forms = {
    id: "forms",
    /**
     * Show list of errors after form is processed
     *
     * Used in controllers when processing forms with remote: true
     *
     * @param {string} modelName
     * @param {Array<string>} list
     */
    showErrors: function (modelName, list) {
        const form = document.getElementById(`${modelName}-form`);
        if (form) {
            const data = list.map((message) => `<li>${message}</li>`);
            let errors = form.querySelector("ol.errors");

            if (!errors) {
                errors = document.createElement("ol");
                errors.classList.add("errors");
                form.prepend(errors);
            }

            errors.innerHTML = data.join();
            errors.scrollIntoView();
        } else {
            console.warn(`Cannot find form for model ${modelName}`)
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
            const show = (element) => element.classList.remove("hidden");
            const hide = (element) => element.classList.add("hidden");

            form.querySelectorAll(showSelector).forEach(show);
            form.querySelectorAll(hideSelector).forEach(hide);
        } else {
            console.warn(`Cannot find element with id ${formId}`);
        }
    },
    showError: function (formId, message) {
        if (formId.length > 0) {
            const form = document.getElementById(formId);
            if (form) {
                let container = form.querySelector(".message-box.error");
                if (!container) {
                    container = document.createElement("div");
                    container.classList.add("message-box", "error");
                    form.prepend(container);
                }
                container.innerHTML = message;
            } else {
                console.warn(`Cannot find form ${formId}`);
            }
        }
    }
}

export default Forms;
