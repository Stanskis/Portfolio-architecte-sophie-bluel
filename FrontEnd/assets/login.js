const form = document.querySelector('#login form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Login successful');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            window.location.href = './index.html';
        } else {
            alert(data.message || 'Email ou mot de passe incorrect')
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server');
    }
});