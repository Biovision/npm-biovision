/**
 * Stretch videos inserted by WYSIWYG applying proportional-container
 *
 * @author Maxim Khan-Magomedov <maxim.km@gmail.com>
 * @type {Object}
 */
const VideoStretcher = {
    id: "videoStretcher",
    /**
     * Component is initialized
     *
     * @type {boolean}
     */
    initialized: false,
    /**
     * Selector for matching embedded videos
     *
     * @type {string}
     */
    selector: 'figure.media iframe[src^="https://www.you"]',
    /**
     * List of matched items
     *
     * @type {array<HTMLElement>}
     */
    items: [],
    /**
     * Initializer
     *
     * @type {function}
     */
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     * Callback for applying stretch
     *
     * @param {HTMLElement} element
     */
    apply: function (element) {
        const figure = element.closest("figure.media");
        if (figure) {
            VideoStretcher.items.push(figure);
            figure.classList.add("proportional-container");
            figure.classList.add("r-16x9");
        }
    }
};

export default VideoStretcher;
