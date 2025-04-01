import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeflex/primeflex.css';

import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Password} from 'primereact/password';
import {classNames} from 'primereact/utils';
import './LoginForm.css';

export const LoginForm = () => {
    const [formData, setFormData] = useState({});
    const defaultValues = {
        email: '', password: '',
    }

    const {control, formState: {errors}, handleSubmit, reset} = useForm({defaultValues});

    const onSubmit = (data) => {
        setFormData(data);
        console.log(data)
        reset();
    };

    const getFormErrorMessage = (name) => {
        return errors[name] && <small className="p-error">{errors[name].message}</small>
    };

    return (<div className="form-login" style={{height: '100vh'}}>
            <div className="flex justify-content-center align-items-center">
                <div className="card">
                    <h5 className="text-center">Login</h5>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
                        <div className="field">
                            <span className="p-float-label p-input-icon-right">
                                <i className="pi pi-envelope"/>
                                <Controller name="email" control={control}
                                            rules={{
                                                required: 'Email is required.', pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                    message: 'Invalid email address. E.g. example@email.com'
                                                }
                                            }}
                                            render={({field, fieldState}) => (<InputText id={field.name} {...field}
                                                                                         className={classNames({'p-invalid': fieldState.invalid})}/>)}/>
                                <label htmlFor="email"
                                       className={classNames({'p-error': !!errors.email})}>Email*</label>
                            </span>
                            {getFormErrorMessage('email')}
                        </div>
                        <div className="field">
                            <span className="p-float-label">
                                <Controller name="password" control={control}
                                            rules={{required: 'Password is required.'}} render={({field}) => (
                                    <Password id={field.name} {...field} feedback={false} toggleMask={true}/>)}/>
                                <label htmlFor="password">Password*</label>
                            </span>

                        </div>
                        <Button type="submit" label="Submit" className="mt-2"/>
                    </form>
                </div>
            </div>
        </div>);
}
