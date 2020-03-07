module.exports=function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=10)}([function(e,t){e.exports=require("@babel/runtime/helpers/interopRequireDefault")},function(e,t){e.exports=require("@babel/runtime/regenerator")},function(e,t){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.EventEmitter=void 0;var i=n(r(4)),o=n(r(1)),a=n(r(6)),u=n(r(7)),s=n(r(8)),c=n(r(2)),l=r(9).Pipe,f=Symbol(),d=Symbol(),p=Symbol(),h=function(){function e(){(0,u.default)(this,e),Object.defineProperty(this,d,{value:{},enumerable:!1,writable:!0}),Object.defineProperty(this,p,{value:{},enumerable:!1,writable:!0}),Object.defineProperty(this,f,{value:[],enumerable:!1,writable:!0})}return(0,s.default)(e,[{key:"_nowAndOn",value:function(e,t){t.callback=e,e(),t.calls.forEach((function(t){return e.apply(void 0,(0,a.default)(t))}))}},{key:"nowAndOn",value:function(e,t){var r={events:e,calls:[],callback:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return r.calls.push(t)}},n=this.on(e);n.observe((function(){r.callback.apply(r,arguments)}));var i=new l(this._nowAndOn,r);return i.onCancel((function(){return n.destroy()})),t&&i.observe(t),i}},{key:"_onArray",value:function(e,t){var r=this;!function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Object,t=arguments.length>1?arguments[1]:void 0,r=entries(e),n=Array.isArray(r),i=0;for(r=n?r:r["function"==typeof Symbol?Symbol.iterator:"@@iterator"]();;){var o;if(n){if(i>=r.length)break;o=r[i++]}else{if((i=r.next()).done)break;o=i.value}var a=o,u=(0,c.default)(a,2),s=u[0],l=u[1],f=t(s,l,e);if(f===Break)break}}(t,(function(t,n){return r.on(n,e)}))}},{key:"on",value:function(e,t){var r;return r=Array.isArray(e)?new l([this,this._onArray],e):this.provision(e),t&&r.observe(t),r}},{key:"emit",value:function(e,t){var r=this,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return Promise.all(this[f].map((function(i){if(r.matches(i.predicate,e))return new Promise((function(r){var o=i.callback(t,e,n);o&&o.then?o.then(r):r()}))})))}},{key:"_provision",value:function(e,t,r){t.callback=e,r.forEach((function(t){var r,n,i;return o.default.async((function(u){for(;;)switch(u.prev=u.next){case 0:return r=(0,c.default)(t,2),n=r[0],i=r[1],u.next=3,o.default.awrap(e.apply(void 0,(0,a.default)(n)));case 3:i();case 4:case"end":return u.stop()}}))}))}},{key:"provision",value:function(e){var t=this,r=new Array,n={predicate:e,callback:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return new Promise((function(e){r.push([t,e])}))}};this[f].push(n);var i=new l(this._provision,n,r);return i.onCancel((function(){t[f]=t[f].filter((function(e){return e!==n}))})),i}},{key:"of",value:function(t){var r=this;if(this[p][t])return this[p][t];var n=this[p][t]=new e,o=Symbol();return this.on(t+".*",(function(e,r,i){if(!i[o]){var a=r.replace(t+".","");n.emit(a,e)}})),n.on("*",(function(e,n){r.emit(t+"."+n,e,(0,i.default)({},o,!0))})),n}},{key:"matches",value:function(e,t){return t===e||(!(!t.endsWith("*")||!e.startsWith(t.substr(0,t.length-1))&&!e.startsWith("*"))||(!(!t.startsWith("*")||!e.endsWith(t.substr(1))&&!e.endsWith("*"))||(!(!e.endsWith("*")||!t.startsWith(e.substr(0,e.length-1)))||!(!e.startsWith("*")||!t.endsWith(e.substr(1))))))}},{key:"bin",get:function(){return this[f]}}]),e}();t.EventEmitter=h,"undefined"!=typeof window&&(window.EventEmitter=h)},function(e,t){e.exports=require("@babel/runtime/helpers/defineProperty")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.unique=t.deepMap=t.find=t.index=t.group=t.map=t.filter=t.each=void 0;n(r(1));var i=n(r(2)),o=function(e){return e?"function"==typeof e.entries?e.entries():Object.entries(e):[]};t.index=function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"_id",n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:void 0,o=new Object,u="function"==typeof r?r:function(e,t){return t[r]};return t="function"==typeof n?n:n?function(e,t){return t[n]}:function(e,t){return t},a(e,(function(e,r){var n=u(e,r);o[n]=t(e,r),void 0===o[n]&&(o[u(r)]=i)})),o};t.group=function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"_id",n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:void 0,o=new Object,u="function"==typeof r?r:function(e,t){return t[r]};return t="function"==typeof n?n:n?function(e,t){return t[n]}:function(e,t){return t},a(e,(function(e,r){var n=u(e,r);o[n]=o[n]||new Array,o[n].push(t(e,r)||i)})),o};t.unique=function(e){return e.filter((function(e,t,r){return r.indexOf(e)===t}))};var a=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Object,t=arguments.length>1?arguments[1]:void 0,r=o(e),n=Array.isArray(r),a=0;for(r=n?r:r["function"==typeof Symbol?Symbol.iterator:"@@iterator"]();;){var u;if(n){if(a>=r.length)break;u=r[a++]}else{if((a=r.next()).done)break;u=a.value}var s=u,c=(0,i.default)(s,2),l=c[0],f=c[1],d=t(l,f,e);if("_break"===d)break}};t.each=a;t.map=function(e,t){var r=new Object;return a(e,(function(n,i){r[n]=t(n,i,e)})),Array.isArray(e)?Object.values(r):r};t.filter=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(e,t){return t},r=new Object;return a(e,(function(n,i){t(n,i,e)&&(r[n]=i)})),r};t.find=function(e,t){var r=null;return a(e,(function(n,i){if(t(n,i,e))return r=i,"_break"})),r};var u=["String","Boolean","Number","Date","Function"];t.deepMap=function e(t,r){if((i=t)&&"object"==typeof i&&!u.includes(i.constructor.name)){for(var n in t)t[n]=e(t[n],r);return r(t)}return t;var i}},function(e,t){e.exports=require("@babel/runtime/helpers/toConsumableArray")},function(e,t){e.exports=require("@babel/runtime/helpers/classCallCheck")},function(e,t){e.exports=require("@babel/runtime/helpers/createClass")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.Pipe=void 0;var i=n(r(2)),o=n(r(1)),a=n(r(6)),u=n(r(7)),s=n(r(8)),c=n(r(4)),l=r(5),f=r(3),d=Symbol(),p=Symbol(),h=function(){function e(t){var r,n=this;(0,u.default)(this,e),(0,c.default)(this,"listeners",[]),(0,c.default)(this,"observers",[]),(0,c.default)(this,"dependencies",[]),(0,c.default)(this,"errorHandlers",[]),(0,c.default)(this,"cancelationHandlers",[]),(0,c.default)(this,"executions",[]),(0,c.default)(this,"currentValue",p),(0,c.default)(this,"resources",{}),(0,c.default)(this,"emit",(function(){var e,t,r,i,u,s=arguments;return o.default.async((function(c){for(;;)switch(c.prev=c.next){case 0:for(e=s.length,t=new Array(e),r=0;r<e;r++)t[r]=s[r];return n.currentValue=t[0],i=(0,a.default)(n.listeners),u=(0,a.default)(n.observers),n.listeners=[],c.next=7,o.default.awrap(Promise.all([].concat((0,a.default)(i.map((function(e){return e.apply(void 0,t)}))),(0,a.default)(u.map((function(e){return e.apply(void 0,t)}))))));case 7:case"end":return c.stop()}}))})),(0,c.default)(this,"throwError",(function(e){n.currentValue=e,n.errorHandlers.forEach((function(t){return t(e)}))})),(0,c.default)(this,d,(function(){var e,t,r,i,u,s,c,l;return o.default.async((function(f){for(;;)switch(f.prev=f.next){case 0:t=!1,r=function(){return t=!0},i=0,n.executions.push(r),(u=function(){if(!t){for(;n.executions.length&&n.executions[0]!=r;){var e=n.executions.shift();e()}n.executions.shift(),n.emit.apply(n,arguments)}}).throw=n.throwError,u.pipe=n;try{e=(s=n.process).call.apply(s,[n.thisArg,u].concat((0,a.default)(n.args)))}catch(e){n.throwError(e)}if(c=function r(a){var s=a.value,c=a.done;i++;var f,d=n.constructor,p=d.isPipe,h=d.isPromise,v=(d.isObservable,n.cached),b=n.cache,m=v(s),g=n.getCachedResource(s,i),y=function(t){return e.throw?r(e.throw(t)):n.throwError(t)};if(!c||void 0!==s)return f=c?function(){return!t&&u.apply(void 0,arguments)}:function(){return!t&&l.apply(void 0,arguments)},new Promise((function(){return o.default.async((function(e){for(;;)switch(e.prev=e.next){case 0:if(!m){e.next=9;break}if(!(m.currentValue instanceof Error)){e.next=5;break}y(m.currentValue),e.next=7;break;case 5:return e.next=7,o.default.awrap(f(m.currentValue));case 7:e.next=27;break;case 9:if(!g){e.next=14;break}return e.next=12,o.default.awrap(f(g));case 12:e.next=27;break;case 14:if(!p(s)){e.next=19;break}n.dependencies.push(s),s.apply((function(e){b(s),f(e)}),(function(e){b(s),y(e)})),e.next=27;break;case 19:if(!h(s)){e.next=24;break}return e.next=22,o.default.awrap(s.then(f).catch((function(e){return y(e)})));case 22:e.next=27;break;case 24:return c||n.cacheResource(s,i),e.next=27,o.default.awrap(f(s));case 27:case"end":return e.stop()}}))}))},l=function(t){try{t=e.next(t),c(t)}catch(e){n.throwError(e)}},!e||"function"!=typeof e.next){f.next=15;break}return f.next=13,o.default.awrap(l());case 13:f.next=17;break;case 15:return f.next=17,o.default.awrap(c({value:e,done:!0}));case 17:case"end":return f.stop()}}))})),(0,c.default)(this,"cache",(function(e){var t=function(e){!n.observers.length&&!n.listeners.length||n.isCanceled||n[d]()};e.catch(t),e.observe(t),n.onCancel((function(){return e.unobserve(t)}))})),(0,c.default)(this,"cached",(function(e){var t=n.dependencies.find((function(t){return t.isEqual(e)}));if(t)return t!==e&&e.destroy(),t})),(0,c.default)(this,"getCachedResource",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;if(e){var r=e.uid||JSON.stringify(e)+"."+t;return n.resources[r]}})),(0,c.default)(this,"isEqual",(function(e){return e&&e.process==n.process&&JSON.stringify(e.args)===JSON.stringify(n.args)&&(e.thisArg==n.thisArg||!e.thisArg||!n.thisArg||n.thisArg.id==e.thisArg.id)})),Array.isArray(t)&&(r=t[0],t=t[1]),this.process=t,this.thisArg=r;for(var i=arguments.length,s=new Array(i>1?i-1:0),l=1;l<i;l++)s[l-1]=arguments[l];this.args=s,setTimeout((function(){n.alreadyInitialized||n.isCanceled||n[d]()}))}return(0,s.default)(e,[{key:"observe",value:function(e){return this.cachedValue&&e(this.cachedValue),this.observers.push(e),this}},{key:"unobserve",value:function(e){this.observers=this.observers.filter((function(t){return t!=e})),0==this.observers.length&&this.destroy()}},{key:"then",value:function(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};if(this.currentValue!==p)return this.currentValue instanceof Error?r(this.currentValue):e(this.currentValue);var n=function e(n){t.errorHandlers=t.errorHandlers.filter((function(t){return t!=e})),r(n)};this.catch(n);var i=function(){return i=!0};return this.listeners.push((function(){var r=arguments;return o.default.async((function(a){for(;;)switch(a.prev=a.next){case 0:if(t.errorHandlers=t.errorHandlers.filter((function(e){return e!=n})),!0===i){a.next=4;break}return a.next=4,o.default.awrap(e.apply(void 0,r));case 4:i();case 5:case"end":return a.stop()}}))})),new Promise((function(e){return!0===i?e():i=e}))}},{key:"catch",value:function(e){this.errorHandlers.push(e)}},{key:"onCancel",value:function(e){this.cancelationHandlers.push(e)}},{key:"apply",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};this.currentValue!=p?this.currentValue instanceof Error?t(this.currentValue):e(this.currentValue):(this.then(e,t),this.alreadyInitialized=!0,this[d]())}},{key:"destroy",value:function(){this.isCanceled=!0,this.cancelationHandlers.forEach((function(e){return e()}))}},{key:"cacheResource",value:function(e,t){if(!e)return e;var r;if(e.uid)r=e.uid;else{var n=JSON.stringify(e);r=n+"."+t,this.currentValue!=p&&(0,l.each)(this.resources,(function(e){var t=e.split(".");if((0,i.default)(t,1)[0]===n)throw Error("A new resource was conditionally yielded identical to a prior resource. This behavior is not supported, as TriFrame will not know where to properly yield state. Please give your resources unique `uid` properties")}))}this.resources[r]=e;var o=new f.EventEmitter;this.cache(o.on("change")),b(e,(function(e){"function"==typeof e.on?e.on("Δ.change",(function(){return o.emit("change")})):(0,l.each)(e,(function(t,r){Object.defineProperty(e,t,{get:function(){return r},set:function(e){r=e,o.emit("change")}})}))}))}}]),e}();t.Pipe=h,(0,c.default)(h,"isPipe",(function(e){return e&&"function"==typeof e.observe})),(0,c.default)(h,"isPromise",(function(e){return e&&"function"==typeof e.then}));var v=["String","Boolean","Number","Date","Function"],b=function e(t,r){if(function(e){return e&&"object"==typeof e&&!v.includes(e.constructor.name)}(t))for(var n in r(t),t){e(t[n],r)}}},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"each",{enumerable:!0,get:function(){return n.each}}),Object.defineProperty(t,"filter",{enumerable:!0,get:function(){return n.filter}}),Object.defineProperty(t,"map",{enumerable:!0,get:function(){return n.map}}),Object.defineProperty(t,"group",{enumerable:!0,get:function(){return n.group}}),Object.defineProperty(t,"index",{enumerable:!0,get:function(){return n.index}}),Object.defineProperty(t,"find",{enumerable:!0,get:function(){return n.find}}),Object.defineProperty(t,"unique",{enumerable:!0,get:function(){return n.unique}}),Object.defineProperty(t,"deepMap",{enumerable:!0,get:function(){return n.deepMap}}),Object.defineProperty(t,"EventEmitter",{enumerable:!0,get:function(){return i.EventEmitter}}),Object.defineProperty(t,"toPlural",{enumerable:!0,get:function(){return o.toPlural}}),Object.defineProperty(t,"toSingular",{enumerable:!0,get:function(){return o.toSingular}}),Object.defineProperty(t,"toCamelCase",{enumerable:!0,get:function(){return o.toCamelCase}}),Object.defineProperty(t,"toPascalCase",{enumerable:!0,get:function(){return o.toPascalCase}}),Object.defineProperty(t,"toTitleCase",{enumerable:!0,get:function(){return o.toTitleCase}}),Object.defineProperty(t,"toDashed",{enumerable:!0,get:function(){return o.toDashed}}),Object.defineProperty(t,"toUnderscored",{enumerable:!0,get:function(){return o.toUnderscored}}),Object.defineProperty(t,"toHumanized",{enumerable:!0,get:function(){return o.toHumanized}}),Object.defineProperty(t,"toCapitalized",{enumerable:!0,get:function(){return o.toCapitalized}}),Object.defineProperty(t,"toTableName",{enumerable:!0,get:function(){return o.toTableName}}),Object.defineProperty(t,"toClassName",{enumerable:!0,get:function(){return o.toClassName}}),Object.defineProperty(t,"toForeignKeyName",{enumerable:!0,get:function(){return o.toForeignKeyName}}),Object.defineProperty(t,"replaceNumbersWithOrdinals",{enumerable:!0,get:function(){return o.replaceNumbersWithOrdinals}}),Object.defineProperty(t,"toColumnName",{enumerable:!0,get:function(){return o.toColumnName}}),Object.defineProperty(t,"getMetadata",{enumerable:!0,get:function(){return a.getMetadata}}),Object.defineProperty(t,"saveMetadata",{enumerable:!0,get:function(){return a.saveMetadata}}),Object.defineProperty(t,"metadata",{enumerable:!0,get:function(){return a.metadata}}),Object.defineProperty(t,"Pipe",{enumerable:!0,get:function(){return u.Pipe}});var n=r(5),i=r(3),o=r(11),a=r(12),u=r(9)},function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.toColumnName=t.replaceNumbersWithOrdinals=t.toForeignKeyName=t.toClassName=t.toTableName=t.toCapitalized=t.toHumanized=t.toUnderscored=t.toDashed=t.toTitleCase=t.toPascalCase=t.toCamelCase=t.toSingular=t.toPlural=t.isSingular=t.isPlural=void 0;var r={UNCOUNTABLE_WORDS:["equipment","information","rice","money","species","series","fish","sheep","moose","deer","news"],Rules:{SINGULAR_TO_PLURAL:[[/(m)an$/gi,"$1en"],[/(pe)rson$/gi,"$1ople"],[/(child)$/gi,"$1ren"],[/^(ox)$/gi,"$1en"],[/(ax|test)is$/gi,"$1es"],[/(octop|vir)us$/gi,"$1i"],[/(alias|status)$/gi,"$1es"],[/(bu)s$/gi,"$1ses"],[/(buffal|tomat|potat)o$/gi,"$1oes"],[/([ti])um$/gi,"$1a"],[/sis$/gi,"ses"],[/(?:([^f])fe|([lr])f)$/gi,"$1$2ves"],[/(hive)$/gi,"$1s"],[/([^aeiouy]|qu)y$/gi,"$1ies"],[/(x|ch|ss|sh)$/gi,"$1es"],[/(matr|vert|ind)ix|ex$/gi,"$1ices"],[/(m|l)ouse$/gi,"$1ice"],[/(quiz)$/gi,"$1zes"],[/s$/gi,"s"],[/$/g,"s"]],PLURAL_TO_SINGULAR:[[/(m)en$/gi,"$1an"],[/(pe)ople$/gi,"$1rson"],[/(child)ren$/gi,"$1"],[/([ti])a$/gi,"$1um"],[/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/gi,"$2sis"],[/(hive)s$/gi,"$1"],[/(tive)s$/gi,"$1"],[/(curve)s$/gi,"$1"],[/([lr])ves$/gi,"$1f"],[/([^fo])ves$/gi,"$1fe"],[/([^aeiouy]|qu)ies$/gi,"$1y"],[/(s)eries$/gi,"$1eries"],[/(m)ovies$/gi,"$1ovie"],[/(x|ch|ss|sh)es$/gi,"$1"],[/(m|l)ice$/gi,"$1ouse"],[/(bus)es$/gi,"$1"],[/(o)es$/gi,"$1"],[/(shoe)s$/gi,"$1"],[/(cris|ax|test)es$/gi,"$1is"],[/(octop|vir)i$/gi,"$1us"],[/(alias|status)es$/gi,"$1"],[/^(ox)en/gi,"$1"],[/(vert|ind)ices$/gi,"$1ex"],[/(matr)ices$/gi,"$1ix"],[/(quiz)zes$/gi,"$1"],[/s$/gi,""]]},TITLE_LOWERCASE_WORDS:["and","or","nor","a","an","the","so","but","to","of","at","by","from","into","on","onto","off","out","in","over","with","for"],CommonRegExp:{ID_SUFFIX:/(_ids|_id)$/g,UNDERSCORES:/_+/g,NUMBERS:/(^|\s)\d+/g,SPACES:/\s+/g,SPACES_OR_UNDERSCORES:/[\s_]+/g,UPPERCASE:/[A-Z]/g,UNDERSCORE_PREFIX:/^_/},applyRules_:function(e,t,r){if(!(-1!==r.indexOf(e.toLowerCase())))for(var n=0,i=t.length;n<i;++n){var o=t[n];if(o[0].test(e))return o[0].lastIndex=0,e.replace(o[0],o[1]);o[0].lastIndex=0}return e},toPlural:function(e){return r.applyRules_(e,r.Rules.SINGULAR_TO_PLURAL,r.UNCOUNTABLE_WORDS)},toSingular:function(e){return r.applyRules_(e,r.Rules.PLURAL_TO_SINGULAR,r.UNCOUNTABLE_WORDS)},toCamelCase:function(e,t){for(var n=(e=e.toLowerCase()).split(r.CommonRegExp.SPACES_OR_UNDERSCORES),i=!0===t?0:1,o=n.length;i<o;++i){var a=n[i];n[i]=a.charAt(0).toUpperCase()+a.substr(1)}return n.join("")},toPascalCase:function(e){return r.toCamelCase(e,!0)},toTitleCase:function(e){for(var t=(e=e.replace(r.CommonRegExp.UNDERSCORES," ")).split(r.CommonRegExp.SPACES),n=0,i=t.length;n<i;++n){for(var o=t[n].split("-"),a=0,u=o.length;a<u;++a){var s=o[a].toLowerCase();r.TITLE_LOWERCASE_WORDS.indexOf(s)<0&&(o[a]=r.toCapitalized(s))}t[n]=o.join("-")}return e=(e=t.join(" ")).charAt(0).toUpperCase()+e.substr(1)},toUnderscored:function(e){return(e=(e=(e=(e=e.replace(r.CommonRegExp.SPACES_OR_UNDERSCORES,"_")).replace(r.CommonRegExp.UPPERCASE,(function(e){return"_"+e}))).replace(r.CommonRegExp.UNDERSCORES,"_")).replace(r.CommonRegExp.UNDERSCORE_PREFIX,"")).toLowerCase()},toDashed:function(e){return e=e.replace(r.CommonRegExp.SPACES_OR_UNDERSCORES,"-")},toHumanized:function(e,t){return e=(e=(e=e.toLowerCase()).replace(r.CommonRegExp.ID_SUFFIX,"")).replace(r.CommonRegExp.UNDERSCORES," "),t?e:r.toCapitalized(e)},toCapitalized:function(e){return e=(e=e.toLowerCase()).charAt(0).toUpperCase()+e.substr(1)},toTableName:function(e){return e=r.toUnderscored(e),e=r.toPlural(e)},toColumnName:function(e){return e=r.toUnderscored(e)},toClassName:function(e){return e=r.toPascalCase(e),e=r.toSingular(e)},toForeignKeyName:function(e){return e=r.toUnderscored(e),e+="_id"},replaceNumbersWithOrdinals:function(e){return e.replace(r.CommonRegExp.NUMBERS,(function(e){var t=Number(e.slice(-1));if(1!==Number(e.slice(-2,-1))){if(1===t)return e+"st";if(2===t)return e+"nd";if(3===t)return e+"rd"}return e+"th"}))}};t.isPlural=function(e){return n(e)===e};t.isSingular=function(e){return i(e)===e};var n=r.toPlural;t.toPlural=n;var i=r.toSingular;t.toSingular=i;var o=r.toCamelCase;t.toCamelCase=o;var a=r.toPascalCase;t.toPascalCase=a;var u=r.toTitleCase;t.toTitleCase=u;var s=r.toDashed;t.toDashed=s;var c=r.toUnderscored;t.toUnderscored=c;var l=r.toHumanized;t.toHumanized=l;var f=r.toCapitalized;t.toCapitalized=f;var d=r.toTableName;t.toTableName=d;var p=r.toClassName;t.toClassName=p;var h=r.toForeignKeyName;t.toForeignKeyName=h;var v=r.replaceNumbersWithOrdinals;t.replaceNumbersWithOrdinals=v;var b=r.toColumnName;t.toColumnName=b},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.metadata=t.saveMetadata=t.getMetadata=void 0;var i=n(r(13)),o=n(r(4)),a=r(3);function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach((function(t){(0,o.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var c={},l=[Object.prototype,Function.prototype,a.EventEmitter.prototype,void 0,null];t.getMetadata=function(e,t){for(var r={},n="function"==typeof e?".":"#",i="function"==typeof e?e.prototype:e.__proto__;!l.includes(i);i=i.__proto__){var o=""+i.constructor.name+n+t;r=s({},c[o],{},r)}return r};t.saveMetadata=function(e,t,r){var n="function"==typeof e?e:e.constructor,o="function"==typeof e?".":"#",a=""+n.name+o+t;c[a]=c[a]||{},(0,i.default)(c[a],s({},r,{className:n.name,key:t,Class:n}))};var f=c;t.metadata=f},function(e,t){e.exports=require("@babel/runtime/helpers/extends")}]);