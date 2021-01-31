/**
 * Preview images when selecting them in input type="file" fields
 *
 * @type {Object}
 */
const FilePreview = {
    /**
     * @type {Boolean}
     */
    initialized: false,
    /**
     * Initialize component
     */
    init: function () {
        document.addEventListener('change', function (event) {
            const input = event.target;

            if (input.matches('input[type=file]')) {
                FilePreview.handle(input);
            }
        });
        this.initialized = true;
    },
    /**
     * Handle change of file input field
     *
     * @param {EventTarget|HTMLInputElement} input
     */
    handle: function (input) {
        const targetImage = input.getAttribute('data-image');

        if (targetImage) {
            const target = document.querySelector('#' + targetImage + ' img');

            if (target && input.files && input.files[0]) {
                const reader = new FileReader();

                reader.onload = function (event) {
                    target.setAttribute('src', event.target["result"]);
                };

                reader.readAsDataURL(input.files[0]);
            }
        }
    },
};

export default FilePreview;
