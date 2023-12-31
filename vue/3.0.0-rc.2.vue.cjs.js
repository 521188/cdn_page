'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var runtimeDom = require('@vue/runtime-dom');
var compilerDom = require('@vue/compiler-dom');
var shared = require('@vue/shared');

function initDev() {
    const target =  global;
    target.__VUE__ = runtimeDom.version;
    runtimeDom.setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__);
}

// This entry is the "full-build" that includes both the runtime
 initDev();
const compileCache = Object.create(null);
function compileToFunction(template, options) {
    if (!shared.isString(template)) {
        if (template.nodeType) {
            template = template.innerHTML;
        }
        else {
             runtimeDom.warn(`invalid template option: `, template);
            return shared.NOOP;
        }
    }
    const key = template;
    const cached = compileCache[key];
    if (cached) {
        return cached;
    }
    if (template[0] === '#') {
        const el = document.querySelector(template);
        if ( !el) {
            runtimeDom.warn(`Template element not found or is empty: ${template}`);
        }
        // __UNSAFE__
        // Reason: potential execution of JS expressions in in-DOM template.
        // The user must make sure the in-DOM template is trusted. If it's rendered
        // by the server, the template should not contain any user data.
        template = el ? el.innerHTML : ``;
    }
    const { code } = compilerDom.compile(template, shared.extend({
        hoistStatic: true,
        onError(err) {
            {
                const message = `Template compilation error: ${err.message}`;
                const codeFrame = err.loc &&
                    shared.generateCodeFrame(template, err.loc.start.offset, err.loc.end.offset);
                runtimeDom.warn(codeFrame ? `${message}\n${codeFrame}` : message);
            }
        }
    }, options));
    // The wildcard import results in a huge object with every export
    // with keys that cannot be mangled, and can be quite heavy size-wise.
    // In the global build we know `Vue` is available globally so we can avoid
    // the wildcard object.
    const render = ( new Function('Vue', code)(runtimeDom));
    return (compileCache[key] = render);
}
runtimeDom.registerRuntimeCompiler(compileToFunction);

Object.keys(runtimeDom).forEach(function (k) {
  if (k !== 'default') exports[k] = runtimeDom[k];
});
exports.compile = compileToFunction;
