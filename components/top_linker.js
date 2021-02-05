/**
 * Show/hide "go to top" link when it is present in layout
 *
 * @type {Object}
 */
const TopLinker = {
    id: "topLinker",
    /**
     * @type {Boolean}
     */
    initialized: false,
    /**
     * @type {HTMLElement}
     */
    element: undefined,
    /**
     * Initialize component
     */
    init: function () {
        this.element = document.getElementById('go-to-top');

        if (this.element) {
            const topLinker = this.element;

            window.addEventListener('scroll', function () {
                if (window.pageYOffset > 500) {
                    topLinker.classList.remove('inactive');
                } else {
                    topLinker.classList.add('inactive');
                }
            });

            this.initialized = true;
        }
    }
};

export default TopLinker;
