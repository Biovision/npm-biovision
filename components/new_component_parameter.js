const NewComponentParameter = {
    id: "newComponentParameter",
    initialized: false,
    container: undefined,
    url: undefined,
    button: undefined,
    init: function () {
        this.container = document.getElementById("biovision-component-new-parameter");
        if (this.container) {
            const component = this;
            this.url = this.container.getAttribute("data-url");
            this.button = this.container.querySelector("button");
            this.button.addEventListener("click", component.click);
            this.initialized = true;
        }
    },
    click: function () {
        const component = NewComponentParameter;
        const data = {"key": {}};
        let dataPresent = true;
        component.container.querySelectorAll("input").forEach(function (input) {
            dataPresent &= input.value.length > 0;
            data.key[input.name] = input.value;
        });

        if (dataPresent) {
            const request = Biovision.jsonAjaxRequest("patch", component.url, function () {
                component.container.querySelectorAll("input").forEach(function (input) {
                    input.value = '';
                });
                Biovision.components.componentParameters.add(data["key"]);
                component.button.disabled = false;
            }, function () {
                component.button.disabled = false;
            });

            component.button.disabled = true;
            request.send(JSON.stringify(data));
        }
    }
};

export default NewComponentParameter;
