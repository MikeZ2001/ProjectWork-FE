import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import AuthService from '../../services/auth.service';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Simple validation
    if (!email || !password) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await AuthService.login({email, password});

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Login" className="w-full md:w-6 lg:w-4" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleLogin} className="p-fluid">
          <div className="field">
            <label htmlFor="email" className="font-bold">Email</label>
            <InputText 
              id="email" 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={classNames({ 'p-invalid': submitted && !email })}
            />
            {submitted && !email && <small className="p-error">Email is required.</small>}
          </div>

          <div className="field mt-4">
            <label htmlFor="password" className="font-bold">Password</label>
            <Password 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              toggleMask 
              feedback={false}
              className={classNames({ 'p-invalid': submitted && !password })}
            />
            {submitted && !password && <small className="p-error">Password is required.</small>}
          </div>

          {error && (
            <div className="field mt-4">
              <Message severity="error" text={error} />
            </div>
          )}

          <div className="flex flex-column sm:flex-row justify-content-between mt-4">
            <Button 
              label="Login" 
              className="p-button-primary" 
              loading={loading} 
              type="submit"
            />
            <Link to="/register" className="p-button p-button-link mt-3 sm:mt-0">
              New user? Register here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login; 