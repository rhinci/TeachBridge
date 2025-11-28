import Header from './Header';

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <main style={{
        padding: '60px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1
      }}>
        {children}
      </main>
    </div>
  );
}