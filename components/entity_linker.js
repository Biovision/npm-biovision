/**
 * Linking entities with checkboxes
 *
 * @type {Object}
 */
const EntityLinker = {
    id: "entityLinker",
    /**
     * @type {Boolean}
     */
    initialized: false,
    selector: '.entity-links input[type=checkbox]',
    /**
     * List of elements with attached event listener
     *
     * @type {Array<HTMLElement>}
     */
    elements: [],
    /**
     * Initialize component
     */
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     * Apply handler to element
     *
     * @param {HTMLInputElement} element
     */
    apply: function (element) {
        EntityLinker.elements.push(element);
        element.addEventListener('click', EntityLinker.handler);
    },
    /**
     * Event handler for clicking on element
     */
    handler: function () {
        const url = this.getAttribute('data-url');

        if (url && !this.disabled) {
            const method = this.checked ? 'put' : 'delete';
            const box = this;

            this.disabled = true;

            Biovision.newAjaxRequest(method, url, function () {
                box.disabled = false
            }).send();
        }
    }
};

export default EntityLinker;
