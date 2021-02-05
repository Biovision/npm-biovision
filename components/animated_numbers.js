const AnimatedNumbers = {
    id: "animatedNumbers",
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
            AnimatedNumbers.addItem(container, value);
        });
        AnimatedNumbers.containers.push(container);
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
        AnimatedNumbers.containers.forEach(function (container) {
            if (container.animated) {
                return;
            }

            const box = container.element.getBoundingClientRect();

            if (box.y < window.innerHeight / 1.75) {
                AnimatedNumbers.animate(container);
            }
        });
    },
    animate: function (container) {
        container.items.forEach(function (item) {
            AnimatedNumbers.increment(item, container.stepCount)
        });
        container.animated = true;
    },
    increment: function (item, stepCount) {
        if (item.stepNumber < stepCount) {
            item.stepNumber++;
            item.element.innerHTML = Math.min(Math.ceil(item.initialValue / stepCount * item.stepNumber), item.initialValue);

            window.setTimeout(AnimatedNumbers.increment, 50, item, stepCount);
        }
    }
};

export default AnimatedNumbers;
