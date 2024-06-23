const GITHUB_USERNAME = 'Srinath-Rajkumar';
        const REPO_NAME = 'security';
        const FILE_PATH = 'Security_Key.txt';
        const GITHUB_TOKEN = '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';

async function fetchPasswordFromGitHub() {
    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });

    if (!response.ok) {
        console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
        alert(`Failed to fetch the password file. Status: ${response.status}. Check console for more details.`);
        return null;
    }

    const data = await response.json();
    const content = atob(data.content); // Decode base64 content
    return content.trim();
}

async function validatePassword() {
    const enteredPassword = document.getElementById('password').value;
    const storedPassword = await fetchPasswordFromGitHub();

    if (storedPassword && enteredPassword === storedPassword) {
        // Store authentication flag in session storage
        sessionStorage.setItem('authenticated', 'true');

        // document.getElementById('pdf-links').style.display = 'block';
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('authenticated-buttons').style.display = 'flex'; // Show authenticated buttons
    } else {
        alert('Incorrect password');
    }
}
function logout() {
    // Clear authentication flag from session storage
    sessionStorage.removeItem('authenticated');

    // Redirect back to index.html after logout
    window.location.href = 'index.html';
}

function navigateToSpringBoot() {
    // Check if authenticated flag is set
    if (sessionStorage.getItem('authenticated') === 'true') {
        window.location.href = 'springboot.html'; // Navigate to Spring Boot page
    } else {
        alert('Authentication required to access this page.');
    }
}

function navigateToReactJS() {
    // Check if authenticated flag is set
    if (sessionStorage.getItem('authenticated') === 'true') {
        window.location.href = 'reactjs.html'; // Navigate to ReactJS page
    } else {
        alert('Authentication required to access this page.');
    }
}