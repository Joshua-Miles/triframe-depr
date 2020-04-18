module.exports=function(e){var n={};function r(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=n,r.d=function(e,n,t){r.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,n){if(1&n&&(e=r(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(r.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)r.d(t,o,function(n){return e[n]}.bind(null,o));return t},r.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(n,"a",n),n},r.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r.p="",r(r.s=19)}([function(e,n){e.exports=require("@babel/runtime/regenerator")},function(e,n){e.exports=require("@babel/runtime/helpers/asyncToGenerator")},function(e,n){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,n){e.exports=require("@babel/runtime/helpers/toArray")},function(e,n){e.exports=require("fs")},function(e,n){e.exports=require("util")},function(e,n){e.exports=require("child_process")},function(e,n){e.exports=require("ncp")},function(e,n){function r(e,n){for(var r=0,t=e.length-1;t>=0;t--){var o=e[t];"."===o?e.splice(t,1):".."===o?(e.splice(t,1),r++):r&&(e.splice(t,1),r--)}if(n)for(;r--;r)e.unshift("..");return e}function t(e,n){if(e.filter)return e.filter(n);for(var r=[],t=0;t<e.length;t++)n(e[t],t,e)&&r.push(e[t]);return r}n.resolve=function(){for(var e="",n=!1,o=arguments.length-1;o>=-1&&!n;o--){var i=o>=0?arguments[o]:process.cwd();if("string"!=typeof i)throw new TypeError("Arguments to path.resolve must be strings");i&&(e=i+"/"+e,n="/"===i.charAt(0))}return(n?"/":"")+(e=r(t(e.split("/"),(function(e){return!!e})),!n).join("/"))||"."},n.normalize=function(e){var i=n.isAbsolute(e),c="/"===o(e,-1);return(e=r(t(e.split("/"),(function(e){return!!e})),!i).join("/"))||i||(e="."),e&&c&&(e+="/"),(i?"/":"")+e},n.isAbsolute=function(e){return"/"===e.charAt(0)},n.join=function(){var e=Array.prototype.slice.call(arguments,0);return n.normalize(t(e,(function(e,n){if("string"!=typeof e)throw new TypeError("Arguments to path.join must be strings");return e})).join("/"))},n.relative=function(e,r){function t(e){for(var n=0;n<e.length&&""===e[n];n++);for(var r=e.length-1;r>=0&&""===e[r];r--);return n>r?[]:e.slice(n,r-n+1)}e=n.resolve(e).substr(1),r=n.resolve(r).substr(1);for(var o=t(e.split("/")),i=t(r.split("/")),c=Math.min(o.length,i.length),s=c,a=0;a<c;a++)if(o[a]!==i[a]){s=a;break}var u=[];for(a=s;a<o.length;a++)u.push("..");return(u=u.concat(i.slice(s))).join("/")},n.sep="/",n.delimiter=":",n.dirname=function(e){if("string"!=typeof e&&(e+=""),0===e.length)return".";for(var n=e.charCodeAt(0),r=47===n,t=-1,o=!0,i=e.length-1;i>=1;--i)if(47===(n=e.charCodeAt(i))){if(!o){t=i;break}}else o=!1;return-1===t?r?"/":".":r&&1===t?"/":e.slice(0,t)},n.basename=function(e,n){var r=function(e){"string"!=typeof e&&(e+="");var n,r=0,t=-1,o=!0;for(n=e.length-1;n>=0;--n)if(47===e.charCodeAt(n)){if(!o){r=n+1;break}}else-1===t&&(o=!1,t=n+1);return-1===t?"":e.slice(r,t)}(e);return n&&r.substr(-1*n.length)===n&&(r=r.substr(0,r.length-n.length)),r},n.extname=function(e){"string"!=typeof e&&(e+="");for(var n=-1,r=0,t=-1,o=!0,i=0,c=e.length-1;c>=0;--c){var s=e.charCodeAt(c);if(47!==s)-1===t&&(o=!1,t=c+1),46===s?-1===n?n=c:1!==i&&(i=1):-1!==n&&(i=-1);else if(!o){r=c+1;break}}return-1===n||-1===t||0===i||1===i&&n===t-1&&n===r+1?"":e.slice(n,t)};var o="b"==="ab".substr(-1)?function(e,n,r){return e.substr(n,r)}:function(e,n,r){return n<0&&(n=e.length+n),e.substr(n,r)}},,function(e,n){e.exports=require("cli-progress")},function(e,n){function r(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}r.keys=function(){return[]},r.resolve=r,e.exports=r,r.id=11},,,,,,function(e,n){e.exports=require("nodegit")},function(e,n){e.exports=require("commander")},function(e,n,r){"use strict";r.r(n);var t=r(0),o=r.n(t),i=r(1),c=r.n(i),s=r(4).promises,a=r(5).promisify(r(6).exec),u=r(7).ncp,l=r(8),p=r(10),f=new p.Bar({},p.Presets.shades_classic);function d(){return(d=c()(o.a.mark((function e(n){var t,i,p,d;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Starting..."),f.start(100,25),e.next=4,a('npx expo init "'.concat(n,'" --template bare-minimum'));case 4:return f.update(50),e.next=7,a('cd "'.concat(n,'" && npm install nodemon webpack webpack-cli concurrently babel-loader babel-plugin-named-asset-import @expo/webpack-config --save-dev && npm install socket.io express formidable https://github.com/Joshua-Miles/triframe.git'));case 7:return t=l.join(process.cwd(),n,"package.json"),(i=r(11)(t)).scripts={"dev-api":'concurrently "npx webpack --watch --config api.config.js"  "nodemon ./dist/index.js --watch ./dist/index.js"',"dev-app":"expo start --web","dev-android":"react-native run-android","dev-ios":"react-native run-ios"},e.next=12,s.writeFile(t,JSON.stringify(i,null,2));case 12:return p=l.join(process.cwd(),n,".gitignore"),e.next=15,s.readFile(p);case 15:return d=e.sent,e.next=18,s.writeFile(p,"".concat(d,"\ndist\n.sessions\n.uploads"));case 18:return f.update(75),e.next=21,Promise.all(["api.config.js","dist","tsconfig.json","App.js","Api.js","views","models","webpack.config.js"].map(function(){var e=c()(o.a.mark((function e(r){var t,i;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=l.join(__dirname,"__assets__",r),i=l.join(process.cwd(),n,r),e.next=4,new Promise((function(e){return u(t,i,e)}));case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()));case 21:f.update(100),f.stop(),console.log("Install Completed");case 24:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var m=r(2),g=r.n(m),b=r(3),h=r.n(b),v=r(4).promises,x=["and","or","nor","a","an","the","so","but","to","of","at","by","from","into","on","onto","off","out","in","over","with","for"],y=function(e){return e=(e=e.toLowerCase()).charAt(0).toUpperCase()+e.substr(1)},w=function(e){for(var n=(e=(e=e.replace(/_+/g," "))[0]+e.slice(1).replace(/[A-Z]/g,(function(e){return" ".concat(e)}))).split(/\s+/g),r=0,t=n.length;r<t;++r){for(var o=n[r].split("-"),i=0,c=o.length;i<c;++i){var s=o[i].toLowerCase();x.indexOf(s)<0&&(o[i]=y(s))}n[r]=o.join("-")}return e=(e=n.join(" ")).charAt(0).toUpperCase()+e.substr(1)},j=r(4).promises,k=r(5).promisify(r(6).exec),A=r(7).ncp,C=r(8),_=r(17).Repository,S=function(){var e=c()(o.a.mark((function e(n){var r,t;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.open(C.resolve(__dirname,"../.git"));case 2:return r=e.sent,e.next=5,r.getStatus();case 5:if(t=e.sent,0===t.length){e.next=9;break}throw Error("You have uncommitted changes. Please commit or revert, then try again.");case 9:return console.log("Building Frontend"),e.next=12,k("expo build:web");case 12:return console.log("Building Backend"),e.next=15,k("npx webpack --config api.config.js");case 15:return e.next=17,r.checkoutBranch("production");case 17:return e.next=19,A("./web-build","./public");case 19:return e.next=21,A("./dist/index.js","./index.js");case 21:return e.next=23,T("./web-build");case 23:console.log("DEPLOYING",n);case 24:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),T=function e(n){j.existsSync(n)&&(j.readdirSync(n).forEach((function(r,t){var o=C.join(n,r);j.lstatSync(o).isDirectory()?e(o):j.unlinkSync(o)})),j.rmdirSync(n))},M=r(18);M.command("deploy <name>").action(S),M.command("new <name>").action((function(e){return d.apply(this,arguments)})),M.command("build type [args...]").action((function(e){var n,r=h()(e),t=r[0],o=r.slice(1);switch(t){case"model":var i={},c=h()(o),s=c[0],a=c[1],u=(b=c.slice(2)).reduce((function(e,n,r){if(n.includes("=")){var t=n.split("="),o=g()(t,2),c=o[0],s=o[1],a=void 0===s?"":s;e="".concat(e,"\n  ").concat(c," = ").concat(a,"\n")}else{var u=n;i[u.split("(")]=!0,e=" ".concat(e,"\n  @").concat(u)}return e}),""),l="import { Resource } from 'triframe/arbiter'\nimport { Model, include, ".concat(Object.keys(i).join(", ")," } from 'triframe/scribe'\nexport class ").concat(a," extends Resource {\n  @include(Model)\n").concat(u,"\n}");v.writeFile("./".concat(s,".js"),l);break;case"form":var p={},f="",d=h()(o),m=(s=d[0],d[1]),b=d.slice(2),x=m;if(m.includes(":")){var y=m.split(":"),j=g()(y,2);x=j[0],m=j[1]}var k=x.toLowerCase(),A=b.reduce((function(e,n,r){var t="TextInput",o=n.split("="),i=g()(o,2),c=i[0],s=i[1],a=void 0===s?"":s;if(c.includes(":")){var u=c.split(":"),l=g()(u,2);t=l[0],c=l[1]}(Number.isNaN(a)||""===a)&&(a='"'.concat(a,'"')),p[t]=!0;var d=w(c);return f="".concat(f,"\n        ").concat(c,": ").concat(a,","),e="".concat(e,"\n            <").concat(t,'\n                label="').concat(d,'"\n                value={').concat(k,".").concat(c,"}\n                onChange={").concat(c," => {\n                    hideErrorsFor('").concat(c,"')\n                    ").concat(k,".").concat(c," = ").concat(c," \n                }}\n            />\n            <HelperText visible={shouldShowErrorsFor('").concat(c,"')} type=\"error\">\n                {errorMessageFor('").concat(c,"')}\n            </HelperText>")}),"");l="import React from 'react'\nimport { tether, Container, Title, Button, HelperText, ".concat(Object.keys(p).join(", ")," } from 'triframe/designer'\n\nexport const ").concat((n=m,function(e,n){for(var r=(e=e.toLowerCase()).split(/[\s_]+/g),t=!0===n?0:1,o=r.length;t<o;++t){var i=r[t];r[t]=i.charAt(0).toUpperCase()+i.substr(1)}return r.join("")}(n,!0))," = tether(function*({  models }) {\n\n    const { ").concat(x," } = models\n\n    const global = yield { errorMessage: '' }\n\n    const ").concat(k," = yield new ").concat(x,"({").concat(f,"\n    })\n    \n    const { errorMessageFor, shouldShowErrorsFor, hideErrorsFor, showAllErrors, isValid } = ").concat(k,".validation\n\n    const handleSubmit = () => {\n        if(isValid){\n            try {\n                console.log('Submitted', ").concat(k,")\n            } catch (err){\n                global.errorMessage = err.message\n            }\n        } else {\n            showAllErrors()\n        }\n    }\n\n    return (\n        <Container>\n            <Title>").concat(w(m),'</Title>\n            <HelperText visible={global.errorMessage.length > 0} type="error">\n                {global.errorMessage}\n            </HelperText>').concat(A,"\n            <Button onPress={handleSubmit}>\n                Submit\n            </Button>\n        </Container>\n    )\n})");v.writeFile("./".concat(s,".js"),l);break;case"view":var C=g()(o,2);s=C[0],m=C[1],l="import React from 'react'\nimport { tether, Container, Title } from 'triframe/designer'\nconst ".concat(m," = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {\nreturn (\n    <Container>\n        <Title>").concat(m,"</Title>\n    </Container>\n)\n})\nexport { ").concat(m," }");v.writeFile("./".concat(s,".js"),l)}})),M.parse(process.argv)}]);