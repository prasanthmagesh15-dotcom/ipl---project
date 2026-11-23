const activeKey = 'agrinex-active-farmer';
const accounts = { KUMAR: 'kumar', RAVI: 'ravi' };

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

function initialize() {
    const form = document.querySelector('[data-login-form]');
    if (form) {
        sessionStorage.removeItem(activeKey);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = new FormData(form);
            const id = accounts[String(input.get('loginId') || '').trim().toUpperCase()];
            const error = document.querySelector('[data-login-error]');

            if (!id || input.get('password') !== '1505') {
                error.textContent = 'Name or password is incorrect.';
                return;
            }

            sessionStorage.setItem(activeKey, id);
            location.href = `${id}.html`;
        });
    }

    document.querySelectorAll('[data-logout]').forEach((button) => {
        button.addEventListener('click', () => {
            sessionStorage.removeItem(activeKey);
            location.href = 'login.html';
        });
    });

    const activeFarmer = sessionStorage.getItem(activeKey);
    if (document.querySelector('[data-protected-page]') &&
        !Object.values(accounts).includes(activeFarmer)) {
        location.replace('login.html');
        return;
    }

    const farmerProfile = activeFarmer === 'ravi'
        ? { name: 'Ravi', city: 'Chengalpattu' }
        : { name: 'Kumar', city: 'Chennai' };
    const farmerName = document.querySelector('[data-demo="farmerName"]');
    const farmerCity = document.querySelector('[data-demo="city"]');
    if (farmerName) farmerName.textContent = farmerProfile.name;
    if (farmerCity) farmerCity.textContent = farmerProfile.city;

    document.querySelectorAll('a[href="dashboard.html"]').forEach((link) => {
        link.href = `${activeFarmer}.html`;
    });

    const homeLink = document.querySelector(
        '.app-header a[href="dashboard.html"], .app-header a[href="kumar.html"], .app-header a[href="ravi.html"]'
    );
    if (homeLink) {
        homeLink.href = `${activeFarmer}.html`;
        homeLink.textContent = '←';
        homeLink.classList.add('app-home-arrow');
        homeLink.setAttribute('aria-label', 'Back to home');
        homeLink.title = 'Back to home';
    }
}

document.addEventListener('DOMContentLoaded', initialize);
