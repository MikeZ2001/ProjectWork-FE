import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Card} from 'primereact/card';
import {InputText} from 'primereact/inputtext';
import {Password} from 'primereact/password';
import {Button} from 'primereact/button';
import {Message} from 'primereact/message';
import {classNames} from 'primereact/utils';
import { useAuth } from '../../contexts/AuthContext';

interface EmailTextFieldProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailIsInvalid: boolean;
  emailRef: React.Ref<HTMLInputElement>;
}

interface PasswordTextFieldProps {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  submitted: boolean;
}

interface LoginButtonProps {
  email: string;
  password: string;
  loading: boolean;
}

const EmailTextField: React.FC<EmailTextFieldProps> = ({ email, setEmail, emailIsInvalid, emailRef }) => (
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
);

const PasswordTextField: React.FC<PasswordTextFieldProps> = ({ password, setPassword, submitted }) => (
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
      {submitted && !password && (
          <small className="p-error">Password is required.</small>
      )}
    </div>
);

const LoginButton: React.FC<LoginButtonProps> = ({ email, password, loading }) => (
    <Button
        label="Login"
        className="p-button-primary"
        loading={loading}
        type="submit"
        disabled={!email || !password || loading}
    />
);

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const emailRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (emailRef.current) {
        emailRef.current?.focus();
      }
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        try {
            setError(null);
            const success = await login(email, password);
            
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (err: any) {
            setError(err.response?.data?.error_description || 'An error occurred during login');
        }
    };

    const emailIsInvalid = submitted && !isValidEmail(email);

    return (
        <div className="flex justify-content-center align-items-center h-screen">
            <Card title="Login" className="w-full md:w-6 lg:w-4" style={{maxWidth: '600px'}}>
                <form onSubmit={handleLogin} className="p-fluid">
                    <EmailTextField email={email} emailIsInvalid={emailIsInvalid} emailRef={emailRef} setEmail={setEmail}/>

                    <PasswordTextField password={password} setPassword={setPassword} submitted={submitted}/>

                    {error && (
                        <div className="field mt-4">
                            <Message severity="error" text={error}/>
                        </div>
                    )}

                    <div className="flex flex-column sm:flex-row justify-content-between mt-4">
                        <LoginButton password={password} email={email} loading={loading}/>
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