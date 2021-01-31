const Transliterator = {
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
        Transliterator.elements.push(element);
        element.addEventListener('blur', Transliterator.handler);
    },
    /**
     *
     * @param {Event} event
     */
    handler: function (event) {
        const element = event.target;
        const target = document.getElementById(element.getAttribute('data-transliterate'));

        if (target && target.value === '') {
            target.value = Transliterator.transliterate(element.value);
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

export default Transliterator;
