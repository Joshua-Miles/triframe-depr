import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Card, TextField, Title, Container, Grid, Column, Text, Chip } from '..';

const Cursor = () => {
    let [visibility, setVisibility] = useState('visible')

    useEffect(() => {
        let interval = setInterval(() => {
            visibility = visibility == 'hidden' ? 'visible' : 'hidden'
            setVisibility(visibility)
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <span style={{ visibility, borderRightStyle: 'solid', borderRightColor: 'black', borderRightWidth: '1px' }}></span>
    )
}


let handleKeyPress = () => void (0)

document.addEventListener('keydown', e => {
    handleKeyPress(e)
})

let pressed = false;
let focused = true;

document.addEventListener('mousedown', () => {
    pressed = true
})

document.addEventListener('mouseup', () => {
    pressed = false
})

document.addEventListener('click', (e) => {
    if(!e.target.dataset.editor){
        focused = false
    }
})

export default ({ document }) => {

    const setSelection = (start, end) => {
        focused = true
        document.setSelection({ start, end })
    }

    let selection = document.selection

    handleKeyPress = (e) => {
        if (!focused) return false
        switch (e.key) {
            case 'Backspace':
                document.backspace()
                break;
            case 'Enter':
                document.insert("\n")
                break;
            case 'Control':
                break;
            case 'Shift':
                break;
            default:
                document.insert(e.key)
                break;
        }
    }
   
    return (
        <pre style={{ whiteSpace: 'pre-wrap', userSelect: 'none', fontSize: '15px' }} data-editor={true}>
            {document.content.map(({ symbol, position, styles, id }, index, characters) => {
                let next = characters[index + 1] || { position: 'end' }
                return <span
                    data-editor={true}
                    key={id}
                    style={styles}
                    onPointerDown={(e) => setSelection(latterHalfClick(e) ? next.position : position, latterHalfClick(e) ? next.position : position)}
                    onPointerUp={(e) => setSelection(selection.start, latterHalfClick(e) ? next.position : position)}
                    onMouseEnter={e => pressed ? setSelection(selection.start, latterHalfClick(e) ? next.position : position) : undefined}
                >
                    {selection.start === selection.end && selection.start == position
                        ? <Cursor />
                        : null
                    }
                    {symbol}
                    {selection.start === selection.end && selection.start === 'end' && index == characters.length - 1
                        ? <Cursor />
                        : null
                    }
                </span>
            })}
            <div style={{ width: window.innerWidth, height: 200 }}
                onClick={() => setSelection('end', 'end')}
            ></div>
        </pre>
    )
}


const latterHalfClick = e => {
    const { x, width } = e.target.getBoundingClientRect()
    return e.clientX > (x + (width / 2))
}

window.type = function (time) {
    let sleep = time => new Promise(resolve => setTimeout(resolve, time))
    let phrase = ["T", "h", "e", " ", "q", "u", "i", "c", "k", " ", "b", "r", "o", "w", "n", " ", "f", "o", "x", " ", "j", "u", "m", "p", "e", "d", " ", "o", "v", "e", "r", " ", "t", "h", "e", " ", "l", "a", "z", "y", " ", "d", "o", "g", "Enter"]
    let cont = true
    let i = 0;
    ; (async () => {
        while (cont) {
            var keyboardEvent = new Event('keydown')
            keyboardEvent.key = phrase[i]
            document.dispatchEvent(keyboardEvent);
            await sleep(time)
            i = (i + 1) % phrase.length;
        }
    })()
    return () => cont = false
}