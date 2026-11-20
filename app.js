const activeKey = 'agrismart-active-farmer';
const accounts = { KUMAR: 'kumar', RAVI: 'ravi' };

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

function updateOfflineStatus() {
    let status = document.querySelector('[data-offline-status]');
    if (!status) {
        status = document.createElement('div');
        status.dataset.offlineStatus = '';
        status.setAttribute('role', 'status');
        status.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9999;padding:10px 14px;border-radius:20px;background:#263238;color:#fff;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.18)';
        document.body.appendChild(status);
    }
    status.textContent = navigator.onLine ? '' : 'Offline mode - saved pages remain available';
    status.hidden = navigator.onLine;
}

function initialize() {
    updateOfflineStatus();
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);

    const form = document.querySelector('[data-login-form]');
    if (form) {
        sessionStorage.removeItem(activeKey);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = new FormData(form);
            const id = accounts[String(input.get('loginId') || '').trim().toUpperCase()];
            const error = document.querySelector('[data-login-error]');

            if (!id || input.get('password') !== '1234') {
                error.textContent = 'ID or password is incorrect.';
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
