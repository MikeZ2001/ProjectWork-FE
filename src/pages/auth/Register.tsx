import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import AuthService from '../../services/auth/auth.service';
import {Dialog} from "primereact/dialog";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Convert camelCase to snake_case for the API
      const registerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      await AuthService.register(registerData);

      setShowSuccessDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setShowSuccessDialog(false);
    navigate('/login', { state: { message: 'Registration successful! Please login.' } });
  };

  const dialogFooter = (
      <Button label="Continue" onClick={closeDialog} autoFocus />
  );

  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Register" className="w-full md:w-8 lg:w-6" style={{ maxWidth: '550px' }}>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="formgrid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="firstName" className="font-bold">First Name</label>
              <InputText 
                id="firstName"
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange} 
                className={classNames({ 'p-invalid': submitted && !formData.firstName })}
              />
              {submitted && !formData.firstName && <small className="p-error">First name is required.</small>}
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="lastName" className="font-bold">Last Name</label>
              <InputText 
                id="lastName"
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                className={classNames({ 'p-invalid': submitted && !formData.lastName })}
              />
              {submitted && !formData.lastName && <small className="p-error">Last name is required.</small>}
            </div>
          </div>

          <div className="field mt-3">
            <label htmlFor="email" className="font-bold">Email</label>
            <InputText 
              id="email"
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={classNames({ 'p-invalid': submitted && !formData.email })}
            />
            {submitted && !formData.email && <small className="p-error">Email is required.</small>}
          </div>

          <div className="field mt-3">
            <label htmlFor="password" className="font-bold">Password</label>
            <Password 
              id="password"
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              toggleMask
              className={classNames({ 'p-invalid': submitted && !formData.password })}
            />
            {submitted && !formData.password && <small className="p-error">Password is required.</small>}
          </div>

          <div className="field mt-3">
            <label htmlFor="confirmPassword" className="font-bold">Confirm Password</label>
            <Password 
              id="confirmPassword"
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              toggleMask
              feedback={false}
              className={classNames({ 'p-invalid': submitted && (!formData.confirmPassword || formData.password !== formData.confirmPassword) })}
            />
            {submitted && !formData.confirmPassword && <small className="p-error">Confirm password is required.</small>}
            {submitted && formData.confirmPassword && formData.password !== formData.confirmPassword && 
              <small className="p-error">Passwords do not match.</small>}
          </div>

          {error && (
            <div className="field mt-3">
              <Message severity="error" text={error} />
            </div>
          )}

          <div className="flex flex-column sm:flex-row justify-content-between mt-4">
            <Button 
              label="Register" 
              className="p-button-primary" 
              loading={loading} 
              type="submit"
            />
            <Link to="/login" className="p-button p-button-link mt-3 sm:mt-0">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </Card>

      <Dialog
          header="Registration Successful"
          visible={showSuccessDialog}
          style={{ width: '350px' }}
          footer={dialogFooter}
          onHide={closeDialog}
          modal
      >
        <p>Your account has been created successfully!</p>
        <p>You can now log in and start using our services.</p>
      </Dialog>
    </div>
  );
};

export default Register; 