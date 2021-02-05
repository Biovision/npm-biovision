/**
 * Instantly check form validity
 *
 * @type {Object}
 */
const InstantCheck = {
    id: "instantCheck",
    initialized: false,
    selector: 'form[data-check-url]',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     *
     * @param {HTMLFormElement} form
     */
    apply: function (form) {
        const component = InstantCheck;

        form.querySelectorAll('[data-check]').forEach(function (element) {
            component.elements.push(element);
            element.addEventListener('blur', component.handler);
        });
    },
    handler: function () {
        const element = this;
        const form = element.closest('form');
        const url = form.getAttribute('data-check-url');

        const request = Biovision.newAjaxRequest('POST', url, function () {
            if (this.responseText) {
                const response = JSON.parse(this.responseText);
                console.log(response);

                if (response.hasOwnProperty('meta')) {
                    if (response.meta.valid) {
                        form.querySelectorAll('[data-field]').forEach(function (field) {
                            field.innerHTML = '';
                        });
                    } else {
                        const key = element.getAttribute('data-check');
                        const container = form.querySelector('[data-field="' + key + '"]');

                        if (container) {
                            const errors = response.meta['errors'];

                            if (errors.hasOwnProperty(key)) {
                                container.innerHTML = errors[key].join('; ');
                                container.classList.remove('hidden');
                            } else {
                                container.innerHTML = '';
                            }
                        }
                    }
                }
            }
        });

        const data = new FormData();
        Array.from((new FormData(form)).entries()).forEach(function (entry) {
            const value = entry[1];

            if (value instanceof window.File && value.name === '' && value.size === 0) {
                data.append(entry[0], new window.Blob([]), '');
            } else {
                if (entry[0] !== '_method') {
                    data.append(entry[0], value);
                }
            }
        });

        request.send(data);
    }
}

export default InstantCheck;
