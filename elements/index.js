// Native and Platform Components
import { View, Platform } from 'react-native'
import { Route, Switch, Redirect } from 'react-router'
import { Router, Link } from './platform'

// Native Paper Components
import { Appbar } from 'react-native-paper';

// 
import { Provider, tether } from './Provider'

// Custom Components
import TextEditor from './TextEditor'
import Drawer from './Drawer'
import Modal from './Modal'
import { Card, Chip, List } from './Material'
import { createGrid, Container, Section } from './Layout'
import { Button, BubbleButton, ToggleButton } from './Button'
import { Text, Title, Heading, Subheading, Paragraph, Caption } from './Typography'
import { TextInput, TextField, HelperText, ToggleSwitch } from './Form'

const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})

export {

    // Deprecate
    TextEditor,

    // Low Level
    Platform, Provider, tether,

    // Routing
    Router, Route, Redirect, Link, Switch,

    // Layout
    View, Container, Section, Grid, Column, 

    // Common
    Drawer, Modal, Appbar,

    // Typography
    Text, Title, Heading, Subheading, Paragraph, Caption,

    // Buttons
    Button, BubbleButton, ToggleButton,

    // Form
    TextInput, TextField, HelperText, ToggleSwitch,

    // Material
    Chip, Card, List,
}