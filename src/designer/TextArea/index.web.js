import React, { useEffect, useState } from 'react'
import { TextInput } from 'react-native'

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
            ref={x => element = x}
            style={{ width: '100%', height, overflow: 'hidden' }}
            multiline
            value={value}
            onChangeText={onChange || onChangeText }
            {...props}
        />         
    )
}