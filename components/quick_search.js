const QuickSearch = {
    id: "quickSearch",
    selector: ".js-quick-search",
    inputs: [],
    init: function () {
        document.querySelectorAll(`${this.selector} .search input`).forEach(this.apply);
    },
    apply: function (input) {
        QuickSearch.inputs.push(input);
        input.addEventListener("input", QuickSearch.handleInput);
    },
    handleInput: function (event) {
        const input = event.target;
        const container = input.closest(QuickSearch.selector);
        const results = container.querySelector(".results");
        results.innerHTML = "";
        if (input.value.length > 0) {
            const url = new URL(container.dataset.url);
            url.searchParams.append("q", input.value);
            fetch(url.href)
                .then(r => r.json())
                .then(r => QuickSearch.showResults(results, r));
        }
    },
    showResults: function (container, response) {
        container.innerHTML = "";
        if (response.hasOwnProperty("data")) {
            response.data.forEach(function (item) {
                const li = document.createElement("li");
                li.innerHTML = item.meta.html;
                container.append(li);
            });
        }
    }
}

export default QuickSearch;
