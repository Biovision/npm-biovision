/**
 * Handler for AJAX authentication with login form
 *
 * Component: Users.
 *
 * @type {Object}
 */
const LoginForm = {
    /**
     * Form id (HTML attribute)
     *
     * @type {String}
     */
    selector: "login-form",
    /**
     * Form object
     *
     * @type {HTMLFormElement|HTMLElement}
     */
    form: undefined,
    /**
     * Submit button
     *
     * @type {HTMLButtonElement}
     */
    button: undefined,
    /**
     * Container for displaying errors
     *
     * @type {HTMLDivElement}
     */
    errors: undefined,
    init: function () {
        this.form = document.getElementById(this.selector);
        if (this.form) {
            const handler = this.handleSubmit;
            this.form.addEventListener("submit", handler);
            this.button = this.form.querySelector("button");
            this.errors = this.form.querySelector(".errors");
        }
    },
    /**
     * Handler for submitting form
     *
     * Performs AJAX request and handles responses
     *
     * @param {Event} event
     */
    handleSubmit: function (event) {
        event.preventDefault();
        const data = new FormData(LoginForm.form);
        const url = LoginForm.form.action;
        const request = Biovision.newAjaxRequest("post", url, LoginForm.success, LoginForm.failure);
        LoginForm.button.disabled = true;
        request.send(data);
    },
    /**
     * Handler for successful authentication
     */
    success: function () {
        const response = JSON.parse(this.responseText);
        if (response.hasOwnProperty("links")) {
            const links = response.links;
            if (links.hasOwnProperty("next")) {
                document.location.href = links.next;
            } else {
                document.location.href = "/";
            }
        } else {
            LoginForm.button.disabled = false;
        }
    },
    /**
     * Handler for failed authentication
     */
    failure: function () {
        const response = JSON.parse(this.responseText);
        if (response.hasOwnProperty("errors")) {
            LoginForm.clearErrors();
            response.errors.forEach(LoginForm.showError);
        }
        LoginForm.button.disabled = false;
    },
    clearErrors: function () {
        if (LoginForm.errors) {
            LoginForm.errors.innerHTML = "";
        }
    },
    /**
     * Append error to container
     *
     * @param {Object} data
     */
    showError: function (data) {
        if (data.hasOwnProperty("title")) {
            const div = document.createElement("div");
            div.classList.add("message-box", "error");
            div.innerHTML = data.title;
            if (LoginForm.errors) {
                LoginForm.errors.append(div);
            } else {
                console.log(data.title);
            }
        }
    }
}

export default LoginForm;
