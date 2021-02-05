/**
 * Hide popups when clicking outside
 *
 * @type {Object}
 */
const HidingPopups = {
    id: "hidingPopups",
    /**
     * @type {Boolean}
     */
    initialized: false,
    /**
     * @type {String}
     */
    selector: '.hiding-popup-container .popup-control',
    /**
     * List of control checkboxes
     *
     * @type {Array<HTMLInputElement>}
     */
    elements: [],
    /**
     * Initialize component
     */
    init: function () {
        const component = this;
        this.elements = [];
        document.querySelectorAll(this.selector).forEach(component.addElement);
        document.addEventListener('click', component.handler);

        this.initialized = true;
    },
    /**
     * Add container to list
     *
     * @param {HTMLInputElement} element
     */
    addElement: function (element) {
        HidingPopups.elements.push(element);
    },
    /**
     * Handle click
     *
     * @param {Event} event
     * @type {Function}
     */
    handler: function (event) {
        const selector = '.hiding-popup-container *';
        const target = event.target;

        if (target.matches(selector)) {
            const container = target.closest('.hiding-popup-container');
            const checkbox = container.querySelector(HidingPopups.selector);
            HidingPopups.elements.forEach(function (element) {
                if (element !== checkbox) {
                    element.checked = false;
                }
            });
        } else {
            HidingPopups.elements.forEach(function (checkbox) {
                checkbox.checked = false;
            });
        }
    }
};

export default HidingPopups;
