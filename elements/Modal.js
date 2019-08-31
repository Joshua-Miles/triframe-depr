import React from 'react';
import { Portal, Dialog } from 'react-native-paper'

export default function Modal(props){
    const { children, ...rest} = props
    return (
        <Portal>
            <Dialog {...rest}>
                {children}
            </Dialog>
        </Portal>
    )
}

Object.assign(Modal, Dialog)