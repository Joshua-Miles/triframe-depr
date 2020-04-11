const fs = require('fs').promises

const toCamelCase = function (str, upper) {
	str = str.toLowerCase();
	var parts = str.split( /[\s_]+/g);
	for (var i = upper === true ? 0 : 1, ii = parts.length; i < ii; ++i) {
		var part = parts[i];
		parts[i] = part.charAt(0).toUpperCase() + part.substr(1);
	}
	return parts.join('');
};

const toPascalCase = str => toCamelCase(str, true)

const TITLE_LOWERCASE_WORDS = [
	'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at', 'by',
	'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over', 'with', 'for'
];

const toCapitalized = function (str) {
	str = str.toLowerCase();
	str = str.charAt(0).toUpperCase() + str.substr(1);
	return str;
};

const toTitleCase = function (str) {
    str = str.replace(/_+/g, ' ');
    str = str[0]+str.slice(1).replace(/[A-Z]/g, x => ` ${x}`)
	var words = str.split(/\s+/g);
	for (var i = 0, ii = words.length; i < ii; ++i) {
		var parts = words[i].split('-');
		for (var o = 0, oo = parts.length; o < oo; ++o) {
			var part = parts[o].toLowerCase();
			if (TITLE_LOWERCASE_WORDS.indexOf(part) < 0) {
				parts[o] = toCapitalized(part);
			}
		}
		words[i] = parts.join('-');
	}
	str = words.join(' ');
	str = str.charAt(0).toUpperCase() + str.substr(1);
	return str;
};

export default function([ type, ...args]) {
    switch(type){
        case 'model':
            let decorators = {}
            var [ path, name, ...instructions] = args;
            let definition = instructions.reduce( ( definition, part, index ) => {
                if(part.includes('=')){
                    let [ name, defaults = "" ] = part.split('=')
                    // defaults = defaults.replace('_', ' ')
                    // try {
                    //     JSON.parse(defaults)
                    // } catch {
                    //     defaults = `"${defaults}"`
                    // }
                    definition =  `${definition}\n  ${name} = ${defaults}\n`
                } else {
                    let decorator = part
                    decorators[decorator.split('(')] = true;
                    definition = ` ${definition}\n  @${decorator}`
                }
                return definition
            }, '')
            var code= `import { Resource } from 'triframe/arbiter'
import { Model, include, ${Object.keys(decorators).join(', ') } } from 'triframe/scribe'
export class ${name} extends Resource {
  @include(Model)
${definition}
}`
        
            fs.writeFile(`./${path}.js`, code)
        break;
        case 'form':
                let inputs = {}
                let defaults = ''
                var [ path, Name, ...instructions] = args;
                let Model = Name

                if(Name.includes(':'))
                    ([ Model, Name ] = Name.split(':'))

                let model = Model.toLowerCase()
                let fields = instructions.reduce( ( fields, part, index ) => {
                    let Input = 'TextInput';
                    let [ name, defaultValue = '' ] = part.split('=')

                    if(name.includes(':'))
                        ([ Input, name ] = name.split(':'))

                    if(Number.isNaN(defaultValue) || defaultValue === "")
                        defaultValue = `"${defaultValue}"`

                    inputs[Input] = true
                    let label = toTitleCase(name)
                    defaults= `${defaults}\n        ${name}: ${defaultValue},`
                    fields = `${fields}
            <${Input}
                label="${label}"
                value={${model}.${name}}
                onChange={${name} => {
                    hideErrorsFor('${name}')
                    ${model}.${name} = ${name} 
                }}
            />
            <HelperText visible={shouldShowErrorsFor('${name}')} type="error">
                {errorMessageFor('${name}')}
            </HelperText>`
                    return fields
                }, '')
                var code= `import React from 'react'
import { tether, Container, Title, Button, HelperText, ${Object.keys(inputs).join(', ')} } from 'triframe/designer'

export const ${toPascalCase(Name)} = tether(function*({  models }) {

    const { ${Model} } = models

    const global = yield { errorMessage: '' }

    const ${model} = yield new ${Model}({${defaults}
    })
    
    const { errorMessageFor, shouldShowErrorsFor, hideErrorsFor, showAllErrors, isValid } = ${model}.validation

    const handleSubmit = () => {
        if(isValid){
            try {
                console.log('Submitted', ${model})
            } catch (err){
                global.errorMessage = err.message
            }
        } else {
            showAllErrors()
        }
    }

    return (
        <Container>
            <Title>${toTitleCase(Name)}</Title>
            <HelperText visible={global.errorMessage.length > 0} type="error">
                {global.errorMessage}
            </HelperText>${fields}
            <Button onPress={handleSubmit}>
                Submit
            </Button>
        </Container>
    )
})`
            
                fs.writeFile(`./${path}.js`, code)
            break;
            case 'view':
                var [ path, Name ] = args;
                var code= `import React from 'react'
import { tether, Container, Title } from 'triframe/designer'
const ${Name} = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {
return (
    <Container>
        <Title>${Name}</Title>
    </Container>
)
})
export { ${Name} }`
            
                fs.writeFile(`./${path}.js`, code)
            break;
    }
}