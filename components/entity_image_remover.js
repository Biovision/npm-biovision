const EntityImageRemover = {
    id: "entityImageRemover",
    initialized: false,
    selector: '.remove-image-button',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        EntityImageRemover.elements.push(element);
        element.addEventListener('click', EntityImageRemover.handler);
    },
    handler: function () {
        const button = this;
        if (!button.disabled) {
            const message = button.getAttribute('data-text');
            if (confirm(message)) {
                const url = button.getAttribute('data-url');
                const request = Biovision.newAjaxRequest('delete', url, function () {
                    if (this.responseText) {
                        const response = JSON.parse(this.responseText);
                        const term = document.getElementById('entity-image');

                        console.log(response);

                        if (term) {
                            term.remove();
                        }
                        button.parentNode.parentNode.remove();
                    }
                });

                button.disabled = true;

                request.send();
            }
        }
    }
};

export default EntityImageRemover;
