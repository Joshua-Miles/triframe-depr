!function(e){var n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(n){return e[n]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=7)}([function(e,n){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,n){e.exports=require("@babel/runtime/regenerator")},function(e,n){e.exports=require("@babel/runtime/helpers/toArray")},function(e,n){var t,r,o=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function c(){throw new Error("clearTimeout has not been defined")}function a(e){if(t===setTimeout)return setTimeout(e,0);if((t===i||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:i}catch(e){t=i}try{r="function"==typeof clearTimeout?clearTimeout:c}catch(e){r=c}}();var s,u=[],l=!1,f=-1;function p(){l&&s&&(l=!1,s.length?u=s.concat(u):f=-1,u.length&&d())}function d(){if(!l){var e=a(p);l=!0;for(var n=u.length;n;){for(s=u,u=[];++f<n;)s&&s[f].run();f=-1,n=u.length}s=null,l=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===c||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(n){try{return r.call(null,e)}catch(n){return r.call(this,e)}}}(e)}}function h(e,n){this.fun=e,this.array=n}function m(){}o.nextTick=function(e){var n=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)n[t-1]=arguments[t];u.push(new h(e,n)),1!==u.length||l||a(d)},h.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=m,o.addListener=m,o.once=m,o.off=m,o.removeListener=m,o.removeAllListeners=m,o.emit=m,o.prependListener=m,o.prependOnceListener=m,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(e,n){e.exports=require("@babel/runtime/helpers/asyncToGenerator")},function(e,n){e.exports=function(e){if(!e.webpackPolyfill){var n=Object.create(e);n.children||(n.children=[]),Object.defineProperty(n,"loaded",{enumerable:!0,get:function(){return n.l}}),Object.defineProperty(n,"id",{enumerable:!0,get:function(){return n.i}}),Object.defineProperty(n,"exports",{enumerable:!0}),n.webpackPolyfill=1}return n}},function(e,n){e.exports=fs},function(e,n,t){(function(e){var n=t(8),r=t(9),o=t(16);n.command("new <name>").action(r),n.command("build type [args...]").action(o),n.parse(e.argv)}).call(this,t(3))},function(e,n){e.exports=require("commander")},function(e,n,t){"use strict";t.r(n),function(e,n,r){var o=t(1),i=t.n(o),c=t(4),a=t.n(c),s=t(6).promises,u=t(10).promisify(t(11).exec),l=t(12).ncp,f=t(13),p=t(14),d=new p.Bar({},p.Presets.shades_classic);r.exports=function(){var r=a()(i.a.mark((function r(o){var c,p,h,m;return i.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return console.log("Starting..."),d.start(100,25),r.next=4,u('npx expo init "'.concat(o,'" --template bare-minimum'));case 4:return d.update(50),r.next=7,u('cd "'.concat(o,'" && npm install nodemon webpack webpack-cli concurrently babel-loader babel-plugin-named-asset-import @expo/webpack-config --save-dev && npm install socket.io express formidable https://github.com/Joshua-Miles/triframe.git'));case 7:return c=f.join(e.cwd(),o,"package.json"),(p=t(15)(c)).scripts={"dev-api":'concurrently "npx webpack --watch --config api.config.js"  "nodemon ./dist/index.js --watch ./dist/index.js"',"dev-web":"expo start --web","dev-android":"react-native run-android","dev-ios":"react-native run-ios"},r.next=12,s.writeFile(c,JSON.stringify(p,null,2));case 12:return h=f.join(e.cwd(),o,".gitignore"),r.next=15,s.readFile(h);case 15:return m=r.sent,r.next=18,s.writeFile(h,"".concat(m,"\ndist\n.sessions\n.uploads"));case 18:return d.update(75),r.next=21,Promise.all(["api.config.js","dist","tsconfig.json","App.js","Api.js","views","models","webpack.config.js"].map(function(){var t=a()(i.a.mark((function t(r){var c,a;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return c=f.join(n,"__assets__",r),a=f.join(e.cwd(),o,r),t.next=4,new Promise((function(e){return l(c,a,e)}));case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()));case 21:d.update(100),d.stop(),console.log("Install Completed");case 24:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}()}.call(this,t(3),"/",t(5)(e))},function(e,n){e.exports=require("util")},function(e,n){e.exports=child_process},function(e,n){e.exports=require("ncp")},function(e,n,t){(function(e){function t(e,n){for(var t=0,r=e.length-1;r>=0;r--){var o=e[r];"."===o?e.splice(r,1):".."===o?(e.splice(r,1),t++):t&&(e.splice(r,1),t--)}if(n)for(;t--;t)e.unshift("..");return e}function r(e,n){if(e.filter)return e.filter(n);for(var t=[],r=0;r<e.length;r++)n(e[r],r,e)&&t.push(e[r]);return t}n.resolve=function(){for(var n="",o=!1,i=arguments.length-1;i>=-1&&!o;i--){var c=i>=0?arguments[i]:e.cwd();if("string"!=typeof c)throw new TypeError("Arguments to path.resolve must be strings");c&&(n=c+"/"+n,o="/"===c.charAt(0))}return(o?"/":"")+(n=t(r(n.split("/"),(function(e){return!!e})),!o).join("/"))||"."},n.normalize=function(e){var i=n.isAbsolute(e),c="/"===o(e,-1);return(e=t(r(e.split("/"),(function(e){return!!e})),!i).join("/"))||i||(e="."),e&&c&&(e+="/"),(i?"/":"")+e},n.isAbsolute=function(e){return"/"===e.charAt(0)},n.join=function(){var e=Array.prototype.slice.call(arguments,0);return n.normalize(r(e,(function(e,n){if("string"!=typeof e)throw new TypeError("Arguments to path.join must be strings");return e})).join("/"))},n.relative=function(e,t){function r(e){for(var n=0;n<e.length&&""===e[n];n++);for(var t=e.length-1;t>=0&&""===e[t];t--);return n>t?[]:e.slice(n,t-n+1)}e=n.resolve(e).substr(1),t=n.resolve(t).substr(1);for(var o=r(e.split("/")),i=r(t.split("/")),c=Math.min(o.length,i.length),a=c,s=0;s<c;s++)if(o[s]!==i[s]){a=s;break}var u=[];for(s=a;s<o.length;s++)u.push("..");return(u=u.concat(i.slice(a))).join("/")},n.sep="/",n.delimiter=":",n.dirname=function(e){if("string"!=typeof e&&(e+=""),0===e.length)return".";for(var n=e.charCodeAt(0),t=47===n,r=-1,o=!0,i=e.length-1;i>=1;--i)if(47===(n=e.charCodeAt(i))){if(!o){r=i;break}}else o=!1;return-1===r?t?"/":".":t&&1===r?"/":e.slice(0,r)},n.basename=function(e,n){var t=function(e){"string"!=typeof e&&(e+="");var n,t=0,r=-1,o=!0;for(n=e.length-1;n>=0;--n)if(47===e.charCodeAt(n)){if(!o){t=n+1;break}}else-1===r&&(o=!1,r=n+1);return-1===r?"":e.slice(t,r)}(e);return n&&t.substr(-1*n.length)===n&&(t=t.substr(0,t.length-n.length)),t},n.extname=function(e){"string"!=typeof e&&(e+="");for(var n=-1,t=0,r=-1,o=!0,i=0,c=e.length-1;c>=0;--c){var a=e.charCodeAt(c);if(47!==a)-1===r&&(o=!1,r=c+1),46===a?-1===n?n=c:1!==i&&(i=1):-1!==n&&(i=-1);else if(!o){t=c+1;break}}return-1===n||-1===r||0===i||1===i&&n===r-1&&n===t+1?"":e.slice(n,r)};var o="b"==="ab".substr(-1)?function(e,n,t){return e.substr(n,t)}:function(e,n,t){return n<0&&(n=e.length+n),e.substr(n,t)}}).call(this,t(3))},function(e,n){e.exports=require("cli-progress")},function(e,n){function t(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}t.keys=function(){return[]},t.resolve=t,e.exports=t,t.id=15},function(e,n,t){"use strict";t.r(n),function(e){var n=t(0),r=t.n(n),o=t(2),i=t.n(o),c=t(6).promises,a=["and","or","nor","a","an","the","so","but","to","of","at","by","from","into","on","onto","off","out","in","over","with","for"],s=function(e){return e=(e=e.toLowerCase()).charAt(0).toUpperCase()+e.substr(1)},u=function(e){for(var n=(e=(e=e.replace(/_+/g," "))[0]+e.slice(1).replace(/[A-Z]/g,(function(e){return" ".concat(e)}))).split(/\s+/g),t=0,r=n.length;t<r;++t){for(var o=n[t].split("-"),i=0,c=o.length;i<c;++i){var u=o[i].toLowerCase();a.indexOf(u)<0&&(o[i]=s(u))}n[t]=o.join("-")}return e=(e=n.join(" ")).charAt(0).toUpperCase()+e.substr(1)};e.exports=function(e){var n,t=i()(e),o=t[0],a=t.slice(1);switch(o){case"model":var s={_public:!0},l=i()(a),f=l[0],p=l[1],d=(w=l.slice(2)).reduce((function(e,n,t){if(n.includes("=")){var o=n.split("="),i=r()(o,2),c=i[0],a=i[1],u=void 0===a?"":a;try{JSON.parse(u)}catch(e){u='"'.concat(u,'"')}e="".concat(e,"\n  ").concat(c," = ").concat(u,"\n")}else{var l=n;s[l]=!0,e=" ".concat(e,"\n  @").concat(l)}return e}),""),h="import { Model, ".concat(Object.keys(s).join(", ")," from 'triframe/scribe'\nexport class ").concat(p," extends Model {\n").concat(d,"\n}");c.writeFile("./src/".concat(f,".js"),h);break;case"form":var m={},b="",v=i()(a),g=(f=v[0],v[1]),w=v.slice(2),y=g;if(g.includes(":")){var x=g.split(":"),j=r()(x,2);y=j[0],g=j[1]}var T=y.toLowerCase(),A=w.reduce((function(e,n,t){var o="TextInput",i=n.split("="),c=r()(i,2),a=c[0],s=c[1],l=void 0===s?"":s;if(a.includes(":")){var f=a.split(":"),p=r()(f,2);o=p[0],a=p[1]}(Number.isNaN(l)||""===l)&&(l='"'.concat(l,'"')),m[o]=!0;var d=u(a);return b="".concat(b,"\n        ").concat(a,": ").concat(l,","),e="".concat(e,"\n            <").concat(o,'\n                label="').concat(d,'"\n                value={').concat(T,".").concat(a,"}\n                onChangeText={").concat(a," => {\n                    hideErrorsFor('").concat(a,"')\n                    ").concat(T,".").concat(a," = ").concat(a," \n                }}\n            />\n            <HelperText visible={shouldShowErrorsFor('").concat(a,"')} type=\"error\">\n                {errorMessageFor('").concat(a,"')}\n            </HelperText>")}),"");h="import React from 'react'\nimport { tether, Container, Title, Button, HelperText, ".concat(Object.keys(m).join(", ")," } from 'triframe/designer'\n\nexport const ").concat((n=g,function(e,n){for(var t=(e=e.toLowerCase()).split(/[\s_]+/g),r=!0===n?0:1,o=t.length;r<o;++r){var i=t[r];t[r]=i.charAt(0).toUpperCase()+i.substr(1)}return t.join("")}(n,!0))," = tether(function*({  models }) {\n\n    const { ").concat(y," } = models\n\n    const global = yield { errorMessage: '' }\n\n    const ").concat(T," = yield new ").concat(y,"({").concat(b,"\n    })\n    \n    const { errorMessageFor, shouldShowErrorsFor, hideErrorsFor, showAllErrors, isValid } = ").concat(T,".validation\n\n    const handleSubmit = () => {\n        if(isValid){\n            try {\n                console.log('Submitted', ").concat(T,")\n            } catch (err){\n                global.errorMessage = err.message\n            }\n        } else {\n            showAllErrors()\n        }\n    }\n\n    return (\n        <Container>\n            <Title>").concat(u(g),'</Title>\n            <HelperText visible={global.errorMessage.length > 0} type="error">\n                {global.errorMessage}\n            </HelperText>').concat(A,"\n            <Button onPress={handleSubmit}>\n                Submit\n            </Button>\n        </Container>\n    )\n})");c.writeFile("./".concat(f,".js"),h);break;case"view":var k=r()(a,2);f=k[0],g=k[1],h="import React from 'react'\nimport { tether, Container, Title } from 'triframe/designer'\nconst ".concat(g," = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {\nreturn (\n    <Container>\n        <Title>").concat(g,"</Title>\n    </Container>\n)\n})\nexport { ").concat(g," }");c.writeFile("./src/".concat(f,".js"),h)}}}.call(this,t(5)(e))}]);