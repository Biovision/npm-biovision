const SimpleImageUploader = {
    id: "simpleImageUploader",
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

export default SimpleImageUploader;
