import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Form, Button } from 'react-bootstrap';
import AuthLayout from '@/layouts/auth-layout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout>
            <Head title="Login" />
            <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Welcome back</h2>
                <p className="text-secondary mb-0">Sign in to your LPage account</p>
            </div>

            <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        isInvalid={!!errors.email}
                        required
                    />
                    {errors.email && <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        isInvalid={!!errors.password}
                        required
                    />
                    {errors.password && <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Check
                        type="checkbox"
                        label="Remember me"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked)}
                    />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={processing} className="w-100 mb-3">
                    {processing ? 'Logging in...' : 'Login'}
                </Button>
            </Form>

            <p className="text-center text-secondary mb-0">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary fw-medium text-decoration-none">
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
}
