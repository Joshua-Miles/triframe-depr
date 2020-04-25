'use strict';


let isValidUTF8
try {
  const isValidUTF8Builder = require('utf-8-validate');

  isValidUTF8 =
    typeof isValidUTF8Builder === 'object'
      ? isValidUTF8Builder.Validation.isValidUTF8 // utf-8-validate@<3.0.0
      : isValidUTF8Builder;
} catch (e) /* istanbul ignore next */ {
  isValidUTF8 = () => true;
}


/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */ 
const isValidStatusCode = (code) => {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
};

export default { isValidStatusCode, isValidUTF8 }
