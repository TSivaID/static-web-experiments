!function(){function e(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}
/**
 * @module logger
 * @version 0.1.0
 * @author T. Siva <t.siva AT outlook.com>
 * @license MIT
 * @description
 * A simple, flexible, and performant logger for use in the browser.
 *
 * The logger provides a way to output messages with different log levels (DEBUG, INFO, WARN, and ERROR)
 * and allows you to include metadata and a thunk function for lazy evaluation of additional information.
 *
 * Thunk functions are useful in scenarios where computing additional information is computationally
 * expensive or time-consuming. By passing a thunk function, the additional information will only be
 * computed when the log level condition is met, avoiding unnecessary computation and improving
 * performance.
 *
 * Usage example:
 * ```
 * import { Logger, LogLevel } from './utils/logger';
 *
 * const logger = new Logger(LogLevel.DEBUG);
 *
 * logger.debug('Debug message');
 * logger.info('Info message', { metadata: { user: 'John Doe' } });
 * logger.warn('Warning message', { metadata: { errorCode: 123 } });
 * logger.error('Error message', { metadata: { error: new Error('Something went wrong') }, thunk: () => ({ additionalInfo: 'lazy evaluated info' }) });
 * ```
 *
 * Usage example with only thunk (without metadata):
 * ```
 * logger.info('Info message', { thunk: () => ({ user: 'John Doe', action: 'lazy evaluated info' }) });
 * ```
 */
/**
 * @module cookie
 * @author T. Siva <t.siva AT outlook.com>
 * @license MIT
 * @description
 * A simple utility module to handle browser cookies with all possible options.
 *
 * Usage example:
 * ```
 * import { setCookie, getCookie, setSessionCookie } from './cookie';
 *
 * setCookie('name', 'John Doe', { maxAge: 3600, path: '/', secure: true });
 * const name = getCookie('name');
 * setSessionCookie('session', '12345');
 * ```
 */function t(e,t,n){let i=`${encodeURIComponent(e)}=${encodeURIComponent(t)}`;n&&(void 0!==n.maxAge&&(i+=`; max-age=${n.maxAge}`),n.path&&(i+=`; path=${n.path}`),n.domain&&(i+=`; domain=${n.domain}`),n.secure&&(i+="; secure"),n.sameSite&&(i+=`; samesite=${n.sameSite}`)),document.cookie=i}function n(e){const t=encodeURIComponent(e)+"=",n=document.cookie.split(";");for(const e of n){const n=e.trim();if(n.startsWith(t))return decodeURIComponent(n.slice(t.length))}return null}let i;var o;(o=i||(i={}))[o.DEBUG=0]="DEBUG",o[o.INFO=1]="INFO",o[o.WARN=2]="WARN",o[o.ERROR=3]="ERROR";class s{getLogLevel(){return this.logLevel}debug(e,t){this.log(i.DEBUG,e,t)}info(e,t){this.log(i.INFO,e,t)}warn(e,t){this.log(i.WARN,e,t)}error(e,t){this.log(i.ERROR,e,t)}log(e,t,n){if(e>=this.logLevel){let o;const s=e===i.DEBUG?"debug":e===i.INFO?"info":e===i.WARN?"warn":e===i.ERROR?"error":"info";try{const e=n?.metadata?{metadata:{...n.metadata}}:void 0,t=n?.thunk?{thunk:{...n.thunk()}}:void 0;o=e||t?{...e||{},...t||{}}:void 0}catch(e){console.error("Error while logging message",e)}o?console[s](t,o):console[s](t)}}constructor(e){this.logLevel=e}}const r=function(){let e=i.INFO;const o=function(){const e=new URLSearchParams(window.location.search).get("loglevel");if(e){const t=e.toLowerCase();if("debug"===t)return i.DEBUG;if("info"===t)return i.INFO;if("warn"===t)return i.WARN;if("error"===t)return i.ERROR}}();if(void 0!==o)e=o,function(e){t("session_loglevel",e.toString(),{path:"/",sameSite:"strict"})}(e);else{const t=function(){const e=n("session_loglevel");if(e){const t=parseInt(e);if(i[t])return t}}();void 0!==t&&(e=t)}return new s(e)}();class a{initialize(){r.info("MockApiAnalytics initialized")}async trackEvent(e,t){if(!t?.mock_api_analytics)return Promise.resolve();const n={...t.mock_api_analytics,useSendBeacon:this.useSendBeacon};if(this.useSendBeacon&&navigator.sendBeacon){const t=new Blob([JSON.stringify({eventName:e,data:n})],{type:"text/plain"});return navigator.sendBeacon(`${this.endpoint}`,t)?r.info(`MockApiAnalytics sent event using sendBeacon: ${e} with data: ${JSON.stringify(n)}`):r.error(`MockApiAnalytics failed to send event using sendBeacon: ${e}`),Promise.resolve()}try{r.info(`MockApiAnalytics sending event: ${e} with data: ${JSON.stringify(n)}`);const t=await fetch(`${this.endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventName:e,data:n})});if(!t.ok)return r.error(`MockApiAnalytics failed to track event: ${t.statusText}`),Promise.resolve()}catch(e){return r.error(`MockApiAnalytics failed to track event: ${e.message}`),Promise.resolve()}}constructor(t){e(this,"name","MockApiAnalytics"),e(this,"endpoint","https://static-web-experiments.free.beeceptor.com/events/"),this.useSendBeacon=!0===t?.useSendBeacon}}class c{initialize(){r.info("DummyAnalytics initialized")}async trackEvent(e,t){return t?.dummy_analytics&&r.info(`DummyAnalytics tracked event: ${e} with data: ${JSON.stringify(t.dummy_analytics)}`),Promise.resolve()}constructor(){e(this,"name","DummyAnalytics")}}class l{async initialize(e){this.isInitialized?r.warn("AnalyticsService already initialized"):(await Promise.all(this.analyticsProviders.map((t=>{t.initialize(e),r.info(`AnalyticsService: ${t.name} initialized`)}))),this.isInitialized=!0)}async trackEvent(e,t){r.info(`AnalyticsService.track called with eventName=${e} data=${JSON.stringify(t)}`),await Promise.all(this.analyticsProviders.map((n=>n.trackEvent(e,t))))}constructor(t){e(this,"isInitialized",!1),this.analyticsProviders=t}}class d{getCommonVars(){return{event_timestamp:(new Date).toISOString(),user_agent:window.navigator.userAgent,page_url:window.location.href}}getPageVars(){const e=document.querySelector("#page-vars");if(e)try{return JSON.parse(e.innerHTML)}catch(e){return void r.error("Error parsing page-vars")}else r.error("No page-vars found")}getVars(e){const t=this.getCommonVars(),n=this.getPageVars(),i={...n?n.vars:{},...e.vars||{}},o={};for(const n in e.providers){const s=e.providers[n],r={...t};if(s.keys)for(const e of s.keys)Object.prototype.hasOwnProperty.call(i,e)&&(r[e]=i[e]);if(s.extra_keys)for(const e of s.extra_keys)Object.prototype.hasOwnProperty.call(i,e)&&(r[e]=i[e]);if(s.exclude_keys)for(const e of s.exclude_keys)Object.prototype.hasOwnProperty.call(r,e)&&delete r[e];if(s.key_mapping)for(const e in s.key_mapping)if(Object.prototype.hasOwnProperty.call(r,e)){r[s.key_mapping[e]]=r[e],delete r[e]}o[n]=r}return o}}class u{addEventListener(){this.selector.addEventListener(this.name,this.handler.bind(this))}removeEventListener(){this.selector.removeEventListener(this.name,this.handler.bind(this))}getEventConf(e){if(e)try{return JSON.parse(e)}catch(e){return void r.error(`Error parsing eventConf for ${this.name} trigger`)}else r.error(`No eventConf found for ${this.name} trigger`)}constructor(t,n,i){e(this,"triggerVariableParser",new d),this.name=t,this.selector=n,this.analyticsService=i}}class m extends u{handler(e){const t=e?.currentTarget?.dataset?.eventConf,n=this.getEventConf(t);if(n){const e=this.triggerVariableParser.getVars(n);this.analyticsService.trackEvent(n.name,e)}}constructor(e,t){super("click",e,t)}}class y{initialize(){this.bindClickTriggers()}bindClickTriggers(){const e=document.querySelectorAll('[data-ae-trigger="click"]');Array.from(e).map((e=>new m(e,this.analyticsService))).forEach((e=>e.addEventListener()))}constructor(e){this.analyticsService=e}}var g={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let f;const p=new Uint8Array(16);function v(){if(!f&&(f="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!f))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return f(p)}const h=[];for(let e=0;e<256;++e)h.push((e+256).toString(16).slice(1));function w(e,t=0){return(h[e[t+0]]+h[e[t+1]]+h[e[t+2]]+h[e[t+3]]+"-"+h[e[t+4]]+h[e[t+5]]+"-"+h[e[t+6]]+h[e[t+7]]+"-"+h[e[t+8]]+h[e[t+9]]+"-"+h[e[t+10]]+h[e[t+11]]+h[e[t+12]]+h[e[t+13]]+h[e[t+14]]+h[e[t+15]]).toLowerCase()}var k=function(e,t,n){if(g.randomUUID&&!t&&!e)return g.randomUUID();const i=(e=e||{}).random||(e.rng||v)();if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,t){n=n||0;for(let e=0;e<16;++e)t[n+e]=i[e];return t}return w(i)};function E(){if(!n("session_id")){t("session_id",k());t("session_count",(parseInt(n("session_count")||"0",10)+1).toString(),{maxAge:2592e3})}}function b(){const e=document.getElementById("cookie-consent-banner"),t=document.getElementById("accept-cookies");"accepted"!==localStorage.getItem("cookie_consent")&&e&&e.classList.remove("hidden"),t&&t.addEventListener("click",(()=>{localStorage.setItem("cookie_consent","accepted"),e&&e.classList.add("hidden")}))}(new class{async initialize(e){const t=new a({useSendBeacon:!1}),n=new a({useSendBeacon:!0}),i=new c,o=new l([t,n,i]);await o.initialize(e);return new y(o).initialize(),Promise.resolve(o)}}).initialize(),function(){const e=n("anonymous_user_id"),i={maxAge:31536e3};t("anonymous_user_id",e||k(),i)}(),E(),function(){let e=null;function n(){e&&clearTimeout(e),e=setTimeout((()=>{var e;t("session_id","",{maxAge:0,...e||{}}),E()}),18e5)}document.addEventListener("mousemove",n),document.addEventListener("mousedown",n),document.addEventListener("keypress",n),document.addEventListener("touchmove",n),document.addEventListener("scroll",n)}(),function(){const e=document.getElementById("subscription-modal"),i=document.getElementById("show-modal"),o=document.querySelector(".close");if(!e||!i||!o)return;const s=parseInt(n("session_count")||"0",10),r="true"===n("subscribed"),a="true"===n("subscribeModalClosed");i.onclick=()=>{e.style.display="block"},o.onclick=()=>{e.style.display="none",t("subscribeModalClosed","true",{maxAge:86400})},window.onclick=t=>{t.target===e&&(e.style.display="none")},document.getElementById("newsletter-form")?.addEventListener("submit",(n=>{n.preventDefault(),t("subscribed","true",{maxAge:31536e3}),e.style.display="none"})),e.style.display=r||a||1!==s&&5!==s?"none":"block"}(),b(),document.addEventListener("DOMContentLoaded",(()=>{const e=window.location.hash.substring(1),t=decodeURIComponent(e)||"Default Title",n=document.getElementById("story-title");n&&(n.textContent=t)}))}();
//# sourceMappingURL=index.63f1d61f.js.map
