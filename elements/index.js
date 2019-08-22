import React from 'react';
import { ToggleButton, Chip, TextInput, HelperText, Button as NativePaperButton, Portal, Dialog, Paragraph, FAB, Card, Title, Appbar, List, Switch as ToggleSwitch, Caption, Subheading as Subtitle } from 'react-native-paper';
import { View, Text, Platform, TextInput as TextField } from 'react-native'
import { createGrid } from './Grid'
import { Route, Switch, Redirect } from 'react-router'
import { Router, Link } from './platform'
import TextEditor from './TextEditor'
import Container from './Container'
import { Provider, tether } from './Provider'
import DrawerLayout from 'react-native-drawer-layout';

const Headline = ({ children }) => (
    <Text style={{ fontSize: 40 }}>
        {children}
    </Text>
)

// Subtitle
// Text

const Pressable = NativePaperButton

const Button = ({ children, ...rest }) => (
    <NativePaperButton style={{ padding: 5, margin: 5 }} mode="contained" {...rest}>{children}</NativePaperButton>
)

const Drawer = ({ children, render = () => null, getDrawer }) => {
    let drawer;
    let handleRef = (ref) => {
        drawer = ref;
        getDrawer(ref)
    }
    let closeDrawer = () => drawer.closeDrawer()
    return (
        <DrawerLayout
            drawerWidth={300}
            drawerLockMode={'unlocked'}
            ref={handleRef}
            keyboardDismissMode="on-drag"
            renderNavigationView={() => render({ closeDrawer })}>
            <View style={{ height: '100vh' }}>
                {children}
            </View>
        </DrawerLayout>
    )
}

function Modal(props){
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

const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})


export {
    HelperText,
    Drawer,
    tether,
    Subtitle,
    ToggleButton,
    Chip,
    Route,
    Router,
    Link,
    Switch,
    TextInput,
    Button,
    View,
    Pressable,
    Portal,
    Dialog,
    Paragraph,
    FAB,
    Provider,
    Text,
    Platform,
    Card,
    Container,
    TextEditor,
    TextField,
    Title,
    Grid,
    Column,
    Redirect,
    Appbar,
    List,
    ToggleSwitch,
    Caption,
    Headline,
    Modal
}