import React from 'react';
import { Portal, Dialog } from 'react-native-paper'
import { ScrollView, Platform } from 'react-native'

const styles = Platform.OS === 'web' ? { maxHeight: `${window.innerHeight}px`} : {};

export default function Modal(props){
    const { children, ...rest} = props
    return (
        <Portal>
            <Dialog {...rest} style={styles}>
                <ScrollView>
                    {children}
                </ScrollView>
            </Dialog>
        </Portal>
    )
}

Object.assign(Modal, Dialog)