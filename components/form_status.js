const FormStatus = {
    initialized: false,
    selector: 'form[data-remote]',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     *
     * @param {HTMLFormElement} element
     */
    apply: function (element) {
        FormStatus.elements.push(element);

        const button = element.querySelector('button[type=submit]');
        const loadingMessage = element.querySelector('.loading_message');
        const stateContainer = element.querySelector('.state_container');
        const progressPercent = element.querySelector('.state_container .percentage');
        const progressBar = element.querySelector('.state_container progress');

        element.addEventListener('ajax:before', function () {
            button.disabled = true;

            if (loadingMessage) {
                loadingMessage.classList.remove('hidden');
            }
        });

        element.addEventListener('ajax:complete', function () {
            button.disabled = false;

            if (loadingMessage) {
                loadingMessage.classList.add('hidden');
            }
            if (progressBar) {
                progressBar.value = '0';
            }
        });

        if (stateContainer) {
            element.addEventListener('ajax:beforeSend', function (event) {
                const request = event.detail[0];

                request.upload.addEventListener('progress', function (e) {
                    const value = e.loaded / e.total;

                    if (progressPercent) {
                        progressPercent.innerHTML = (value * 100) + '%';
                    }
                    if (progressBar) {
                        progressBar.value = value;
                    }
                });
            });
        }
    },
};

export default FormStatus;
