const fs = require('fs').promises
const toCamelCase = function (str, upper) {
	str = str.toLowerCase();
	var parts = str.split(/[\s_]+/g);
	for (var i = upper === true ? 0 : 1, ii = parts.length; i < ii; ++i) {
		var part = parts[i];
		parts[i] = part.charAt(0).toUpperCase() + part.substr(1);
	}
	return parts.join('');
};

module.exports = function([ type, ...args]) {
    switch(type){
        case 'model':
            let decorators = { _public: true }
            var [ path, name, ...instructions] = args;
            let definition = instructions.reduce( ( definition, part, index ) => {
                if(part.includes('=')){
                    let [ name, defaults = "" ] = part.split('=')
                    try {
                        JSON.parse(defaults)
                    } catch {
                        defaults = `"${defaults}"`
                    }
                    definition =  `${definition}\n  ${name} = ${defaults}\n`
                } else {
                    let decorator = part
                    decorators[decorator] = true;
                    definition = ` ${definition}\n  @${decorator}`
                }
                return definition
            }, '')
            var code= `import { Model, ${Object.keys(decorators).join(', ') } from 'triframe/scribe'
export class ${name} extends Model {
${definition}
}`
        
            fs.writeFile(`./src/${path}.js`, code)
        break;
        case 'form':
                let inputs = {}
                let defaults = ''
                var [ path, name, ...instructions] = args;
                var [ Name, Model = name ] = name.split(':')
                var model = Model.toLowerCase()
                let fields = instructions.reduce( ( fields, part, index ) => {
                    let [ something, Input = 'TextInput' ] = part.split(':')
                    var [ label, defaultValue = '""' ] = something.split('=')
                    inputs[Input] = true
                    let name = toCamelCase(label)
                    defaults= `${defaults}\n        ${name}: ${defaultValue},`
                    fields = `${fields}
        <${Input}
            label="${label}"
            value={${model}.${name}}
            onChangeText={${name} => ${model}.set({ ${name} })}
        />
        <HelperText visible={form.hasBeenSubmitted && ${model}.validation.hasErrors('${name}')} type="error">
            {${model}.validation.errorsFor('${name}')}
        </HelperText>`
                    return fields
                }, '')
                var code= `import React from 'react'
import { tether, Container, Button, HelperText, ${Object.keys(inputs).join(', ')} } from 'triframe/designer'
const ${Name} = tether(function*({  models, use, redirect, catchErrors, onError }) {

    const { ${Model} } = models

    const ${model} = yield use(new ${Model}({${defaults}
    }))
    
    const form = yield use({ hasBeenSubmitted: false, errorMessage: '' })

    const handleSubmit = () => {
        console.log(${model})
    }

    onError((err) => {
        form.set({ errorMessage: err.message })
    })

    return (
        <Container>
            <HelperText visible={form.errorMessage.length > 0} type="error">
                {form.errorMessage}
            </HelperText>${fields}
            <Button onPress={catchErrors(handleSubmit)}>
                Submit
            </Button>
        </Container>
    )
})
export { ${Name} }`
            
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
            
                fs.writeFile(`./src/${path}.js`, code)
            break;
    }
}