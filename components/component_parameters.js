const ComponentParameters = {
    initialized: false,
    container: undefined,
    url: undefined,
    list: undefined,
    elements: [],
    init: function () {
        this.container = document.getElementById("biovision-component-parameters");
        if (this.container) {
            this.url = this.container.getAttribute("data-url");
            this.list = this.container.querySelector("dl");
            this.list.querySelectorAll("input").forEach(this.apply);
            this.initialized = true;
        }
    },
    /**
     *
     * @param {HTMLElement} element
     * @type {Function}
     */
    apply: function (element) {
        ComponentParameters.elements.push(element);
        element.addEventListener("change", ComponentParameters.change);
    },
    change: function (event) {
        const element = event.target;
        const data = {
            "key": {
                "slug": element.name,
                "value": element.value
            }
        };
        const request = Biovision.jsonAjaxRequest("patch", ComponentParameters.url, function () {
            element.disabled = false;
            element.classList.add("updated");
        }, function () {
            element.disabled = false;
            element.classList.add("failed");
        });

        element.classList.remove("updated", "failed");
        element.disabled = true;
        request.send(JSON.stringify(data));
    },
    add: function (data) {
        const div = document.createElement("div");
        const dt = document.createElement("dt");
        const label = document.createElement("label");
        const elementId = "parameter-" + data["slug"];
        label.setAttribute("for", elementId);
        label.innerHTML = data["slug"];
        dt.append(label);
        const dd = document.createElement("dd");
        const input = document.createElement("input");
        input.setAttribute("id", elementId);
        input.setAttribute("name", data["slug"]);
        input.value = data["value"];
        dd.append(input);
        this.apply(input);
        div.append(dt);
        div.append(dd);
        this.list.append(div);
    }
};

export default ComponentParameters;
