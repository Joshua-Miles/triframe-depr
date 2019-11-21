import Picker from 'react-datepicker';
import React from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { TextInput } from '../Form';



const DateTimeInput = ({ label, mode, style, value, ...props }) => {

    const Input = ({ value, onClick }) => (
        <TextInput label={label} value={value} onClick={onClick} mode={mode} style={style} />
    )

    return (
        <Picker
            {...props}
            selected={value}
            customInput={<Input />}
        />
    )
}

export { DateTimeInput }