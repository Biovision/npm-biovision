const AutoExpand = {
    id: "autoExpand",
    initialized: false,
    selector: 'textarea.auto-expand',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     *
     * @param {HTMLTextAreaElement} element
     */
    apply: function (element) {
        AutoExpand.elements.push(element);

        element.addEventListener('focus', AutoExpand.handler);
        element.addEventListener('input', AutoExpand.handler);
    },
    handler: function () {
        if (!this.hasOwnProperty('baseScrollHeight')) {
            let savedValue = this.value;
            this.value = '';
            this.baseScrollHeight = this.scrollHeight;
            this.value = savedValue;
        }
        const styles = getComputedStyle(this);
        const ratio = styles.getPropertyValue('line-height').replace('px', '');
        const minRows = this.hasAttribute("data-min-rows") ? parseInt(this.getAttribute("data-min-rows")) : 5;
        const maxRows = this.hasAttribute('data-max-rows') ? parseInt(this.getAttribute('data-max-rows')) : 25;
        const rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / ratio);

        this.rows = minRows;
        this.rows = minRows + rows;
        if (this.rows > maxRows) {
            this.rows = maxRows;
        }
    }
};

export default AutoExpand;
