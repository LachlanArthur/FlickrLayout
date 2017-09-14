class FlickrLayout {
    constructor(element, settings = {}) {
        this.element = element;
        this.maxRowHeight = 200;
        this.gutter = 20;
        this.expandLastRow = true;
        this.debug = false;
        Object.assign(this, settings);
        this.findItems();
        this.imageLoadHooks();
        this.layout();
        this.clearFix();
        window.addEventListener('FlickrLayoutResize', (e) => {
            this.layout();
        });
    }
    log(...args) {
        if (this.debug) {
            console.log.apply(console, args);
        }
    }
    layout() {
        if (this.debug) {
            console.groupCollapsed('FlickrLayout - Recomputing Layout...');
        }
        if (this.debug) {
            console.groupCollapsed('Item Sizes');
            console.table(this.items.map(item => { let { width, height } = item; return { width, height }; }));
            console.groupEnd();
        }
        Object.assign(this.element.style, {
            marginLeft: `-${this.gutter}px`,
        });
        this.width = this.element.clientWidth - this.gutter;
        this.log('Container Width: %fpx', this.width);
        this.log('Starting Height: %fpx', this.maxRowHeight);
        this.log('Gutter: %fpx', this.gutter);
        let lastRow = this.items.reduce((row, item, index) => {
            row.push(item);
            const rowWidth = row.getImagesTotalWidth();
            this.log('Adding image #%d to row. Image width: %dpx. Row width: %dpx.', index, item.getWidthByHeight(this.maxRowHeight), rowWidth);
            Object.assign(item.element.style, {
                float: 'left',
                marginLeft: `${this.gutter}px`,
                marginBottom: `${this.gutter}px`,
            });
            if (rowWidth < this.width) {
                return row;
            }
            this.log('Overlapped container width.');
            row.fitWidth();
            this.log('Starting new row...');
            return new FlickrLayoutRow([], this);
        }, new FlickrLayoutRow([], this));
        if (this.expandLastRow) {
            this.log('Fitting last row');
            lastRow.fitWidth();
        }
        else {
            lastRow.fitHeight();
        }
        if (this.debug) {
            console.groupEnd();
        }
    }
    findItems() {
        let items = Array.from(this.element.children);
        this.items = items.map(item => new FlickrLayoutItem(item));
    }
    imageLoadHooks() {
        this.items.forEach(item => item.onload(this.layout.bind(this)));
    }
    clearFix() {
        const clearFix = document.createElement('br');
        clearFix.style.clear = 'both';
        this.element.appendChild(clearFix);
    }
    static init() {
        this.throttledResizeEvents();
        this.jQueryPlugin();
    }
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    static throttledResizeEvents() {
        const throttle = (type, name, obj = window) => {
            let running = false;
            const func = () => {
                if (running) {
                    return;
                }
                running = true;
                requestAnimationFrame(() => {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };
            obj.addEventListener(type, func);
        };
        throttle('resize', 'FlickrLayoutResize');
    }
    static jQueryPlugin() {
        const $ = window.jQuery;
        if (typeof $ !== 'undefined') {
            $.fn.flickrLayout = function (settings) {
                if (typeof settings === 'string') {
                    this.each((index, container) => {
                        const instance = $(container).data('FlickrLayout');
                        switch (settings) {
                            case 'layout':
                            /* falls through */
                            default:
                                instance.layout();
                                break;
                        }
                    });
                }
                else {
                    this.each((index, container) => {
                        $(container).data('FlickrLayout', new FlickrLayout(container, settings));
                    });
                }
                return this;
            };
        }
    }
}
class FlickrLayoutItem {
    constructor(element) {
        this.element = element;
        if (this.element.tagName === 'IMG') {
            this.isImg = true;
            this.img = this.element;
        }
        else {
            this.isImg = false;
            this.img = this.element.querySelector('img');
        }
    }
    onload(callback) {
        this.img.addEventListener('load', e => {
            this.width = this.img.width;
            this.height = this.img.height;
            callback();
        });
        // Image was already loaded
        if (this.img.complete) {
            this.img.dispatchEvent(new CustomEvent('load'));
        }
    }
    getWidthByHeight(newHeight) {
        return (this.width / this.height) * newHeight;
    }
    getHeightByWidth(newWidth) {
        return (this.height / this.width) * newWidth;
    }
    setScale(height, scale = 1) {
        let width = this.getWidthByHeight(height);
        width *= scale;
        height *= scale;
        this.setSize(width, height);
    }
    setSize(width, height) {
        Object.assign(this.element.style, {
            width: `${width}px`,
            height: `${height}px`,
        });
        if (!this.isImg) {
            Object.assign(this.img.style, {
                display: 'block',
                width: '100%',
            });
        }
    }
}
class FlickrLayoutRow {
    constructor(items, layout) {
        this.items = items;
        this.layout = layout;
    }
    push(item) {
        this.items.push(item);
    }
    fitWidth() {
        this.layout.log('Scaling images in row.');
        const totalGutters = this.getGutterTotal();
        this.layout.log('Container Width: %fpx', this.layout.width);
        this.layout.log('Total widths of images in row: %fpx', this.getImagesTotalWidth());
        this.layout.log('Total gutters in row: %fpx', totalGutters);
        const rowScaleFactor = (this.layout.width - totalGutters) / (this.getImagesTotalWidth() - totalGutters);
        this.layout.log('Row scale factor: %f%%', rowScaleFactor * 100);
        this.items.forEach(item => item.setScale(this.layout.maxRowHeight, rowScaleFactor));
    }
    fitHeight() {
        this.items.forEach(item => item.setScale(this.layout.maxRowHeight));
    }
    getImagesTotalWidth() {
        return this.items.reduce((width, item) => width + item.getWidthByHeight(this.layout.maxRowHeight), 0) + this.getGutterTotal();
    }
    getGutterTotal() {
        return (this.count() - 1) * this.layout.gutter;
    }
    count() {
        return this.items.length;
    }
}
FlickrLayout.init();
//# sourceMappingURL=flickr-layout.js.map