"use strict";

const Biovision = {
    locale: "",
    csrfToken: "",
    components: {},
    init: function () {
        this.locale = document.querySelector("html").getAttribute("lang");
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

        for (let componentName in this.components) {
            if (this.components.hasOwnProperty(componentName)) {
                const component = this.components[componentName];
                if (component.hasOwnProperty("init")) {
                    component.init();
                }

                if (component.hasOwnProperty("autoInitComponents")) {
                    if (component.autoInitComponents) {
                        this.initChildComponents(component);
                    }
                }
            }
        }
    },
    /**
     * Init child components of given component
     *
     * @type {Function}
     * @param {Object} parent
     */
    initChildComponents: function (parent) {
        if (!parent.hasOwnProperty("components")) {
            return;
        }

        for (let componentName in parent.components) {
            if (parent.components.hasOwnProperty(componentName)) {
                const child = parent.components[componentName];

                if (child.hasOwnProperty("init")) {
                    let initialized = false;
                    if (child.hasOwnProperty("initialized")) {
                        initialized = child.initialized;
                    }

                    if (!initialized) {
                        child.init();
                    }
                }
            }
        }
    },
    /**
     * Initialize new AJAX request
     *
     * @param {string} method
     * @param {string} url
     * @param {function} [onSuccess] callback for success
     * @param {function} [onFailure=Biovision.handleAjaxFailure] callback for failure
     * @returns {XMLHttpRequest}
     */
    newAjaxRequest: function (method, url, onSuccess, onFailure) {
        const request = new XMLHttpRequest();

        request.addEventListener("load", function () {
            if (this.status >= 200 && this.status < 400) {
                if (onSuccess) {
                    onSuccess.call(this);
                }
            } else {
                (onFailure || Biovision.handleAjaxFailure).call(this);
            }
        });
        request.addEventListener("error", Biovision.handleAjaxFailure);

        request.open(method.toUpperCase(), url);
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        request.setRequestHeader("X-CSRF-Token", Biovision.csrfToken);

        return request;
    },
    /**
     * Initialize new AJAX request with JSON content-type and accept headers
     *
     * @param {string} method
     * @param {string} url
     * @param {function} onSuccess
     * @param {function} onFailure
     * @returns {XMLHttpRequest}
     */
    jsonAjaxRequest: function (method, url, onSuccess, onFailure) {
        const request = Biovision.newAjaxRequest(method, url, onSuccess, onFailure);

        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");

        return request;
    },
    /**
     * Handle failed AJAX request
     *
     * @type {Function}
     */
    handleAjaxFailure: function () {
        console.log("AJAX failed", this);
    },
    execute: function (name, context) {
        const args = Array.prototype.slice.call(arguments, 2);
        const namespaces = name.split(".");
        const func = namespaces.pop();
        for(let i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }

        return context[func].apply(context, args);
    }
};

Biovision.components.forms = {
    /**
     * Показать список ошибок после обработки формы
     *
     * Используется в контроллерах при отправке форм через remote: true
     *
     * @param {string} modelName название модели
     * @param {Array<string>} list список ошибок
     */
    showErrors: function (modelName, list) {
        const form = document.getElementById(modelName + "-form");
        if (form) {
            let errors = form.querySelector("ol.errors");
            let data = "";

            if (!errors) {
                errors = document.createElement("ol");
                errors.classList.add("errors");
            }

            list.forEach(function (message) {
                data += "<li>" + message + "</li>";
            });

            errors.innerHTML = data;

            form.prepend(errors);

            errors.scrollIntoView();
        }
    },
    /**
     * Hide and show elements in form with given id
     *
     * Toggles class "hidden" for elements with selectors
     * hideSelector and showSelector for form children
     *
     * @param {String} formId
     * @param {String} hideSelector elements to hide
     * @param {String} showSelector elements to show
     */
    switchElements: function (formId, hideSelector, showSelector) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll(showSelector).forEach(function (element) {
                element.classList.remove("hidden");
            });
            form.querySelectorAll(hideSelector).forEach(function (element) {
                element.classList.add("hidden");
            });
        } else {
            console.log("Cannot find element with id " + formId)
        }
    },
    showError: function (formId, message) {
        if (formId.length > 0) {
            const form = document.getElementById(formId);
            if (form) {
                let container = form.querySelector(".message-box.error");
                if (!container) {
                    container = document.createElement("div");
                    container.classList.add("message-box");
                    container.classList.add("error");
                    form.prepend(container);
                }
                container.innerHTML = message;
            } else {
                console.log("Cannot find form " + formId);
            }
        }
    }
}

/**
 * Show/hide "go to top" link when it is present in layout
 *
 * @type {Object}
 */
Biovision.components.topLinker = {
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

/**
 * Preview images when selecting them in input type="file" fields
 *
 * @type {Object}
 */
Biovision.components.filePreview = {
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
                Biovision.components.filePreview.handle(input);
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

/**
 * Linking entities with checkboxes
 *
 * @type {Object}
 */
Biovision.components.entityLinker = {
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
        const component = Biovision.components.entityLinker;

        component.elements.push(element);
        element.addEventListener('click', component.handler);
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

/**
 * Instantly check form validity
 *
 * @type {Object}
 */
Biovision.components.instantCheck = {
    initialized: false,
    selector: 'form[data-check-url]',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     *
     * @param {HTMLFormElement} form
     */
    apply: function (form) {
        const component = Biovision.components.instantCheck;

        form.querySelectorAll('[data-check]').forEach(function (element) {
            component.elements.push(element);
            element.addEventListener('blur', component.handler);
        });
    },
    handler: function () {
        const element = this;
        const form = element.closest('form');
        const url = form.getAttribute('data-check-url');

        const request = Biovision.newAjaxRequest('POST', url, function () {
            if (this.responseText) {
                const response = JSON.parse(this.responseText);

                if (response.hasOwnProperty('meta')) {
                    if (response.meta.valid) {
                        form.querySelectorAll('[data-field]').forEach(function (field) {
                            field.innerHTML = '';
                        });
                    } else {
                        const key = element.getAttribute('data-check');
                        const container = form.querySelector('[data-field="' + key + '"]');

                        if (container) {
                            const errors = response.meta['errors'];

                            if (errors.hasOwnProperty(key)) {
                                container.innerHTML = errors[key].join('; ');
                                container.classList.remove('hidden');
                            } else {
                                container.innerHTML = '';
                            }
                        }
                    }
                }
            }
        });

        const data = new FormData();
        Array.from((new FormData(form)).entries()).forEach(function (entry) {
            const value = entry[1];

            if (value instanceof window.File && value.name === '' && value.size === 0) {
                data.append(entry[0], new window.Blob([]), '');
            } else {
                if (entry[0] !== '_method') {
                    data.append(entry[0], value);
                }
            }
        });

        request.send(data);
    }
};

Biovision.components.transliterator = {
    initialized: false,
    selector: '[data-transliterate]',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     *
     * @param {HTMLElement} element
     */
    apply: function (element) {
        const component = Biovision.components.transliterator;

        component.elements.push(element);
        element.addEventListener('blur', component.handler);
    },
    /**
     *
     * @param {Event} event
     */
    handler: function (event) {
        const component = Biovision.components.transliterator;
        const element = event.target;
        const target = document.getElementById(element.getAttribute('data-transliterate'));

        if (target && target.value === '') {
            target.value = component.transliterate(element.value);
            target.dispatchEvent(new Event('change'));
        }
    },
    /**
     *
     * @param {string} input
     * @returns {string}
     */
    transliterate: function (input) {
        const characterMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'c', 'ч': 'ch',
            'ш': 'sh', 'щ': 'shh', 'ъ': '', 'ы': 'y', 'ь': '',
            'э': 'e', 'ю': 'yu', 'я': 'ya',
            'å': 'aa', 'ä': 'ae', 'ö': 'oe', 'é': 'e'
        };
        let string = input.toLowerCase();

        for (let index in characterMap) {
            if (characterMap.hasOwnProperty(index)) {
                string = string.replace(new RegExp(index, 'g'), characterMap[index]);
            }
        }
        string = string.replace(/[^-a-z0-9_.]/g, '-');
        string = string.replace(/^[-_.]*([-a-z0-9_.]*[a-z0-9]+)[-_.]*$/, '$1');
        string = string.replace(/--+/g, '-');

        return string;
    },
};

Biovision.components.formStatus = {
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
        const component = Biovision.components.formStatus;
        component.elements.push(element);

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

Biovision.components.autoExpand = {
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
        const component = Biovision.components.autoExpand;
        component.elements.push(element);

        element.addEventListener('focus', component.handler);
        element.addEventListener('input', component.handler);
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

Biovision.components.entityImageRemover = {
    initialized: false,
    selector: '.remove-image-button',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        const component = Biovision.components.entityImageRemover;
        component.elements.push(element);
        element.addEventListener('click', component.handler);
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

Biovision.components.imageRemover = {
    initialized: false,
    selector: ".js-image-remover",
    buttons: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (button) {
        const component = Biovision.components.imageRemover;
        component.buttons.push(button);
        button.addEventListener("click", component.handler);
    },
    handler: function (event) {
        const button = event.target;
        const container = document.getElementById(button.getAttribute("data-container"));

        if (container && confirm(button.getAttribute("data-text"))) {
            const image = container.querySelector("img");
            const url = button.getAttribute("data-url");
            const request = Biovision.jsonAjaxRequest("delete", url, function () {
                const response = JSON.parse(this.responseText);
                if (response.hasOwnProperty("meta")) {
                    const meta = response.meta;
                    if (meta.hasOwnProperty("result") && meta.result) {
                        image.src = button.getAttribute("data-blank-url");
                        button.remove();

                        const link = image.closest("a");
                        if (link) {
                            link.href = "#";
                        }
                    }
                }
            });

            button.disabled = true;
            request.send();
        }
    }
};

Biovision.components.ajaxDeleteButton = {
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
        const component = Biovision.components.ajaxDeleteButton;
        component.elements.push(element);
        element.addEventListener('click', component.handler);
    },
    handler: function (event) {
        const messages = Biovision.components.ajaxDeleteButton.messages;
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

Biovision.components.storage = {
    initialized: false,
    session: {
        set: function (key, value) {
            Biovision.components.storage.set('sessionStorage', key, value);
        },
        get: function (key) {
            return Biovision.components.storage.get('sessionStorage', key);
        },
        remove: function (key) {
            Biovision.components.storage.remove('sessionStorage', key);
        }
    },
    local: {
        set: function (key, value) {
            Biovision.components.storage.set('localStorage', key, value);
        },
        get: function (key) {
            return Biovision.components.storage.get('localStorage', key);
        },
        remove: function (key) {
            Biovision.components.storage.remove('localStorage', key);
        }
    },
    init: function () {
        Biovision.storage = this;
        this.initialized = true;
    },
    available: function (type) {
        try {
            const x = '__storage_test__';

            window[type].setItem(x, x);
            window[type].removeItem(x);

            return true;
        } catch (e) {
            return false;
        }
    },
    set: function (type, key, value) {
        if (Biovision.components.storage.available(type)) {
            window[type].setItem(key, value);
        } else {
            console.log('set: Storage ' + type + ' is not available');
        }
    },
    get: function (type, key) {
        if (Biovision.components.storage.available(type)) {
            return window[type].getItem(key);
        } else {
            console.log('get: Storage ' + type + ' is not available');
            return null;
        }
    },
    remove: function (type, key) {
        if (Biovision.components.storage.available(type)) {
            window[type].removeItem(key);
        } else {
            console.log('remove: Storage ' + type + ' is not available');
        }
    }
};

// Кнопка удаления элемента через AJAX
Biovision.components.destroyButton = {
    initialized: false,
    selector: 'div[data-destroy-url] button.destroy',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        const component = Biovision.components.destroyButton;
        component.elements.push(element);
        element.addEventListener('click', component.handler);
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

// Поиск пользователя в админке
Biovision.components.userSearch = {
    initialized: false,
    selector: '.user-search button',
    elements: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        const component = Biovision.components.userSearch;
        component.elements.push(element);
        element.addEventListener('click', component.handler);
    },
    handler: function () {
        const container = this.closest('.user-search');
        const input = container.querySelector('input[type=search]');
        const url = container.getAttribute('data-url') + '?q=' + encodeURIComponent(input.value);

        const request = Biovision.newAjaxRequest('GET', url, function () {
            const response = JSON.parse(this.responseText);
            const results = container.querySelector('.results');

            if (response.hasOwnProperty('meta')) {
                results.innerHTML = response['meta']['html'];

                results.querySelectorAll('li').forEach(function (li) {
                    li.addEventListener('click', function (event) {
                        const element = event.target;
                        const target = document.getElementById(container.getAttribute('data-target'));

                        target.value = element.getAttribute('data-id');
                    });
                });
            }
        });

        request.send();
    }
};

Biovision.components.adminUserSearch = {
    initialized: false,
    selector: ".js-admin-user-search",
    url: undefined,
    button: undefined,
    input: undefined,
    resultsContainer: undefined,
    callbackName: undefined,
    init: function () {
        const container = document.querySelector(this.selector);
        if (container) {
            const component = this;
            this.url = container.getAttribute("data-url");
            this.button = container.querySelector("button");
            this.input = container.querySelector("input");
            this.resultsContainer = container.querySelector("select");
            this.callbackName = container.getAttribute("data-callback");

            this.input.addEventListener("input", component.changeInput);
            this.button.addEventListener("click", component.clickButton);
            this.resultsContainer.addEventListener("change", component.changeSelect);
            this.initialized = true;
        }
    },
    changeInput: function (event) {
        const component = Biovision.components.adminUserSearch;
        const input = event.target;
        component.button.disabled = input.value.length < 1;
    },
    clickButton: function (event) {
        const component = Biovision.components.adminUserSearch;
        const url = component.url + "?q=" + encodeURIComponent(component.input.value);
        Biovision.jsonAjaxRequest("get", url, component.showResults).send();
    },
    changeSelect: function (event) {
        const component = Biovision.components.adminUserSearch;
        const select = event.target;
        const option = select.options[select.selectedIndex];
        const id = parseInt(option.value);

        if (id > 0 && component.callbackName) {
            Biovision.execute(component.callbackName, window, id);
            option.disabled = true;
        }
    },
    showResults: function () {
        const component = Biovision.components.adminUserSearch;
        const response = JSON.parse(this.responseText);
        component.resultsContainer.innerHTML = "";

        const option = document.createElement("option");
        option.innerHTML = response["meta"]["count"];
        option.value = "";
        component.resultsContainer.append(option);

        if (response.hasOwnProperty("data")) {
            response.data.forEach(function (item) {
                const option = document.createElement("option");
                option.setAttribute("value", item.id);
                option.innerHTML = item["attributes"]["slug"] + " (" + item["meta"]["name"] + ")";

                component.resultsContainer.append(option);
            });
        }
    }
};

Biovision.components.userPrivilege = {
    initialized: false,
    selector: ".js-component-added-users",
    list: undefined,
    url: undefined,
    init: function () {
        this.list = document.querySelector(this.selector);
        if (this.list) {
            this.url = this.list.getAttribute("data-url");
            this.initialized = true;
        }
    },
    addUser: function (id) {
        const component = Biovision.components.userPrivilege;
        if (component.url) {
            const data = {
                "user_id": id
            };
            const request = Biovision.jsonAjaxRequest("patch", component.url, component.processAddResponse);

            request.send(JSON.stringify(data));
        } else {
            console.log("URL is not set for userPrivilege component")
        }
    },
    processAddResponse: function () {
        const component = Biovision.components.userPrivilege;
        if (component.list) {
            const response = JSON.parse(this.responseText);
            if (response.hasOwnProperty("data")) {
                const data = response["data"];
                const li = document.createElement("li");
                const user = data["relationships"]["user"]["data"];
                const div = document.createElement("div");
                div.innerHTML = user["attributes"]["screen_name"] + " (" + user["meta"]["full_name"] + ")";
                li.append(div);

                const linkData = data["attributes"]["data"];
                if (Object.keys(linkData).length > 0) {
                    const details = document.createElement("div");
                    details.innerHTML = JSON.stringify(linkData);
                    li.append(details);
                }

                component.list.append(li);
            }
        } else {
            console.log("List is not defined for userPrivilege component");
        }
    }
};

/**
 * Hide popups when clicking outside
 *
 * @type {Object}
 */
Biovision.components.hidingPopups = {
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
        Biovision.components.hidingPopups.elements.push(element);
    },
    /**
     * Handle click
     *
     * @param {Event} event
     * @type {Function}
     */
    handler: function (event) {
        const component = Biovision.components.hidingPopups;
        const selector = '.hiding-popup-container *';
        const target = event.target;

        if (target.matches(selector)) {
            const container = target.closest('.hiding-popup-container');
            const checkbox = container.querySelector(component.selector);
            component.elements.forEach(function (element) {
                if (element !== checkbox) {
                    element.checked = false;
                }
            });
        } else {
            component.elements.forEach(function (checkbox) {
                checkbox.checked = false;
            });
        }
    }
};

Biovision.components.componentParameters = {
    initialized: false,
    container: undefined,
    url: undefined,
    list: undefined,
    elements: [],
    init: function () {
        this.container = document.getElementById("biovision-component-parameters");
        if (this.container) {
            this.url = this.container.getAttribute("data-url");
            this.list = this.container.querySelector("dl");
            this.list.querySelectorAll("input").forEach(this.apply);
            this.initialized = true;
        }
    },
    /**
     *
     * @param {HTMLElement} element
     * @type {Function}
     */
    apply: function (element) {
        const component = Biovision.components.componentParameters;
        component.elements.push(element);
        element.addEventListener("change", component.change);
    },
    change: function (event) {
        const component = Biovision.components.componentParameters;
        const element = event.target;
        const data = {
            "key": {
                "slug": element.name,
                "value": element.value
            }
        };
        const request = Biovision.jsonAjaxRequest("patch", component.url, function () {
            element.disabled = false;
            element.classList.add("updated");
        }, function () {
            element.disabled = false;
            element.classList.add("failed");
        });

        element.classList.remove("updated", "failed");
        element.disabled = true;
        request.send(JSON.stringify(data));
    },
    add: function (data) {
        const div = document.createElement("div");
        const dt = document.createElement("dt");
        const label = document.createElement("label");
        const elementId = "parameter-" + data["slug"];
        label.setAttribute("for", elementId);
        label.innerHTML = data["slug"];
        dt.append(label);
        const dd = document.createElement("dd");
        const input = document.createElement("input");
        input.setAttribute("id", elementId);
        input.setAttribute("name", data["slug"]);
        input.value = data["value"];
        dd.append(input);
        this.apply(input);
        div.append(dt);
        div.append(dd);
        this.list.append(div);
    }
};

Biovision.components.newComponentParameter = {
    initialized: false,
    container: undefined,
    url: undefined,
    button: undefined,
    init: function () {
        this.container = document.getElementById("biovision-component-new-parameter");
        if (this.container) {
            const component = this;
            this.url = this.container.getAttribute("data-url");
            this.button = this.container.querySelector("button");
            this.button.addEventListener("click", component.click);
            this.initialized = true;
        }
    },
    click: function () {
        const component = Biovision.components.newComponentParameter;
        const data = {"key": {}};
        let dataPresent = true;
        component.container.querySelectorAll("input").forEach(function (input) {
            dataPresent &= input.value.length > 0;
            data.key[input.name] = input.value;
        });

        if (dataPresent) {
            const request = Biovision.jsonAjaxRequest("patch", component.url, function () {
                component.container.querySelectorAll("input").forEach(function (input) {
                    input.value = '';
                });
                Biovision.components.componentParameters.add(data["key"]);
                component.button.disabled = false;
            }, function () {
                component.button.disabled = false;
            });

            component.button.disabled = true;
            request.send(JSON.stringify(data));
        }
    }
};

Biovision.components.cookieNotifier = {
    initialized: false,
    selector: "cookie-info",
    container: undefined,
    button: undefined,
    init: function () {
        this.container = document.getElementById(this.selector);
        if (this.container) {
            const handler = this.handler;
            this.button = this.container.querySelector("button");
            if (this.button) {
                this.button.addEventListener("click", handler);
            }
            this.initialized = true;
        }
    },
    handler: function () {
        const component = Biovision.components.cookieNotifier;
        const date = new Date();
        date.setTime(date.getTime() + 31536000000);
        document.cookie = "f=1;path=/;expires=" + date.toUTCString();
        component.container.remove();
    }
};

Biovision.components.animatedNumbers = {
    initialized: false,
    selector: ".js-animated-numbers",
    containers: [],
    breakpoints: {},
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.addContainer);
        if (this.containers.length > 0) {
            const component = this;
            window.addEventListener("scroll", component.watch);
        }
        this.initialized = true;
    },
    addContainer: function (element) {
        const component = Biovision.components.animatedNumbers;
        const container = {
            "element": element,
            "animated": false,
            "items": []
        };
        if (element.hasAttribute("data-time")) {
            container["time"] = parseInt(element.getAttribute("data-time"));
        } else {
            container["time"] = 3000;
        }
        container["stepCount"] = Math.ceil(container["time"] / 50);
        element.querySelectorAll(".value").forEach(function (value) {
            component.addItem(container, value);
        });
        component.containers.push(container);
    },
    addItem: function (container, element) {
        const item = {
            "element": element,
            "initialValue": parseInt(element.innerHTML),
            "stepNumber": 0,
        };
        element.innerHTML = "";
        container.items.push(item);
    },
    watch: function () {
        const component = Biovision.components.animatedNumbers;
        component.containers.forEach(function (container) {
            if (container.animated) {
                return;
            }

            const box = container.element.getBoundingClientRect();

            if (box.y < window.innerHeight / 1.75) {
                component.animate(container);
            }
        });
    },
    animate: function (container) {
        const component = Biovision.components.animatedNumbers;

        container.items.forEach(function (item) {
            component.increment(item, container.stepCount)
        });
        container.animated = true;
    },
    increment: function (item, stepCount) {
        const component = Biovision.components.animatedNumbers;
        if (item.stepNumber < stepCount) {
            item.stepNumber++;
            item.element.innerHTML = Math.min(Math.ceil(item.initialValue / stepCount * item.stepNumber), item.initialValue);

            window.setTimeout(component.increment, 50, item, stepCount);
        }
    }
};

Biovision.components.carousel = {
    /**
     * Component is initialized
     *
     * @type {Boolean}
     */
    initialized: false,
    /**
     * Selector string for matching carousel containers
     *
     * @type {String}
     */
    selector: ".js-biovision-carousel",
    /**
     * Wrappers for found carousel containers
     *
     * @type {Array<Object>}
     */
    sliders: [],
    /**
     * Initializer
     */
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    /**
     * Apply carousel behavior to container
     *
     * @param {HTMLElement} element
     */
    apply: function (element) {
        const component = Biovision.components.carousel;
        const slider = {
            "element": element,
            "container": element.querySelector(".carousel-container"),
            "items": element.querySelectorAll(".carousel-item"),
            "prevButton": element.querySelector("button.prev"),
            "nextButton": element.querySelector("button.next"),
            "current": 0,
            "touchData": {"x": null, "y": null},
            "lastSlide": 0,
            "ready": false
        };
        if (element.hasAttribute("data-type")) {
            slider["type"] = element.getAttribute("data-type");
        } else {
            slider["type"] = "offset";
        }
        if (element.hasAttribute("data-timeout")) {
            slider["timeout"] = parseInt(element.getAttribute("data-timeout"));
            if (slider["timeout"] > 0) {
                slider["timeout_handler"] = window.setInterval(component.autoSlide, slider["timeout"], slider);
            }
        }
        if (slider["prevButton"]) {
            slider["prevButton"].addEventListener("click", component.clickedPrev);
        }
        if (slider["nextButton"]) {
            slider["nextButton"].addEventListener("click", component.clickedNext);
        }
        slider["transition"] = parseFloat(getComputedStyle(slider["items"][0]).transitionDuration) * 1000;
        slider["maxItem"] = slider["items"].length - 1;
        element.addEventListener("touchstart", component.touchStart, false);
        element.addEventListener("touchend", component.touchEnd, false);
        component.sliders.push(slider);
        component.rearrange(slider);
    },
    /**
     * Rearrange items in carousel
     *
     * @param {Object} slider
     */
    rearrange: function (slider) {
        const component = Biovision.components.carousel;
        switch (slider["type"]) {
            case "current-item":
                component.newCurrentItem(slider);
                break;
            case "offset":
                component.setMaxItem(slider);
                component.newOffset(slider);
                break;
            case "offset-cycle":
                component.processCycle(slider);
                break;
            default:
                console.log("Unknown carousel type: " + slider["type"]);
                component.newOffset(slider);
        }
        slider["ready"] = true;
    },
    /**
     * Handler for clicking "Previous" button
     *
     * @param {Event} event
     */
    clickedPrev: function (event) {
        const component = Biovision.components.carousel;
        const slider = component.getSlider(event.target);
        component.prevItem(slider);
    },
    /**
     * Handler for clicking "Next" button
     *
     * @param {Event} event
     */
    clickedNext: function (event) {
        const component = Biovision.components.carousel;
        const slider = component.getSlider(event.target);
        component.nextItem(slider);
    },
    /**
     * Get wrapper for slider
     *
     * @param {HTMLElement|EventTarget} element
     * @returns {Object}
     */
    getSlider: function (element) {
        const slider = element.closest(this.selector);
        for (let i = 0; i < this.sliders.length; i++) {
            if (this.sliders[i].element === slider) {
                return this.sliders[i];
            }
        }
    },
    /**
     * Check if it's time to move to next slide in auto-interval
     *
     * @param {Object} slider
     */
    autoSlide: function (slider) {
        const component = Biovision.components.carousel;
        const delta = Date.now() - slider["lastSlide"];
        // Adding 5% uncertainty to timeout for delays between calls
        if (delta >= slider["timeout"] * 0.95) {
            component.nextItem(slider);
        }
    },
    /**
     * Slide to next item
     *
     * @param {Object} slider
     */
    nextItem: function (slider) {
        const component = Biovision.components.carousel;

        slider["current"]++;
        if (slider["current"] > slider["maxItem"]) {
            slider["current"] = 0;
        }
        slider["lastSlide"] = Date.now();

        component.rearrange(slider);
    },
    /**
     * Slide to previous item
     *
     * @param {Object} slider
     */
    prevItem: function (slider) {
        const component = Biovision.components.carousel;
        slider["current"]--;
        if (slider["current"] < 0) {
            slider["current"] = slider["maxItem"];
        }

        component.rearrange(slider);
    },
    /**
     * Mark new item as current
     *
     * @param {Object} slider
     */
    newCurrentItem: function (slider) {
        const selector = ".carousel-item:nth-of-type(" + (slider.current + 1) + ")";
        const currentSlide = slider.container.querySelector(".carousel-item.current");
        if (currentSlide) {
            currentSlide.classList.remove("current");
        }
        slider.container.querySelector(selector).classList.add("current");
    },
    /**
     * Change margin of the leftmost slide
     *
     * @param {Object} slider
     */
    newOffset: function (slider) {
        const firstSlide = slider.container.querySelector(".carousel-item:first-of-type");
        if (firstSlide) {
            const rightMargin = window.getComputedStyle(firstSlide).marginRight;
            const slideWidth = firstSlide.offsetWidth + parseInt(rightMargin);
            let newMargin = -(slideWidth * slider.current);
            const slidesLength = slideWidth * slider.items.length;
            const maxOffset = slidesLength - slider.container.offsetWidth;
            const delta = newMargin + maxOffset;

            if (delta < 0) {
                newMargin -= delta;
                slider["current"] = slider["maxItem"];
            }

            firstSlide.style.marginLeft = String(newMargin) + "px";
        }
    },
    processCycle: function (slider) {
        if (slider["ready"]) {
            if (slider["current"] === 1) {
                this.newOffset(slider);
                window.setTimeout(this.offsetLeft, slider["transition"], slider);
            } else {
                this.offsetRight(slider);
            }

            slider["current"] = 0;
        }
    },
    offsetLeft: function (slider) {
        const list = slider["container"];
        const element = list.querySelector(".carousel-item:first-of-type");
        list.append(element);
        element.style.setProperty("margin-left", 0);
    },
    offsetRight: function (slider) {
        const list = slider["container"];
        const element = list.querySelector(".carousel-item:last-of-type");
        const styles = getComputedStyle(element);
        const clear = function() {
            element.style.marginLeft = null;
        };
        element.style.transitionDuration = 0;
        const rightMargin = styles.marginRight;
        const slideWidth = element.offsetWidth + parseInt(rightMargin);
        element.style.marginLeft = String(-slideWidth) + "px";
        list.prepend(element);
        element.style.transitionDuration = null;
        window.setTimeout(clear, 50);
    },
    /**
     * Determine maximum item number so that right margin remains minimal
     *
     * @param {Object} slider
     */
    setMaxItem: function (slider) {
        const firstSlide = slider.container.querySelector(".carousel-item:first-of-type");
        if (firstSlide) {
            const rightMargin = window.getComputedStyle(firstSlide).marginRight;
            const slideWidth = firstSlide.offsetWidth + parseInt(rightMargin);
            const maxCount = slider.container.offsetWidth / slideWidth;
            slider["maxItem"] = slider.items.length - Math.floor(maxCount);
        }
    },
    /**
     * Handler for start of swipe
     *
     * @param {TouchEvent} event
     * @type {Function}
     */
    touchStart: function (event) {
        const component = Biovision.components.carousel;
        const slider = component.getSlider(event.target);
        slider["touchData"] = {
            "x": event.changedTouches[0].pageX,
            "y": event.changedTouches[0].pageY
        }
    },
    /**
     * Handler for end of swipe
     *
     * @param {TouchEvent} event
     * @type {Function}
     */
    touchEnd: function (event) {
        const component = Biovision.components.carousel;
        const slider = component.getSlider(event.target);
        const x = event.changedTouches[0].pageX;
        const y = event.changedTouches[0].pageY;
        const deltaX = Math.abs(x - slider["touchData"]["x"]);
        const deltaY = Math.abs(y - slider["touchData"]["y"]);
        if (deltaX > deltaY) {
            if (x < slider["touchData"]["x"]) {
                component.nextItem(slider);
            } else if (x > slider["touchData"]["x"]) {
                component.prevItem(slider);
            }
        }
        slider["touchData"] = {"x": null, "y": null}
    }
};

const Notifications = {
    initialized: false,
    autoInitComponents: true,
    components: {},
    init: function () {
        this.initialized = true;
    }
};

Notifications.components.markAsRead = {
    initialized: false,
    selector: ".notifications-list .unread",
    items: {},
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        const component = Notifications.components.markAsRead;
        const id = element.getAttribute("data-id");
        component.items[id] = element;
        element.addEventListener("mouseover", component.handler);
    },
    handler: function (event) {
        const component = Notifications.components.markAsRead;
        const element = event.target.closest(".unread");
        if (element) {
            const url = element.getAttribute("data-url");
            Biovision.jsonAjaxRequest("put", url, function () {
                element.classList.remove("unread");
            }).send();
            element.removeEventListener("mouseover", component.handler);
        }
    }
};

Notifications.components.deleteNotification = {
    initialized: false,
    selector: ".notifications-list button",
    items: {},
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply);
        this.initialized = true;
    },
    apply: function (element) {
        const li = element.closest("li");
        const id = li.getAttribute("data-id");
        const component = Notifications.components.deleteNotification;
        component.items[id] = element;
        element.addEventListener("click", component.handler);
    },
    handler: function (event) {
        const button = event.target;
        const url = button.getAttribute("data-url");
        button.disabled = true;
        const request = Biovision.jsonAjaxRequest("delete", url, function () {
            button.closest("li").remove();
        });

        request.send();
    }
};

window.Notifications = Notifications;
Biovision.components.notifications = Notifications;

Biovision.components.oembed = {
    initialized: false,
    selector: "oembed",
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.replace);
        this.initialized = true;
    },
    replace: function (element) {
        const component = Biovision.components.oembed;
        const url = element.getAttribute("url");
        if (url) {
            const replacement = component.receive(url);

            element.parentElement.replaceChild(replacement, element);
        }
    },
    fallback: function (url) {
        const div = document.createElement("div");
        const element = document.createElement("a");
        element.setAttribute("rel", "external nofollow noopener noreferrer");
        element.setAttribute("target", "_blank");
        element.href = url;
        element.innerHTML = element.hostname;
        div.append(element);

        return div;
    },
    hostname: function (url) {
        const element = document.createElement("a");
        element.href = url;

        return element.hostname;
    },
    receive: function (remoteUrl) {
        const div = document.createElement("div");
        const url = "/oembed?url=" + encodeURIComponent(remoteUrl);
        const query = Biovision.jsonAjaxRequest("get", url, function () {
            const response = JSON.parse(this.responseText);
            if (response.hasOwnProperty("meta")) {
                const doc = new DOMParser().parseFromString(response["meta"]["code"], "text/html");
                doc.querySelectorAll("body > *").forEach(function (element) {
                    if (element.nodeName.toLocaleLowerCase() === "script") {
                        const scriptElement = document.createElement("script");
                        scriptElement.src = element.src;
                        if (element.hasAttribute("async")) {
                            scriptElement.setAttribute("async", "");
                        }
                        div.append(scriptElement);
                    } else {
                        div.append(element);
                    }
                });
            }
        });
        query.send();

        return div;
    }
};

const Socialization = {
    initialized: false,
    components: {},
    autoInitComponents: true,
    init: function () {
        this.initialized = true;
    }
};

/**
 * Sending messages to other users
 *
 * @type {Object}
 */
Socialization.components.messageSender = {
    /**
     * @type {Boolean}
     */
    initialized: false,
    /**
     * HTML id for selecting container
     *
     * @type {String}
     */
    selector: "user_messages",
    /**
     * Container for widget
     *
     * @type {HTMLDivElement}
     */
    container: undefined,
    /**
     * UL element for displaying messages
     *
     * @type {HTMLUListElement}
     */
    list: undefined,
    /**
     * "Send" button
     *
     * @type {HTMLButtonElement}
     */
    button: undefined,
    /**
     * Textarea field for entering new message text
     *
     * @type {HTMLTextAreaElement}
     */
    field: undefined,
    /**
     * Loader button for receiving next page
     *
     * @type {HTMLButtonElement}
     */
    loader: undefined,
    /**
     * URL for new messages
     *
     * @type {String}
     */
    url: undefined,
    init: function () {
        this.container = document.getElementById(this.selector);
        if (this.container) {
            this.url = this.container.getAttribute("data-url");
            this.list = this.container.querySelector(".user_messages-list");
            this.field = this.container.querySelector("textarea");
            this.button = this.container.querySelector(".actions button");
            this.loader = this.container.querySelector(".user_messages-loader");

            this.field.addEventListener("keyup", this.keyup);
            this.button.addEventListener("click", this.send);
            this.loader.addEventListener("click", this.loadMessages);

            this.initialized = true;

            this.loadMessages();
        }
    },
    /**
     * Handler for checking new message length
     *
     * @type {Function}
     */
    keyup: function () {
        const component = Socialization.components.messageSender;
        const message = component.field.value.trim();
        component.button.disabled = message.length < 1;
    },
    send: function () {
        const component = Socialization.components.messageSender;
        const request = Biovision.jsonAjaxRequest("post", component.url, component.processPost, null);
        const data = {
            "user_message": {
                "body": component.field.value
            }
        };

        component.button.disabled = true;
        request.send(JSON.stringify(data));
    },
    processPost: function () {
        const component = Socialization.components.messageSender;
        const response = JSON.parse(this.responseText);
        if (response.hasOwnProperty("data")) {
            component.addMessage(response.data, true);
            component.field.value = "";
        }
    },
    /**
     * Append or prepend message to list
     *
     * @param {Object} data
     * @param {boolean} append
     * @type {Function}
     */
    addMessage: function (data, append) {
        const component = Socialization.components.messageSender;
        if (data.hasOwnProperty("meta")) {
            const li = document.createElement("li");
            li.classList.add(data["meta"]["direction"]);
            li.innerHTML = data["meta"]["html"];
            if (append) {
                component.list.append(li);
            } else {
                component.list.prepend(li);
            }
        }
    },
    /**
     * @type {Function}
     */
    loadMessages: function () {
        const component = Socialization.components.messageSender;
        const url = component.loader.getAttribute("data-url");
        const request = Biovision.jsonAjaxRequest("get", url, component.processGet, null);
        component.loader.disabled = true;
        request.send();
    },
    processGet: function () {
        const component = Socialization.components.messageSender;
        const response = JSON.parse(this.responseText);
        if (response.hasOwnProperty("data")) {
            response["data"].forEach(function (data) {
                component.addMessage(data, false);
            });
            component.loader.disabled = false;
        }
        if (response.hasOwnProperty("links")) {
            if (response["links"].hasOwnProperty("next")) {
                component.loader.setAttribute("data-url", response["links"]["next"]);
            } else {
                component.loader.remove();
            }
        } else {
            component.loader.remove();
        }
    }
};

Socialization.components.messageCounter = {
    initialized: false,
    selector: "unread-message-count",
    container: undefined,
    init: function () {
        this.container = document.getElementById(this.selector);
        if (this.container && this.container.hasAttribute("data-url")) {
            this.process();
        }
        this.initialized = true;
    },
    process: function () {
        const url = this.container.getAttribute("data-url");
        const container = this.container;
        const request = Biovision.jsonAjaxRequest("get", url, function () {
            const response = JSON.parse(this.responseText);
            if (response.hasOwnProperty("meta")) {
                const messageCount = parseInt(response["meta"]["count"]);
                if (messageCount > 0) {
                    container.innerHTML = messageCount;
                }
            }
        });

        request.send();
    }
};

window.Socialization = Socialization;
Biovision.components.socialization = Socialization;

/**
 * Stretch videos inserted by WYSIWYG applying proportional-container
 *
 * @author Maxim Khan-Magomedov <maxim.km@gmail.com>
 * @type {Object}
 */
Biovision.components.videoStretcher = {
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
        const component = Biovision.components.videoStretcher;
        const figure = element.closest("figure.media");
        if (figure) {
            component.items.push(figure);
            figure.classList.add("proportional-container");
            figure.classList.add("r-16x9");
        }
    }
};

Biovision.components.simpleImageUploader = {
    selector: ".js-simple-image-upload",
    newImageSelector: ".js-new-image",
    selectImageSelector: ".js-select-image",
    changeSelector: ".js-change",
    buttons: [],
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.apply)
    },
    apply: function (element) {
        const component = Biovision.components.simpleImageUploader;
        const newImage = element.querySelector(component.newImageSelector);
        if (newImage) {
            component.buttons.push(newImage);
            newImage.addEventListener("click", component.handleClickNew);
        }
        const selectImage = element.querySelector(component.selectImageSelector);
        if (selectImage) {
            component.buttons.push(selectImage);
            selectImage.addEventListener("click", component.handleClickSelect);
        }
        const figure = element.querySelector("figure");
        const fileField = element.querySelector('input[type="file"]');
        fileField.dataset.image = figure.id;
        fileField.addEventListener("change", component.preview);
        const uploadButton = element.querySelector("button.upload");
        uploadButton.addEventListener("click", component.handleUpload);
        component.applyBrowser(element.querySelector(".browse-images"));
    },
    applyBrowser: function (container) {
        const component = Biovision.components.simpleImageUploader;
        const handler = component.updateImageList;
        container.querySelectorAll("button").forEach(e => e.addEventListener("click", handler));
        container.querySelector(".current").addEventListener("change", handler);
        container.querySelector(".filter").addEventListener("input", handler);
    },
    handleClickNew: function (event) {
        const component = Biovision.components.simpleImageUploader;
        const target = event.target;
        const container = target.closest(component.selector);
        component.showLoadImage(container);
    },
    showLoadImage: function (container) {
        container.querySelector(".load-image").classList.remove("hidden");
        container.querySelector(".browse-images").classList.add("hidden");
    },
    showBrowse: function (container) {
        container.querySelector(".load-image").classList.add("hidden");
        container.querySelector(".browse-images").classList.remove("hidden");
    },
    preview: function (event) {
        const input = event.target;

        if (input.matches('input[type=file]')) {
            Biovision.components.filePreview.handle(input);
            input.classList.add("changed");
        }
    },
    handleUpload: function (event) {
        const component = Biovision.components.simpleImageUploader;
        const button = event.target;
        const container = button.closest(".load-image");
        const file = container.querySelector("input");
        if (file.files.length > 0) {
            const url = button.closest(".js-change").dataset.url;
            const label = button.closest(component.selector).querySelector(".current-image");
            const form = new FormData();
            form.append("simple_image[image]", file.files[0]);
            ["caption", "image_alt_text", "source_name", "source_link"].forEach(function (key) {
                const field = container.querySelector(`[data-name="${key}"]`);
                if (field && field.value) {
                    form.append(`simple_image[${key}]`, field.value);
                }
            });
            const request = Biovision.newAjaxRequest("post", url, function () {
                const response = JSON.parse(this.responseText);
                if (response.hasOwnProperty("data")) {
                    const container = button.closest(component.selector);
                    const input = container.querySelector('input[type="hidden"]');
                    if (input) {
                        input.value = response.data.id;
                    }

                    if (label) {
                        label.classList.remove("progress");
                    }
                }

                container.classList.add("hidden");
            });

            if (label) {
                label.classList.add("progress");
                label.style.setProperty("--percent", 0);
                request.upload.addEventListener("progress", function (e) {
                    const percent = (e.loaded / e.total) * 100;

                    label.style.setProperty("--percent", `${percent}%`);
                });
            }

            button.disabled = true;
            request.send(form);
        }
    },
    handleClickSelect: function (event) {
        const component = Biovision.components.simpleImageUploader;
        const target = event.target;
        const container = target.closest(component.selector);
        component.showBrowse(container);

        const url = container.querySelector(".js-change").dataset.url;
        component.loadImages(container, url);
    },
    addPagination: function (container, links) {
        ["first", "prev", "next", "last"].forEach(function (type) {
            const url = links.hasOwnProperty(type) ? links[type] : '';
            const button = container.querySelector(`button.${type}`);
            button.dataset.url = url;
        });
        const current = container.querySelector(".current");
        current.value = new URL(links.self, location.origin).searchParams.get("page") || '1';
        current.max = new URL(links.last, location.origin).searchParams.get("page");
    },
    addImageList: function (container, data) {
        const component = Biovision.components.simpleImageUploader;
        const ul = container.querySelector("ul");
        ul.innerHTML = "";
        data.forEach(function (imageData) {
            if (imageData.hasOwnProperty("data")) {
                component.addImage(ul, imageData.data);
            }
        });
    },
    updateImageList: function (event) {
        const target = event.target;
        const component = Biovision.components.simpleImageUploader;
        const container = target.closest(component.selector);
        const section = target.closest(".js-change");
        const parameters = new URLSearchParams();
        let url;
        if (target.className.includes("current")) {
            parameters.set("page", target.value);
            const filter = section.querySelector(".filter");
            if (filter.value) {
                parameters.set("q", filter.value);
            }
            url = section.dataset.url + '?' + parameters.toString();
        } else if (target.className.includes("filter")) {
            parameters.set("q", target.value);
            url = section.dataset.url + '?' + parameters.toString();
        } else if (target.type === "button") {
            url = target.dataset.url;
        }
        component.loadImages(container, url);
    },
    loadImages: function (container, url) {
        const component = Biovision.components.simpleImageUploader;
        const request = Biovision.jsonAjaxRequest("get", url, function () {
            const response = JSON.parse(this.responseText);
            const section = container.querySelector(".browse-images");
            if (response.hasOwnProperty("links")) {
                component.addPagination(section, response.links);
            }
            if (response.hasOwnProperty("data")) {
                component.addImageList(section, response.data);
            }
        });
        request.send();
    },
    addImage: function (list, data) {
        const component = Biovision.components.simpleImageUploader;
        const li = document.createElement("li");
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("image");
        const image = document.createElement("img");
        image.src = data.meta.url.preview;
        image.dataset.url = data.meta.url.medium;
        image.dataset.id = data.id;
        image.addEventListener("click", component.selectImage);
        imageWrapper.append(image);
        const dataWrapper = document.createElement("div");
        dataWrapper.classList.add("data");
        component.addImageField(dataWrapper, data.meta.name, []);
        component.addImageField(dataWrapper, data.meta.size, ["info"]);
        component.addImageField(dataWrapper, data.meta.object_count, ["secondary", "info"]);
        ["caption", "image_alt_text"].forEach(function (key) {
            if (data.attributes[key]) {
                component.addImageField(dataWrapper, data.attributes[key], ["secondary", "info"]);
            }
        });
        li.append(imageWrapper);
        li.append(dataWrapper);
        list.append(li);
    },
    addImageField: function (wrapper, text, classes) {
        const div = document.createElement("div");
        if (classes) {
            classes.forEach(function (className) {
                div.classList.add(className);
            });
        }
        div.innerHTML = text;
        wrapper.append(div);
    },
    selectImage: function (event) {
        const component = Biovision.components.simpleImageUploader;
        const image = event.target;
        const container = image.closest(component.selector)
        const currentImage = container.querySelector(".current-image img");
        currentImage.src = image.dataset.url;
        const imageId = container.querySelector('input[type="hidden"]');
        imageId.value = image.dataset.id;
        container.querySelector(".browse-images").classList.add("hidden");
        container.querySelector(".load-image").classList.add("hidden");
    }
}

window.Biovision = Biovision;

document.addEventListener('DOMContentLoaded', function () {
    Biovision.init();

    document.addEventListener('click', function (event) {
        const element = event.target;

        // Запирание/отпирание сущности (иконка с замком)
        if (element.matches('li.lock > a img')) {
            event.preventDefault();

            const container = element.closest('li');
            const button = element.closest('a');
            const lockable = container.parentElement.querySelectorAll('.lockable');
            const url = container.getAttribute('data-url');

            if (url.length > 1) {
                const method = button.classList.contains('lock') ? 'PUT' : 'DELETE';

                const request = Biovision.newAjaxRequest(method, url, function () {
                    const response = JSON.parse(this.responseText);

                    if (response.hasOwnProperty('data') && response['data'].hasOwnProperty('locked')) {
                        const locked = response['data']['locked'];

                        if (locked) {
                            lockable.forEach(function (button) {
                                button.classList.add('hidden')
                            });
                        } else {
                            lockable.forEach(function (button) {
                                button.classList.remove('hidden')
                            });
                        }

                        container.querySelectorAll('a').forEach(function (button) {
                            const classes = button.classList;

                            if (classes.contains('lock')) {
                                locked ? classes.add('hidden') : classes.remove('hidden');
                            } else {
                                locked ? classes.remove('hidden') : classes.add('hidden');
                            }
                        });
                    }
                });

                request.send();
            }
        }

        // Переключение флагов сущности
        if (element.matches('div.toggleable > span')) {
            if (!element.classList.contains('switch')) {
                const url = element.parentNode.getAttribute('data-url');
                const parameter = element.getAttribute('data-flag');

                const onSuccess = function () {
                    const response = JSON.parse(this.responseText);

                    if (response.hasOwnProperty('data')) {
                        switch (response['data'][parameter]) {
                            case true:
                                element.className = 'active';
                                break;
                            case false:
                                element.className = 'inactive';
                                break;
                            default:
                                element.className = 'unknown';
                        }
                    } else {
                        element.className = 'unknown';
                    }
                };

                const onFailure = function () {
                    element.className = 'unknown';
                    Biovision.handleAjaxFailure().call(this);
                };

                const request = Biovision.newAjaxRequest('POST', url, onSuccess, onFailure);
                const data = new FormData();
                data.append('parameter', parameter);

                element.className = 'switch';

                request.send(data);
            }
        }

        // Изменение порядка сортировки элементов
        if (element.matches('li.priority-changer > button')) {
            const delta = parseInt(element.getAttribute('data-delta'));
            const url = element.parentNode.getAttribute('data-url');
            let item = element.closest('li[data-number]');

            if (parseInt(item.getAttribute('data-number')) + delta > 0) {
                const onSuccess = function () {
                    const response = JSON.parse(this.responseText);

                    if (response.hasOwnProperty('data')) {
                        const data = response.data;
                        const container = item.parentNode;
                        const list = Array.prototype.slice.call(container.children);

                        if (data.hasOwnProperty('priority')) {
                            item.setAttribute('data-number', data.priority);
                        } else {
                            for (let entity_id in data) {
                                if (data.hasOwnProperty(entity_id)) {
                                    item = container.querySelector('li[data-id="' + entity_id + '"]');
                                    item.setAttribute('data-number', data[entity_id]);
                                }
                            }
                        }

                        list.sort(function (a, b) {
                            let an = parseInt(a.getAttribute('data-number'));
                            let bn = parseInt(b.getAttribute('data-number'));

                            if (an > bn) {
                                return 1;
                            } else if (an < bn) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }).forEach(function (item) {
                            container.appendChild(item);
                        });
                    }
                };

                const request = Biovision.newAjaxRequest('POST', url, onSuccess);

                const data = new FormData();
                data.append('delta', String(delta));

                request.send(data);
            }
        }
    });
});

/**
 * Workaround for defective Safari behaviour with empty files
 * @see https://github.com/rails/rails/issues/32440
 */
document.addEventListener('ajax:beforeSend', function (e) {
    const formData = e.detail[1].data;

    if (!(formData instanceof FormData) || !formData.keys) {
        return;
    }

    const newFormData = new FormData();

    Array.from(formData.entries()).forEach(function (entry) {
        const value = entry[1];

        if (value instanceof window.File && value.name === '' && value.size === 0) {
            newFormData.append(entry[0], new window.Blob([]), '');
        } else {
            newFormData.append(entry[0], value);
        }
    });

    e.detail[1].data = newFormData
});
