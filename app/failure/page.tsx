export default function FailurePage() {
  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
      <p style={{ fontSize: '3rem' }}>❌</p>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        El pago no se completó
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Podés volver a la tienda y reintentar el pago desde el carrito.
      </p>
      <a href="/" style={{
        background: '#EF7F1A', color: 'white',
        padding: '0.75rem 2rem', borderRadius: 24,
        textDecoration: 'none', fontWeight: 700,
        fontSize: '1rem',
      }}>
        Volver a la tienda
      </a>
    </div>
  )
}