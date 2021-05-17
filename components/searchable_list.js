const SearchableList = {
    id: "searchableList",
    selector: ".js-searchable-list",
    inputs: [],
    init: function () {
        document.querySelectorAll(`${this.selector} .search input`).forEach(this.apply);
    },
    apply: function (input) {
        SearchableList.inputs.push(input);
        input.addEventListener("input", SearchableList.handleInput);
    },
    handleInput: function (event) {
        const input = event.target;
        const container = input.closest(SearchableList.selector);
        const resultsContainer = container.querySelector(".results");
        resultsContainer.innerHTML = "";
        if (input.value.length > 0) {
            const url = new URL(container.dataset.url);
            url.searchParams.append("q", input.value);

            fetch(url.href)
                .then(r => r.json())
                .then(r => SearchableList.showResults(resultsContainer, r))
        }
    },
    showResults: function (container, response) {
        if (response.hasOwnProperty("data")) {
            response.data.forEach(function (item) {
                const li = document.createElement("li");
                const button = document.createElement("button");
                button.type = "button";
                button.classList.add("button", "button-secondary");
                button.innerHTML = item.meta.text_for_link;
                button.dataset.id = item.id;
                button.addEventListener("click", SearchableList.handleClick);
                li.append(button);
                container.append(li);
            });
        }
    },
    handleClick: function (event) {
        const button = event.target;
        const container = button.closest(SearchableList.selector);
        const input = container.querySelector(".current input");
        const text = container.querySelector(".current .text");
        text.innerHTML = button.innerHTML;
        input.value = button.dataset.id;
        container.querySelector(".search input").value = "";
        container.querySelector(".results").innerHTML = "";
    }
}

export default SearchableList;
