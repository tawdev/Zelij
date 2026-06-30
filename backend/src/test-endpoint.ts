async function test() {
  try {
    const res = await fetch('http://localhost:3002/products?onSale=true&page=1&limit=18');
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data length:', data.data?.length);
    if (res.status !== 200) {
      console.log('Error Body:', data);
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

test();
