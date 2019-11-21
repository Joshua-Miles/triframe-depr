// Native and Platform Components
import { View, TouchableOpacity, Platform, ScrollView, Animated, PanResponder, Modal as LegacyModal } from 'react-native'
import { Route, Switch, Redirect } from 'react-router'
import { Router, Link } from './platform'

// Native Paper Components
import { Appbar, Avatar, Menu, Divider, Badge, RadioButton, Snackbar, Portal } from 'react-native-paper';

// 
import { Provider, tether } from './Provider'

// Custom Components
import TextEditor from './TextEditor'
import Drawer from './Drawer'
import Modal from './Modal'
import { Card, Chip, List } from './Material'
import { createGrid, Container, Section, Area } from './Layout'
import { Button, BubbleButton, ToggleButton, FileInput } from './Button'
import { Text, Title, Heading, Subheading, Paragraph, Caption } from './Typography'
import { TextInput, PasswordInput, TextField, HelperText, ToggleSwitch } from './Form'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DateTimeInput } from './DateTimeInput/index.web';


const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})


export {

    Portal,

    Icon,

    TouchableOpacity, ScrollView, Animated, PanResponder, LegacyModal,

    // Deprecate
    TextEditor,

    // Low Level
    Platform, Provider, tether,

    // Routing
    Router, Route, Redirect, Link, Switch,

    // Layout
    View, Container, Section, Area, Grid, Column, Divider,

    // Common
    Drawer, Modal, Appbar, Avatar, Menu, Badge, Snackbar,

    // Typography
    Text, Title, Heading, Subheading, Paragraph, Caption,

    // Buttons
    Button, BubbleButton, ToggleButton,

    // Form
    TextInput, PasswordInput, FileInput, DateTimeInput, TextField, HelperText, ToggleSwitch, RadioButton,

    // Material
    Chip, Card, List,
}