// Simple fetch test to see the actual API response
fetch('http://localhost:3000/api/creator/projects/92424dd1-6de1-4646-918d-e526476cacd9', {
  credentials: 'include',
  headers: {
    'Cookie': 'creator_token=YOUR_TOKEN_HERE'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
