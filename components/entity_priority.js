const EntityPriority = {
    id: "entityPriority",
    selector: ".priority-changer button",
    buttons: [],
    init: function () {
        this.applyToContainer(document);
    },
    applyToContainer: function (container) {
        container.querySelectorAll(this.selector).forEach(this.apply);
    },
    apply: function (element) {
        EntityPriority.buttons.push(element);
        element.addEventListener("click", EntityPriority.handleClick);
    },
    handleClick: function (event) {
        const element = event.target;
        const delta = parseInt(element.dataset.delta);
        const url = element.parentNode.dataset.url;
        let item = element.closest("li[data-number]");

        if (parseInt(item.dataset.number) + delta > 0) {
            const onSuccess = function () {
                const response = JSON.parse(this.responseText);

                if (response.hasOwnProperty("data")) {
                    const data = response.data;
                    const container = item.parentNode;
                    const list = Array.prototype.slice.call(container.children);

                    if (data.hasOwnProperty("priority")) {
                        item.dataset.number = data.priority;
                    } else {
                        for (let entity_id in data) {
                            if (data.hasOwnProperty(entity_id)) {
                                item = container.querySelector('li[data-id="' + entity_id + '"]');
                                item.dataset.number = data[entity_id];
                            }
                        }
                    }

                    list.sort(function (a, b) {
                        let an = parseInt(a.dataset.number);
                        let bn = parseInt(b.dataset.number);

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

            const request = Biovision.newAjaxRequest("POST", url, onSuccess);

            const data = new FormData();
            data.append("delta", String(delta));

            request.send(data);
        }
    }
}

export default EntityPriority;
