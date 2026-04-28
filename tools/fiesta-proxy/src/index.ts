const ALLOWED_HOSTS = new Set([
  'vidsrc.me',
  'vidsrc.xyz',
]);

const BLOCKED_PATTERNS: RegExp[] = [
  /(^|\.)histats\.com\b/i,
  /cloudnestra\.com\/base64\.js/i,
  /vidsrc\.[a-z]+\/cdn-cgi\/rum/i,
];

function isBlockedUrl(raw: string, base: string): boolean {
  let href = raw;
  try {
    href = new URL(raw, base).href;
  } catch {}
  return BLOCKED_PATTERNS.some((p) => p.test(href));
}

const BLOCKED_PATTERNS_JS = `[${BLOCKED_PATTERNS.map((p) => p.toString()).join(',')}]`;

const NEUTRALIZER = `<script>
(function () {
  var BLOCKED = ${BLOCKED_PATTERNS_JS};
  function isBlocked(s) {
    if (s == null) return false;
    try { return BLOCKED.some(function (p) { return p.test(String(s)); }); }
    catch (e) { return false; }
  }

  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if ((name === 'src' || name === 'href') && isBlocked(value)) {
      console.debug('[neutralize] blocked', name, String(value));
      return;
    }
    return origSetAttr.apply(this, arguments);
  };

  ['HTMLScriptElement', 'HTMLImageElement', 'HTMLIFrameElement', 'HTMLLinkElement'].forEach(function (n) {
    var Ctor = window[n];
    if (!Ctor) return;
    var key = n === 'HTMLLinkElement' ? 'href' : 'src';
    var desc = Object.getOwnPropertyDescriptor(Ctor.prototype, key);
    if (!desc || !desc.set) return;
    Object.defineProperty(Ctor.prototype, key, {
      configurable: true,
      get: desc.get,
      set: function (v) {
        if (isBlocked(v)) {
          console.debug('[neutralize] blocked ' + n + '.' + key, String(v));
          return;
        }
        return desc.set.call(this, v);
      }
    });
  });

  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      var u = typeof input === 'string' ? input : (input && input.url) || '';
      if (isBlocked(u)) {
        console.debug('[neutralize] blocked fetch', u);
        return Promise.reject(new TypeError('blocked'));
      }
      return origFetch.apply(this, arguments);
    };
  }

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (isBlocked(url)) {
      console.debug('[neutralize] blocked xhr', String(url));
      this.send = function () {};
      return;
    }
    return origOpen.apply(this, arguments);
  };

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    var origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      if (isBlocked(url)) {
        console.debug('[neutralize] blocked beacon', String(url));
        return true;
      }
      return origBeacon(url, data);
    };
  }

  try {
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: function () {
        console.debug('[neutralize] blocked window.open', arguments[0]);
        return null;
      }
    });
  } catch (e) {
    try { window.open = function () { return null; }; } catch (_) {}
  }

  var isBlankTarget = function (t) { return t === '_blank' || t === 'blank'; };

  var origAClick = HTMLElement.prototype.click;
  HTMLElement.prototype.click = function () {
    if (this instanceof HTMLAnchorElement && isBlankTarget(this.target)) {
      console.debug('[neutralize] blocked anchor.click target=_blank', this.href);
      return;
    }
    return origAClick.apply(this, arguments);
  };

  if (typeof HTMLFormElement !== 'undefined') {
    var origFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      if (isBlankTarget(this.target)) {
        console.debug('[neutralize] blocked form.submit target=_blank');
        return;
      }
      return origFormSubmit.apply(this, arguments);
    };
  }

  try {
    Object.defineProperty(document, 'domain', {
      configurable: true,
      get: function () { return location.hostname; },
      set: function () {}
    });
  } catch (_) {}

  if (typeof document.write === 'function') {
    var origWrite = document.write.bind(document);
    var origWriteln = document.writeln ? document.writeln.bind(document) : null;
    var sanitizeWrite = function (chunk) {
      if (typeof chunk !== 'string') return chunk;
      return chunk.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script\\s*>|<script\\b[^>]*\\/?\\s*>/gi, function (m) {
        return BLOCKED.some(function (p) { return p.test(m); }) ? '' : m;
      });
    };
    document.write = function () {
      var args = Array.prototype.map.call(arguments, sanitizeWrite);
      return origWrite.apply(document, args);
    };
    if (origWriteln) {
      document.writeln = function () {
        var args = Array.prototype.map.call(arguments, sanitizeWrite);
        return origWriteln.apply(document, args);
      };
    }
  }

  document.addEventListener('click', function (e) {
    var baseHost;
    try { baseHost = new URL(document.baseURI).host; } catch (_) { baseHost = location.host; }
    var node = e.target;
    while (node && node !== document) {
      if (node.tagName === 'A' && isBlankTarget(node.target)) {
        try {
          var u = new URL(node.getAttribute('href') || '', document.baseURI);
          if (u.host && u.host !== baseHost) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.debug('[neutralize] blocked anchor click', u.href);
            return;
          }
        } catch (_) {}
      }
      node = node.parentNode;
    }
  }, true);

  var stub = function () {};
  stub.isSuspend = false;
  stub.isRunning = false;
  stub.md5 = function (x) { return x; };
  stub.version = '0.0.0';
  try {
    Object.defineProperty(window, 'DisableDevtool', {
      configurable: false,
      get: function () { return stub; },
      set: function () { return true; }
    });
  } catch (e) {}

  try {
    Object.defineProperty(window, 'outerWidth',  { get: function () { return window.innerWidth;  } });
    Object.defineProperty(window, 'outerHeight', { get: function () { return window.innerHeight; } });
  } catch (e) {}

  var realLog = console.log.bind(console);
  console.log = function () {
    var args = Array.prototype.slice.call(arguments);
    return realLog.apply(null, args.map(function (a) {
      if (a && typeof a === 'object') {
        try { Object.defineProperty(a, 'id', { get: function () { return undefined; }, configurable: true }); } catch (_) {}
      }
      return a;
    }));
  };

  var block = function () { console.debug('[neutralize] navigation blocked'); };
  try {
    Object.defineProperty(window.location, 'href', { set: block });
    window.location.replace = block;
    window.location.assign  = block;
  } catch (_) {}
  window.close = function () { console.debug('[neutralize] window.close blocked'); };

  var _Function = window.Function;
  window.Function = new Proxy(_Function, {
    construct: function (target, args) {
      if (args.some(function (a) { return typeof a === 'string' && a.indexOf('debugger') !== -1; })) {
        return function () {};
      }
      return Reflect.construct(target, args);
    }
  });
})();
</script>`;

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return new Response(
        'usage: /<host>/<path>  e.g. /vidsrc.me/embed/movie/tt0111161',
        { status: 400, headers: { 'content-type': 'text/plain' } },
      );
    }

    const targetHost = segments[0].toLowerCase();
    if (!ALLOWED_HOSTS.has(targetHost)) {
      return new Response(`host not allowed: ${targetHost}`, { status: 403 });
    }

    const targetPath = '/' + segments.slice(1).join('/');
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers.get('User-Agent') ?? 'Mozilla/5.0',
        'Accept': req.headers.get('Accept') ?? '*/*',
        'Accept-Language': req.headers.get('Accept-Language') ?? 'en-US',
        'Referer': `https://${targetHost}/`,
      },
      redirect: 'follow',
    });

    const headers = new Headers(upstream.headers);
    headers.delete('content-security-policy');
    headers.delete('content-security-policy-report-only');
    headers.delete('x-frame-options');
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.set('access-control-allow-origin', '*');

    const ct = (upstream.headers.get('content-type') ?? '').toLowerCase();
    const proxyOrigin = url.origin;

    const rewriteToProxy = (raw: string): string | null => {
      try {
        const r = new URL(raw, `https://${targetHost}/`);
        if (!ALLOWED_HOSTS.has(r.host.toLowerCase())) return null;
        return `${proxyOrigin}/${r.host.toLowerCase()}${r.pathname}${r.search}`;
      } catch {
        return null;
      }
    };

    if (ct.includes('javascript') || ct.includes('ecmascript')) {
      const text = await upstream.text();
      return new Response(stripDebugger(text), { status: upstream.status, headers });
    }

    if (!ct.includes('text/html')) {
      return new Response(upstream.body, { status: upstream.status, headers });
    }

    const rewriter = new HTMLRewriter()
      .on('head', {
        element(el) {
          el.prepend(`<base href="https://${targetHost}/">`, { html: true });
          el.prepend(NEUTRALIZER, { html: true });
        },
      })
      .on('script', {
        element(el) {
          const src = el.getAttribute('src');
          if (!src) return;
          if (isBlockedUrl(src, `https://${targetHost}/`)) {
            el.remove();
            return;
          }
          const proxied = rewriteToProxy(src);
          if (proxied) el.setAttribute('src', proxied);
        },
        text(chunk) {
          if (!chunk.text) return;
          chunk.replace(stripDebugger(chunk.text), { html: false });
        },
      })
      .on('iframe', {
        element(el) {
          const src = el.getAttribute('src');
          if (!src) return;
          if (isBlockedUrl(src, `https://${targetHost}/`)) {
            el.remove();
            return;
          }
          const proxied = rewriteToProxy(src);
          if (proxied) el.setAttribute('src', proxied);
        },
      })
      .on('img', {
        element(el) {
          const src = el.getAttribute('src');
          if (src && isBlockedUrl(src, `https://${targetHost}/`)) el.remove();
        },
      })
      .on('link', {
        element(el) {
          const href = el.getAttribute('href');
          if (href && isBlockedUrl(href, `https://${targetHost}/`)) el.remove();
        },
      });

    return rewriter.transform(
      new Response(upstream.body, { status: upstream.status, headers }),
    );
  },
};

function stripDebugger(src: string): string {
  return src.replace(/(?<!\.)\bdebugger\b(?=\s*(?:;|\}|$))/g, '        ');
}
