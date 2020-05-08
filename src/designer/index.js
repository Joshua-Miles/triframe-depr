// Native and Platform Components
import { View, TouchableOpacity, Platform, ScrollView, Animated, PanResponder, Modal as LegacyModal } from 'react-native'


// // Native Paper Components
import { Provider as StyleProvider, Appbar, Avatar, Menu, Divider, Badge, RadioButton, Snackbar, Portal, ProgressBar, Checkbox, DefaultTheme } from 'react-native-paper';

// // Custom Components
import TextEditor from './TextEditor'
import Drawer from './Drawer'
import Modal from './Modal'
import { Card, Chip, List, Surface } from './Material'
import { createGrid, Container, Section, Area } from './Layout'
import { Button, BubbleButton, ToggleButton } from './Button'
import { Text, Title, Heading, Subheading, Paragraph, Caption } from './Typography'
import { TextInput, PasswordInput, DateInput, TextField, HelperText, ToggleSwitch, FileInput, ToggleInput, DateTimeInput, TextArea } from './Form'
import * as Constants from './constants'
import { Route, Redirect, Switch } from 'react-router';
import { Provider, tether } from './Provider';


import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})



export {
    Icon,

    DefaultTheme,
    
    Surface,

    Constants,

    Switch,

    Redirect,

    Provider,

    tether,

    Route, 

    StyleProvider,

    Checkbox,

    ProgressBar,

    Portal,

    // Icon,

    TouchableOpacity, ScrollView, Animated, PanResponder, LegacyModal,

    // Deprecate
    TextEditor,

    // Low Level
    Platform,

    // Layout
    View, Container, Section, Area, Grid, Column, Divider,

    // Common
    Drawer, Modal, Appbar, Avatar, Menu, Badge, Snackbar,

    // Typography
    Text, Title, Heading, Subheading, Paragraph, Caption,

    // Buttons
    Button, BubbleButton, ToggleButton,

    // Form
    TextInput, PasswordInput, FileInput, ToggleInput, DateInput, DateTimeInput, TextArea, TextField, HelperText, ToggleSwitch, RadioButton,

    // Material
    Chip, Card, List,
}