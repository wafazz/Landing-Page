import { router } from '@inertiajs/react';
import { Dropdown } from 'react-bootstrap';
import type { User } from '@/types/models';

interface Props {
    user: User | null;
    onToggleSidebar?: () => void;
}

export default function Topbar({ user, onToggleSidebar }: Props) {
    const handleLogout = () => router.post('/logout');

    const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';

    return (
        <nav className="app-header navbar navbar-expand bg-body">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <button
                            type="button"
                            className="nav-link sidebar-toggle btn btn-link border-0"
                            onClick={onToggleSidebar}
                            aria-label="Toggle sidebar"
                        >
                            <i className="bi bi-list fs-3"></i>
                        </button>
                    </li>
                </ul>

                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <i className="bi bi-bell fs-5"></i>
                        </a>
                    </li>

                    <li className="nav-item">
                        <Dropdown align="end">
                            <Dropdown.Toggle
                                as="a"
                                className="nav-link d-flex align-items-center text-decoration-none"
                                style={{ cursor: 'pointer' }}
                            >
                                <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                    style={{ width: 32, height: 32, fontSize: 14, fontWeight: 600 }}
                                >
                                    {initial}
                                </div>
                                <span className="d-none d-md-inline">{user?.name}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Header>
                                    <small className="text-muted">{user?.email}</small>
                                </Dropdown.Header>
                                <Dropdown.Divider />
                                <Dropdown.Item href="#"><i className="bi bi-person me-2"></i>Profile</Dropdown.Item>
                                <Dropdown.Item href="#"><i className="bi bi-gear me-2"></i>Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="text-danger">
                                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
