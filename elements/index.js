import React from 'react';
import { ToggleButton, Chip, TextInput, Button, Portal, Dialog, Paragraph, FAB, Card, Title, Appbar, List, Switch as ToggleSwitch, Caption, Subheading as Subtitle } from 'react-native-paper';
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

const Drawer = ({ children, render = () => null, ref }) => (
    <DrawerLayout
        drawerWidth={300}
        drawerLockMode={'unlocked'}
        ref={ref}
        keyboardDismissMode="on-drag"
        renderNavigationView={render}>
        {children}
    </DrawerLayout>
)

const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})


export { 
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
    Headline
}