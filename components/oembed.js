const Oembed = {
    id: "oembed",
    initialized: false,
    selector: "oembed",
    init: function () {
        document.querySelectorAll(this.selector).forEach(this.replace);
        this.initialized = true;
    },
    replace: function (element) {
        const url = element.getAttribute("url");
        if (url) {
            const replacement = Oembed.receive(url);

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
        const query = Biovision.jsonAjaxRequest("post", url, function () {
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
                        if (remoteUrl.includes("youtu")) {
                            div.classList.add("proportional-container", "r-16x9")
                        }
                        div.append(element);
                    }
                });
            }
        });
        query.send();

        return div;
    }
}

export default Oembed;
