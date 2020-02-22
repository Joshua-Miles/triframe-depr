// Native and Platform Components
import { View, TouchableOpacity, Platform, ScrollView, Animated, PanResponder, Modal as LegacyModal } from 'react-native'

require('./platform')

// Native Paper Components
import { Provider as StyleProvider, Appbar, Avatar, Menu, Divider, Badge, RadioButton, Snackbar, Portal, ProgressBar, Checkbox } from 'react-native-paper';

// Custom Components
import TextEditor from './TextEditor'
import Drawer from './Drawer'
import Modal from './Modal'
import { Card, Chip, List } from './Material'
import { createGrid, Container, Section, Area } from './Layout'
import { Button, BubbleButton, ToggleButton } from './Button'
import { Text, Title, Heading, Subheading, Paragraph, Caption } from './Typography'
import { TextInput, PasswordInput, TextField, HelperText, ToggleSwitch, FileInput } from './Form'

import { Route } from 'react-router';
import { Router } from './Router';
import { Provider, tether } from './Provider';


import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const { Grid, Column } = createGrid({
    xs: 0,
    sm: 350,
    md: 450,
    lg: 650,
    xl: 950
})




export {
    Provider,

    tether,

    Route, 

    StyleProvider,

    Checkbox,

    ProgressBar,

    Portal,

    Icon,

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
    TextInput, PasswordInput, TextField, HelperText, ToggleSwitch, RadioButton, FileInput,

    // Material
    Chip, Card, List,
}