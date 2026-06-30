async function test() {
  try {
    const res = await fetch('http://localhost:3002/products?limit=5');
    const data = await res.json();
    console.log('Sample Product from List:', data.data[0].id, {
        ratingAvg: data.data[0].ratingAvg,
        reviewCount: data.data[0].reviewCount
    });
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

test();
