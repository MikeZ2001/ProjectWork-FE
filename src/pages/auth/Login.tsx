import React, {useEffect, useRef, useState} from 'react';
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
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      setLoading(true);
      setError(null);

      await AuthService.login({email, password});

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error_description || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const emailIsInvalid = submitted && !isValidEmail(email);

  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Login" className="w-full md:w-6 lg:w-4" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleLogin} className="p-fluid">
          <div className="field">
            <label htmlFor="email" className="font-bold">Email</label>
            <InputText 
              id="email"
              type="email"
              value={email}
              ref={emailRef}
              aria-required="true"
              aria-label="Email"
              onChange={(e) => setEmail(e.target.value)} 
              className={classNames({ 'p-invalid': emailIsInvalid })}
            />
            {emailIsInvalid && (
                <small className="p-error">Please enter a valid email address.</small>
            )}
          </div>

          <div className="field mt-4">
            <label htmlFor="password" className="font-bold">Password</label>
            <Password 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              toggleMask 
              feedback={false}
              aria-required="true"
              aria-label="Password"
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
              disabled={!email || !password || loading}
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