document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value.trim();

    if (!name || !email || !password || !role) {
        alert('Please fill in all fields.');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) throw new Error('GET request failed');

        const users = await response.json();
        const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);  
        const nextUserId = maxId + 1;  


        if (users.find(user => user.email === email)) {
            alert('This email is already registered.');
            return;
        }


        const newUser = { id: nextUserId, name, email, password, role };
        const postResponse = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!postResponse.ok) throw new Error('POST request failed');

        const result = await postResponse.json();
        console.log('New user saved:', result);


        console.log(`Role selected: ${role}`);
        switch (role) {
            case 'customer':
                console.log('Redirecting to customer page...');
                window.location.href = '../homeAscustomer.html';
                break;
            case 'seller':
                console.log('Redirecting to seller page...');
                window.location.href = '../html/seller.html';
                break;
            // case 'admin':
            //     console.log('Redirecting to admin page...');
            //     window.location.href = '../html/admin.html';
            //     break;
            // default:
            //     console.log('Unknown role, redirecting to home...');
            //     window.location.href = '../home.html';
        }

        
    } catch (error) {
        console.error('Error:', error);
        alert(`Registration failed: ${error.message}. Please try again.`);
    }
});

