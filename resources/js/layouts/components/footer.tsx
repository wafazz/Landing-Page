export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="app-footer">
            <div className="float-end d-none d-sm-inline">v1.0.0</div>
            <strong>Copyright &copy; {year} <a href="/" className="text-decoration-none">LPage.my</a>.</strong>{' '}
            All rights reserved.
        </footer>
    );
}
