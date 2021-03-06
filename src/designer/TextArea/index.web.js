import React, { useEffect, useState } from 'react'
import { TextInput as NativeInput } from 'react-native'

const TextInput = ({ value, onChange, $ref, ...rest}) => {
    let [ cached ] = useState({ value: value, key: 1 })
    if(value !== cached.value) cached.key = cached.key + 1
    return <NativeInput 
        ref={$ref}
        key={cached.key}
        defaultValue={value}
        onChange={e => {
            cached.value = e.target.value
            if(onChange) onChange(e)
        }}
        {...rest}
    />
}

let sizingProps = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    // non-standard
    'tabSize',
    'textIndent',
    // non-standard
    'textRendering',
    'textTransform',
    'width',
]

let createHiddenNode = (ref) => {
    let hiddenArea = document.createElement('textarea')

    Object.assign(hiddenArea.style, {
        'min-height': '0',
        'max-height': 'none',
        visibility: 'hidden',
        overflow: 'hidden',
        position: 'absolute',
        'z-index': '-1000',
        top: '0',
        right: '0',
        height: 'auto'
    })

    if(ref){
        let styles = window.getComputedStyle(ref)
        sizingProps.forEach( key => {
            hiddenArea.style[key] = styles[key]
        })
    }

    document.body.append(hiddenArea)
    return hiddenArea
}


export const TextArea = ({ value, onChange, onChangeText, ...props }) => {

    let element;
    let [ hiddenArea, setHiddenArea ] = useState(null)
   
    useEffect(() => {
        setHiddenArea(createHiddenNode(element._node))
    }, [])


    if(hiddenArea) hiddenArea.value = value
    let height = hiddenArea ? hiddenArea.scrollHeight : 'auto'
    return (  
        <TextInput
            $ref={x => element = x}
            style={{ width: '100%', height, overflow: 'hidden' }}
            multiline
            value={value}
            onChangeText={onChange || onChangeText }
            {...props}
        />         
    )
}