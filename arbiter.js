module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=27)}([function(e,t){e.exports=require("triframe/core")},function(e,t){e.exports=require("@babel/runtime/helpers/typeof")},function(e,t){e.exports=require("@babel/runtime/helpers/toConsumableArray")},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("@babel/runtime/helpers/getPrototypeOf")},function(e,t){e.exports=require("@babel/runtime/helpers/classCallCheck")},function(e,t){e.exports=require("@babel/runtime/helpers/possibleConstructorReturn")},function(e,t){e.exports=require("@babel/runtime/helpers/inherits")},function(e,t){e.exports=require("@babel/runtime/regenerator")},function(e,t){e.exports=require("@babel/runtime/helpers/assertThisInitialized")},function(e,t){e.exports=require("@babel/runtime/helpers/createClass")},function(e,t){e.exports=require("@babel/runtime/helpers/construct")},function(e,t){e.exports=require("@babel/runtime/helpers/asyncToGenerator")},function(e,t){e.exports=require("@babel/runtime/helpers/defineProperty")},function(e,t){e.exports=require("@babel/runtime/helpers/get")},function(e,t){e.exports=require("@babel/runtime/helpers/wrapNativeSuper")},function(e,t){e.exports=require("@babel/runtime/helpers/objectWithoutProperties")},function(e,t){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,t){e.exports=require("mime")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("socket.io")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("body-parser")},function(e,t){e.exports=require("formidable")},function(e,t){e.exports=require("express-session")},function(e,t){e.exports=require("session-file-store")},function(e,t,n){"use strict";n.r(t),n.d(t,"Resource",(function(){return q})),n.d(t,"List",(function(){return A})),n.d(t,"createSerializer",(function(){return W})),n.d(t,"createUnserializer",(function(){return pe})),n.d(t,"serve",(function(){return Se}));var r,o=n(5),a=n.n(o),i=n(10),c=n.n(i),u=n(6),s=n.n(u),p=n(4),f=n.n(p),l=n(9),h=n.n(l),d=n(7),v=n.n(d),m=n(0),y=n(2),b=n.n(y),O=n(11),g=n.n(O),w=n(1),E=n.n(w),P=n(14),_=n.n(P),j=n(15),A=function(e){function t(){var e,n;a()(this,t);for(var r=arguments.length,o=new Array(r),i=0;i<r;i++)o[i]=arguments[i];return n=s()(this,(e=f()(t)).call.apply(e,[this].concat(o))),Object.defineProperty(h()(n),"[[patches]]",{enumerable:!1,value:[]}),Object.defineProperty(h()(n),"[[events]]",{enumerable:!1,value:new m.EventEmitter}),n}return v()(t,e),c()(t,[{key:"on",value:function(){var e;return(e=this["[[events]]"]).on.apply(e,arguments)}},{key:"emit",value:function(){var e;return(e=this["[[events]]"]).emit.apply(e,arguments)}},{key:"push",value:function(){for(var e,n,r=this.length,o=arguments.length,a=new Array(o),i=0;i<o;i++)a[i]=arguments[i];var c=a.map((function(e){return{op:"add",path:"/".concat(r++),value:e}}));(e=this["[[patches]]"]).push.apply(e,b()(c)),this.emit("Δ.change",c),(n=_()(f()(t.prototype),"push",this)).call.apply(n,[this].concat(a))}},{key:"insert",value:function(e,t){this.splice(t,0,e);var n={op:"add",path:"/".concat(t),value:e};this["[[patches]]"].push(n),this.emit("Δ.change",[n])}},{key:"replace",value:function(e,t){this[e]=t;var n={op:"replace",path:"/".concat(e),value:t};this["[[patches]]"].push(n),this.emit("Δ.change",[n])}},{key:"remove",value:function(e){this.splice(e,1);var t={op:"remove",path:"/".concat(e)};this["[[patches]]"].push(t),this.emit("Δ.change",[t])}}]),t}(n.n(j)()(Array)),x=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.i=function(e){return e},n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t){
/*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017 Joachim Wester
   * MIT license
   */
var n=this&&this.__extends||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);function r(){this.constructor=e}e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)},r=Object.prototype.hasOwnProperty;function o(e,t){return r.call(e,t)}function a(e){if(Array.isArray(e)){for(var t=new Array(e.length),n=0;n<t.length;n++)t[n]=""+n;return t}if(Object.keys)return Object.keys(e);t=[];for(var r in e)o(e,r)&&t.push(r);return t}function i(e){return-1===e.indexOf("/")&&-1===e.indexOf("~")?e:e.replace(/~/g,"~0").replace(/\//g,"~1")}function c(e,t){var n;for(var r in e)if(o(e,r)){if(e[r]===t)return i(r)+"/";if("object"===E()(e[r])&&""!=(n=c(e[r],t)))return i(r)+"/"+n}return""}function u(e,t){var n=[e];for(var r in t){var o="object"===E()(t[r])?JSON.stringify(t[r],null,2):t[r];void 0!==o&&n.push(r+": "+o)}return n.join("\n")}t.hasOwnProperty=o,t._objectKeys=a,t._deepClone=function(e){switch(E()(e)){case"object":return JSON.parse(JSON.stringify(e),(function(e,t){return Array.isArray(t)?g()(A,b()(t)):t}));case"undefined":return null;default:return e}},t.isInteger=function(e){for(var t,n=0,r=e.length;n<r;){if(!((t=e.charCodeAt(n))>=48&&t<=57))return!1;n++}return!0},t.escapePathComponent=i,t.unescapePathComponent=function(e){return e.replace(/~1/g,"/").replace(/~0/g,"~")},t._getPathRecursive=c,t.getPath=function(e,t){if(e===t)return"/";var n=c(e,t);if(""===n)throw new Error("Object not found in root");return"/"+n},t.hasUndefined=function e(t){if(void 0===t)return!0;if(t)if(Array.isArray(t)){for(var n=0,r=t.length;n<r;n++)if(e(t[n]))return!0}else if("object"===E()(t)){var o=a(t),i=o.length;for(n=0;n<i;n++)if(e(t[o[n]]))return!0}return!1};var s=function(e){function t(t,n,r,o,a){e.call(this,u(t,{name:n,index:r,operation:o,tree:a})),this.name=n,this.index=r,this.operation=o,this.tree=a,this.message=u(t,{name:n,index:r,operation:o,tree:a})}return n(t,e),t}(Error);t.PatchError=s},function(e,t,n){var r={strict:!0},o=n(3),a=function(e,t){return o(e,t,r)},i=n(0);t.JsonPatchError=i.PatchError,t.deepClone=i._deepClone;var c={add:function(e,t,n){return e[t]=this.value,{newDocument:n}},remove:function(e,t,n){var r=e[t];return delete e[t],{newDocument:n,removed:r}},replace:function(e,t,n){var r=e[t];return e[t]=this.value,{newDocument:n,removed:r}},move:function(e,t,n){var r=s(n,this.path);r&&(r=i._deepClone(r));var o=p(n,{op:"remove",path:this.from}).removed;return p(n,{op:"add",path:this.path,value:o}),{newDocument:n,removed:r}},copy:function(e,t,n){var r=s(n,this.from);return p(n,{op:"add",path:this.path,value:i._deepClone(r)}),{newDocument:n}},test:function(e,t,n){return{newDocument:n,test:a(e[t],this.value)}},_get:function(e,t,n){return this.value=e[t],{newDocument:n}}},u={add:function(e,t,n){return i.isInteger(t)?e.splice(t,0,this.value):e[t]=this.value,{newDocument:n,index:t}},remove:function(e,t,n){return{newDocument:n,removed:e.splice(t,1)[0]}},replace:function(e,t,n){var r=e[t];return e[t]=this.value,{newDocument:n,removed:r}},move:c.move,copy:c.copy,test:c.test,_get:c._get};function s(e,t){if(""==t)return e;var n={op:"_get",path:t};return p(e,n),n.value}function p(e,n,r,o,p,f){if(void 0===r&&(r=!1),void 0===o&&(o=!0),void 0===p&&(p=!0),void 0===f&&(f=0),r&&("function"==typeof r?r(n,0,e,n.path):l(n,0)),""===n.path){var h={newDocument:e};if("add"===n.op)return h.newDocument=n.value,h;if("replace"===n.op)return h.newDocument=n.value,h.removed=e,h;if("move"===n.op||"copy"===n.op)return h.newDocument=s(e,n.from),"move"===n.op&&(h.removed=e),h;if("test"===n.op){if(h.test=a(e,n.value),!1===h.test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,n,e);return h.newDocument=e,h}if("remove"===n.op)return h.removed=e,h.newDocument=null,h;if("_get"===n.op)return n.value=e,h;if(r)throw new t.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902","OPERATION_OP_INVALID",f,n,e);return h}o||(e=i._deepClone(e));var d=(n.path||"").split("/"),v=e,m=1,y=d.length,b=void 0,O=void 0,g=void 0;for(g="function"==typeof r?r:l;;){if(O=d[m],p&&"__proto__"==O)throw new TypeError("JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");if(r&&void 0===b&&(void 0===v[O]?b=d.slice(0,m).join("/"):m==y-1&&(b=n.path),void 0!==b&&g(n,0,e,b)),m++,Array.isArray(v)){if("-"===O)O=v.length;else{if(r&&!i.isInteger(O))throw new t.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index","OPERATION_PATH_ILLEGAL_ARRAY_INDEX",f,n,e);i.isInteger(O)&&(O=~~O)}if(m>=y){if(r&&"add"===n.op&&O>v.length)throw new t.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array","OPERATION_VALUE_OUT_OF_BOUNDS",f,n,e);if(!1===(h=u[n.op].call(n,v,O,e)).test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,n,e);return h}}else if(O&&-1!=O.indexOf("~")&&(O=i.unescapePathComponent(O)),m>=y){if(!1===(h=c[n.op].call(n,v,O,e)).test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,n,e);return h}v=v[O]}}function f(e,n,r,o,a){if(void 0===o&&(o=!0),void 0===a&&(a=!0),r&&!Array.isArray(n))throw new t.JsonPatchError("Patch sequence must be an array","SEQUENCE_NOT_AN_ARRAY");o||(e=i._deepClone(e));for(var c=new Array(n.length),u=0,s=n.length;u<s;u++)c[u]=p(e,n[u],r,!0,a,u),e=c[u].newDocument;return c.newDocument=e,c}function l(e,n,r,o){if("object"!==E()(e)||null===e||Array.isArray(e))throw new t.JsonPatchError("Operation is not an object","OPERATION_NOT_AN_OBJECT",n,e,r);if(!c[e.op])throw new t.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902","OPERATION_OP_INVALID",n,e,r);if("string"!=typeof e.path)throw new t.JsonPatchError("Operation `path` property is not a string","OPERATION_PATH_INVALID",n,e,r);if(0!==e.path.indexOf("/")&&e.path.length>0)throw new t.JsonPatchError('Operation `path` property must start with "/"',"OPERATION_PATH_INVALID",n,e,r);if(("move"===e.op||"copy"===e.op)&&"string"!=typeof e.from)throw new t.JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)","OPERATION_FROM_REQUIRED",n,e,r);if(("add"===e.op||"replace"===e.op||"test"===e.op)&&void 0===e.value)throw new t.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)","OPERATION_VALUE_REQUIRED",n,e,r);if(("add"===e.op||"replace"===e.op||"test"===e.op)&&i.hasUndefined(e.value))throw new t.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)","OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED",n,e,r);if(r)if("add"==e.op){var a=e.path.split("/").length,u=o.split("/").length;if(a!==u+1&&a!==u)throw new t.JsonPatchError("Cannot perform an `add` operation at the desired path","OPERATION_PATH_CANNOT_ADD",n,e,r)}else if("replace"===e.op||"remove"===e.op||"_get"===e.op){if(e.path!==o)throw new t.JsonPatchError("Cannot perform the operation at a path that does not exist","OPERATION_PATH_UNRESOLVABLE",n,e,r)}else if("move"===e.op||"copy"===e.op){var s=h([{op:"_get",path:e.from,value:void 0}],r);if(s&&"OPERATION_PATH_UNRESOLVABLE"===s.name)throw new t.JsonPatchError("Cannot perform the operation from a path that does not exist","OPERATION_FROM_UNRESOLVABLE",n,e,r)}}function h(e,n,r){try{if(!Array.isArray(e))throw new t.JsonPatchError("Patch sequence must be an array","SEQUENCE_NOT_AN_ARRAY");if(n)f(i._deepClone(n),i._deepClone(e),r||!0);else{r=r||l;for(var o=0;o<e.length;o++)r(e[o],o,n,void 0)}}catch(e){if(e instanceof t.JsonPatchError)return e;throw e}}t.getValueByPointer=s,t.applyOperation=p,t.applyPatch=f,t.applyReducer=function(e,n,r){var o=p(e,n);if(!1===o.test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",r,n,e);return o.newDocument},t.validator=l,t.validate=h},function(e,t,n){
/*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017 Joachim Wester
   * MIT license
   */
var r=n(0),o=n(1),a=n(1);t.applyOperation=a.applyOperation,t.applyPatch=a.applyPatch,t.applyReducer=a.applyReducer,t.getValueByPointer=a.getValueByPointer,t.validate=a.validate,t.validator=a.validator;var i=n(0);t.JsonPatchError=i.PatchError,t.deepClone=i._deepClone,t.escapePathComponent=i.escapePathComponent,t.unescapePathComponent=i.unescapePathComponent;var c=new WeakMap,u=function(e){this.observers=new Map,this.obj=e},s=function(e,t){this.callback=e,this.observer=t};function p(e){var t=c.get(e.object);f(t.value,e.object,e.patches,""),e.patches.length&&o.applyPatch(t.value,e.patches);var n=e.patches;return n.length>0&&(e.patches=[],e.callback&&e.callback(n)),n}function f(e,t,n,o){if(t!==e){"function"==typeof t.toJSON&&(t=t.toJSON());for(var a=r._objectKeys(t),i=r._objectKeys(e),c=!1,u=i.length-1;u>=0;u--){var s=e[l=i[u]];if(!r.hasOwnProperty(t,l)||void 0===t[l]&&void 0!==s&&!1===Array.isArray(t))Array.isArray(e)===Array.isArray(t)?(n.push({op:"remove",path:o+"/"+r.escapePathComponent(l)}),c=!0):(n.push({op:"replace",path:o,value:t}),!0);else{var p=t[l];"object"==E()(s)&&null!=s&&"object"==E()(p)&&null!=p?f(s,p,n,o+"/"+r.escapePathComponent(l)):s!==p&&(!0,n.push({op:"replace",path:o+"/"+r.escapePathComponent(l),value:r._deepClone(p)}))}}if(c||a.length!=i.length)for(u=0;u<a.length;u++){var l=a[u];r.hasOwnProperty(e,l)||void 0===t[l]||n.push({op:"add",path:o+"/"+r.escapePathComponent(l),value:r._deepClone(t[l])})}}}t.unobserve=function(e,t){t.unobserve()},t.observe=function(e,t){var n,o=function(e){return c.get(e)}(e);if(o){var a=function(e,t){return e.observers.get(t)}(o,t);n=a&&a.observer}else o=new u(e),c.set(e,o);if(n)return n;if(n={},o.value=r._deepClone(e),t){n.callback=t,n.next=null;var i=function(){p(n)},f=function(){clearTimeout(n.next),n.next=setTimeout(i)};"undefined"!=typeof window&&(window.addEventListener?(window.addEventListener("mouseup",f),window.addEventListener("keyup",f),window.addEventListener("mousedown",f),window.addEventListener("keydown",f),window.addEventListener("change",f)):(document.documentElement.attachEvent("onmouseup",f),document.documentElement.attachEvent("onkeyup",f),document.documentElement.attachEvent("onmousedown",f),document.documentElement.attachEvent("onkeydown",f),document.documentElement.attachEvent("onchange",f)))}return n.patches=[],n.object=e,n.unobserve=function(){p(n),clearTimeout(n.next),function(e,t){e.observers.delete(t.callback)}(o,n),"undefined"!=typeof window&&(window.removeEventListener?(window.removeEventListener("mouseup",f),window.removeEventListener("keyup",f),window.removeEventListener("mousedown",f),window.removeEventListener("keydown",f)):(document.documentElement.detachEvent("onmouseup",f),document.documentElement.detachEvent("onkeyup",f),document.documentElement.detachEvent("onmousedown",f),document.documentElement.detachEvent("onkeydown",f)))},o.observers.set(t,new s(t,n)),n},t.generate=p,t.compare=function(e,t){var n=[];return f(e,t,n,""),n}},function(e,t,n){var r=Array.prototype.slice,o=n(5),a=n(4),i=e.exports=function(e,t,n){return n||(n={}),e===t||(e instanceof Date&&t instanceof Date?e.getTime()===t.getTime():!e||!t||"object"!=E()(e)&&"object"!=E()(t)?n.strict?e===t:e==t:function(e,t,n){var s,p;if(c(e)||c(t))return!1;if(e.prototype!==t.prototype)return!1;if(a(e))return!!a(t)&&(e=r.call(e),t=r.call(t),i(e,t,n));if(u(e)){if(!u(t))return!1;if(e.length!==t.length)return!1;for(s=0;s<e.length;s++)if(e[s]!==t[s])return!1;return!0}try{var f=o(e),l=o(t)}catch(e){return!1}if(f.length!=l.length)return!1;for(f.sort(),l.sort(),s=f.length-1;s>=0;s--)if(f[s]!=l[s])return!1;for(s=f.length-1;s>=0;s--)if(p=f[s],!i(e[p],t[p],n))return!1;return E()(e)===E()(t)}(e,t,n))};function c(e){return null==e}function u(e){return!(!e||"object"!==E()(e)||"number"!=typeof e.length)&&("function"==typeof e.copy&&"function"==typeof e.slice&&!(e.length>0&&"number"!=typeof e[0]))}},function(e,t){var n="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();function r(e){return"[object Arguments]"==Object.prototype.toString.call(e)}function o(e){return e&&"object"==E()(e)&&"number"==typeof e.length&&Object.prototype.hasOwnProperty.call(e,"callee")&&!Object.prototype.propertyIsEnumerable.call(e,"callee")||!1}(t=e.exports=n?r:o).supported=r,t.unsupported=o},function(e,t){function n(e){var t=[];for(var n in e)t.push(n);return t}(e.exports="function"==typeof Object.keys?Object.keys:n).shim=n}]),T=function(){var e=e||{};e.transform=function(e,n){var r=[];r=r.concat.apply(r,n);var o=JSON.parse(JSON.stringify(e));return r.reduce(t,o)},e.transformAgainstSingleOp=function(e,t){};var t=function(e,t){if(void 0===t.value&&("add"===t.op||"replace"===t.op||"test"===t.op))throw new Error("'value' MUST be defined");if(void 0===t.from&&("copy"===t.op||"move"===t.op))throw new Error("'from' MUST be defined");if(n[t.op])if("function"==typeof n[t.op])n[t.op](t,e);else for(var r=e.length,o=0;o<r;){var a=e[o];o++,n[t.op][a.op]&&n[t.op][a.op](t,a)}return e},n={remove:function(e,t){for(var n,a=t.length,i=0;n=t[i];)("add"!==n.op&&"test"!==n.op||e.path!==n.path)&&(n.from&&(n.from===e.path||0===n.from.indexOf(e.path+"/"))||e.path===n.path||0===n.path.indexOf(e.path+"/"))&&(t.splice(i,1),a--,i--),i++;var c=e.path.lastIndexOf("/");if(c>-1){var u=e.path.substr(c+1),s=e.path.substr(0,c+1);if(o(u))for(a=t.length,i=0;i<a;)n=t[i],i++,0===n.path.indexOf(s)&&(n.path=r(n.path,s,u,-1)),n.from&&0===n.from.indexOf(s)&&(n.from=r(n.from,s,u,-1))}},add:function(e,t){for(var n,a=t.length,i=0;n=t[i];)("add"!==n.op&&"test"!==n.op||e.path!==n.path)&&(n.from&&(n.from===e.path||0===n.from.indexOf(e.path+"/"))||e.path===n.path||0===n.path.indexOf(e.path+"/"))&&(t.splice(i,1),a--,i--),i++;var c=e.path.lastIndexOf("/");if(c>-1){var u=e.path.substr(c+1),s=e.path.substr(0,c+1);if(o(u))for(a=t.length,i=0;i<a;)n=t[i],i++,0===n.path.indexOf(s)&&(n.path=r(n.path,s,u,1)),n.from&&0===n.from.indexOf(s)&&(n.from=r(n.from,s,u,1))}},replace:function(e,t){for(var n,r=0;n=t[r];)(n.from&&(n.from===e.path||0===n.from.indexOf(e.path+"/"))||0===n.path.indexOf(e.path+"/"))&&(t.splice(r,1),r--),r++}};function r(e,t,n,r){var a=e.substr(t.length),i=a.indexOf("/");i>-1||(i=a.length);var c=a.substr(0,i),u=a.substr(i);return o(c)&&r>0&&c>=n||r<0&&c>n?t+(parseInt(c)+r)+u:e}function o(e){var t=~~Number(e);return String(t)===e&&t>=0}return e}(),k=function(e,t){Object.defineProperty(e,"[[attributes]]",{writable:!0,enumerable:!1,value:t}),Object.defineProperty(e,"[[base]]",{writable:!0,enumerable:!1,value:x.deepClone(t)}),Object.defineProperty(e,"[[patches]]",{writable:!0,enumerable:!1,value:[]}),Object.defineProperty(e,"[[batch]]",{writable:!0,enumerable:!1,value:1}),Object.defineProperty(e,"[[syncRate]]",{writable:!0,enumerable:!1,value:0}),L(e,t),"function"==typeof e.onChange&&e.on("Δ.change",(function(t){return J(e,"change",t)}))},N=function(e){var t=[];return e["[[patches]]"].forEach((function(n){var r=!n.staged;n.batchId||(n.batchId=e["[[batch]]"]),r&&(n.staged=!0,t.push(n))})),t},S=function(e,t){var n;return e&&e["[[patches]]"]?(x.applyPatch(e["[[attributes]]"],t),(n=e["[[patches]]"]).push.apply(n,b()(t)),t):[]},C=function(e,t){return e["[[patches]]"]=T.transform(e["[[patches]]"],t),J(e,"merge",t),R(e,t)},I=function(e){return e["[[batch]]"]++},D=function(e,t){var n=e["[[patches]]"].filter((function(e){return e.batchId===t}));return e["[[patches]]"]=e["[[patches]]"].filter((function(e){return e.batchId!==t})),R(e,n)},R=function(e,t){x.applyPatch(e["[[base]]"],t);var n=x.deepClone(e["[[base]]"]);return x.applyPatch(n,e["[[patches]]"]),e["[[attributes]]"]=n,L(e,n),t},L=function(e,t){Object(m.each)(t,(function(t,n){n&&n.on&&n.on("Δ.change",(function(n){var r,o=n.map((function(e){return{op:e.op,path:"/".concat(t).concat(e.path),value:e.value}}));(r=e["[[patches]]"]).push.apply(r,b()(o)),e.emit("Δ.change",o)}))}))},J=function(e,t,n){e.emit("Δ.".concat(t),n);var r="on".concat(Object(m.toCapitalized)(t));"function"==typeof e[r]&&e[r](n)},q=function(e){function t(){var e,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return a()(this,t),e=s()(this,f()(t).call(this)),k(h()(e),n),e}return v()(t,e),c()(t,[{key:"set",value:function(e){Object.assign(this,e)}},{key:"uid",get:function(){return void 0!==this.id?"".concat(this.constructor.name,".").concat(this.id):null}},{key:"validation",get:function(){return this["[[validation]]"].for(this)}}]),t}(m.EventEmitter);Object.defineProperty(q.prototype,"[[validation]]",{writable:!0,enumerable:!1,value:(r={},{for:function(e){e["[[validationState]]"]||Object.defineProperty(e,"[[validationState]]",{enumerable:!1,value:{}});var t=e["[[validationState]]"],n=function(e){return o(e).length>0},o=function(t){var n=r[t];if(void 0!==n){var o=e[t],a=[],i=Object(m.toTitleCase)(t);return n.forEach((function(t){return t({property:o,label:i,errors:a,resource:e})})),a}return[]},a={addHandler:function(e,t){r[e]=r[e]||[],r[e].push(t)},errorMessageFor:function(e){var t=o(e);if(0===t.length)return" ";if(1===t.length)return"".concat(Object(m.toTitleCase)(e)," ").concat(t[0]);var n=t.pop();return"".concat(Object(m.toTitleCase)(e)," ").concat(t.join(", ")," and ").concat(n)},shouldShowErrorsFor:function(e){return!0===t[e]&&n(e)},showErrorsFor:function(n){t[n]=!0,e.emit("Δ.change")},hideErrorsFor:function(e){t[e]=!1},showAllErrors:function(){Object(m.each)(r,(function(e){t[e]=!0})),e.emit("Δ.change")},hideAllErrors:function(){Object(m.each)(r,(function(e){t[e]=!1})),e.emit("Δ.change")},get isInvalid(){var e=!1;return Object(m.each)(r,(function(t){e=e||n(t)})),e},get isValid(){return!a.isInvalid}};return a}})});var M=n(8),U=n.n(M),F=n(12),V=n.n(F),B=n(13),H=n.n(B);function z(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Q(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?z(Object(n),!0).forEach((function(t){H()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):z(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Y=["String","Boolean","Number","Date","Function"],K=[Object.prototype,Function.prototype,q.prototype,q,m.EventEmitter.prototype,void 0,null],G=function(e){return"function"==typeof e?["length","name","prototype"]:["constructor","[[attributes]]","[[patches]]","[[base]]","[[batch]]","[[validation]]"]},W=function(e){var t=function e(t,r){for(var c={},u={},s=function(e){Object(m.each)(Object.getOwnPropertyDescriptors(e),(function(t,n){G(e).includes(t)||(u[t]=r[t],c[t]=n)}))},p=r;!K.includes(p);p=p.__proto__)s(p);return Object(m.map)(u,(function(u,s){var p=c[u],f=Object(m.getMetadata)(r,u);return"private"===f.accessLevel?null:X(s,p)?n("".concat(t,"/").concat(u),s,p,f,r,u):Z(s,p)?e("".concat(t,"/").concat(u),s):$(s,p)?o("".concat(t,"/").concat(u),s,p,f,r,u):ee(s,p)?a("".concat(t,"/").concat(u),s,p,f,r,u):te(s,p)?i("".concat(t,"/").concat(u),s,p,f,r,u):void 0}))},n=function(e,t){var n=new t;return{name:e,type:"class",className:t.name,classMethods:r(e,t),instanceMethods:Q({},r("".concat(e,"/#"),n),{sync:o("".concat(e,"/#/sync"),n.sync,{},{},n)})}},r=function(e,n){for(var r={},c=function(e){Object(m.each)(Object.getOwnPropertyDescriptors(e),(function(t,n){G(e).includes(t)||(r[t]=n)}))},u=n;!K.includes(u);u=u.__proto__)c(u);return Object(m.map)(r,(function(r,c){var u=Object(m.getMetadata)(n,r);return Z(c.value,c)?t("".concat(e,"/").concat(r),c.value,c,u,n,r):$(c.value,c)?o("".concat(e,"/").concat(r),c.value,c,u,n,r):ee(c.value,c)?a("".concat(e,"/").concat(r),c.value,c,u,n,r):te(c.value,c)?i("".concat(e,"/").concat(r),c.value,c,u,n,r):void 0}))},o=function(t,n,r,o,a){var i=o.isShared,c=o.accessLevel,u=o.authCheck,s=o.usesSession;return i?{name:t,type:"shared-function",value:n.toString()}:(e.on(t,function(){var e=V()(U.a.mark((function e(t){var r,o,i,p,f,l,h,d,v;return U.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t.args,o=t.uid,i=t.patches,p=t.connection,f=t.send,l=t.onClose,p.cache=p.cache||ae(p),h=function(e,t){s&&p.session.save(),f(ie(e,p),t)},d=o?p.cache.getCached(o):"function"==typeof a?a:new a.constructor,i&&S(d,i),e.t0="private"===c,e.t0){e.next=13;break}if(e.t1="protected"===c,!e.t1){e.next=12;break}return e.next=11,u(p.session,d);case 11:e.t1=!e.sent;case 12:e.t0=e.t1;case 13:if(!e.t0){e.next=15;break}return e.abrupt("return",f({error:!0,message:"You are not authorized to call this method"}));case 15:s&&r.unshift(p.session);try{v=n.apply(d,r)}catch(e){f({error:!0,message:e.message})}v&&v.catch&&v.catch((function(e){return f({error:!0,message:e.message})})),ne(v)?(v.observe((function(e){return h(e,!0)})),l((function(){return v.destroy()}))):re(v)?v.then((function(e){return h(e)})):h(v);case 19:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),{name:t,type:"remote-function"})},a=function(e,t,n,r,a,i){var c=r.validators;return{name:e,key:i,type:"property",get:o("".concat(e,".get"),n.get||function(){return null},n,r,a),set:o("".concat(e,".set"),n.set||function(){return null},n,r,a),validators:c&&c.map((function(e){return e.toString()}))}},i=function(e,t,n,r,o,a){var i=r.validators;return{name:e,key:a,type:"attribute",value:n.value,validators:i&&i.map((function(e){return e.toString()}))}};return function(e){if(!Z(e))throw Error("$interface must be a plain JavaScript Object");return t("global",e)}},X=function(e){return"function"==typeof e&&e.prototype instanceof q},Z=function(e){return e&&e.__proto__===Object.prototype},$=function(e){return"function"==typeof e&&!X(e)},ee=function(e,t){return"function"==typeof t.get||"function"==typeof t.set},te=function(e,t){return[X,Z,$,ee].every((function(n){return!n(e,t)}))},ne=function(e){return e&&"function"==typeof e.observe},re=function(e){return e&&"function"==typeof e.then&&!ne(e)},oe={},ae=function(e){var t=e.socket,n={};return{cache:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(oe[e.uid]=oe[e.uid]||{patches:[],branches:[]},C(e,oe[e.uid].patches),!n[e.uid]){n[e.uid]=e,oe[e.uid].branches.push({socket:t,resource:e}),t.on("".concat(e.uid,".sync"),(function(n){var r=n.batchId,a=n.patches;S(e,a),o(r),t.emit("".concat(e.uid,".commitBatch"),r)})),e.on("Δ.sync",(function(){N(e);var t=I(e);o(t,{includeSelf:!0})}));var r=[];e.on("Δ.commiting",(function(){r.push(b()(oe[e.uid].patches))})),e.on("Δ.commited",(function(){var t=r.shift();oe[e.uid].patches=oe[e.uid].patches.filter((function(e){return!t.includes(e)}))}))}var o=function(n){var r,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=o.includeSelf,i=void 0!==a&&a,c=D(e,n);(r=oe[e.uid].patches).push.apply(r,b()(c)),oe[e.uid].branches.forEach((function(e){var n=e.socket,r=e.resource;(t!=n||i)&&(C(r,c),n.emit("".concat(r.uid,".mergePatches"),c))}))};return e},getCached:function(e){return n[e]}}},ie=function e(t,n){var r,o=function(t){return e(t,n)};return t?X(t)?{_class_:t.name}:(r=t,Y.includes(r.constructor.name)?t:function(e){return Array.isArray(e)}(t)?t.map((function(e,t){return o(e)})):Z(t)?Object(m.map)(t,(function(e,t){return o(t)})):function(e){return e instanceof q}(t=n.cache.cache(t))?Q({},Object(m.map)(t["[[attributes]]"],(function(e,r){var a=Object(m.getMetadata)(t,e),i=a.accessLevel,c=a.authCheck;return"private"==i?null:"protected"!=i||c(n.session)?o(r):null})),{_proto_:t.constructor.name}):void 0):t},ce=n(16),ue=n.n(ce),se=["String","Boolean","Number","Date","Function"],pe=function(e){var t=fe({socket:e}),n={Resource:q,List:A},r=function(e){var t=function(e){function t(){return a()(this,t),s()(this,f()(t).apply(this,arguments))}return v()(t,e),t}(q);return Object.defineProperty(t,"name",{value:e.className}),o(t,e.classMethods),o(t.prototype,e.instanceMethods),t},o=function e(t,n){return Object(m.each)(n,(function(n,o){switch(o.type){case"class":t[n]=r(o);break;case"object":t[n]=e({},o);break;case"shared-function":t[n]=c(o);break;case"remote-function":t[n]=u(o);break;case"property":p(t,n,o);break;case"attribute":t[n]=l(o,t)}})),t},i=function(e){switch(e.type){case"shared-function":return c(e);case"remote-function":return u(e)}},c=function(e){return new Function("return ".concat(e.value))()},u=function(t){var n=t.name,r=function(t,r){var o=this.uid,a=this.getNewPatches?this.getNewPatches():[],i=function(e){e&&e.error&&t.throw(new Error(e.message));var n=h(e,(function(){return t(n)}));t(n)};e.emit(n,{uid:o,patches:a,args:r},(function(t){var c=t.value,u=t.hook;i(c),void 0!==u&&(e.on(u,(function(e){var t=e.value;return i(t)})),e.on("reconnect",(function(){e.emit(n,{uid:o,patches:a,args:r},(function(t){var n=t.value,r=t.hook;i(n),void 0!==r&&e.on(r,(function(e){var t=e.value;return i(t)}))}))})))}))};return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return new m.Pipe([this,r],t)}},p=function(e,t,n){var r=e.validation;r&&n.validators&&n.validators.forEach((function(e){r.addHandler(n.key,c({value:e}))})),Object.defineProperty(e,t,{get:i(n.get),set:i(n.set)})},l=function(e,t){var n=t.validation;return n&&e.validators&&e.validators.forEach((function(t){n.addHandler(e.key,c({value:t}))})),e.value},h=function e(r,o){var a=function(t){return e(t,o)};if(!r)return r;if(se.includes(r.constructor.name))return r;if(Array.isArray(r))return g()(A,b()(r.map((function(e){return a(e)}))));var i=r._class_,c=r._proto_,u=ue()(r,["_class_","_proto_"]);return i?n[__class__]:c?t.register(new n[c](Object(m.map)(u,(function(e,t){return a(t)}))),o):Object(m.map)(u,(function(e,t){return a(t)}))};return function(e){if("object"!==E()(e))throw Error("schema must be a plain JavaScript Object");return o(n,e)}},fe=function(e){var t=e.socket;return{register:function(){var e,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=arguments.length>1?arguments[1]:void 0;return n.on("Δ.change",(function(){e&&clearTimeout(e),e=setTimeout((function(){n.emit("Δ.sync")}),n["[[syncRate]]"])})),n.on("Δ.sync",(function(){var e=N(n),o=I(n);t.emit("".concat(n.uid,".sync"),{patches:e,batchId:o}),r()})),t.on("".concat(n.uid,".commitBatch"),(function(e){D(n,e)})),t.on("".concat(n.uid,".mergePatches"),(function(e){C(n,e),r()})),n}}},le=n(17),he=n.n(le),de=n(3),ve=n.n(de),me=n(18),ye=n.n(me);function be(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Oe(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?be(Object(n),!0).forEach((function(t){H()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):be(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var ge=n(19)(),we=n(20).Server(ge),Ee=n(21)(we,{serveClient:!1}),Pe=n(22),_e=n(23),je=n(24);function Ae(e){var t={};return e.keys().forEach((function(n){if(!n.includes("__")){var r=n.replace(".js","").split("/").pop(),o=e(n);o[r]&&(t[r]=o[r])}})),t}ve.a.existsSync("./.sessions")||ve.a.mkdirSync("./.sessions"),ve.a.existsSync("./.uploads")||ve.a.mkdirSync("./.uploads");var xe=Pe({origin:function(e,t){t(null,e)},credentials:!0}),Te=_e(),ke=n(25),Ne=ke({store:new(n(26)(ke))({path:"./.sessions"}),secret:"keyboard cat",resave:!0,saveUninitialized:!0});function Se(e,t){return Ce.apply(this,arguments)}function Ce(){return(Ce=V()(U.a.mark((function e(t,n){var r,o,a;return U.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t="function"==typeof t?Ae(t):t,r=new m.EventEmitter,o=W(r),a=o(t),ge.use(Ne),ge.use(Te),ge.use(xe),ge.get("/init",(function(e,t){return t.json({ok:!0})})),ge.post("/upload",Ie),ge.get("/cdn*",De),Ee.use((function(e,t){return Ne(e.request,e.request.res,t)})),Ee.on("connection",(function(e){var t=e.request.session,n=0,o={socket:e,session:t};e.use((function(t,a){var i=he()(t,3),c=i[0],u=i[1],s=i[2],p=function(){return null},f=!1,l=!1;r.emit(c,Oe({},u,{connection:o,send:function(t,r){f?e.emit(l,{value:t}):(f=!0,r?(l="".concat(n++,": ").concat(c),s({value:t,hook:l})):s({value:t}))},onClose:function(e){return p=e}})),e.on("disconnect",(function(){return p()})),a()})),e.emit("interface",a)})),we.listen(8080);case 13:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var Ie=function(e,t){var n=new je.IncomingForm,r=[];n.parse(e,(function(e,n,o){for(var a=Oe({},n,{},o),i=0;i<a.length;i++){var c=a[i],u=c.name.split(".").pop(),s="".concat(Re(),".").concat(u);r.push("/cdn/".concat(s)),ve.a.rename(c.path,"".concat("./.uploads","/").concat(s),(function(e){if(e)throw e}))}t.end(JSON.stringify(r))}))},De=function(e,t){var n=e.url.replace("/cdn","".concat("./.uploads","/")),r=n.split(".").pop(),o=ve.a.statSync(n),a=ye.a.lookup(r);t.writeHead(200,{"Content-Type":a,"Content-Length":o.size}),ve.a.createReadStream(n).pipe(t)},Re=function(){for(var e="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=t.length,r=0;r<12;r++)e+=t.charAt(Math.floor(Math.random()*n));return e}}]);