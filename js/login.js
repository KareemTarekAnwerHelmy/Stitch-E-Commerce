document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        let role = null;

        if (email === 'kareemtarekanwer@gmail.com') {
            role = 'admin'; 
        } else {
            const user = data.find(u => u.email === email && u.password === password);
            if (user) {
                role = user.role; 
            }
        }

        if (role) {
            console.log(`Role selected: ${role}`);
            switch (role) {
                case 'customer':
                    console.log('Redirecting to customer page...');
                    window.location.href = '../html/customer.html';
                    break;
                case 'seller':
                    console.log('Redirecting to seller page...');
                    window.location.href = '../html/seller.html';
                    break;
                case 'admin':
                    console.log('Redirecting to admin page...');
                    window.location.href = '../html/admin.html';
                    break;
                default:
                    console.error('Unknown role. Redirecting to home page...');
                    window.location.href = '../home.html';
            }
        } else {
            console.log('Invalid email or password. Please try again.');
            alert('Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
