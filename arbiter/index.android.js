module.exports=function(e){var t={};function r(n){if(t[n])return t[n].exports;var a=t[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)r.d(n,a,function(t){return e[t]}.bind(null,a));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=16)}([function(e,t){e.exports=require("@babel/runtime/helpers/interopRequireDefault")},function(e,t){e.exports=require("triframe/core")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.updateResource=t.createCache=t.upstreamMerge=t.rollbackPatches=t.mergeBatch=t.createBatch=t.mergePatches=t.stageNewPatches=t.unstageLatentMutations=t.stageLatentMutations=t.initializeResource=void 0;var a=n(r(17)),o=n(r(15)),i=n(r(11)),u=n(r(9)),c=r(18),s=r(1),p=r(20);t.initializeResource=function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object.defineProperty(e,"[[attributes]]",{writable:!0,enumerable:!1,value:r}),Object.defineProperty(e,"[[base]]",{writable:!0,enumerable:!1,value:c.jsonpatch.deepClone(r)}),Object.defineProperty(e,"[[patches]]",{writable:!0,enumerable:!1,value:[]}),Object.defineProperty(e,"[[batch]]",{writable:!0,enumerable:!1,value:1}),Object.defineProperty(e,"[[syncRate]]",{writable:!0,enumerable:!1,value:0}),Object.defineProperty(e,"toJSON",{value:function(){return this["[[attributes]]"]}}),v(e,r),e.on("Δ.change",(function(){t&&clearTimeout(t),t=setTimeout((function(){e.uid&&e.emit("Δ.sync",new p.SyncEvent({resource:e}))}),e["[[syncRate]]"])})),e.on("Δ.sync",(function(t){var r=t.socket,n=t.patches,a=t.batchId;t.resource;m[e.uid]&&m[e.uid].forEach((function(e){var t=e.socket,a=e.resource;r!=t&&(l(a,n),t.emit(a.uid+".mergePatches",n))})),r&&r.emit(e.uid+".mergeBatch",a)})),f[e.uid]&&c.jsonpatch.applyPatch(r,f[e.uid])};var f={};t.stageLatentMutations=function(e,t){var r;f[e.uid]=f[e.uid]||[],(r=f[e.uid]).push.apply(r,(0,u.default)(t))};t.unstageLatentMutations=function(e,t){f[e.uid]=f[e.uid].filter((function(e){return!t.includes(e)}))};t.stageNewPatches=function(e){if(!e["[[patches]]"])return[];var t=[];return e["[[patches]]"].forEach((function(r){var n=!r.staged;r.batchId||(r.batchId=e["[[batch]]"]),n&&(r.staged=!0,t.push(r))})),t};var l=function(e,t){return e["[[patches]]"]=c.JSONPatchOT.transform(e["[[patches]]"],t),d(e,t)};t.mergePatches=l;t.createBatch=function(e){return e["[[batch]]"]++};t.mergeBatch=function(e,t){var r=e["[[patches]]"].filter((function(e){return e.batchId===t}));return e["[[patches]]"]=e["[[patches]]"].filter((function(e){return e.batchId!==t})),d(e,r)};t.rollbackPatches=function(e,t){var r=JSON.stringify(t);e["[[patches]]"]=e["[[patches]]"].filter((function(e){return!r.includes(JSON.stringify(e))}));var n=c.jsonpatch.deepClone(e["[[base]]"]);c.jsonpatch.applyPatch(n,e["[[patches]]"]),e["[[attributes]]"]=n,v(e,n)};var h=function(e,t){var r;return e&&e["[[patches]]"]?(c.jsonpatch.applyPatch(e["[[attributes]]"],t),(r=e["[[patches]]"]).push.apply(r,(0,u.default)(t)),t):[]},d=function(e,t){c.jsonpatch.applyPatch(e["[[base]]"],t);var r=c.jsonpatch.deepClone(e["[[base]]"]);return c.jsonpatch.applyPatch(r,e["[[patches]]"]),e["[[attributes]]"]=r,v(e,r),e.emit("Δ.rebase",e["[[base]]"]),t};t.upstreamMerge=function(e,t){var r=c.jsonpatch.deepMerge(e["[[attributes]]"],t["[[attributes]]"]),n=c.jsonpatch.deepMerge(e["[[base]]"],t["[[base]]"]);c.jsonpatch.applyPatch(r,e["[[patches]]"]),e["[[base]]"]=n,e["[[attributes]]"]=r,v(e,r),e.emit("Δ.rebase",e["[[base]]"])};var v=function(e,t){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];(0,s.each)(t,(function(t,n){n&&n.on&&(n.on("Δ.rebase",(function(n){var a=e["[[base]]"];!1!==r&&(a=a[r]),a[t]=n})),n.on("Δ.change",(function(r){var n,a=r.map((function(e){return{op:e.op,path:"/"+t+e.path,value:e.value}}));(n=e["[[patches]]"]).push.apply(n,(0,u.default)(a)),e.emit("Δ.change",a)})))}))},m={};t.createCache=function(e){var t=e.socket,r=e.session,n={};return{cache:function(e){n[e.uid]?(0,i.default)(n[e.uid]["[[attributes]]"],e["[[attributes]]"]):(m[e.uid]=m[e.uid]||[],m[e.uid].push({resource:e,socket:t}),n[e.uid]=e,t.on(e.uid+".sync",(function(n,a){var i,u,c,s,f;return o.default.async((function(l){for(;;)switch(l.prev=l.next){case 0:return i=n.batchId,u=n.patches,l.next=3,o.default.awrap(b(e,u,r));case 3:c=l.sent,s=c.updateSuccessful,f=c.invalidPatches,a({updateSuccessful:s,invalidPatches:f}),e.emit("Δ.sync",new p.SyncEvent({resource:e,batchId:i,socket:t}));case 8:case"end":return l.stop()}}))})))},getCached:function(e){return o.default.async((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",n[e]);case 1:case"end":return t.stop()}}))}}};var b=function(e,t,r){var n,i,u;return o.default.async((function(c){for(;;)switch(c.prev=c.next){case 0:return n=[],i=[],c.next=4,o.default.awrap((0,s.eachAsync)(t,(function(t,u){var c,p,f,l,h;return o.default.async((function(t){for(;;)switch(t.prev=t.next){case 0:if(c=u.path.split("/").slice(1),p=(0,a.default)(c,1),f=p[0],l=(0,s.getMetadata)(e,f),h=l.writeAccessTest,l.namespace,void 0!==h){t.next=6;break}n.push(u),t.next=10;break;case 6:return t.next=8,o.default.awrap(h.call(e,{session:r,resource:e}));case 8:t.sent?n.push(u):i.push(u);case 10:case"end":return t.stop()}}))})));case 4:return h(e,n),u=n.length===t.length,c.abrupt("return",{updateSuccessful:u,validPatches:n,invalidPatches:i});case 7:case"end":return c.stop()}}))};t.updateResource=b},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.Resource=void 0;var a,o=n(r(11)),i=n(r(4)),u=n(r(5)),c=n(r(12)),s=n(r(13)),p=n(r(6)),f=n(r(7)),l=n(r(14)),h=n(r(8)),d=r(1),v=r(2),m=Symbol(),b=function(e){function t(){var e,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(0,i.default)(this,t),e=(0,u.default)(this,(0,f.default)(t).call(this)),(0,v.initializeResource)((0,c.default)(e),r),e}return(0,p.default)(t,e),(0,s.default)(t,[{key:"emit",value:function(e){for(var r,n=arguments.length,a=new Array(n>1?n-1:0),o=1;o<n;o++)a[o-1]=arguments[o];return this[m]&&"Δ.change"==e?null:(r=(0,l.default)((0,f.default)(t.prototype),"emit",this)).call.apply(r,[this,e].concat(a))}},{key:"startBatchUpdate",value:function(){this[m]=!0}},{key:"commitBatchUpdate",value:function(){this[m]=!1,this.emit("Δ.change")}}],[{key:"on",value:function(e,t){var r=this;return e=Array.isArray(e)?e.map((function(e){return r.name+"."+e})):this.name+"."+e,this.events.on(e,t)}},{key:"emit",value:function(e){var t;console.log("Emitting: "+this.name+"."+e);for(var r=arguments.length,n=new Array(r>1?r-1:0),a=1;a<r;a++)n[a-1]=arguments[a];return(t=this.events).emit.apply(t,[this.name+"."+e].concat(n))}},{key:"nowAndOn",value:function(e,t){var r=this;return e=Array.isArray(e)?e.map((function(e){return r.name+"."+e})):this.name+"."+e,this.events.nowAndOn(e,t)}}]),(0,s.default)(t,[{key:"set",value:function(e){var t,r=[];(0,d.each)(e,(function(e,t){var n={op:"replace",path:"/"+e,value:t};r.push(n)})),this.emit("Δ.change",r),(t=this["[[patches]]"]).push.apply(t,r),(0,o.default)(this["[[attributes]]"],e)}},{key:"uid",get:function(){return void 0!==this.id?this.constructor.name+"."+this.id:null}},{key:"validation",get:function(){return this["[[validation]]"].for(this)}}]),t}(d.EventEmitter);t.Resource=b,(0,h.default)(b,"events",new d.EventEmitter),Object.defineProperty(b.prototype,"[[validation]]",{writable:!0,enumerable:!1,value:(a={},{handlers:a,for:function(e){e["[[validationState]]"]||Object.defineProperty(e,"[[validationState]]",{enumerable:!1,value:{}});var t=e["[[validationState]]"],r=function(e){return n(e).length>0},n=function(t){var r=a[t];if(void 0!==r){var n=e[t],o=[],i=(0,d.toTitleCase)(t);return r.forEach((function(t){return t.call(e,{property:n,label:i,errors:o,resource:e})})),o}return[]},o={addHandler:function(e,t){a[e]=a[e]||[],a[e].push(t)},errorMessageFor:function(e){var t=n(e);if(0===t.length)return" ";if(1===t.length)return(0,d.toTitleCase)(e)+" "+t[0];var r=t.pop();return(0,d.toTitleCase)(e)+" "+t.join(", ")+" and "+r},shouldShowErrorsFor:function(e){return!0===t[e]&&r(e)},showErrorsFor:function(r){t[r]=!0,e.emit("Δ.change")},hideErrorsFor:function(e){t[e]=!1},showAllErrors:function(){(0,d.each)(a,(function(e){t[e]=!0})),e.emit("Δ.change")},hideAllErrors:function(){(0,d.each)(a,(function(e){t[e]=!1})),e.emit("Δ.change")},get isInvalid(){var e=!1;return(0,d.each)(a,(function(t){e=e||r(t)})),e},get isValid(){return!o.isInvalid}};return o}})})},function(e,t){e.exports=require("@babel/runtime/helpers/classCallCheck")},function(e,t){e.exports=require("@babel/runtime/helpers/possibleConstructorReturn")},function(e,t){e.exports=require("@babel/runtime/helpers/inherits")},function(e,t){e.exports=require("@babel/runtime/helpers/getPrototypeOf")},function(e,t){e.exports=require("@babel/runtime/helpers/defineProperty")},function(e,t){e.exports=require("@babel/runtime/helpers/toConsumableArray")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.List=void 0;var a=n(r(9)),o=n(r(4)),i=n(r(13)),u=n(r(5)),c=n(r(12)),s=n(r(7)),p=n(r(14)),f=n(r(6)),l=n(r(19)),h=r(1),d=function(e){function t(){var e,r;(0,o.default)(this,t);for(var n=arguments.length,a=new Array(n),i=0;i<n;i++)a[i]=arguments[i];return r=(0,u.default)(this,(e=(0,s.default)(t)).call.apply(e,[this].concat(a))),Object.defineProperty((0,c.default)(r),"[[patches]]",{enumerable:!1,value:[]}),Object.defineProperty((0,c.default)(r),"[[events]]",{enumerable:!1,value:new h.EventEmitter}),r}return(0,f.default)(t,e),(0,i.default)(t,[{key:"on",value:function(){var e;return(e=this["[[events]]"]).on.apply(e,arguments)}},{key:"emit",value:function(){var e;return(e=this["[[events]]"]).emit.apply(e,arguments)}},{key:"push",value:function(){for(var e,r,n=this.length,o=arguments.length,i=new Array(o),u=0;u<o;u++)i[u]=arguments[u];var c=i.map((function(e){return{op:"add",path:"/"+n++,value:e}}));(e=this["[[patches]]"]).push.apply(e,(0,a.default)(c)),this.emit("Δ.change",c),(r=(0,p.default)((0,s.default)(t.prototype),"push",this)).call.apply(r,[this].concat(i))}},{key:"insert",value:function(e,t){this.splice(t,0,e);var r={op:"add",path:"/"+t,value:e};this["[[patches]]"].push(r),this.emit("Δ.change",[r])}},{key:"replace",value:function(e,t){this[e]=t;var r={op:"replace",path:"/"+e,value:t};this["[[patches]]"].push(r),this.emit("Δ.change",[r])}},{key:"map$",value:function(e){var t,r=this,n=[];this.forEach((function(t,a){var o=e(t,a);if(o!=t){r[a]=o;var i={op:"replace",path:"/"+a,value:o};n.push(i)}})),(t=this["[[patches]]"]).push.apply(t,n),this.emit("Δ.change",n)}},{key:"remove",value:function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;null==r&&(r=e),this.splice(e,1+r-e);for(var n=[],a=e;a<=r;a++)n.push({op:"remove",path:"/"+e});(t=this["[[patches]]"]).push.apply(t,n),this.emit("Δ.change",n)}}]),t}((0,l.default)(Array));t.List=d},function(e,t){e.exports=require("@babel/runtime/helpers/extends")},function(e,t){e.exports=require("@babel/runtime/helpers/assertThisInitialized")},function(e,t){e.exports=require("@babel/runtime/helpers/createClass")},function(e,t){e.exports=require("@babel/runtime/helpers/get")},function(e,t){e.exports=require("@babel/runtime/regenerator")},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"Resource",{enumerable:!0,get:function(){return n.Resource}}),Object.defineProperty(t,"List",{enumerable:!0,get:function(){return a.List}}),Object.defineProperty(t,"serialize",{enumerable:!0,get:function(){return o.serialize}}),Object.defineProperty(t,"createUnserializer",{enumerable:!0,get:function(){return i.createUnserializer}}),Object.defineProperty(t,"serve",{enumerable:!0,get:function(){return u.serve}}),Object.defineProperty(t,"getPatchesFor",{enumerable:!0,get:function(){return c.getPatchesFor}}),Object.defineProperty(t,"archivePatchesFor",{enumerable:!0,get:function(){return c.archivePatchesFor}});var n=r(3),a=r(10),o=r(21),i=r(22),u=r(25),c=r(2)},function(e,t){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.JSONPatchOT=t.jsonpatch=void 0;var a=n(r(8)),o=(r(10),r(3),r(1));function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}var u=function(e){var t={};function r(n){if(t[n])return t[n].exports;var a=t[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}return r.m=e,r.c=t,r.i=function(e){return e},r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(e,t){var r=this&&this.__extends||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);function n(){this.constructor=e}e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},n=Object.prototype.hasOwnProperty;function u(e,t){return n.call(e,t)}function c(e){if(Array.isArray(e)){for(var t=new Array(e.length),r=0;r<t.length;r++)t[r]=""+r;return t}if(Object.keys)return Object.keys(e);t=[];for(var n in e)u(e,n)&&t.push(n);return t}function s(e){return-1===e.indexOf("/")&&-1===e.indexOf("~")?e:e.replace(/~/g,"~0").replace(/\//g,"~1")}function p(e,t){var r;for(var n in e)if(u(e,n)){if(e[n]===t)return s(n)+"/";if("object"==typeof e[n]&&""!=(r=p(e[n],t)))return s(n)+"/"+r}return""}function f(e,t){var r=[e];for(var n in t){var a="object"==typeof t[n]?JSON.stringify(t[n],null,2):t[n];void 0!==a&&r.push(n+": "+a)}return r.join("\n")}t.hasOwnProperty=u,t._objectKeys=c,t.deepMerge=function e(t,r){switch(typeof r){case"object":return t?t["[[attributes]]"]?(t.attributes=e(t["[[attributes]]"],r["[[attributes]]"]),t.base=e(t["[[base]]"],r["[[base]]"]),t):Array.isArray(r)?r.map((function(r,n){return t[n]&&t[n].uid==r.uid?e(t[n],r):r})):function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){(0,a.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({},t,{},(0,o.map)(r,(function(r,n){return e(t[r],n)}))):t||r;case"undefined":return null;default:return r}},t._deepClone=function e(t){switch(typeof t){case"object":return t?t["[[attributes]]"]?t:Array.isArray(t)?t.map(e):(0,o.map)(t,(function(t,r){return e(r)})):t;case"undefined":return null;default:return t}},t.isInteger=function(e){for(var t,r=0,n=e.length;r<n;){if(!((t=e.charCodeAt(r))>=48&&t<=57))return!1;r++}return!0},t.escapePathComponent=s,t.unescapePathComponent=function(e){return e.replace(/~1/g,"/").replace(/~0/g,"~")},t._getPathRecursive=p,t.getPath=function(e,t){if(e===t)return"/";var r=p(e,t);if(""===r)throw new Error("Object not found in root");return"/"+r},t.hasUndefined=function e(t){if(void 0===t)return!0;if(t)if(Array.isArray(t)){for(var r=0,n=t.length;r<n;r++)if(e(t[r]))return!0}else if("object"==typeof t){var a=c(t),o=a.length;for(r=0;r<o;r++)if(e(t[a[r]]))return!0}return!1};var l=function(e){function t(t,r,n,a,o){e.call(this,f(t,{name:r,index:n,operation:a,tree:o})),this.name=r,this.index=n,this.operation=a,this.tree=o,this.message=f(t,{name:r,index:n,operation:a,tree:o})}return r(t,e),t}(Error);t.PatchError=l},function(e,t,r){var n={strict:!0},a=r(3),o=function(e,t){return a(e,t,n)},i=r(0);t.JsonPatchError=i.PatchError,t.deepClone=i._deepClone,t.deepMerge=i.deepMerge;var u={add:function(e,t,r){return e[t]=this.value,{newDocument:r}},remove:function(e,t,r){var n=e[t];return delete e[t],{newDocument:r,removed:n}},replace:function(e,t,r){var n=e[t];return e[t]=this.value,{newDocument:r,removed:n}},move:function(e,t,r){var n=s(r,this.path);n&&(n=i._deepClone(n));var a=p(r,{op:"remove",path:this.from}).removed;return p(r,{op:"add",path:this.path,value:a}),{newDocument:r,removed:n}},copy:function(e,t,r){var n=s(r,this.from);return p(r,{op:"add",path:this.path,value:i._deepClone(n)}),{newDocument:r}},test:function(e,t,r){return{newDocument:r,test:o(e[t],this.value)}},_get:function(e,t,r){return this.value=e[t],{newDocument:r}}},c={add:function(e,t,r){return i.isInteger(t)?e.splice(t,0,this.value):e[t]=this.value,{newDocument:r,index:t}},remove:function(e,t,r){return{newDocument:r,removed:e.splice(t,1)[0]}},replace:function(e,t,r){var n=e[t];return e[t]=this.value,{newDocument:r,removed:n}},move:u.move,copy:u.copy,test:u.test,_get:u._get};function s(e,t){if(""==t)return e;var r={op:"_get",path:t};return p(e,r),r.value}function p(e,r,n,a,p,f){if(void 0===n&&(n=!1),void 0===a&&(a=!0),void 0===p&&(p=!0),void 0===f&&(f=0),n&&("function"==typeof n?n(r,0,e,r.path):l(r,0)),""===r.path){var h={newDocument:e};if("add"===r.op)return h.newDocument=r.value,h;if("replace"===r.op)return h.newDocument=r.value,h.removed=e,h;if("move"===r.op||"copy"===r.op)return h.newDocument=s(e,r.from),"move"===r.op&&(h.removed=e),h;if("test"===r.op){if(h.test=o(e,r.value),!1===h.test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,r,e);return h.newDocument=e,h}if("remove"===r.op)return h.removed=e,h.newDocument=null,h;if("_get"===r.op)return r.value=e,h;if(n)throw new t.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902","OPERATION_OP_INVALID",f,r,e);return h}a||(e=i._deepClone(e));var d=(r.path||"").split("/"),v=e,m=1,b=d.length,y=void 0,g=void 0,w=void 0;for(w="function"==typeof n?n:l;;){if(g=d[m],p&&"__proto__"==g)throw new TypeError("JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");if(n&&void 0===y&&(void 0===v[g]?y=d.slice(0,m).join("/"):m==b-1&&(y=r.path),void 0!==y&&w(r,0,e,y)),m++,Array.isArray(v)){if("-"===g)g=v.length;else{if(n&&!i.isInteger(g))throw new t.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index","OPERATION_PATH_ILLEGAL_ARRAY_INDEX",f,r,e);i.isInteger(g)&&(g=~~g)}if(m>=b){if(n&&"add"===r.op&&g>v.length)throw new t.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array","OPERATION_VALUE_OUT_OF_BOUNDS",f,r,e);if(!1===(h=c[r.op].call(r,v,g,e)).test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,r,e);return h}}else if(g&&-1!=g.indexOf("~")&&(g=i.unescapePathComponent(g)),m>=b){if(!1===(h=u[r.op].call(r,v,g,e)).test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",f,r,e);return h}v=v[g]}}function f(e,r,n,a,o){if(void 0===a&&(a=!0),void 0===o&&(o=!0),n&&!Array.isArray(r))throw new t.JsonPatchError("Patch sequence must be an array","SEQUENCE_NOT_AN_ARRAY");a||(e=i._deepClone(e));for(var u=new Array(r.length),c=0,s=r.length;c<s;c++)u[c]=p(e,r[c],n,!0,o,c),e=u[c].newDocument;return u.newDocument=e,u}function l(e,r,n,a){if("object"!=typeof e||null===e||Array.isArray(e))throw new t.JsonPatchError("Operation is not an object","OPERATION_NOT_AN_OBJECT",r,e,n);if(!u[e.op])throw new t.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902","OPERATION_OP_INVALID",r,e,n);if("string"!=typeof e.path)throw new t.JsonPatchError("Operation `path` property is not a string","OPERATION_PATH_INVALID",r,e,n);if(0!==e.path.indexOf("/")&&e.path.length>0)throw new t.JsonPatchError('Operation `path` property must start with "/"',"OPERATION_PATH_INVALID",r,e,n);if(("move"===e.op||"copy"===e.op)&&"string"!=typeof e.from)throw new t.JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)","OPERATION_FROM_REQUIRED",r,e,n);if(("add"===e.op||"replace"===e.op||"test"===e.op)&&void 0===e.value)throw new t.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)","OPERATION_VALUE_REQUIRED",r,e,n);if(("add"===e.op||"replace"===e.op||"test"===e.op)&&i.hasUndefined(e.value))throw new t.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)","OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED",r,e,n);if(n)if("add"==e.op){var o=e.path.split("/").length,c=a.split("/").length;if(o!==c+1&&o!==c)throw new t.JsonPatchError("Cannot perform an `add` operation at the desired path","OPERATION_PATH_CANNOT_ADD",r,e,n)}else if("replace"===e.op||"remove"===e.op||"_get"===e.op){if(e.path!==a)throw new t.JsonPatchError("Cannot perform the operation at a path that does not exist","OPERATION_PATH_UNRESOLVABLE",r,e,n)}else if("move"===e.op||"copy"===e.op){var s=h([{op:"_get",path:e.from,value:void 0}],n);if(s&&"OPERATION_PATH_UNRESOLVABLE"===s.name)throw new t.JsonPatchError("Cannot perform the operation from a path that does not exist","OPERATION_FROM_UNRESOLVABLE",r,e,n)}}function h(e,r,n){try{if(!Array.isArray(e))throw new t.JsonPatchError("Patch sequence must be an array","SEQUENCE_NOT_AN_ARRAY");if(r)f(i._deepClone(r),i._deepClone(e),n||!0);else{n=n||l;for(var a=0;a<e.length;a++)n(e[a],a,r,void 0)}}catch(e){if(e instanceof t.JsonPatchError)return e;throw e}}t.getValueByPointer=s,t.applyOperation=p,t.applyPatch=f,t.applyReducer=function(e,r,n){var a=p(e,r);if(!1===a.test)throw new t.JsonPatchError("Test operation failed","TEST_OPERATION_FAILED",n,r,e);return a.newDocument},t.validator=l,t.validate=h},function(e,t,r){var n=r(0),a=r(1),o=r(1);t.applyOperation=o.applyOperation,t.applyPatch=o.applyPatch,t.applyReducer=o.applyReducer,t.getValueByPointer=o.getValueByPointer,t.validate=o.validate,t.validator=o.validator;var i=r(0);t.JsonPatchError=i.PatchError,t.deepClone=i._deepClone,t.deepMerge=i.deepMerge,t.escapePathComponent=i.escapePathComponent,t.unescapePathComponent=i.unescapePathComponent;var u=new WeakMap,c=function(e){this.observers=new Map,this.obj=e},s=function(e,t){this.callback=e,this.observer=t};function p(e){var t=u.get(e.object);f(t.value,e.object,e.patches,""),e.patches.length&&a.applyPatch(t.value,e.patches);var r=e.patches;return r.length>0&&(e.patches=[],e.callback&&e.callback(r)),r}function f(e,t,r,a){if(t!==e){"function"==typeof t.toJSON&&(t=t.toJSON());for(var o=n._objectKeys(t),i=n._objectKeys(e),u=!1,c=i.length-1;c>=0;c--){var s=e[l=i[c]];if(!n.hasOwnProperty(t,l)||void 0===t[l]&&void 0!==s&&!1===Array.isArray(t))Array.isArray(e)===Array.isArray(t)?(r.push({op:"remove",path:a+"/"+n.escapePathComponent(l)}),u=!0):(r.push({op:"replace",path:a,value:t}),!0);else{var p=t[l];"object"==typeof s&&null!=s&&"object"==typeof p&&null!=p?f(s,p,r,a+"/"+n.escapePathComponent(l)):s!==p&&(!0,r.push({op:"replace",path:a+"/"+n.escapePathComponent(l),value:n._deepClone(p)}))}}if(u||o.length!=i.length)for(c=0;c<o.length;c++){var l=o[c];n.hasOwnProperty(e,l)||void 0===t[l]||r.push({op:"add",path:a+"/"+n.escapePathComponent(l),value:n._deepClone(t[l])})}}}t.unobserve=function(e,t){t.unobserve()},t.observe=function(e,t){var r,a=function(e){return u.get(e)}(e);if(a){var o=function(e,t){return e.observers.get(t)}(a,t);r=o&&o.observer}else a=new c(e),u.set(e,a);if(r)return r;if(r={},a.value=n._deepClone(e),t){r.callback=t,r.next=null;var i=function(){p(r)},f=function(){clearTimeout(r.next),r.next=setTimeout(i)};"undefined"!=typeof window&&(window.addEventListener?(window.addEventListener("mouseup",f),window.addEventListener("keyup",f),window.addEventListener("mousedown",f),window.addEventListener("keydown",f),window.addEventListener("change",f)):(document.documentElement.attachEvent("onmouseup",f),document.documentElement.attachEvent("onkeyup",f),document.documentElement.attachEvent("onmousedown",f),document.documentElement.attachEvent("onkeydown",f),document.documentElement.attachEvent("onchange",f)))}return r.patches=[],r.object=e,r.unobserve=function(){p(r),clearTimeout(r.next),function(e,t){e.observers.delete(t.callback)}(a,r),"undefined"!=typeof window&&(window.removeEventListener?(window.removeEventListener("mouseup",f),window.removeEventListener("keyup",f),window.removeEventListener("mousedown",f),window.removeEventListener("keydown",f)):(document.documentElement.detachEvent("onmouseup",f),document.documentElement.detachEvent("onkeyup",f),document.documentElement.detachEvent("onmousedown",f),document.documentElement.detachEvent("onkeydown",f)))},a.observers.set(t,new s(t,r)),r},t.generate=p,t.compare=function(e,t){var r=[];return f(e,t,r,""),r}},function(e,t,r){var n=Array.prototype.slice,a=r(5),o=r(4),i=e.exports=function(e,t,r){return r||(r={}),e===t||(e instanceof Date&&t instanceof Date?e.getTime()===t.getTime():!e||!t||"object"!=typeof e&&"object"!=typeof t?r.strict?e===t:e==t:function(e,t,r){var s,p;if(u(e)||u(t))return!1;if(e.prototype!==t.prototype)return!1;if(o(e))return!!o(t)&&(e=n.call(e),t=n.call(t),i(e,t,r));if(c(e)){if(!c(t))return!1;if(e.length!==t.length)return!1;for(s=0;s<e.length;s++)if(e[s]!==t[s])return!1;return!0}try{var f=a(e),l=a(t)}catch(e){return!1}if(f.length!=l.length)return!1;for(f.sort(),l.sort(),s=f.length-1;s>=0;s--)if(f[s]!=l[s])return!1;for(s=f.length-1;s>=0;s--)if(p=f[s],!i(e[p],t[p],r))return!1;return typeof e==typeof t}(e,t,r))};function u(e){return null==e}function c(e){return!(!e||"object"!=typeof e||"number"!=typeof e.length)&&("function"==typeof e.copy&&"function"==typeof e.slice&&!(e.length>0&&"number"!=typeof e[0]))}},function(e,t){var r="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();function n(e){return"[object Arguments]"==Object.prototype.toString.call(e)}function a(e){return e&&"object"==typeof e&&"number"==typeof e.length&&Object.prototype.hasOwnProperty.call(e,"callee")&&!Object.prototype.propertyIsEnumerable.call(e,"callee")||!1}(t=e.exports=r?n:a).supported=n,t.unsupported=a},function(e,t){function r(e){var t=[];for(var r in e)t.push(r);return t}(e.exports="function"==typeof Object.keys?Object.keys:r).shim=r}]);t.jsonpatch=u;var c=function(){var e=e||{};e.transform=function(e,r){var n=[];n=n.concat.apply(n,r);var a=JSON.parse(JSON.stringify(e));return n.reduce(t,a)},e.transformAgainstSingleOp=function(e,t){};var t=function(e,t){if(void 0===t.value&&("add"===t.op||"replace"===t.op||"test"===t.op))throw new Error("'value' MUST be defined");if(void 0===t.from&&("copy"===t.op||"move"===t.op))throw new Error("'from' MUST be defined");if(r[t.op])if("function"==typeof r[t.op])r[t.op](t,e);else for(var n=e.length,a=0;a<n;){var o=e[a];a++,r[t.op][o.op]&&r[t.op][o.op](t,o)}return e},r={remove:function(e,t){for(var r,o=t.length,i=0;r=t[i];)("add"!==r.op&&"test"!==r.op||e.path!==r.path)&&(r.from&&(r.from===e.path||0===r.from.indexOf(e.path+"/"))||e.path===r.path||0===r.path.indexOf(e.path+"/"))&&(t.splice(i,1),o--,i--),i++;var u=e.path.lastIndexOf("/");if(u>-1){var c=e.path.substr(u+1),s=e.path.substr(0,u+1);if(a(c))for(o=t.length,i=0;i<o;)r=t[i],i++,0===r.path.indexOf(s)&&(r.path=n(r.path,s,c,-1)),r.from&&0===r.from.indexOf(s)&&(r.from=n(r.from,s,c,-1))}},add:function(e,t){for(var r,o=t.length,i=0;r=t[i];)("add"!==r.op&&"test"!==r.op||e.path!==r.path)&&(r.from&&(r.from===e.path||0===r.from.indexOf(e.path+"/"))||e.path===r.path||0===r.path.indexOf(e.path+"/"))&&(t.splice(i,1),o--,i--),i++;var u=e.path.lastIndexOf("/");if(u>-1){var c=e.path.substr(u+1),s=e.path.substr(0,u+1);if(a(c))for(o=t.length,i=0;i<o;)r=t[i],i++,0===r.path.indexOf(s)&&(r.path=n(r.path,s,c,1)),r.from&&0===r.from.indexOf(s)&&(r.from=n(r.from,s,c,1))}},replace:function(e,t){for(var r,n=0;r=t[n];)(r.from&&(r.from===e.path||0===r.from.indexOf(e.path+"/"))||0===r.path.indexOf(e.path+"/"))&&(t.splice(n,1),n--),n++}};function n(e,t,r,n){var o=e.substr(t.length),i=o.indexOf("/");i>-1||(i=o.length);var u=o.substr(0,i),c=o.substr(i);return a(u)&&n>0&&u>=r||n<0&&u>r?t+(parseInt(u)+n)+c:e}function a(e){var t=~~Number(e);return String(t)===e&&t>=0}return e}();t.JSONPatchOT=c},function(e,t){e.exports=require("@babel/runtime/helpers/wrapNativeSuper")},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.SyncEvent=void 0;var a=n(r(4)),o=r(2);t.SyncEvent=function e(t){var r=t.resource;(0,a.default)(this,e),this.resource=r,this.patches=(0,o.stageNewPatches)(r)}},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.serialize=void 0;var a=n(r(8)),o=n(r(15)),i=r(1),u=r(3),c=r(2);function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){(0,a.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var f=["String","Boolean","Number","Date","Function"],l=[Object.prototype,Function.prototype,u.Resource.prototype,u.Resource,i.EventEmitter.prototype,void 0,null],h=function(e){return"function"==typeof e?["length","name","prototype"]:["constructor","[[attributes]]","[[patches]]","[[base]]","[[batch]]","[[validation]]"]};t.serialize=function(e){arguments.length>1&&void 0!==arguments[1]&&arguments[1];var t=new i.EventEmitter,r=function(){if(!b(e))throw Error("$interface must be a plain JavaScript Object");var r=n("global",e);return Object.defineProperty(r,"emit",{enumerable:!1,value:function(){return t.emit.apply(t,arguments)}}),r},n=function e(t,r){for(var n={},o={},u=function(e){(0,i.each)(Object.getOwnPropertyDescriptors(e),(function(t,a){h(e).includes(t)||(o[t]=r[t],n[t]=a)}))},c=r;!l.includes(c);c=c.__proto__)u(c);return{type:"object",attributes:(0,i.map)(o,(function(o,u){var c=n[o],l=(0,i.getMetadata)(r,o);return d(u,c)?a(t+"/"+o,u,c,l,r,o):b(u,c)?e(t+"/"+o,u):y(u,c)?s(t+"/"+o,u,c,l,r,o):g(u,c)?p(t+"/"+o,u,c,l,r,o):w(u,c)?f(t+"/"+o,u,c,l,r,o):void 0}))}},a=function(e,t){var r=new t;return{name:e,type:"class",className:t.name,classMethods:u(e,t),instanceMethods:u(e+"/#",r)}},u=function(e,t){for(var r={},a=function(e){(0,i.each)(Object.getOwnPropertyDescriptors(e),(function(t,n){h(e).includes(t)||(r[t]=n)}))},o=t;!l.includes(o);o=o.__proto__)a(o);return(0,i.map)(r,(function(r,a){var o=(0,i.getMetadata)(t,r);return b(a.value,a)?n(e+"/"+r,a.value,a,o,t,r):y(a.value,a)?s(e+"/"+r,a.value,a,o,t,r):g(a.value,a)?p(e+"/"+r,a.value,a,o,t,r):w(a.value,a)?f(e+"/"+r,a.value,a,o,t,r):void 0}))},s=function(e,r,n,a,i){var u=a.isShared,s=a.readAccessTest,p=a.usesSession,f=a.isStream,l=a.original;return u?{isStream:f,name:e,type:"shared-function",value:f?l.toString():r.toString()}:(t.on(e,(function(e){var t,n,a,u,f,l,h,d,v,m,b,y,g,w,_,j;return o.default.async((function(A){for(;;)switch(A.prev=A.next){case 0:return t=e.args,e.uid,n=e.attributes,a=e.patches,u=e.connection,f=e.send,l=e.onClose,u.cache=u.cache||(0,c.createCache)(u),h=u.session,d="function"==typeof i?i:new i.constructor(n),A.next=6,o.default.awrap((0,c.updateResource)(d,a,h));case 6:if(v=A.sent,m=v.updateSuccessful,b=v.invalidPatches,m){A.next=11;break}return A.abrupt("return",f({error:!0,invalidPatches:b,message:"You are not authorized to update the resource as requested"}));case 11:if(A.t0=void 0!==s,!A.t0){A.next=16;break}return A.next=15,o.default.awrap(s.call(d,{session:h,resource:d}));case 15:A.t0=!A.sent;case 16:if(!A.t0){A.next=18;break}return A.abrupt("return",f({error:!0,message:"You are not authorized to call this method"}));case 18:w=u.session.createSlice(),_=function e(t,r){var n,a,i,c;return o.default.async((function(s){for(;;)switch(s.prev=s.next){case 0:return p&&g.save(),n=u.cache,a=w,i=function(){return e(t,r)},s.next=6,o.default.awrap(E(t,{cache:n,session:a,callback:i}));case 6:c=s.sent,f(c,r);case 8:case"end":return s.stop()}}))},p&&(g=u.session.createSlice(),t.unshift(g),g.onChange((function(){return j()}))),(j=function(){y&&y.destroy&&y.destroy();try{y=r.apply(d,t)}catch(e){f({error:!0,message:e.message})}y&&y.catch&&y.catch((function(e){return f({error:!0,message:e.message})})),O(y)?(y.observe((function(e){return _(e,!0)})),l((function(){y.destroy(),g&&g.removeListeners(),w&&w.removeListeners()}))):P(y)?y.then((function(e){return _(e)})):_(y)})();case 23:case"end":return A.stop()}}))})),{name:e,type:"remote-function"})},p=function(e,t,r,n,a,o){var i=n.validators;return{name:e,key:o,type:"property",enumerable:r.enumerable,get:s(e+".get",r.get||function(){return null},r,n,a),set:s(e+".set",r.set||function(){return null},r,n,a),validators:i&&i.map((function(e){return e.toString()}))}},f=function(e,t,r,n,a,o){var i=n.validators;return{name:e,key:o,type:"attribute",value:r.value,validators:i&&i.map((function(e){return e.toString()}))}};return r()};var d=function(e){return"function"==typeof e&&e.prototype instanceof u.Resource},v=function(e){return e instanceof u.Resource},m=function(e){return Array.isArray(e)},b=function(e){return e&&e.__proto__===Object.prototype},y=function(e){return"function"==typeof e&&!d(e)},g=function(e,t){return"function"==typeof t.get||"function"==typeof t.set},w=function(e,t){return[d,b,y,g].every((function(r){return!r(e,t)}))},O=function(e){return e&&"function"==typeof e.observe},P=function(e){return e&&"function"==typeof e.then&&!O(e)},E=function e(t,r){var n,a,u,c;return o.default.async((function(s){for(;;)switch(s.prev=s.next){case 0:if(n=r.cache,a=r.session,u=r.callback,c=function(t){return e(t,{cache:n,session:a,callback:u})},t){s.next=4;break}return s.abrupt("return",t);case 4:if(!d(t)){s.next=6;break}return s.abrupt("return",{_class_:t.name});case 6:if(l=t,!f.includes(l.constructor.name)){s.next=8;break}return s.abrupt("return",t);case 8:if(!m(t)){s.next=12;break}return s.next=11,o.default.awrap(Promise.all(t.map((function(e,t){return c(e)}))));case 11:return s.abrupt("return",s.sent);case 12:if(!b(t)){s.next=16;break}return s.next=15,o.default.awrap((0,i.mapAsync)(t,(function(e,t){return c(t)})));case 15:return s.abrupt("return",s.sent);case 16:if(n.cache(t),!v(t)){s.next=25;break}return s.t0=p,s.t1={},s.next=22,o.default.awrap((0,i.mapAsync)(t["[[attributes]]"],(function(e,r){var n,s,p,f,l;return o.default.async((function(h){for(;;)switch(h.prev=h.next){case 0:if(n=(0,i.getMetadata)(t,e),s=n.readAccessTest,p=n.namespace,void 0!==s){h.next=8;break}return h.next=5,o.default.awrap(c(r));case 5:return h.abrupt("return",h.sent);case 8:return a.onChange(u),f=t,(l=s.call(f,{session:a,resource:f}))instanceof Promise&&config.audit&&console.warn("Running Asynchronous Authentication Checks for "+p+" during serailization"),h.next=14,o.default.awrap(l);case 14:if(h.sent){h.next=18;break}return h.abrupt("return",null);case 18:return h.next=20,o.default.awrap(c(r));case 20:return h.abrupt("return",h.sent);case 21:case"end":return h.stop()}}))})));case 22:return s.t2=s.sent,s.t3={_proto_:t.constructor.name},s.abrupt("return",(0,s.t0)(s.t1,s.t2,s.t3));case 25:case"end":return s.stop()}var l}))}},function(e,t,r){var n=r(0);Object.defineProperty(t,"__esModule",{value:!0}),t.createUnserializer=void 0;var a=n(r(23)),o=n(r(9)),i=n(r(24)),u=n(r(4)),c=n(r(5)),s=n(r(7)),p=n(r(6)),f=r(1),l=r(10),h=r(3),d=r(2),v=["String","Boolean","Number","Date","Function"];t.createUnserializer=function(e){var t=m({socket:e}),r={Resource:h.Resource,List:l.List},n=function(e){var t=function(e){function t(){return(0,u.default)(this,t),(0,c.default)(this,(0,s.default)(t).apply(this,arguments))}return(0,p.default)(t,e),t}(h.Resource);return Object.defineProperty(t,"name",{value:e.className}),b(t,e.classMethods),b(t.prototype,e.instanceMethods),t},b=function e(t,r){return(0,f.each)(r,(function(r,a){switch(a.type){case"class":t[r]=n(a);break;case"object":t[r]=e({},a.attributes);break;case"shared-function":t[r]=g(a);break;case"remote-function":t[r]=w(a);break;case"property":O(t,r,a);break;case"attribute":t[r]=P(a,t)}})),t},y=function(e){switch(e.type){case"shared-function":return g(e);case"remote-function":return w(e)}},g=function(e){var t,r,n=e.isStream,a=(e.prependEmit,e.value),o=new Function("return "+a)();return n?(t=o,r=function(e){for(var r=arguments.length,n=new Array(r>1?r-1:0),a=1;a<r;a++)n[a-1]=arguments[a];return t.call.apply(t,[this].concat(n,[e]))},function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return(0,i.default)(f.Pipe,[[this,r]].concat(t))}):o};var w=function(t){var r=t.name,n=function(t,n){var a,o=this.uid,i=this["[[attributes]]"],u=(0,d.stageNewPatches)(this),c=function(){return t(a)},s=function(e){var r=e.value;r&&r.error&&(r.invalidPatches,t.throw(new Error(r.message))),a=E(r,c),t(a)},p=function(){e.emit(r,{uid:o,patches:u,args:n,attributes:i},(function(e){var t=e.value,r=e.hook;s({value:t}),void 0!==r&&f(r)}))},f=function(r){e.on(r,s);e.on("reconnect",(function t(){e.removeEventListener("reconnect",t),e.removeEventListener(r,s),p()})),t.pipe.onCancel((function(){e.removeEventListener(r,s),e.emit(r+".destroy")}))};p()};return function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return new f.Pipe([this,n],t)}},O=function(e,t,r){var n=e.validation;n&&r.validators&&r.validators.forEach((function(e){n.addHandler(r.key,g({value:e}))})),Object.defineProperty(e,t,{enumerable:r.enumerable,get:y(r.get),set:y(r.set)})},P=function(e,t){var r=t.validation;return r&&e.validators&&e.validators.forEach((function(t){r.addHandler(e.key,g({value:t}))})),e.value},E=function e(n,u){var c=function(t){return e(t,u)};if(!n)return n;if(v.includes(n.constructor.name))return n;if(Array.isArray(n))return(0,i.default)(l.List,(0,o.default)(n.map((function(e){return c(e)}))));var s=n._class_,p=n._proto_,h=(0,a.default)(n,["_class_","_proto_"]);return s?r[s]:p?t.register(new r[p]((0,f.map)(h,(function(e,t){return c(t)}))),u):(0,f.map)(h,(function(e,t){return c(t)}))};return function(e){if("object"!=typeof e)throw Error("schema must be a plain JavaScript Object");return b(r,e.attributes)}};var m=function(e){var t=e.socket,r={};return window.bin=r,{register:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;if(r[e.uid])r[e.uid].callbacks.includes(n)||r[e.uid].callbacks.push(n),(0,d.upstreamMerge)(r[e.uid].resource,e),e=r[e.uid].resource;else{function a(){r[e.uid].callbacks.forEach((function(e){return e()}))}e.on("Δ.change",(function(){return a()})),e.on("Δ.sync",(function(r){var n=r.patches,o=(0,d.createBatch)(e);t.emit(e.uid+".sync",{patches:n,batchId:o},(function(t){var r=t.updateSuccessful,n=t.invalidPatches;r||((0,d.rollbackPatches)(e,n),a())}))})),t.on(e.uid+".mergeBatch",(function(t){(0,d.mergeBatch)(e,t)})),t.on(e.uid+".mergePatches",(function(t){(0,d.mergePatches)(e,t),a()})),r[e.uid]={resource:e,callbacks:[n]}}return e}}}},function(e,t){e.exports=require("@babel/runtime/helpers/objectWithoutProperties")},function(e,t){e.exports=require("@babel/runtime/helpers/construct")},function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.serve=void 0;t.serve=function(){throw Error("Cannot Serve From Client Side")}}]);