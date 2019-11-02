# Designer

`triframe/designer` exports a function for `tether`ing components to your backend data source, as well as a number of components helpful to designing a clean user experience that follows material design principles.

It is built on `react-native-paper`

### `Provider`

Provider is a component which should be used to wrap your entire application.

It creates a context which will be used to share data with all other components in your app.

```jsx
import React from 'react'
import { Provider } from 'triframe/designer'

const App = () => null

export default () => (
    <Provider>
      <App />
    </Provider>
)
```

##### Props

| name       | value                                                        |
| ---------- | ------------------------------------------------------------ |
| `url`      | Optional. A http address for your backend. Defaults to `http://localhost:8080` |
| `iconSets` | Optional. An array of `react-native-vector-icons` to load. Defaults to `MaterialIcons` |



### `tether`

Tether is a function which creates a higher-order-component, subscribing to the context provided by the `Provider`, and passing a number of props into the provided component: 

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| `props`        | An object which contain any props passed to the component    |
| `models`       | An object which will contain all models served by the backend |
| `redirect`     | A function which can be used to change the current route<br />**Accepts:** a string route to change the current view<br />**Returns:** Nothing |
| `use`          | A hook which creates stateful data<br />**Accepts:** An object to represent "initial state"<br />**Returns:** A new object with the current stateful values and a "set" method, which can be used to set any object property and automatically re-render effected components |
| `useContext`   | A hook which consumes a function for sharing data between multiple components<br />**Accepts:** A context - function<br />**Returns:** The output of the context function |
| `useRouter`    | A hook which provides routing data<br />**Accepts:** Nothing<br />**Returns:** An object with, match, history, and location properties from react-router |
| `whileLoading` | A function which can change the display of a component while the main display is still loading.<br />**Accepts:** jsx to display<br />**Returns:** Nothing |
| `afterRender`  | A function which takes in a callback to be invoked after every render<br />**Accepts:** A callback function<br />**Returns:** Nothing |
| `onError`      | A function which takes in a callback to be invoked with any errors thrown within the component<br />**Accepts:** A callback function<br />**Returns:** Nothing |
| `catchErrors`  | A function which can wrap any function and route any errors it throws back to this component (useful for handling errors from event listeners)<br />**Accepts:** A function<br />**Returns:** A wrapped function |



### `Route`

A component which conditionally render components based on the current route:

```jsx
import React from 'react'
import { Route } from 'triframe/designer'
import { IndexPage } from './example-path'
import { DetailPage } from './example-path'
import { CreatePage } from './example-path'

export const App = () => (
	<>
		<Route exact path="/things" component={IndexPage}/>
		<Route exact path="/things/:id" component={DetailPage} />
		<Route exact path="/things/create" component={CreatePage} />
	</>
)
```

##### Props

| name        | value                                                        |
| ----------- | ------------------------------------------------------------ |
| `path`      | A path to use for the component                              |
| `component` | A component to display when the given path is visited by the user |
| `exact`     | Optional boolean (Defaults to false). If true, the component will only be displayed with the path matches exactly. Otherwise, the component will display if the visited path starts with the provided path |



## Layout

### `Container`

 Fills the remaining space in the parent and wraps it's children in a `ScrollView`

```jsx
import React from 'react'
import { Container } from 'triframe/designer'

export const App = () => (
	<Container>
    	// children
    </Container>
)
```

##### Props

| name   | value                                                        |
| ------ | ------------------------------------------------------------ |
| `slim` | Optional boolean (Defaults to false). If true, the container will not apply margin, otherwise, it will apply 50px of margin |



### `Section`

Wraps part of a page and gives it margin

```jsx
import React from 'react'
import { Container, Section } from 'triframe/designer'

export const App = () => (
	<Container>
    	<Section>
            // Children
        </Section>
        <Section>
            // Children
        </Section>
        <Section>
            // Children
        </Section>
    </Container>
)
```

##### Props

> None



### `Area`

 Fills the remaining space in the parent and allows the developer to align the contents inside it

```jsx
import React from 'react'
import { Container, Area } from 'triframe/designer'

export const App = () => (
    <Container>
        <Area inline alignX="center">
            // children
        </Area>
     </Container>
)
```

##### Props

| name     | value                                                        |
| -------- | ------------------------------------------------------------ |
| `inline` | Optional boolean (Defaults to false). If true, `Area`'s contents will be displayed inline |
| `alignX` | One of: 'left' \| 'right' \| 'center'. Determines the alignment of the `Area`'s contents in the x-axis |
| `alignY` | One of: 'left' \| 'right' \| 'center'. Determines the alignment of the `Area`'s contents in the y-axis |



### `Grid`

  Creates a `Grid` which displays dynamically based on screen size

```jsx
import React from 'react'
import { Container, Grid } from 'triframe/designer'

export const App = () => (
    <Container>
        <Grid>
            // children
        </Grid>
     </Container>
)
```

##### Props

| name   | value                                               |
| ------ | --------------------------------------------------- |
| `base` | The number of columns for the grid. Defaults to 12. |



### `Column`

Creates a `Grid` which displays dynamically based on screen size

```jsx
import React from 'react'
import { Container, Grid, Column } from 'triframe/designer'

export const App = () => (
    <Container>
        <Grid>
            <Column>One</Column>
            <Column>Two</Column>
            <Column>Three</Column>
        </Grid>
     </Container>
)
```

##### Props

| name | value                                                        |
| ---- | ------------------------------------------------------------ |
| `xs` | number \| 'fix-bottom'. <br />If a number, the number of spaces this `Column` takes up in the grid on a extra-small screen (< 350px)<br />If 'fix-bottom', the `Column`'s position will be fixed to the bottom of the viewport on a extra-small screen (<350px) |
| `sm` | If a number, the number of spaces this `Column` takes up in the grid on a small screen ( 350px-450px)<br />If 'fix-bottom', the `Column`'s position will be fixed to the bottom of the viewport on a small screen (350px-450px) |
| `md` | If a number, the number of spaces this `Column` takes up in grid on a medium screen (450px-650px)<br />If 'fix-bottom', the `Column`'s position will be fixed to the bottom of the viewport on a medium screen (450px-650px) |
| `lg` | If a number, the number of spaces this `Column` takes up in grid on a large screen (650px-950px)<br />If 'fix-bottom', the `Column`'s position will be fixed to the bottom of the viewport on a largescreen (650px-950px) |
| `xl` | If a number, the number of spaces this `Column` takes up in grid on a small screen (> 950px)<br />If 'fix-bottom', the `Column`'s position will be fixed to the bottom of the viewport on a small screen (> 950px) |



 ## Typography

 ### `Text`

  Unstyled Text

```jsx
import React from 'react'
import { Container, Text } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Text>Hello World</Text>
    </Container>
)
```

##### Props

> None



### `Title`

  A page title

```jsx
import React from 'react'
import { Container, Title } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Title>Hello World</Title>
    </Container>
)
```

##### Props

> None



### `Heading`

  A section heading

```jsx
import React from 'react'
import { Container, Heading } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Heading>Hello World</Heading>
    </Container>
)
```

##### Props

> None

### `Subheading`

  A subsection heading

```jsx
import React from 'react'
import { Container, Subheading } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Subheading>Hello World</Subheading>
    </Container>
)
```

##### Props

> None

### `Paragraph`

  A paragraph

```jsx
import React from 'react'
import { Container, Paragraph } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Paragraph>Hello World</Paragraph>
    </Container>
)
```

##### Props

> None



### `Caption`

  A caption

```jsx
import React from 'react'
import { Container, Caption } from 'triframe/designer'

export const App = () => (
    <Container>
    	<Caption>Hello World</Caption>
    </Container>
)
```

##### Props

> None



 ## Buttons

### `Button`

 https://callstack.github.io/react-native-paper/button.html 

### `BubbleButton`

FAB:  https://callstack.github.io/react-native-paper/fab.html 

### `ToggleButton`

 https://callstack.github.io/react-native-paper/toggle-button.html 



 ## Forms

 ### `TextField`

A basic space for text input

### `TextInput`

 https://callstack.github.io/react-native-paper/text-input.html 

### `FileInput`



### `HelperText`

 https://callstack.github.io/react-native-paper/helper-text.html 

### `ToggleSwitch`

 https://callstack.github.io/react-native-paper/switch.html 

### `RadioButton`

 https://callstack.github.io/react-native-paper/radio-button.html 



 ## Material

 ### `Chip`

 https://callstack.github.io/react-native-paper/chip.html 

### `Card`

 https://callstack.github.io/react-native-paper/card.html 

### `List `

 https://callstack.github.io/react-native-paper/list-item.html 

### `Badge`

 https://callstack.github.io/react-native-paper/badge.html 



## Misc

### `Appbar`

 https://callstack.github.io/react-native-paper/appbar.html 

### `Drawer`

 https://callstack.github.io/react-native-paper/drawer-item.html 

### `Modal `

 https://callstack.github.io/react-native-paper/modal.html 