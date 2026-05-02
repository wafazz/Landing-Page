import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        subscriber_slug: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

    useEffect(() => {
        if (!data.subscriber_slug || data.subscriber_slug.length < 3) {
            setSlugStatus('idle');
            return;
        }
        if (!/^[a-z0-9-]+$/.test(data.subscriber_slug)) {
            setSlugStatus('invalid');
            return;
        }
        setSlugStatus('checking');
        const timer = setTimeout(() => {
            axios.post('/register/check-slug', { slug: data.subscriber_slug })
                .then(res => {
                    if (res.data.reason === 'invalid') setSlugStatus('invalid');
                    else setSlugStatus(res.data.available ? 'available' : 'taken');
                })
                .catch(() => setSlugStatus('idle'));
        }, 400);
        return () => clearTimeout(timer);
    }, [data.subscriber_slug]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    const slugFeedback = () => {
        if (slugStatus === 'checking') return <small className="text-muted">Checking availability...</small>;
        if (slugStatus === 'available') return <small className="text-success"><i className="bi bi-check-circle me-1"></i>Available</small>;
        if (slugStatus === 'taken') return <small className="text-danger"><i className="bi bi-x-circle me-1"></i>Already taken</small>;
        if (slugStatus === 'invalid') return <small className="text-danger">Use lowercase letters, numbers, hyphens (min 3 chars)</small>;
        return null;
    };

    return (
        <AuthLayout>
            <Head title="Register" />
            <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Create your account</h2>
                <p className="text-secondary mb-0">Start your 15-day free trial</p>
            </div>

            <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        isInvalid={!!errors.name}
                        required
                    />
                    {errors.name && <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>}
                </Form.Group>

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
                    <Form.Label>Your Subdomain</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            value={data.subscriber_slug}
                            onChange={e => setData('subscriber_slug', e.target.value.toLowerCase())}
                            placeholder="johnshop"
                            isInvalid={!!errors.subscriber_slug || slugStatus === 'taken' || slugStatus === 'invalid'}
                            required
                        />
                        <InputGroup.Text>.lpage.my</InputGroup.Text>
                    </InputGroup>
                    <div className="mt-1">
                        {slugFeedback()}
                        {errors.subscriber_slug && <div className="text-danger small">{errors.subscriber_slug}</div>}
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Phone <span className="text-muted small">(optional)</span></Form.Label>
                    <Form.Control
                        type="text"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        isInvalid={!!errors.password}
                        required
                        minLength={8}
                    />
                    {errors.password && <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        required
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={processing || slugStatus === 'taken' || slugStatus === 'invalid'}
                    className="w-100 mb-3"
                >
                    {processing ? 'Creating account...' : 'Start Free Trial'}
                </Button>
            </Form>

            <p className="text-center text-secondary mb-0">
                Already have an account?{' '}
                <Link href="/login" className="text-primary fw-medium text-decoration-none">
                    Login
                </Link>
            </p>
        </AuthLayout>
    );
}
