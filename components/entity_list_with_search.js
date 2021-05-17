const EntityListWithSearch = {
    id: "entityListWithSearch",
    selector: ".js-entity-list-with-search",
    inputs: [],
    init: function () {
        document.querySelectorAll(`${this.selector} .search input`).forEach(this.apply);
    },
    apply: function (input) {
        EntityListWithSearch.inputs.push(input);
        input.addEventListener("input", EntityListWithSearch.handleChange);
    },
    handleChange: function (event) {
        const input = event.target;
        if (input.value.length > 0) {
            const container = input.closest(EntityListWithSearch.selector);
            const url = new URL(input.dataset.url);
            let pattern;
            if (container.hasAttribute("data-prefix")) {
                pattern = container.dataset.prefix + "__id__";
            } else {
                pattern = container.dataset.pattern;
            }

            url.searchParams.append("q", input.value);

            const results = container.querySelector(".results");

            fetch(url.href)
                .then(r => r.json())
                .then(data => EntityListWithSearch.processResponse(data, results, pattern));
        }
    },
    processResponse: function (response, container, pattern) {
        if (response.hasOwnProperty("data")) {
            container.innerHTML = "";
            response.data.forEach(function (item) {
                const li = document.createElement("li");
                const button = document.createElement("button");
                const url = String(pattern.replace(/__id__/, String(item.id)))
                button.type = "button";
                button.classList.add("button", "button-secondary");
                button.innerHTML = item.meta.text_for_link;
                button.dataset.url = url;
                button.dataset.id = String(item.id);
                button.addEventListener("click", EntityListWithSearch.selectEntity);
                li.append(button);
                container.append(li);
            });
        }
    },
    selectEntity: function (event) {
        const button = event.target;
        const mainContainer = button.closest(EntityListWithSearch.selector);
        const listContainer = mainContainer.querySelector(".list");
        const request = Biovision.jsonAjaxRequest("put", button.dataset.url, function () {
            let list = listContainer.querySelector(".list-of-entities");
            if (!list) {
                list = document.createElement("ul");
                list.classList.add("list-of-entities");
                listContainer.innerHTML = "";
                listContainer.append(list);
            }
            const li = document.createElement("li");
            li.dataset.id = button.dataset.id;
            const dataDiv = document.createElement("div");
            dataDiv.classList.add("data");
            const div = document.createElement("div");
            div.innerHTML = button.innerHTML;
            dataDiv.append(div);
            li.append(dataDiv);
            list.append(li);
            button.parentNode.remove();
        });
        button.disabled = true;
        request.send();
    }
}

export default EntityListWithSearch;
