const AdminUserSearch = {
    initialized: false,
    selector: ".js-admin-user-search",
    url: undefined,
    button: undefined,
    input: undefined,
    resultsContainer: undefined,
    callbackName: undefined,
    init: function () {
        const container = document.querySelector(this.selector);
        if (container) {
            const component = this;
            this.url = container.getAttribute("data-url");
            this.button = container.querySelector("button");
            this.input = container.querySelector("input");
            this.resultsContainer = container.querySelector("select");
            this.callbackName = container.getAttribute("data-callback");

            this.input.addEventListener("input", component.changeInput);
            this.button.addEventListener("click", component.clickButton);
            this.resultsContainer.addEventListener("change", component.changeSelect);
            this.initialized = true;
        }
    },
    changeInput: function (event) {
        const input = event.target;
        AdminUserSearch.button.disabled = input.value.length < 1;
    },
    clickButton: function (event) {
        const url = AdminUserSearch.url + "?q=" + encodeURIComponent(AdminUserSearch.input.value);
        Biovision.jsonAjaxRequest("get", url, AdminUserSearch.showResults).send();
    },
    changeSelect: function (event) {
        const select = event.target;
        const option = select.options[select.selectedIndex];
        const id = parseInt(option.value);

        if (id > 0 && AdminUserSearch.callbackName) {
            Biovision.execute(AdminUserSearch.callbackName, window, id);
            option.disabled = true;
        }
    },
    showResults: function () {
        const response = JSON.parse(this.responseText);
        AdminUserSearch.resultsContainer.innerHTML = "";

        const option = document.createElement("option");
        option.innerHTML = response["meta"]["count"];
        option.value = "";
        AdminUserSearch.resultsContainer.append(option);

        if (response.hasOwnProperty("data")) {
            response.data.forEach(function (item) {
                const option = document.createElement("option");
                option.setAttribute("value", item.id);
                option.innerHTML = item["attributes"]["slug"] + " (" + item["meta"]["name"] + ")";

                AdminUserSearch.resultsContainer.append(option);
            });
        }
    }
};

export default AdminUserSearch;
