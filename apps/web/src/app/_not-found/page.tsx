import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif'
        }}>
            <h1>404</h1>
            <p>Page Not Found</p>
            <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
                Go back home
            </Link>
        </div>
    );
}