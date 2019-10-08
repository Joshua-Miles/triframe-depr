import React from 'react';
import { Portal, Dialog } from 'react-native-paper'
import { ScrollView } from 'react-native'

export default function Modal(props){
    const { children, ...rest} = props
    return (
        <Portal>
            <Dialog {...rest} style={{ maxHeight: `${window.innerHeight}px`}}>
                <ScrollView>
                    {children}
                </ScrollView>
            </Dialog>
        </Portal>
    )
}

Object.assign(Modal, Dialog)