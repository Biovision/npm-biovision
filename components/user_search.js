// Поиск пользователя в админке
const UserSearch = {
    initialized: false,
    selector: '.user-search button',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        UserSearch.elements.push(element);
        element.addEventListener('click', UserSearch.handler);
    },
    handler: function () {
        const container = this.closest('.user-search');
        const input = container.querySelector('input[type=search]');
        const url = container.getAttribute('data-url') + '?q=' + encodeURIComponent(input.value);

        const request = Biovision.newAjaxRequest('GET', url, function () {
            const response = JSON.parse(this.responseText);
            const results = container.querySelector('.results');

            if (response.hasOwnProperty('meta')) {
                results.innerHTML = response['meta']['html'];

                results.querySelectorAll('li').forEach(function (li) {
                    li.addEventListener('click', function (event) {
                        const element = event.target;
                        const target = document.getElementById(container.getAttribute('data-target'));

                        target.value = element.getAttribute('data-id');
                    });
                });
            }
        });

        request.send();
    }
};

export default UserSearch;
