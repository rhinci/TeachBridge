export default function Header() {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      paddingTop: '25px',
      paddingBottom: '20px',
      paddingLeft: '200px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center'
    }}>
        <img src="/logo.png" alt="TeachBridge" style={{ height: '38px', width: 'auto'}} />
    </div>
  );
}