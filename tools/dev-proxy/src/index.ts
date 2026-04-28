const ALLOWED_HOSTS = new Set([
  'vidsrc.me',
  'vidsrc.xyz',
]);

const NEUTRALIZER = `<script>
(function () {
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

  var block = function () { console.warn('[neutralize] navigation blocked'); };
  try {
    Object.defineProperty(window.location, 'href', { set: block });
    window.location.replace = block;
    window.location.assign  = block;
  } catch (_) {}
  window.close = function () { console.warn('[neutralize] window.close blocked'); };

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
    if (!ct.includes('text/html')) {
      return new Response(upstream.body, { status: upstream.status, headers });
    }

    const rewriter = new HTMLRewriter().on('head', {
      element(el) {
        el.prepend(`<base href="https://${targetHost}/">`, { html: true });
        el.prepend(NEUTRALIZER, { html: true });
      },
    });

    return rewriter.transform(
      new Response(upstream.body, { status: upstream.status, headers }),
    );
  },
};
