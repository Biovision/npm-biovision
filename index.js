import LoginForm from "./components/login_form";
import InstantCheck from "./components/instant_check";
import Forms from "./components/forms";
import FilePreview from "./components/file_preview";
import EntityLinker from "./components/entity_linker";
import EntityListWithSearch from "./components/entity_list_with_search";
import EntityPriority from "./components/entity_priority";
import Transliterator from "./components/transliterator";
import FormStatus from "./components/form_status";
import AjaxDeleteButton from "./components/ajax_delete_button";
import UserSearch from "./components/user_search";
import DestroyButton from "./components/destroy_button";
import AdminUserSearch from "./components/admin_user_search";
import UserPrivilege from "./components/user_privilege";
import ComponentParameters from "./components/component_parameters";
import NewComponentParameter from "./components/new_component_parameter";
import Notifications from "./components/notifications";
import QuickSearch from "./components/quick_search";
import Socialization from "./components/socialization";
import SimpleImageUploader from "./components/simple_image_uploader";
import SearchableList from "./components/searchable_list";

// topLinker, autoExpand, entityImageRemover, imageRemover, Storage,
// hidingPopups, cookieNotifier, carousel, animatedNumbers, oembed,
// videoStretcher

const Biovision = {
    locale: "",
    csrfToken: "",
    components: {},
    componentQueue: [],
    init: function () {
        this.locale = document.querySelector("html").getAttribute("lang");
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            this.csrfToken = metaToken.getAttribute("content");
        }

        const defaultComponents = [
            LoginForm, InstantCheck, Forms, FilePreview, EntityLinker,
            EntityListWithSearch, EntityPriority, Transliterator, FormStatus,
            AjaxDeleteButton, DestroyButton, UserSearch, AdminUserSearch,
            UserPrivilege, ComponentParameters, NewComponentParameter,
            Notifications, QuickSearch, Socialization, SimpleImageUploader,
            SearchableList
        ];

        defaultComponents.forEach(component => Biovision.loadComponent(component));

        let component;
        while (component = this.componentQueue.shift()) {
            this.loadComponent(component);
        }
    },
    /**
     * Add component to list
     *
     * @param {Object} component
     */
    loadComponent: function (component) {
        if (component.hasOwnProperty("id")) {
            Biovision.components[component.id] = component;
            if (component.hasOwnProperty("init")) {
                component.init();
            }

            if (component.hasOwnProperty("autoInitComponents")) {
                if (component.autoInitComponents) {
                    Biovision.initChildComponents(component);
                }
            }
        } else {
            console.warn("Component has no id");
        }
    },
    addComponent: function (component) {
        Biovision.componentQueue.push(component);
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
        console.warn("AJAX failed", this);
    },
    execute: function (name, context) {
        const args = Array.prototype.slice.call(arguments, 2);
        const namespaces = name.split(".");
        const func = namespaces.pop();
        for (let i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }

        return context[func].apply(context, args);
    },
    fetchJson: async function (method, url, data = {}, headers = {}) {
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
        headers["X-CSRF-Token"] = Biovision.csrfToken;

        const options = {
            body: JSON.stringify(data),
            headers: headers,
            method: method
        }
        const response = await fetch(url, options);

        return await response.json();
    }
};

window.Biovision = Biovision;

document.addEventListener('DOMContentLoaded', function () {
    Biovision.init();

    document.addEventListener('click', function (event) {
        const element = event.target;

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
