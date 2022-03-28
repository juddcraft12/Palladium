if (!self.__palladium) {
    __palladiumHook(self, self.__palladium$config, self.__palladium$config.bare);
};

async function __palladiumHook(window, config = {}, bare = '/bare/') {
    if ('__palladium' in window && window.__palladium instanceof Palladiumdev) return false;

    if (window.document && !!window.window) {
        window.document.querySelectorAll("script[__palladium-script]").forEach(node => node.remove())
    };

    const worker = !window.window;
    const master = '__palladium';
    const methodPrefix = '__palladium$';
    const __palladium = new Palladiumdev({
        ...config,
        window,
    });

    if (typeof config.construct === 'function') {
        config.construct(__palladium, worker ? 'worker' : 'window');
    };

    const { client } = __palladium;
    const {
        HTMLMediaElement,
        HTMLScriptElement,
        HTMLAudioElement,
        HTMLVideoElement,
        HTMLInputElement,
        HTMLEmbedElement,
        HTMLTrackElement,
        HTMLAnchorElement,
        HTMLIFrameElement,
        HTMLAreaElement,
        HTMLLinkElement,
        HTMLBaseElement,
        HTMLFormElement,
        HTMLImageElement,
        HTMLSourceElement,
    } = window;

    client.nativeMethods.defineProperty(window, '__palladium', {
        value: __palladium,
        enumerable: false,
    });


    __palladium.meta.origin = location.origin;
    __palladium.location = client.location.emulate(
        (href) => {
            if (href === 'about:srcdoc') return new URL(href);
            if (href.startsWith('blob:')) href = href.slice('blob:'.length);
            return new URL(__palladium.sourceUrl(href));
        },
        (href) => {
            return __palladium.rewriteUrl(href);
        },
    );

    __palladium.cookieStr = window.__palladium$cookies || '';
    __palladium.meta.url = __palladium.location;
    __palladium.domain = __palladium.meta.url.host;
    __palladium.blobUrls = new window.Map();
    __palladium.referrer = '';
    __palladium.cookies = [];
    __palladium.localStorageObj = {};
    __palladium.sessionStorageObj = {};

    try {
        __palladium.bare = new URL(bare, window.location.href);
    } catch(e) {
        __palladium.bare = window.parent.__palladium.bare;
    };

    if (__palladium.location.href === 'about:srcdoc') {
        __palladium.meta = window.parent.__palladium.meta;
    };

    if (window.EventTarget) {
        __palladium.addEventListener = window.EventTarget.prototype.addEventListener;
        __palladium.removeListener = window.EventTarget.prototype.removeListener;
        __palladium.dispatchEvent = window.EventTarget.prototype.dispatchEvent;
    };

    // Storage wrappers
    client.nativeMethods.defineProperty(client.storage.storeProto, '__palladium$storageObj', {
        get() {
            if (this === client.storage.sessionStorage) return __palladium.sessionStorageObj;
            if (this === client.storage.localStorage) return __palladium.localStorageObj;
        },
        enumerable: false,
    });

    if (window.localStorage) {
        for (const key in window.localStorage) {
            if (key.startsWith(methodPrefix + __palladium.location.origin + '@')) {
                __palladium.localStorageObj[key.slice((methodPrefix + __palladium.location.origin + '@').length)] = window.localStorage.getItem(key);
            };
        };

        __palladium.lsWrap = client.storage.emulate(client.storage.localStorage, __palladium.localStorageObj);
    };

    if (window.sessionStorage) {
        for (const key in window.sessionStorage) {
            if (key.startsWith(methodPrefix + __palladium.location.origin + '@')) {
                __palladium.sessionStorageObj[key.slice((methodPrefix + __palladium.location.origin + '@').length)] = window.sessionStorage.getItem(key);
            };
        };

        __palladium.ssWrap = client.storage.emulate(client.storage.sessionStorage, __palladium.sessionStorageObj);
    };



    let rawBase = window.document ? client.node.baseURI.get.call(window.document) : window.location.href;
    let base = __palladium.sourceUrl(rawBase);

    client.nativeMethods.defineProperty(__palladium.meta, 'base', {
        get() {
            if (!window.document) return __palladium.meta.url.href;

            if (client.node.baseURI.get.call(window.document) !== rawBase) {
                rawBase = client.node.baseURI.get.call(window.document);
                base = __palladium.sourceUrl(rawBase);
            };

            return base;
        },
    });


    __palladium.methods = {
        setSource: methodPrefix + 'setSource',
        source: methodPrefix + 'source',
        location: methodPrefix + 'location',
        function: methodPrefix + 'function',
        string: methodPrefix + 'string',
        eval: methodPrefix + 'eval',
        parent: methodPrefix + 'parent',
        top: methodPrefix + 'top',
    };

    __palladium.filterKeys = [
        master,
        __palladium.methods.setSource,
        __palladium.methods.source,
        __palladium.methods.location,
        __palladium.methods.function,
        __palladium.methods.string,
        __palladium.methods.eval,
        __palladium.methods.parent,
        __palladium.methods.top,
        methodPrefix + 'protocol',
        methodPrefix + 'storageObj',
        methodPrefix + 'url',
        methodPrefix + 'modifiedStyle',
        methodPrefix + 'config',
        methodPrefix + 'dispatched',
        'Palladiumdev',
        '__palladiumHook',
    ];


    client.on('wrap', (target, wrapped) => {
        client.nativeMethods.defineProperty(wrapped, 'name', client.nativeMethods.getOwnPropertyDescriptor(target, 'name'));
        client.nativeMethods.defineProperty(wrapped, 'length', client.nativeMethods.getOwnPropertyDescriptor(target, 'length'));

        client.nativeMethods.defineProperty(wrapped, __palladium.methods.string, {
            enumerable: false,
            value: client.nativeMethods.fnToString.call(target),
        });

        client.nativeMethods.defineProperty(wrapped, __palladium.methods.function, {
            enumerable: false,
            value: target,
        });
    });

    client.fetch.on('request', event => {
        event.data.input = __palladium.rewriteUrl(event.data.input);
    });

    client.fetch.on('requestUrl', event => {
        event.data.value = __palladium.sourceUrl(event.data.value);
    });

    client.fetch.on('responseUrl', event => {
        event.data.value = __palladium.sourceUrl(event.data.value);
    });

    // XMLHttpRequest
    client.xhr.on('open', event => {
        event.data.input = __palladium.rewriteUrl(event.data.input);
    });

    client.xhr.on('responseUrl', event => {
        event.data.value = __palladium.sourceUrl(event.data.value);
    });


    // Workers
    client.workers.on('worker', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });

    client.workers.on('addModule', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });

    client.workers.on('importScripts', event => {
        for (const i in event.data.scripts) {
            event.data.scripts[i] = __palladium.rewriteUrl(event.data.scripts[i]);
        };
    });

    client.workers.on('postMessage', event => {
        let to = event.data.origin;

        event.data.origin = '*';
        event.data.message = {
            __data: event.data.message,
            __origin: __palladium.meta.url.origin,
            __to: to,
        };
    });

    // Navigator
    client.navigator.on('sendBeacon', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });

    // Cookies
    client.document.on('getCookie', event => {
        event.data.value = __palladium.cookieStr;
    });

    client.document.on('setCookie', event => {
        Promise.resolve(__palladium.cookie.setCookies(event.data.value, __palladium.db, __palladium.meta)).then(() => {
            __palladium.cookie.db().then(db => {
                __palladium.cookie.getCookies(db).then(cookies => {
                    __palladium.cookieStr = __palladium.cookie.serialize(cookies, __palladium.meta, true);
                });
            });
        });
        const cookie = __palladium.cookie.setCookie(event.data.value)[0];

        if (!cookie.path) cookie.path = '/';
        if (!cookie.domain) cookie.domain = __palladium.meta.url.hostname;

        if (__palladium.cookie.validateCookie(cookie, __palladium.meta, true)) {
            if (__palladium.cookieStr.length) __palladium.cookieStr += '; ';
            __palladium.cookieStr += `${cookie.name}=${cookie.value}`;
        };

        event.respondWith(event.data.value);
    });

    // HTML
    client.element.on('setInnerHTML', event => {
        switch (event.that.tagName) {
            case 'SCRIPT':
                event.data.value = __palladium.js.rewrite(event.data.value);
                break;
            case 'STYLE':
                event.data.value = __palladium.rewriteCSS(event.data.value);
                break;
            default:
                event.data.value = __palladium.rewriteHtml(event.data.value);
        };
    });

    client.element.on('getInnerHTML', event => {
        switch (event.that.tagName) {
            case 'SCRIPT':
                event.data.value = __palladium.js.source(event.data.value);
                break;
            default:
                event.data.value = __palladium.sourceHtml(event.data.value);
        };
    });

    client.element.on('setOuterHTML', event => {
        event.data.value = __palladium.rewriteHtml(event.data.value, { document: event.that.tagName === 'HTML' });
    });

    client.element.on('getOuterHTML', event => {
        switch (event.that.tagName) {
            case 'HEAD':
                event.data.value = __palladium.sourceHtml(
                    event.data.value.replace(/<head(.*)>(.*)<\/head>/s, '<op-head$1>$2</op-head>')
                ).replace(/<op-head(.*)>(.*)<\/op-head>/s, '<head$1>$2</head>');
                break;
            case 'BODY':
                event.data.value = __palladium.sourceHtml(
                    event.data.value.replace(/<body(.*)>(.*)<\/body>/s, '<op-body$1>$2</op-body>')
                ).replace(/<op-body(.*)>(.*)<\/op-body>/s, '<body$1>$2</body>');
                break;
            default:
                event.data.value = __palladium.sourceHtml(event.data.value, { document: event.that.tagName === 'HTML' });
                break;
        };

        //event.data.value = __palladium.sourceHtml(event.data.value, { document: event.that.tagName === 'HTML' });
    });

    client.document.on('write', event => {
        if (!event.data.html.length) return false;
        event.data.html = [__palladium.rewriteHtml(event.data.html.join(''))];
    });

    client.document.on('writeln', event => {
        if (!event.data.html.length) return false;
        event.data.html = [__palladium.rewriteHtml(event.data.html.join(''))];
    });

    client.element.on('insertAdjacentHTML', event => {
        event.data.html = __palladium.rewriteHtml(event.data.html);
    });

    // EventSource

    client.eventSource.on('construct', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });


    client.eventSource.on('url', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });

    // History
    client.history.on('replaceState', event => {
        if (event.data.url) event.data.url = __palladium.rewriteUrl(event.data.url, '__palladium' in event.that ? event.that.__palladium.meta : __palladium.meta);
    });
    client.history.on('pushState', event => {
        if (event.data.url) event.data.url = __palladium.rewriteUrl(event.data.url, '__palladium' in event.that ? event.that.__palladium.meta : __palladium.meta);
    });

    // Element get set attribute methods
    client.element.on('getAttribute', event => {
        if (client.element.hasAttribute.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name)) {
            event.respondWith(
                event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name)
            );
        };
    });

    // Message
    client.message.on('postMessage', event => {
        let to = event.data.origin;
        let call = __palladium.call;


        if (event.that) {
            call = event.that.__palladium$source.call;
        };

        event.data.origin = '*';
        event.data.message = {
            __data: event.data.message,
            __origin: (event.that || event.target).__palladium$source.location.origin,
            __to: to,
        };

        event.respondWith(
            worker ?
            call(event.target, [event.data.message, event.data.transfer], event.that) :
            call(event.target, [event.data.message, event.data.origin, event.data.transfer], event.that)
        );

    });

    client.message.on('data', event => {
        const { value: data } = event.data;
        if (typeof data === 'object' && '__data' in data && '__origin' in data) {
            event.respondWith(data.__data);
        };
    });

    client.message.on('origin', event => {
        const data = client.message.messageData.get.call(event.that);
        if (typeof data === 'object' && data.__data && data.__origin) {
            event.respondWith(data.__origin);
        };
    });

    client.overrideDescriptor(window, 'origin', {
        get: (target, that) => {
            return __palladium.location.origin;
        },
    });

    client.node.on('baseURI', event => {
        if (event.data.value.startsWith(window.location.origin)) event.data.value = __palladium.sourceUrl(event.data.value);
    });

    client.element.on('setAttribute', event => {
        if (event.that instanceof HTMLMediaElement && event.data.name === 'src' && event.data.value.startsWith('blob:')) {
            event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.blobUrls.get(event.data.value);
            return;
        };

        if (__palladium.attrs.isUrl(event.data.name)) {
            event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteUrl(event.data.value);
        };

        if (__palladium.attrs.isStyle(event.data.name)) {
            event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteCSS(event.data.value, { context: 'declarationList' });
        };

        if (__palladium.attrs.isHtml(event.data.name)) {
            event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteHtml(event.data.value, {...__palladium.meta, document: true, injectHead:__palladium.createHtmlInject(__palladium.handlerScript, __palladium.bundleScript, __palladium.configScript, __palladium.cookieStr, window.location.href) });
        };

        if (__palladium.attrs.isSrcset(event.data.name)) {
            event.target.call(event.that, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.html.wrapSrcset(event.data.value);
        };

        if (__palladium.attrs.isForbidden(event.data.name)) {
            event.data.name = __palladium.attributePrefix + '-attr-' + event.data.name;
        };
    });

    client.element.on('audio', event => {
        event.data.url = __palladium.rewriteUrl(event.data.url);
    });

    // Element Property Attributes
    client.element.hookProperty([HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement, HTMLBaseElement], 'href', {
        get: (target, that) => {
            return __palladium.sourceUrl(
                target.call(that)
            );
        },
        set: (target, that, [val]) => {
            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-href', val)
            target.call(that, __palladium.rewriteUrl(val));
        },
    }); 

    client.element.hookProperty([HTMLScriptElement, HTMLAudioElement, HTMLVideoElement,  HTMLMediaElement, HTMLImageElement, HTMLInputElement, HTMLEmbedElement, HTMLIFrameElement, HTMLTrackElement, HTMLSourceElement], 'src', {
        get: (target, that) => {
            return __palladium.sourceUrl(
                target.call(that)
            );
        },
        set: (target, that, [val]) => {
            if (new String(val).toString().trim().startsWith('blob:') && that instanceof HTMLMediaElement) {
                client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-src', val)
                return target.call(that, __palladium.blobUrls.get(val) || val);
            };

            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-src', val)
            target.call(that, __palladium.rewriteUrl(val));
        },
    });

    client.element.hookProperty([HTMLFormElement], 'action', {
        get: (target, that) => {
            return __palladium.sourceUrl(
                target.call(that)
            );
        },
        set: (target, that, [val]) => {
            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-action', val)
            target.call(that, __palladium.rewriteUrl(val));
        },
    });

    client.element.hookProperty([HTMLImageElement], 'srcset', {
        get: (target, that) => {
            return client.element.getAttribute.call(that, __palladium.attributePrefix + '-attr-srcset') || target.call(that);
        },
        set: (target, that, [val]) => {
            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-srcset', val)
            target.call(that, __palladium.html.wrapSrcset(val));
        },
    });

    client.element.hookProperty(HTMLScriptElement, 'integrity', {
        get: (target, that) => {
            return client.element.getAttribute.call(that, __palladium.attributePrefix + '-attr-integrity');
        },
        set: (target, that, [val]) => {
            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-integrity', val);
        },
    });

    client.element.hookProperty(HTMLIFrameElement, 'sandbox', {
        get: (target, that) => {
            return client.element.getAttribute.call(that, __palladium.attributePrefix + '-attr-sandbox') || target.call(that);
        },
        set: (target, that, [val]) => {
            client.element.setAttribute.call(that, __palladium.attributePrefix + '-attr-sandbox', val);
        },
    });

    client.element.hookProperty(HTMLIFrameElement, 'contentWindow', {
        get: (target, that) => {
            const win = target.call(that);
            try {
                if (!win.__palladium) __palladiumHook(win, config, bare);
                return win;
            } catch (e) {
                return win;
            };
        },
    });

    client.element.hookProperty(HTMLIFrameElement, 'contentDocument', {
        get: (target, that) => {
            const doc = target.call(that);
            try {
                const win = doc.defaultView
                if (!win.__palladium) __palladiumHook(win, config, bare);
                return doc;
            } catch (e) {
                return win;
            };
        },
    });

    client.element.hookProperty(HTMLIFrameElement, 'srcdoc', {
        get: (target, that) => {
            return client.element.getAttribute.call(that, __palladium.attributePrefix + '-attr-srcdoc') || target.call(that);
        },
        set: (target, that, [val]) => {
            target.call(that, __palladium.rewriteHtml(val, {
                document: true,
                injectHead: __palladium.createHtmlInject(__palladium.handlerScript, __palladium.bundleScript, __palladium.configScript, __palladium.cookieStr, window.location.href)
            }))
        },
    });

    client.node.on('getTextContent', event => {
        if (event.that.tagName === 'SCRIPT') {
            event.data.value = __palladium.js.source(event.data.value);
        };
    });

    client.node.on('setTextContent', event => {
        if (event.that.tagName === 'SCRIPT') {
            event.data.value = __palladium.js.rewrite(event.data.value);
        };
    });

    // Until proper rewriting is implemented for service workers.
    // Not sure atm how to implement it with the already built in service worker
    if ('serviceWorker' in window.navigator) {
        delete window.Navigator.prototype.serviceWorker;
    };

    // Document
    client.document.on('getDomain', event => {
        event.data.value = __palladium.domain;
    });
    client.document.on('setDomain', event => {
        if (!event.data.value.toString().endsWith(__palladium.meta.url.hostname.split('.').slice(-2).join('.'))) return event.respondWith('');
        event.respondWith(__palladium.domain = event.data.value);
    })

    client.document.on('url', event => {
        event.data.value = __palladium.location.href;
    });

    client.document.on('documentURI', event => {
        event.data.value = __palladium.location.href;
    });

    client.document.on('referrer', event => {
        event.data.value = __palladium.referrer || __palladium.sourceUrl(event.data.value);
    });

    client.document.on('parseFromString', event => {
        if (event.data.type !== 'text/html') return false;
        event.data.string = __palladium.rewriteHtml(event.data.string, {...__palladium.meta, document: true, });
    });

    // Attribute (node.attributes)
    client.attribute.on('getValue', event => {
        if (client.element.hasAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name)) {
            event.data.value = client.element.getAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name);
        };
    });

    client.attribute.on('setValue', event => {
        if (__palladium.attrs.isUrl(event.data.name)) {
            client.element.setAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteUrl(event.data.value);
        };

        if (__palladium.attrs.isStyle(event.data.name)) {
            client.element.setAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteCSS(event.data.value, { context: 'declarationList' });
        };

        if (__palladium.attrs.isHtml(event.data.name)) {
            client.element.setAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.rewriteHtml(event.data.value, {...__palladium.meta, document: true, injectHead:__palladium.createHtmlInject(__palladium.handlerScript, __palladium.bundleScript, __palladium.configScript, __palladium.cookieStr, window.location.href) });
        };

        if (__palladium.attrs.isSrcset(event.data.name)) {
            client.element.setAttribute.call(event.that.ownerElement, __palladium.attributePrefix + '-attr-' + event.data.name, event.data.value);
            event.data.value = __palladium.html.wrapSrcset(event.data.value);
        };

    });

    // URL
    client.url.on('createObjectURL', event => {
        let url = event.target.call(event.that, event.data.object);
        if (url.startsWith('blob:' + location.origin)) {
            let newUrl = 'blob:' + (__palladium.meta.url.href !== 'about:blank' ?  __palladium.meta.url.origin : window.parent.__palladium.meta.url.origin) + url.slice('blob:'.length + location.origin.length);
            __palladium.blobUrls.set(newUrl, url);
            event.respondWith(newUrl);
        } else {
            event.respondWith(url);
        };
    });

    client.url.on('revokeObjectURL', event => {
        if (__palladium.blobUrls.has(event.data.url)) {
            const old = event.data.url;
            event.data.url = __palladium.blobUrls.get(event.data.url);
            __palladium.blobUrls.delete(old);
        };
    });

    client.storage.on('get', event => {
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('set', event => {
        if (event.that.__palladium$storageObj) {
            event.that.__palladium$storageObj[event.data.name] = event.data.value;
        };
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('delete', event => {
        if (event.that.__palladium$storageObj) {
            delete event.that.__palladium$storageObj[event.data.name];
        };
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('getItem', event => {
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('setItem', event => {
        if (event.that.__palladium$storageObj) {
            event.that.__palladium$storageObj[event.data.name] = event.data.value;
        };
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('removeItem', event => {
        if (event.that.__palladium$storageObj) {
            delete event.that.__palladium$storageObj[event.data.name];
        };
        event.data.name = methodPrefix + __palladium.meta.url.origin + '@' + event.data.name;
    });

    client.storage.on('clear', event => {
        if (event.that.__palladium$storageObj) {
            for (const key of client.nativeMethods.keys.call(null, event.that.__palladium$storageObj)) {
                delete event.that.__palladium$storageObj[key];
                client.storage.removeItem.call(event.that, methodPrefix + __palladium.meta.url.origin + '@' + key);
                event.respondWith();
            };
        };
    });

    client.storage.on('length', event => {
        if (event.that.__palladium$storageObj) {
            event.respondWith(client.nativeMethods.keys.call(null, event.that.__palladium$storageObj).length);
        };
    });

    client.storage.on('key', event => {
        if (event.that.__palladium$storageObj) {
            event.respondWith(
                (client.nativeMethods.keys.call(null, event.that.__palladium$storageObj)[event.data.index] || null)
            );
        };
    });

    client.websocket.on('websocket', async event => {
        let url;
        try {
            url = new URL(event.data.url);
        } catch(e) {
            return;
        };

        const headers = {
            Host: url.host,
            Origin: __palladium.meta.url.origin,
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
            Upgrade: 'websocket',
            'User-Agent': window.navigator.userAgent,
            'Connection': 'Upgrade',
        };

        const cookies = __palladium.cookie.serialize(__palladium.cookies, { url }, false);

        if (cookies) headers.Cookie = cookies;
        const protocols = [...event.data.protocols];

        const remote = {
            protocol: url.protocol,
            host: url.hostname,
            port: url.port || (url.protocol === 'wss:' ? '443' : '80'),
            path: url.pathname + url.search,
        };

        if (protocols.length) headers['Sec-WebSocket-Protocol'] = protocols.join(', ');

        event.data.url =  (__palladium.bare.protocol === 'https:' ? 'wss://' : 'ws://') + __palladium.bare.host + __palladium.bare.pathname + 'v1/';
        event.data.protocols = [
            'bare',
            __palladium.encodeProtocol(JSON.stringify({
                remote,
                headers,
                forward_headers: [
                    'accept',
                    'accept-encoding',
                    'accept-language',
                    'sec-websocket-extensions',
                    'sec-websocket-key',
                    'sec-websocket-version',
                ],
            })),
        ];

        const ws = new event.target(event.data.url, event.data.protocols);

        client.nativeMethods.defineProperty(ws, methodPrefix + 'url', {
            enumerable: false,
            value: url.href,
        });

        event.respondWith(
            ws
        );
    });

    client.websocket.on('url', event => {
        if ('__palladium$url' in event.that) {
            event.data.value = event.that.__palladium$url;
        };
    });

    client.websocket.on('protocol', event => {
        if ('__palladium$protocol' in event.that) {
            event.data.value = event.that.__palladium$protocol;
        };
    });

    client.function.on('function', event => {
        event.data.script = __palladium.rewriteJS(event.data.script);
    });

    client.function.on('toString', event => {
        if (__palladium.methods.string in event.that) event.respondWith(event.that[__palladium.methods.string]);
    });

    client.object.on('getOwnPropertyNames', event => {
        event.data.names = event.data.names.filter(element => !(__palladium.filterKeys.includes(element)));
    });

    client.object.on('getOwnPropertyDescriptors', event => {
        for (const forbidden of __palladium.filterKeys) {
            delete event.data.descriptors[forbidden];
        };

    });

    client.style.on('setProperty', event => {
        if (client.style.dashedUrlProps.includes(event.data.property)) {
            event.data.value = __palladium.rewriteCSS(event.data.value, {
                context: 'value',
                ...__palladium.meta
            })
        };
    });

    client.style.on('getPropertyValue', event => {
        if (client.style.dashedUrlProps.includes(event.data.property)) {
            event.respondWith(
                __palladium.sourceCSS(
                    event.target.call(event.that, event.data.property),
                    {
                        context: 'value',
                        ...__palladium.meta
                    }
                )
            );
        };
    });

    if ('CSS2Properties' in window) {
        for (const key of client.style.urlProps) {
            client.overrideDescriptor(window.CSS2Properties.prototype, key, {
                get: (target, that) => {
                    return __palladium.sourceCSS(
                        target.call(that),
                        {
                            context: 'value',
                            ...__palladium.meta
                        }
                    )
                },
                set: (target, that, val) => {
                    target.call(
                        that,
                        __palladium.rewriteCSS(val, {
                            context: 'value',
                            ...__palladium.meta
                        })
                    );
                }
            });
        };
    } else if ('HTMLElement' in window) {

        client.overrideDescriptor(
            window.HTMLElement.prototype,
            'style',
            {
                get: (target, that) => {
                    const value = target.call(that);
                    if (!value[methodPrefix + 'modifiedStyle']) {

                        for (const key of client.style.urlProps) {
                            client.nativeMethods.defineProperty(value, key, {
                                enumerable: true,
                                configurable: true,
                                get() {
                                    const value = client.style.getPropertyValue.call(this, key) || '';
                                    return __palladium.sourceCSS(
                                        value,
                                        {
                                            context: 'value',
                                            ...__palladium.meta
                                        }
                                    )
                                },
                                set(val) {
                                    client.style.setProperty.call(this, 
                                        (client.style.propToDashed[key] || key),
                                        __palladium.rewriteCSS(val, {
                                            context: 'value',
                                            ...__palladium.meta
                                        })    
                                    )
                                }
                            });
                            client.nativeMethods.defineProperty(value, methodPrefix + 'modifiedStyle', {
                                enumerable: false,
                                value: true
                            });
                        };
                    };
                    return value;
                }
            }
        );
    };

    client.style.on('setCssText', event => {
        event.data.value = __palladium.rewriteCSS(event.data.value, {
            context: 'declarationList',
            ...__palladium.meta
        });
    });

    client.style.on('getCssText', event => {
        event.data.value = __palladium.sourceCSS(event.data.value, {
            context: 'declarationList',
            ...__palladium.meta
        });
    });

    // Proper hash emulation.
    if (!!window.window) {
        __palladium.addEventListener.call(window, 'hashchange', event => {
            if (event.__palladium$dispatched) return false;
            event.stopImmediatePropagation();
            const hash = window.location.hash;
            client.history.replaceState.call(window.history, '', '', event.oldURL);
            __palladium.location.hash = hash;
        });
    };

    client.location.on('hashchange', (oldUrl, newUrl, ctx) => {
        if (ctx.HashChangeEvent && client.history.replaceState) {
            client.history.replaceState.call(window.history, '', '', __palladium.rewriteUrl(newUrl));

            const event = new ctx.HashChangeEvent('hashchange', { newURL: newUrl, oldURL: oldUrl });

            client.nativeMethods.defineProperty(event, methodPrefix + 'dispatched', {
                value: true,
                enumerable: false,
            }); 

            __palladium.dispatchEvent.call(window, event);
        };
    });

    // Hooking functions & descriptors
    client.fetch.overrideRequest();
    client.fetch.overrideUrl();
    client.xhr.overrideOpen();
    client.xhr.overrideResponseUrl();
    client.element.overrideHtml();
    client.element.overrideAttribute();
    client.element.overrideInsertAdjacentHTML();
    client.element.overrideAudio();
    // client.element.overrideQuerySelector();
    client.node.overrideBaseURI();
    client.node.overrideTextContent();
    client.attribute.overrideNameValue();
    client.document.overrideDomain();
    client.document.overrideURL();
    client.document.overrideDocumentURI();
    client.document.overrideWrite();
    client.document.overrideReferrer();
    client.document.overrideParseFromString();
    client.storage.overrideMethods();
    client.storage.overrideLength();
    //client.document.overrideQuerySelector();
    client.object.overrideGetPropertyNames();
    client.object.overrideGetOwnPropertyDescriptors();
    client.history.overridePushState();
    client.history.overrideReplaceState();
    client.eventSource.overrideConstruct();
    client.eventSource.overrideUrl();
    client.websocket.overrideWebSocket();
    client.websocket.overrideProtocol();
    client.websocket.overrideUrl();
    client.url.overrideObjectURL();
    client.document.overrideCookie();
    client.message.overridePostMessage();
    client.message.overrideMessageOrigin();
    client.message.overrideMessageData();
    client.workers.overrideWorker();
    client.workers.overrideAddModule();
    client.workers.overrideImportScripts();
    client.workers.overridePostMessage();
    client.style.overrideSetGetProperty();
    client.style.overrideCssText();
    client.navigator.overrideSendBeacon();
    client.function.overrideFunction();
    client.function.overrideToString();
    client.location.overrideWorkerLocation(
        (href) => {
            return new URL(__palladium.sourceUrl(href));
        }
    );

    client.overrideDescriptor(window, 'localStorage', {
        get: (target, that) => {
            return (that || window).__palladium.lsWrap;
        },
    });
    client.overrideDescriptor(window, 'sessionStorage', {
        get: (target, that) => {
            return (that || window).__palladium.ssWrap;
        },
    });


    client.override(window, 'open', (target, that, args) => {
        if (!args.length) return target.apply(that, args);
        let [url] = args;

        url = __palladium.rewriteUrl(url);

        return target.call(that, url);
    });

    __palladium.$wrap = function(name) {
        if (name === 'location') return __palladium.methods.location;
        if (name === 'eval') return __palladium.methods.eval;
        return name;
    };


    __palladium.$get = function(that) {
        if (that === window.location) return __palladium.location;
        if (that === window.eval) return __palladium.eval;
        if (that === window.parent) {
            return window.__palladium$parent;
        };
        if (that === window.top) {
            return window.__palladium$top;
        };
        return that;
    };

    __palladium.eval = client.wrap(window, 'eval', (target, that, args) => {
        if (!args.length || typeof args[0] !== 'string') return target.apply(that, args);
        let [script] = args;

        script = __palladium.rewriteJS(script);
        return target.call(that, script);
    });

    __palladium.call = function(target, args, that) {
        return that ? target.apply(that, args) : target(...args);
    };

    __palladium.call$ = function(obj, prop, args = []) {
        return obj[prop].apply(obj, args);
    };

    client.nativeMethods.defineProperty(window.Object.prototype, master, {
        get: () => {
            return __palladium;
        },
        enumerable: false
    });

    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.setSource, {
        value: function(source) {
            if (!client.nativeMethods.isExtensible(this)) return this;

            client.nativeMethods.defineProperty(this, __palladium.methods.source, {
                value: source,
                writable: true,
                enumerable: false
            });

            return this;
        },
        enumerable: false,
    });

    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.source, {
        value: __palladium,
        writable: true,
        enumerable: false
    });

    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.location, {
        configurable: true,
        get() {
            return (this === window.document || this === window) ? __palladium.location : this.location;
        },
        set(val) {
            if (this === window.document || this === window) {
                __palladium.location.href = val;
            } else {
                this.location = val;
            };
        },
    });

    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.parent, {
        configurable: true,
        get() {
            const val = this.parent;

            if (this === window) {
                try {
                    return '__palladium' in val ? val : this;
                } catch (e) {
                    return this;
                };
            };
            return val;
        },
        set(val) {
            this.parent = val;
        },
    });

    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.top, {
        configurable: true,
        get() {
            const val = this.top;

            if (this === window) {
                if (val === this.parent) return this[__palladium.methods.parent];
                try {
                    if (!('__palladium' in val)) {
                        let current = this;

                        while (current.parent !== val) {
                            current = current.parent
                        };

                        return '__palladium' in current ? current : this;

                    } else {
                        return val;
                    };
                } catch (e) {
                    return this;
                };
            };
            return val;
        },
        set(val) {
            this.top = val;
        },
    });


    client.nativeMethods.defineProperty(window.Object.prototype, __palladium.methods.eval, {
        configurable: true,
        get() {
            return this === window ? __palladium.eval : this.eval;
        },
        set(val) {
            this.eval = val;
        },
    });
};