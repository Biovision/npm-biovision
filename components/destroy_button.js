// Кнопка удаления элемента через AJAX
const DestroyButton = {
    initialized: false,
    selector: 'div[data-destroy-url] button.destroy',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        DestroyButton.elements.push(element);
        element.addEventListener('click', DestroyButton.handler);
    },
    handler: function () {
        const container = this.closest('div[data-destroy-url]');
        const url = container.getAttribute('data-destroy-url');
        const request = Biovision.newAjaxRequest('DELETE', url, function () {
            container.remove();
        });

        this.setAttribute('disabled', 'true');
        request.send();
    }
};

export default DestroyButton;
