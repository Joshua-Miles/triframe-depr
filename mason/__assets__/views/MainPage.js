import React, { useState } from 'react'
import {

    // Layout
    Container, Grid, Column, Section, Area,

    // Common
    Drawer, Modal, Appbar,

    // Typography
    Text, Title, Heading, Subheading, Paragraph, Caption,

    // Buttons
    Button, BubbleButton, ToggleButton,

    // Form
    TextInput, TextField, FileInput, HelperText, ToggleSwitch,

    // Material
    Chip, Card, List,

} from 'triframe/designer'


export const MainPage = () => {
    // Drawer (Menu) 
    const [drawerIsOpen, showDrawer] = useState(false)

    // Toggle Switch
    const [toggleIsChecked, checkToggle] = useState(false)

    // Toggle Button
    const [toggleButtonStatus, setToggleButtonStatus] = useState('unchecked')

    // Modal 
    const [modalIsVisible, showModal] = useState(false)

    // File Input
    const [ imageURL, setImageURL ] = useState('')

    return (
        <Drawer
            open={drawerIsOpen}
            onClose={() => showDrawer(false)}
            render={() => (
                    <Card style={{ flex: 1 }}>
                        <Card.Content>
                            <Text>Hi</Text>
                        </Card.Content>
                    </Card>
            )}>
            <Container>
                <Section>
                    <Heading>Typography</Heading>
                    <Title>Title</Title>
                    <Heading>Heading</Heading>
                    <Subheading>Subheading</Subheading>
                    <Paragraph>Paragraph</Paragraph>
                    <Caption>Caption</Caption>
                    <Text>Text</Text>
                </Section>
                <Section>
                    <Heading>TextInput</Heading>
                    <TextInput label="Text Input" />
                </Section>
                <Section>
                    <Heading>HelperText</Heading>
                    <TextInput label="Text Input" />
                    <HelperText type="error" >This is some bad helper text</HelperText>
                </Section>
                <Section>
                    <Heading>TextField</Heading>
                    <TextField />
                </Section>
                <Section>
                    <Heading>ToggleSwitch</Heading>
                    <ToggleSwitch value={toggleIsChecked} onPress={() => checkToggle(!toggleIsChecked)} />
                </Section>
                <Section>
                    <Heading>Image Input</Heading>
                    <Image source={{ uri: `http://localhost:8080${imageURL}`}} />
                    <FileInput onChange={setImageURL}>Upload an Image</FileInput>
                </Section>
                <Section>
                    <Heading>Section</Heading>
                    <Section>
                        <Paragraph>This is in a section</Paragraph>
                    </Section>
                </Section>
                <Section>
                    <Heading>Grid</Heading>
                    <Grid >
                        <Column xs={4}>
                            Column One
                            </Column>
                        <Column xs={4}>
                            Column Two
                            </Column>
                        <Column xs={4}>
                            Column Three
                            </Column>
                    </Grid>
                </Section>
                <Section>
                    <Heading>Button</Heading>
                    <Area inline>
                        <Button>Contained Button</Button>
                        <Button mode="text">Text Button</Button>
                        <Button mode="outlined">Outlined Button</Button>
                    </Area>
                </Section>
                <Section>
                    <Heading>BubbleButton</Heading>
                    <BubbleButton icon="plus" small />
                </Section>
                <Section>
                    <Heading>ToggleButton</Heading>
                    <ToggleButton icon="plus" status={toggleButtonStatus} onPress={() => {
                        setToggleButtonStatus(
                            toggleButtonStatus === 'checked'
                                ? 'unchecked'
                                : 'checked'
                        )
                    }} />
                </Section>
                <Section>
                    <Heading>Card</Heading>
                    <Card>
                        <Card.Content>
                            <Text>I'm a Card</Text>
                        </Card.Content>
                    </Card>
                </Section>
                <Section>
                    <Heading>Chip</Heading>
                    <Chip>
                        I'm a Chip
                        </Chip>
                </Section>
                <Section>
                    <Heading>List</Heading>
                    <List.Accordion title="List">
                        <List.Item description="List Item 1" />
                        <List.Item description="List Item 2" />
                        <List.Item description="List Item 3" />
                    </List.Accordion>
                </Section>
                <Section>
                    <Heading>Appbar</Heading>
                    <Appbar>
                        <Button mode="text" color="white">Hi</Button>
                    </Appbar>
                </Section>
                <Section>
                    <Heading>Modal</Heading>
                    <Area alignX="center">
                        <Button onPress={() => showModal(true)} mode="outlined">Open Modal</Button>
                    </Area>
                    <Modal visible={modalIsVisible} onDismiss={() => showModal(false)}>
                        <Modal.Content>
                            <Text>Hi</Text>
                        </Modal.Content>
                    </Modal>
                </Section>
                <Section>
                    <Heading>Drawer</Heading>
                    <Area alignX="center">
                        <Button onPress={() => showDrawer(true)} mode="outlined">Open Drawer</Button>
                    </Area>
                </Section>
            </Container>
        </Drawer>
    )
}  