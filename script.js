const HARD_CODED_PASSWORD = 'pls#Dont$Hack@69'; // Change this to your desired password

// async function fetchPasswordFromGitHub() {
//     const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;
//     const response = await fetch(url, {
//         headers: {
//             'Authorization': `token ${GITHUB_TOKEN}`
//         }
//     });

//     if (!response.ok) {
//         console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
//         alert(`Failed to fetch the password file. Status: ${response.status}. Check console for more details.`);
//         return null;
//     }

//     const data = await response.json();
//     const content = atob(data.content); // Decode base64 content
//     return content.trim();
// }

async function validatePassword() {
    const enteredPassword = document.getElementById('password').value;

    if (enteredPassword === HARD_CODED_PASSWORD) {
        // Store authentication flag in session storage
        sessionStorage.setItem('authenticated', 'true');

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
