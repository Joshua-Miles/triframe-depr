import React, { useState } from 'react'
import { Button } from '../Button'
import { HelperText } from 'react-native-paper'
import { Model } from '../Provider'


export const FileInput = ({ onChange = () => void (0), multiple = false, path = false, children = 'Upload', ...props }) => {
    const [filenames, changeFilenames] = useState('')
    const handleChange = (e, url) => {
        const names = [];
        const input = e.target;
        const form = new FormData;
        for (let index = 0; index < input.files.length; index++) {
            let file = input.files[index]
            names.push(file.name)
            form.append(index, file);
        }
        changeFilenames(names.join(', '))
        form.append('length', input.files.length)
        form.append('path', path)
        fetch(`${url}/upload`, {
            method: 'POST',
            body: form
        })
            .then(res => res.json())
            .then(urls => {
                onChange(multiple ? urls : urls[0])
            })
    }
    let input;
    let chooseFile = () => input.click()
    return (
        <Model.Consumer>
            {models =>
                <>
                    <Button onPress={chooseFile} {...props}>{children}</Button>
                    <HelperText>{filenames}</HelperText>
                    <input
                        style={{ display: 'none' }}
                        ref={x => input = x}
                        type="file"
                        multiple={multiple}
                        onChange={e => handleChange(e, models.url)}
                    />
                </>
            }
        </Model.Consumer>
    )
}