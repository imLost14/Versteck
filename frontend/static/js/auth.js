async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (data.mfa_required) {
            document.getElementById('mfa-section').style.display = 'block';
            localStorage.setItem('access', data.access);
            
            // Obtener QR para MFA
            const qrResponse = await fetch('http://localhost:8000/api/mfa/setup/', {
                headers: { 'Authorization': `Bearer ${data.access}` },
            });
            const qrData = await qrResponse.json();
            document.getElementById('qr-code').src = `data:image/png;base64,${qrData.qr_code}`;
        } else {
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            window.location.href = '/templates/dashboard.html';
        }
    } catch (error) {
        alert('Error en el login: ' + error.message);
    }
}

async function verifyMFA() {
    const code = document.getElementById('mfa-code').value;
    
    try {
        const response = await fetch('http://localhost:8000/api/mfa/verify/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (response.ok) {
            window.location.href = '../../../frontend/templates/dashboard.html';
        } else {
            alert('Código MFA incorrecto');
        }
    } catch (error) {
        alert('Error al verificar MFA: ' + error.message);
    }
}
