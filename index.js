import LoginForm from "./components/login_form";
import InstantCheck from "./components/instant_check";
import Forms from "./components/forms";
import TopLinker from "./components/top_linker";
import FilePreview from "./components/file_preview";
import EntityLinker from "./components/entity_linker";
import Transliterator from "./components/transliterator";
import FormStatus from "./components/form_status";
import AutoExpand from "./components/auto_expand";
import EntityImageRemover from "./components/entity_image_remover";
import ImageRemover from "./components/image_remover";
import AjaxDeleteButton from "./components/ajax_delete_button";
import Storage from "./components/storage";
import UserSearch from "./components/user_search";
import DestroyButton from "./components/destroy_button";
import AdminUserSearch from "./components/admin_user_search";
import UserPrivilege from "./components/user_privilege";
import HidingPopups from "./components/hiding_popups";
import ComponentParameters from "./components/component_parameters";
import NewComponentParameter from "./components/new_component_parameter";
import CookieNotifier from "./components/cookie_notifier";
import AnimatedNumbers from "./components/animated_numbers";
import Carousel from "./components/carousel";
import Notifications from "./components/notifications";
import Oembed from "./components/oembed";
import Socialization from "./components/socialization";
import VideoStretcher from "./components/video_stretcher";
import SimpleImageUploader from "./components/simple_image_uploader";

const Biovision = {
    locale: "",
    csrfToken: "",
    components: {
        loginForm: LoginForm,
        instantCheck: InstantCheck,
        forms: Forms,
        topLinker: TopLinker,
        filePreview: FilePreview,
        entityLinker: EntityLinker,
        transliterator: Transliterator,
        formStatus: FormStatus,
        autoExpand: AutoExpand,
        entityImageRemover: EntityImageRemover,
        imageRemover: ImageRemover,
        ajaxDeleteButton: AjaxDeleteButton,
        storage: Storage,
        destroyButton: DestroyButton,
        userSearch: UserSearch,
        adminUserSearch: AdminUserSearch,
        userPrivilege: UserPrivilege,
        hidingPopups: HidingPopups,
        componentParameters: ComponentParameters,
        newComponentParameter: NewComponentParameter,
        cookieNotifier: CookieNotifier,
        animatedNumbers: AnimatedNumbers,
        carousel: Carousel,
        notifications: Notifications,
        oembed: Oembed,
        socialization: Socialization,
        videoStretcher: VideoStretcher,
        simpleImageUploader: SimpleImageUploader
    },
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
