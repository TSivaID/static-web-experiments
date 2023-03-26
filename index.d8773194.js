var e={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let t;const n=new Uint8Array(16);function o(){if(!t&&(t="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!t))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return t(n)}const s=[];for(let e=0;e<256;++e)s.push((e+256).toString(16).slice(1));function c(e,t=0){return(s[e[t+0]]+s[e[t+1]]+s[e[t+2]]+s[e[t+3]]+"-"+s[e[t+4]]+s[e[t+5]]+"-"+s[e[t+6]]+s[e[t+7]]+"-"+s[e[t+8]]+s[e[t+9]]+"-"+s[e[t+10]]+s[e[t+11]]+s[e[t+12]]+s[e[t+13]]+s[e[t+14]]+s[e[t+15]]).toLowerCase()}var d=function(t,n,s){if(e.randomUUID&&!n&&!t)return e.randomUUID();const d=(t=t||{}).random||(t.rng||o)();if(d[6]=15&d[6]|64,d[8]=63&d[8]|128,n){s=s||0;for(let e=0;e<16;++e)n[s+e]=d[e];return n}return c(d)};
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
 */function r(e,t,n){let o=`${encodeURIComponent(e)}=${encodeURIComponent(t)}`;n&&(void 0!==n.maxAge&&(o+=`; max-age=${n.maxAge}`),n.path&&(o+=`; path=${n.path}`),n.domain&&(o+=`; domain=${n.domain}`),n.secure&&(o+="; secure"),n.sameSite&&(o+=`; samesite=${n.sameSite}`)),document.cookie=o}function i(e){const t=encodeURIComponent(e)+"=",n=document.cookie.split(";");for(const e of n){const n=e.trim();if(n.startsWith(t))return decodeURIComponent(n.slice(t.length))}return null}function a(){if(!i("session_id")){r("session_id",d());r("session_count",(parseInt(i("session_count")||"0",10)+1).toString(),{maxAge:2592e3})}}function u(){const e=document.getElementById("cookie-consent-banner"),t=document.getElementById("accept-cookies");"accepted"!==localStorage.getItem("cookie_consent")&&e&&e.classList.remove("hidden"),t&&t.addEventListener("click",(()=>{localStorage.setItem("cookie_consent","accepted"),e&&e.classList.add("hidden")}))}(new class{trackEvent(e){console.log(`Tracking event: ${e}`)}constructor(){}}).trackEvent("page_load"),function(){const e=i("anonymous_user_id"),t={maxAge:31536e3};r("anonymous_user_id",e||d(),t)}(),a(),function(){let e=null;function t(){e&&clearTimeout(e),e=setTimeout((()=>{var e;r("session_id","",{maxAge:0,...e||{}}),a()}),18e5)}document.addEventListener("mousemove",t),document.addEventListener("mousedown",t),document.addEventListener("keypress",t),document.addEventListener("touchmove",t),document.addEventListener("scroll",t)}(),function(){const e=document.getElementById("subscription-modal"),t=document.getElementById("show-modal"),n=document.querySelector(".close");if(!e||!t||!n)return;const o=parseInt(i("session_count")||"0",10),s="true"===i("subscribed"),c="true"===i("subscribeModalClosed");t.onclick=()=>{e.style.display="block"},n.onclick=()=>{e.style.display="none",r("subscribeModalClosed","true",{maxAge:86400})},window.onclick=t=>{t.target===e&&(e.style.display="none")},document.getElementById("newsletter-form")?.addEventListener("submit",(t=>{t.preventDefault(),r("subscribed","true",{maxAge:31536e3}),e.style.display="none"})),e.style.display=s||c||1!==o&&5!==o?"none":"block"}(),u(),document.addEventListener("DOMContentLoaded",(()=>{const e=window.location.hash.substring(1),t=decodeURIComponent(e)||"Default Title",n=document.getElementById("story-title");n&&(n.textContent=t)}));
//# sourceMappingURL=index.d8773194.js.map