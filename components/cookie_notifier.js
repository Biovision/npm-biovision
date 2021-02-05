const CookieNotifier = {
    id: "cookieNotifier",
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
        const date = new Date();
        date.setTime(date.getTime() + 31536000000);
        document.cookie = "f=1;path=/;expires=" + date.toUTCString();
        CookieNotifier.container.remove();
    }
};

export default CookieNotifier;
