import React from 'react'
import {

  tether,

  // Layout
  Container, Grid, Column, Section, Area,

  // Common
  Drawer, Modal, Appbar,

  // Typography
  Text, Title, Heading, Subheading, Paragraph, Caption,

  // Buttons
  Button, BubbleButton, ToggleButton, FileInput,

  // Form
  TextInput, TextField, HelperText, ToggleSwitch,

  // Material
  Chip, Card, List,

} from 'triframe/designer'



function* App({ models, props, use, useContext, useHistory, redirect }) {
  let state = yield use({
    toggleSwitch: false,
    toggleButton: 'unchecked',
    modal: false,
    drawer: false
  })
  return (
    <Drawer 
      open={state.drawer} 
      onClose={() => {
        state.set({ drawer: false })
      }}
      render={ () => <Card><Card.Content><Text>Hi</Text></Card.Content></Card>}>
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
          <Heading>FileInput</Heading>
          <FileInput icon="cloud-upload" multiple onChange={console.log} label="Text Input" />
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
          <ToggleSwitch value={state.toggleSwitch} onPress={() => {
            state.set({ toggleSwitch: !state.toggleSwitch })
          }} />
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
          <BubbleButton icon="add" small />
        </Section>
        <Section>
          <Heading>ToggleButton</Heading>
          <ToggleButton icon="add" status={state.toggleButton} onPress={() => {
            state.set({
              toggleButton: state.toggleButton === 'checked'
                ? 'unchecked'
                : 'checked'
            })
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
            <Button onPress={() => {
              state.set({ modal: true })
            }} mode="outlined">Open Modal</Button>
          </Area>
          <Modal visible={state.modal} onDismiss={() => state.set({ modal: false })}>
            <Modal.Content>
              <Text>Hi</Text>
            </Modal.Content>
          </Modal>
        </Section>
        <Section>
          <Heading>Drawer</Heading>
          <Area alignX="center">
            <Button onPress={() => {
              state.set({ drawer: true })
            }} mode="outlined">Open Drawer</Button>
          </Area>
        </Section>
      </Container>
    </Drawer>
  )
}


export default tether(Demo)
 


const TetheredApp = tether(App)
export default () => (
  <Provider url="http://localhost">
    <TetheredApp />
  </Provider>
)