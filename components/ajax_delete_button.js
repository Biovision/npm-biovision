const AjaxDeleteButton = {
    id: "ajaxDeleteButton",
    initialized: false,
    selector: 'button.destroy[data-url]',
    elements: [],
    messages: {
        "ru": "Вы уверены?",
        "en": "Are you sure?"
    },
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        AjaxDeleteButton.elements.push(element);
        element.addEventListener('click', AjaxDeleteButton.handler);
    },
    handler: function (event) {
        const messages = AjaxDeleteButton.messages;
        const element = event.target;
        const message = messages.hasOwnProperty(Biovision.locale) ? messages[Biovision.locale] : 'Are you sure?';

        element.disabled = true;

        if (confirm(message)) {
            const url = element.getAttribute('data-url');
            const request = Biovision.newAjaxRequest('delete', url, function () {
                element.closest('li[data-id]').remove();
            });
            request.send();
        }

        element.disabled = false;
    }
};

export default AjaxDeleteButton;
