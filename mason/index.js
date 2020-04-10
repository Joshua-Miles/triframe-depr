module.exports=function(e){var n={};function r(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=n,r.d=function(e,n,t){r.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,n){if(1&n&&(e=r(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(r.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)r.d(t,o,function(n){return e[n]}.bind(null,o));return t},r.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(n,"a",n),n},r.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r.p="",r(r.s=6)}([function(e,n){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,n){e.exports=require("@babel/runtime/regenerator")},function(e,n){e.exports=require("@babel/runtime/helpers/toArray")},function(e,n){e.exports=require("@babel/runtime/helpers/asyncToGenerator")},function(e,n){e.exports=function(e){if(!e.webpackPolyfill){var n=Object.create(e);n.children||(n.children=[]),Object.defineProperty(n,"loaded",{enumerable:!0,get:function(){return n.l}}),Object.defineProperty(n,"id",{enumerable:!0,get:function(){return n.i}}),Object.defineProperty(n,"exports",{enumerable:!0}),n.webpackPolyfill=1}return n}},function(e,n){e.exports=require("fs")},function(e,n,r){var t=r(7),o=r(8),i=r(15);t.command("new <name>").action(o),t.command("build type [args...]").action(i),t.parse(process.argv)},function(e,n){e.exports=require("commander")},function(e,n,r){"use strict";r.r(n),function(e){var n=r(1),t=r.n(n),o=r(3),i=r.n(o),c=r(5).promises,s=r(9).promisify(r(10).exec),a=r(11).ncp,u=r(12),l=r(13),f=new l.Bar({},l.Presets.shades_classic);e.exports=function(){var e=i()(t.a.mark((function e(n){var o,l,p,d;return t.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Starting..."),f.start(100,25),e.next=4,s('npx expo init "'.concat(n,'" --template bare-minimum'));case 4:return f.update(50),e.next=7,s('cd "'.concat(n,'" && npm install nodemon webpack webpack-cli concurrently babel-loader babel-plugin-named-asset-import @expo/webpack-config --save-dev && npm install socket.io express formidable https://github.com/Joshua-Miles/triframe.git'));case 7:return o=u.join(process.cwd(),n,"package.json"),(l=r(14)(o)).scripts={"dev-api":'concurrently "npx webpack --watch --config api.config.js"  "nodemon ./dist/index.js --watch ./dist/index.js"',"dev-app":"expo start --web","dev-android":"react-native run-android","dev-ios":"react-native run-ios"},e.next=12,c.writeFile(o,JSON.stringify(l,null,2));case 12:return p=u.join(process.cwd(),n,".gitignore"),e.next=15,c.readFile(p);case 15:return d=e.sent,e.next=18,c.writeFile(p,"".concat(d,"\ndist\n.sessions\n.uploads"));case 18:return f.update(75),e.next=21,Promise.all(["api.config.js","dist","tsconfig.json","App.js","Api.js","views","models","webpack.config.js"].map(function(){var e=i()(t.a.mark((function e(r){var o,i;return t.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=u.join(__dirname,"__assets__",r),i=u.join(process.cwd(),n,r),e.next=4,new Promise((function(e){return a(o,i,e)}));case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()));case 21:f.update(100),f.stop(),console.log("Install Completed");case 24:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()}.call(this,r(4)(e))},function(e,n){e.exports=require("util")},function(e,n){e.exports=require("child_process")},function(e,n){e.exports=require("ncp")},function(e,n){function r(e,n){for(var r=0,t=e.length-1;t>=0;t--){var o=e[t];"."===o?e.splice(t,1):".."===o?(e.splice(t,1),r++):r&&(e.splice(t,1),r--)}if(n)for(;r--;r)e.unshift("..");return e}function t(e,n){if(e.filter)return e.filter(n);for(var r=[],t=0;t<e.length;t++)n(e[t],t,e)&&r.push(e[t]);return r}n.resolve=function(){for(var e="",n=!1,o=arguments.length-1;o>=-1&&!n;o--){var i=o>=0?arguments[o]:process.cwd();if("string"!=typeof i)throw new TypeError("Arguments to path.resolve must be strings");i&&(e=i+"/"+e,n="/"===i.charAt(0))}return(n?"/":"")+(e=r(t(e.split("/"),(function(e){return!!e})),!n).join("/"))||"."},n.normalize=function(e){var i=n.isAbsolute(e),c="/"===o(e,-1);return(e=r(t(e.split("/"),(function(e){return!!e})),!i).join("/"))||i||(e="."),e&&c&&(e+="/"),(i?"/":"")+e},n.isAbsolute=function(e){return"/"===e.charAt(0)},n.join=function(){var e=Array.prototype.slice.call(arguments,0);return n.normalize(t(e,(function(e,n){if("string"!=typeof e)throw new TypeError("Arguments to path.join must be strings");return e})).join("/"))},n.relative=function(e,r){function t(e){for(var n=0;n<e.length&&""===e[n];n++);for(var r=e.length-1;r>=0&&""===e[r];r--);return n>r?[]:e.slice(n,r-n+1)}e=n.resolve(e).substr(1),r=n.resolve(r).substr(1);for(var o=t(e.split("/")),i=t(r.split("/")),c=Math.min(o.length,i.length),s=c,a=0;a<c;a++)if(o[a]!==i[a]){s=a;break}var u=[];for(a=s;a<o.length;a++)u.push("..");return(u=u.concat(i.slice(s))).join("/")},n.sep="/",n.delimiter=":",n.dirname=function(e){if("string"!=typeof e&&(e+=""),0===e.length)return".";for(var n=e.charCodeAt(0),r=47===n,t=-1,o=!0,i=e.length-1;i>=1;--i)if(47===(n=e.charCodeAt(i))){if(!o){t=i;break}}else o=!1;return-1===t?r?"/":".":r&&1===t?"/":e.slice(0,t)},n.basename=function(e,n){var r=function(e){"string"!=typeof e&&(e+="");var n,r=0,t=-1,o=!0;for(n=e.length-1;n>=0;--n)if(47===e.charCodeAt(n)){if(!o){r=n+1;break}}else-1===t&&(o=!1,t=n+1);return-1===t?"":e.slice(r,t)}(e);return n&&r.substr(-1*n.length)===n&&(r=r.substr(0,r.length-n.length)),r},n.extname=function(e){"string"!=typeof e&&(e+="");for(var n=-1,r=0,t=-1,o=!0,i=0,c=e.length-1;c>=0;--c){var s=e.charCodeAt(c);if(47!==s)-1===t&&(o=!1,t=c+1),46===s?-1===n?n=c:1!==i&&(i=1):-1!==n&&(i=-1);else if(!o){r=c+1;break}}return-1===n||-1===t||0===i||1===i&&n===t-1&&n===r+1?"":e.slice(n,t)};var o="b"==="ab".substr(-1)?function(e,n,r){return e.substr(n,r)}:function(e,n,r){return n<0&&(n=e.length+n),e.substr(n,r)}},function(e,n){e.exports=require("cli-progress")},function(e,n){function r(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}r.keys=function(){return[]},r.resolve=r,e.exports=r,r.id=14},function(e,n,r){"use strict";r.r(n),function(e){var n=r(0),t=r.n(n),o=r(2),i=r.n(o),c=r(5).promises,s=["and","or","nor","a","an","the","so","but","to","of","at","by","from","into","on","onto","off","out","in","over","with","for"],a=function(e){return e=(e=e.toLowerCase()).charAt(0).toUpperCase()+e.substr(1)},u=function(e){for(var n=(e=(e=e.replace(/_+/g," "))[0]+e.slice(1).replace(/[A-Z]/g,(function(e){return" ".concat(e)}))).split(/\s+/g),r=0,t=n.length;r<t;++r){for(var o=n[r].split("-"),i=0,c=o.length;i<c;++i){var u=o[i].toLowerCase();s.indexOf(u)<0&&(o[i]=a(u))}n[r]=o.join("-")}return e=(e=n.join(" ")).charAt(0).toUpperCase()+e.substr(1)};e.exports=function(e){var n,r=i()(e),o=r[0],s=r.slice(1);switch(o){case"model":var a={},l=i()(s),f=l[0],p=l[1],d=(x=l.slice(2)).reduce((function(e,n,r){if(n.includes("=")){var o=n.split("="),i=t()(o,2),c=i[0],s=i[1],u=void 0===s?"":s;e="".concat(e,"\n  ").concat(c," = ").concat(u,"\n")}else{var l=n;a[l.split("(")]=!0,e=" ".concat(e,"\n  @").concat(l)}return e}),""),b="import { Resource } from 'triframe/arbiter'\nimport { Model, include, ".concat(Object.keys(a).join(", ")," } from 'triframe/scribe'\nexport class ").concat(p," extends Resource {\n  @include(Model)\n").concat(d,"\n}");c.writeFile("./".concat(f,".js"),b);break;case"form":var m={},g="",h=i()(s),v=(f=h[0],h[1]),x=h.slice(2),w=v;if(v.includes(":")){var y=v.split(":"),j=t()(y,2);w=j[0],v=j[1]}var A=w.toLowerCase(),C=x.reduce((function(e,n,r){var o="TextInput",i=n.split("="),c=t()(i,2),s=c[0],a=c[1],l=void 0===a?"":a;if(s.includes(":")){var f=s.split(":"),p=t()(f,2);o=p[0],s=p[1]}(Number.isNaN(l)||""===l)&&(l='"'.concat(l,'"')),m[o]=!0;var d=u(s);return g="".concat(g,"\n        ").concat(s,": ").concat(l,","),e="".concat(e,"\n            <").concat(o,'\n                label="').concat(d,'"\n                value={').concat(A,".").concat(s,"}\n                onChange={").concat(s," => {\n                    hideErrorsFor('").concat(s,"')\n                    ").concat(A,".").concat(s," = ").concat(s," \n                }}\n            />\n            <HelperText visible={shouldShowErrorsFor('").concat(s,"')} type=\"error\">\n                {errorMessageFor('").concat(s,"')}\n            </HelperText>")}),"");b="import React from 'react'\nimport { tether, Container, Title, Button, HelperText, ".concat(Object.keys(m).join(", ")," } from 'triframe/designer'\n\nexport const ").concat((n=v,function(e,n){for(var r=(e=e.toLowerCase()).split(/[\s_]+/g),t=!0===n?0:1,o=r.length;t<o;++t){var i=r[t];r[t]=i.charAt(0).toUpperCase()+i.substr(1)}return r.join("")}(n,!0))," = tether(function*({  models }) {\n\n    const { ").concat(w," } = models\n\n    const global = yield { errorMessage: '' }\n\n    const ").concat(A," = yield new ").concat(w,"({").concat(g,"\n    })\n    \n    const { errorMessageFor, shouldShowErrorsFor, hideErrorsFor, showAllErrors, isValid } = ").concat(A,".validation\n\n    const handleSubmit = () => {\n        if(isValid){\n            try {\n                console.log('Submitted', ").concat(A,")\n            } catch (err){\n                global.errorMessage = err.message\n            }\n        } else {\n            showAllErrors()\n        }\n    }\n\n    return (\n        <Container>\n            <Title>").concat(u(v),'</Title>\n            <HelperText visible={global.errorMessage.length > 0} type="error">\n                {global.errorMessage}\n            </HelperText>').concat(C,"\n            <Button onPress={handleSubmit}>\n                Submit\n            </Button>\n        </Container>\n    )\n})");c.writeFile("./".concat(f,".js"),b);break;case"view":var k=t()(s,2);f=k[0],v=k[1],b="import React from 'react'\nimport { tether, Container, Title } from 'triframe/designer'\nconst ".concat(v," = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {\nreturn (\n    <Container>\n        <Title>").concat(v,"</Title>\n    </Container>\n)\n})\nexport { ").concat(v," }");c.writeFile("./".concat(f,".js"),b)}}}.call(this,r(4)(e))}]);