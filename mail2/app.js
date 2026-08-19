// ==========================================================================
// LAVIENTRA STUDIO COMMAND CENTER — CRM & MANTINE UI ENGINE (v7+)
// Production Ready: Google OAuth + 3-Day Follow-Up Reminders + Dynamic Markets
// ==========================================================================

const ALLOWED_EMAILS = [
    "thivanka.ltk@gmail.com",
    "lavientra@gmail.com"
];

const firebaseConfig = {
    apiKey: "AIzaSyCVcML4xiZXMqKzcBiJrtfJI4kC-3ZvDbU",
    authDomain: "mail-list-f302b.firebaseapp.com",
    projectId: "mail-list-f302b",
    storageBucket: "mail-list-f302b.firebasestorage.app",
    messagingSenderId: "871998549668",
    appId: "1:871998549668:web:dcf0386e63cb1cbcac8031",
    measurementId: "G-WSGP0WHQ8P"
};

let db, contactsCol, logsCol, followupLogsCol;
let unsubscribeContacts = null;
let unsubscribeLogs = null;
let unsubscribeFollowupLogs = null;

window.contacts = [];
window.logs = [];
window.followupLogs = [];

window.activeMainTab = 'workspace';
window.activeWorkspaceRegion = 'UK';
window.ncActiveRegion = 'UK';
window.ncActiveCategory = 'all';
window.activePipelineStage = 'all';
window.activeTemplateMarket = 'UK';
window.activeTemplateType = 'initial'; // 'initial' or 'followup'
window.followupReminderDays = 3; // Default 3-Day Reminder Cycle

// Dynamic Country System (Default: UK and Australia only)
const DEFAULT_COUNTRIES = [
    { id: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'Australia', name: 'Australia', flag: '🇦🇺' }
];

window.countries = JSON.parse(localStorage.getItem('lavientra_countries')) || DEFAULT_COUNTRIES;

// Default Market Pitch & Follow-up Draft Templates
window.templates = JSON.parse(localStorage.getItem('lavientra_templates')) || {
    UK: {
        subject: "Floor plan drafting support for {{Company}}",
        body: `Hi {{ContactName}},\n\nI’m from Lavientra Studio, and we help busy UK property photographers offload their floor plan drafting with a guaranteed 24-hour turnaround. We specialize in clean, RICS-compliant 2D layouts customized to your brand standards.\n\nIf you’d like to review our work or check our standard drafting workflow, feel free to visit us at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nWe’d love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`,
        followupSubject: "Following up: Floor plan drafting support for {{Company}}",
        followupBody: `Hi {{ContactName}},\n\nJust following up on my message from earlier regarding floor plan drafting support for your property shoots in the UK.\n\nI know you're likely busy, so I'll keep this brief—we’d still love to handle your first layout as a complimentary test run with a guaranteed 24-hour turnaround whenever you have a shoot lined up this week.\n\nFeel free to check our drafting workflow at lavientra.com or message back here whenever you'd like to test us out.\n\nNo commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`
    },
    Australia: {
        subject: "Floor plan drafting support for {{Company}}",
        body: `Hi {{ContactName}},\n\nI came across your work in Australia and love your property photography style! I'm with Lavientra Studio—we provide dedicated 24-hr turnaround floor plan drafting tailored to your brand.\n\nWe'd love to draft your first floor plan completely free as a test run on your next shoot this week! Feel free to check out lavientra.com or message back here if you'd like to try us out.\n\nBest,\n\nThe Lavientra Studio Team`,
        followupSubject: "Following up: Floor plan drafting support for {{Company}}",
        followupBody: `Hi {{ContactName}},\n\nQuick follow-up on my earlier message regarding floor plan drafting support for your shoots in Australia.\n\nWe'd still love to handle your first layout as a complimentary test run with a 24-hr turnaround whenever you have a shoot this week! No commitments.\n\nBest,\n\nThe Lavientra Studio Team`
    }
};

// ==========================================================================
// 1. MANTINE NOTIFICATIONS SYSTEM (@mantine/notifications)
// ==========================================================================
window.showNotification = function ({ title, message, color = 'indigo', icon = 'info', autoClose = 3500 }) {
    const container = document.getElementById('mantineNotifications');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = 'mantine-Notification-root';

    let iconBg = 'var(--mantine-color-indigo-0)';
    let iconColor = 'var(--mantine-color-indigo-6)';
    let iconName = 'info';

    if (color === 'teal' || color === 'green') {
        iconBg = 'var(--mantine-color-teal-0)';
        iconColor = 'var(--mantine-color-teal-6)';
        iconName = 'check_circle';
    } else if (color === 'amber' || color === 'yellow') {
        iconBg = 'var(--mantine-color-amber-0)';
        iconColor = 'var(--mantine-color-amber-6)';
        iconName = 'notification_important';
    } else if (color === 'red') {
        iconBg = 'var(--mantine-color-red-0)';
        iconColor = 'var(--mantine-color-red-6)';
        iconName = 'error';
    }

    notif.innerHTML = `
        <div class="mantine-Notification-icon" style="background-color: ${iconBg}; color: ${iconColor};">
            <span class="material-symbols-outlined" style="font-size: 18px;">${iconName}</span>
        </div>
        <div style="flex: 1;">
            <div class="mantine-Notification-title">${title}</div>
            <div class="mantine-Notification-message">${message}</div>
        </div>
        <button type="button" class="mantine-ActionIcon-root" style="width: 24px; height: 24px; padding: 0;" onclick="this.parentElement.remove()">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
        </button>
    `;

    container.appendChild(notif);

    setTimeout(() => {
        if (notif.parentElement) {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(100%)';
            notif.style.transition = 'all 0.25s ease';
            setTimeout(() => notif.remove(), 250);
        }
    }, autoClose);
};

// ==========================================================================
// 2. GOOGLE AUTHENTICATION & ACCESS CONTROL
// ==========================================================================
function initFirebaseAuth() {
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
        setTimeout(initFirebaseAuth, 200);
        return;
    }

    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();

        contactsCol = db.collection("contacts");
        logsCol = db.collection("logs");
        followupLogsCol = db.collection("followup_logs");

        firebase.auth().onAuthStateChanged((user) => {
            const loginContainer = document.getElementById('loginContainer');
            const appContainer = document.getElementById('appContainer');
            const userEmailSpan = document.getElementById('headerUserEmail');

            if (user) {
                const userEmail = (user.email || '').toLowerCase().trim();
                if (ALLOWED_EMAILS.includes(userEmail)) {
                    if (loginContainer) loginContainer.style.display = 'none';
                    if (appContainer) appContainer.style.display = 'flex';
                    if (userEmailSpan) userEmailSpan.innerText = user.displayName || user.email;

                    startDatabaseSync();

                    window.showNotification({
                        title: 'Welcome Back',
                        message: `Signed in as ${user.displayName || user.email}.`,
                        color: 'teal'
                    });
                } else {
                    alert(`Access Denied: ${user.email} is not authorized.`);
                    firebase.auth().signOut();
                }
            } else {
                if (loginContainer) loginContainer.style.display = 'flex';
                if (appContainer) appContainer.style.display = 'none';
                stopDatabaseSync();
                window.contacts = [];
                window.logs = [];
                window.followupLogs = [];
            }
        });
    } catch (e) {
        console.error("Firebase auth initialization error:", e);
    }
}

window.loginWithGoogle = async function () {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await firebase.auth().signInWithPopup(provider);
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            window.showNotification({ title: 'Sign-in Failed', message: error.message, color: 'red' });
        }
    }
};

window.logout = async function () {
    try {
        await firebase.auth().signOut();
        window.showNotification({ title: 'Signed Out', message: 'You have been signed out safely.', color: 'indigo' });
    } catch (error) {
        window.showNotification({ title: 'Logout Failed', message: error.message, color: 'red' });
    }
};

// ==========================================================================
// 3. DYNAMIC COUNTRY SYSTEM (UK & Australia default + Add Country option)
// ==========================================================================
window.renderCountryControls = function () {
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.innerHTML = window.countries.map(c => `
            <option value="${c.id}">${c.flag} ${c.name} (${c.id})</option>
        `).join('') + `<option value="__add_new__">+ Add New Country...</option>`;
    }

    const ncRegionCtrl = document.getElementById('ncRegionSegmentedControl');
    if (ncRegionCtrl) {
        ncRegionCtrl.innerHTML = window.countries.map(c => `
            <button type="button" class="mantine-SegmentedControl-label ${c.id === window.ncActiveRegion ? 'active' : ''}" onclick="setNewContactRegion('${c.id}')">
                ${c.flag} ${c.name}
            </button>
        `).join('');
    }

    const pipeRegionCtrl = document.getElementById('pipelineRegionSegmentedControl');
    if (pipeRegionCtrl) {
        pipeRegionCtrl.innerHTML = window.countries.map(c => `
            <button type="button" class="mantine-SegmentedControl-label ${c.id === window.activeWorkspaceRegion ? 'active' : ''}" onclick="setWorkspaceRegion('${c.id}')">
                ${c.flag} ${c.name}
            </button>
        `).join('');
    }

    const tplMarketCtrl = document.getElementById('tplMarketSegmentedControl');
    if (tplMarketCtrl) {
        tplMarketCtrl.innerHTML = window.countries.map(c => `
            <button type="button" class="mantine-SegmentedControl-label ${c.id === window.activeTemplateMarket ? 'active' : ''}" onclick="switchTemplateMarket('${c.id}')">
                ${c.flag} ${c.name}
            </button>
        `).join('');
    }

    const sidebarList = document.getElementById('sidebarCountryList');
    if (sidebarList) {
        sidebarList.innerHTML = window.countries.map(c => `
            <span class="mantine-Badge-root mantine-Badge-gray" style="font-size: 11px;">${c.flag} ${c.id}</span>
        `).join('');
    }
};

window.handleCountrySelectChange = function (selectEl) {
    if (selectEl.value === '__add_new__') {
        selectEl.value = window.countries[0]?.id || 'UK';
        window.openAddCountryModal();
    }
};

window.openAddCountryModal = function () {
    const modal = document.getElementById('countryModalOverlay');
    if (modal) modal.classList.add('opened');
};

window.closeCountryModal = function () {
    const modal = document.getElementById('countryModalOverlay');
    if (modal) modal.classList.remove('opened');
};

window.saveNewCountry = function () {
    const keyRaw = document.getElementById('newCountryKey')?.value.trim();
    const nameRaw = document.getElementById('newCountryName')?.value.trim();
    const flagRaw = document.getElementById('newCountryFlag')?.value.trim() || '🌐';

    if (!keyRaw || !nameRaw) {
        window.showNotification({ title: 'Validation Error', message: 'Please enter both Country Key and Full Name.', color: 'red' });
        return;
    }

    const key = keyRaw.toUpperCase();
    if (window.countries.some(c => c.id.toLowerCase() === key.toLowerCase())) {
        window.showNotification({ title: 'Duplicate Country', message: `Country "${key}" already exists.`, color: 'amber' });
        return;
    }

    const newCountry = { id: key, name: nameRaw, flag: flagRaw };
    window.countries.push(newCountry);
    localStorage.setItem('lavientra_countries', JSON.stringify(window.countries));

    if (!window.templates[key]) {
        window.templates[key] = {
            subject: `Floor plan drafting support for {{Company}}`,
            body: `Hi {{ContactName}},\n\nI’m from Lavientra Studio, and we help busy property photographers in ${nameRaw} offload their floor plan drafting with a guaranteed 24-hour turnaround.\n\nFeel free to check our work at lavientra.com. We’d love to draft your first layout complimentary as a test run on your next shoot!\n\nBest regards,\nThe Lavientra Studio Team`,
            followupSubject: `Following up: Floor plan drafting support for {{Company}}`,
            followupBody: `Hi {{ContactName}},\n\nQuick follow-up on my message from earlier regarding floor plan drafting support for your shoots in ${nameRaw}.\n\nWe’d still love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\nThe Lavientra Studio Team`
        };
        localStorage.setItem('lavientra_templates', JSON.stringify(window.templates));
    }

    document.getElementById('newCountryKey').value = '';
    document.getElementById('newCountryName').value = '';
    document.getElementById('newCountryFlag').value = '🌐';

    window.closeCountryModal();
    window.renderCountryControls();
    window.renderNewContacts();
    window.renderContacts();
    window.renderAnalytics();

    window.showNotification({
        title: 'Country Market Added',
        message: `${flagRaw} ${nameRaw} added to active outreach markets!`,
        color: 'teal'
    });
};

// ==========================================================================
// 4. THEME & APP SHELL NAVIGATION
// ==========================================================================
window.initTheme = function () {
    const saved = localStorage.getItem('lavientra_theme') || 'light';
    if (saved === 'dark') {
        document.body.classList.add('mantine-dark');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.innerText = 'light_mode';
    }
};

window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('mantine-dark');
    localStorage.setItem('lavientra_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.innerText = isDark ? 'light_mode' : 'dark_mode';
    window.showNotification({
        title: isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled',
        message: `Theme switched to ${isDark ? 'Dark Slate' : 'Clean Light'}.`,
        color: 'indigo'
    });
};

window.toggleSidebar = function () {
    const navbar = document.getElementById('appNavbar');
    const backdrop = document.getElementById('navbarBackdrop');
    if (!navbar) return;

    if (window.innerWidth <= 1024) {
        const isOpened = navbar.classList.toggle('opened');
        if (backdrop) backdrop.style.display = isOpened ? 'block' : 'none';
    } else {
        navbar.classList.toggle('collapsed');
    }
};

window.switchMainTab = function (tab) {
    window.activeMainTab = tab;

    ['workspace', 'newContacts', 'pipeline', 'templates', 'analytics'].forEach(t => {
        const navEl = document.getElementById(`nav${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const modEl = document.getElementById(`${t}Module`);
        if (navEl) navEl.classList.toggle('active', t === tab);
        if (modEl) modEl.style.display = t === tab ? 'block' : 'none';
    });

    const currentModEl = document.getElementById('headerCurrentModule');
    if (currentModEl) {
        const titles = {
            workspace: 'Workspace Dashboard',
            newContacts: 'New Contact List (Unsent)',
            pipeline: 'Pipeline & 3-Day Follow-Up Tracker',
            templates: 'Template & Follow-Up Studio',
            analytics: 'Progress & Analytics'
        };
        currentModEl.innerText = titles[tab] || tab;
    }

    const navbar = document.getElementById('appNavbar');
    const backdrop = document.getElementById('navbarBackdrop');
    if (navbar && window.innerWidth <= 1024) {
        navbar.classList.remove('opened');
        if (backdrop) backdrop.style.display = 'none';
    }

    if (tab === 'newContacts') window.renderNewContacts();
    if (tab === 'pipeline') window.renderContacts();
    if (tab === 'analytics') window.renderAnalytics();
    if (tab === 'templates') window.initTemplateEditor();
    if (tab === 'workspace') window.renderAnalytics();
};

window.goToFollowupReminders = function () {
    window.switchMainTab('pipeline');
    window.setPipelineStageFilter('followup_due');
    window.showNotification({
        title: '3-Day Follow-Up Reminders',
        message: 'Filtered pipeline to contacts that reached 3+ days since initial outreach.',
        color: 'amber'
    });
};

window.setWorkspaceRegion = function (region) {
    window.activeWorkspaceRegion = region;
    window.renderCountryControls();
    window.renderContacts();
};

window.setNewContactRegion = function (region) {
    window.ncActiveRegion = region;
    window.renderCountryControls();
    window.renderNewContacts();
};

window.setNewContactCategoryFilter = function (category) {
    window.ncActiveCategory = category;
    ['ncTabAll', 'ncTabEmail', 'ncTabInstagram', 'ncTabLinkedin', 'ncTabFacebook'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const matches = (id === 'ncTabAll' && category === 'all') ||
                (id === 'ncTabEmail' && category === 'email') ||
                (id === 'ncTabInstagram' && category === 'instagram') ||
                (id === 'ncTabLinkedin' && category === 'linkedin') ||
                (id === 'ncTabFacebook' && category === 'facebook');
            el.classList.toggle('active', matches);
        }
    });
    window.renderNewContacts();
};

window.setPipelineStageFilter = function (stage) {
    window.activePipelineStage = stage;
    ['tabStageAll', 'tabStageDue', 'tabStageSent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const matches = (id === 'tabStageAll' && stage === 'all') ||
                (id === 'tabStageDue' && stage === 'followup_due') ||
                (id === 'tabStageSent' && stage === 'sent_recent');
            el.classList.toggle('active', matches);
        }
    });
    window.renderContacts();
};

// ==========================================================================
// 5. COPY HELPER FUNCTIONS
// ==========================================================================
window.copyFieldValue = function (fieldId, btnElement) {
    const el = document.getElementById(fieldId);
    if (!el || !el.value) return;

    navigator.clipboard.writeText(el.value).then(() => {
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 15px; color: var(--mantine-color-teal-6);">check</span> Copied!`;
            setTimeout(() => { btnElement.innerHTML = originalHTML; }, 1500);
        }
        window.showNotification({ title: 'Copied', message: 'Field copied to clipboard.', color: 'teal' });
    });
};

window.copyValueDirect = function (text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; color: var(--mantine-color-teal-6);">check</span>`;
            setTimeout(() => { btnElement.innerHTML = originalHTML; }, 1500);
        }
        window.showNotification({ title: 'Copied', message: `"${text}" copied to clipboard.`, color: 'teal' });
    });
};

window.copyAllOutreach = function (btnElement) {
    const email = document.getElementById('modalTargetAddress')?.value || '';
    const subject = document.getElementById('emailSubject')?.value || '';
    const body = document.getElementById('generatedEmail')?.value || '';

    const textToCopy = `To: ${email}\nSubject: ${subject}\n\n${body}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 15px; color: var(--mantine-color-teal-6);">check</span> Copied All!`;
            setTimeout(() => { btnElement.innerHTML = originalHTML; }, 1500);
        }
        window.showNotification({ title: 'Copied All', message: 'Address, Subject, and Body copied to clipboard.', color: 'teal' });
    });
};

window.copyTemplateSubject = function (btnElement) {
    window.copyFieldValue('templateSubjectInput', btnElement);
};

window.copyTemplateBody = function (btnElement) {
    window.copyFieldValue('templateBodyInput', btnElement);
};

window.copyFullPreview = function (btnElement) {
    const sub = document.getElementById('previewSubjectText')?.innerText || '';
    const body = document.getElementById('previewBodyText')?.innerText || '';
    const text = `Subject: ${sub}\n\n${body}`;
    navigator.clipboard.writeText(text).then(() => {
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px; color: var(--mantine-color-teal-6);">check</span> Copied!`;
            setTimeout(() => { btnElement.innerHTML = originalHTML; }, 1500);
        }
        window.showNotification({ title: 'Copied Full Preview', message: 'Subject and body copied.', color: 'teal' });
    });
};

// ==========================================================================
// 6. 3-DAY REMINDER LOGIC & STATUS CLASSIFICATION
// ==========================================================================
window.toTitleCase = function (str) {
    if (!str) return '';
    return str.trim().split(/\s+/).map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

window.formatSocialUrl = function (url, channel) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanHandle = url.replace(/^@/, '').trim();
    if (channel === 'instagram') return `https://instagram.com/${cleanHandle}`;
    if (channel === 'linkedin') return url.startsWith('in/') ? `https://linkedin.com/${cleanHandle}` : `https://linkedin.com/in/${cleanHandle}`;
    if (channel === 'facebook') return `https://facebook.com/${cleanHandle}`;
    return `https://${url}`;
};

window.getChannelBadge = function (channel) {
    const ch = (channel || 'email').toLowerCase();
    const colors = {
        email: 'mantine-Badge-indigo',
        instagram: 'mantine-Badge-amber',
        linkedin: 'mantine-Badge-indigo',
        facebook: 'mantine-Badge-gray'
    };
    return `<span class="mantine-Badge-root ${colors[ch] || 'mantine-Badge-indigo'}">${ch.toUpperCase()}</span>`;
};

window.getContactStatusInfo = function (contact) {
    let lastDate = null;
    if (contact && contact.lastSentDate) {
        if (contact.lastSentDate.toDate && typeof contact.lastSentDate.toDate === 'function') {
            lastDate = contact.lastSentDate.toDate();
        } else if (contact.lastSentDate instanceof Date) {
            lastDate = contact.lastSentDate;
        } else if (typeof contact.lastSentDate === 'string' || typeof contact.lastSentDate === 'number') {
            lastDate = new Date(contact.lastSentDate);
        }
    }

    if (!lastDate && contact) {
        const contactLogs = [
            ...window.logs.filter(l => (contact.id && l.contactId === contact.id) || (contact.email && l.email && l.email.trim().toLowerCase() === contact.email.trim().toLowerCase())),
            ...window.followupLogs.filter(l => (contact.id && l.contactId === contact.id) || (contact.email && l.email && l.email.trim().toLowerCase() === contact.email.trim().toLowerCase()))
        ];
        if (contactLogs.length > 0) {
            contactLogs.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.isoDate ? new Date(a.isoDate) : new Date(0));
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.isoDate ? new Date(b.isoDate) : new Date(0));
                return dateB - dateA;
            });
            const topLog = contactLogs[0];
            if (topLog.createdAt?.toDate) lastDate = topLog.createdAt.toDate();
            else if (topLog.isoDate) lastDate = new Date(topLog.isoDate);
        }
    }

    if (!lastDate || isNaN(lastDate.getTime())) {
        return { status: 'never_sent', days: null, label: 'Unsent Lead' };
    }

    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const reminderDays = window.followupReminderDays || 3;

    if (diffDays >= reminderDays) {
        return {
            status: 'followup_due',
            days: diffDays,
            daysOverdue: diffDays - reminderDays,
            label: `Follow-up Due (${diffDays}d ago)`
        };
    } else {
        const daysRemaining = reminderDays - diffDays;
        const dayText = diffDays === 0 ? 'Today' : `${diffDays}d ago`;
        return {
            status: 'sent_recent',
            days: diffDays,
            daysRemaining: daysRemaining,
            label: `Follow-up in ${daysRemaining}d (Sent ${dayText})`
        };
    }
};

// ==========================================================================
// 7. RENDER "NEW CONTACT LIST" (UNSENT ONLY + CATEGORY CHART)
// ==========================================================================
window.renderNewContacts = function () {
    const tbody = document.getElementById('newContactsTableBody');
    if (!tbody) return;

    const searchQuery = (document.getElementById('newContactsSearchInput')?.value || '').toLowerCase().trim();
    const selectedCategory = window.ncActiveCategory || 'all';

    const regionUnsentAll = window.contacts.filter(c => (c.country || 'UK') === window.ncActiveRegion && window.getContactStatusInfo(c).status === 'never_sent');

    const countAll = regionUnsentAll.length;
    const countEmail = regionUnsentAll.filter(c => (c.channel || 'email') === 'email').length;
    const countInstagram = regionUnsentAll.filter(c => c.channel === 'instagram').length;
    const countLinkedin = regionUnsentAll.filter(c => c.channel === 'linkedin').length;
    const countFacebook = regionUnsentAll.filter(c => c.channel === 'facebook').length;

    const elStatAll = document.getElementById('statCountAll');
    const elStatEmail = document.getElementById('statCountEmail');
    const elStatIg = document.getElementById('statCountInstagram');
    const elStatLi = document.getElementById('statCountLinkedin');
    const elStatFb = document.getElementById('statCountFacebook');

    if (elStatAll) elStatAll.innerText = countAll;
    if (elStatEmail) elStatEmail.innerText = countEmail;
    if (elStatIg) elStatIg.innerText = countInstagram;
    if (elStatLi) elStatLi.innerText = countLinkedin;
    if (elStatFb) elStatFb.innerText = countFacebook;

    const elBadgeAll = document.getElementById('statNewAll');
    const elBadgeEmail = document.getElementById('statNewEmail');
    const elBadgeIg = document.getElementById('statNewInstagram');
    const elBadgeLi = document.getElementById('statNewLinkedin');
    const elBadgeFb = document.getElementById('statNewFacebook');

    if (elBadgeAll) elBadgeAll.innerText = countAll;
    if (elBadgeEmail) elBadgeEmail.innerText = countEmail;
    if (elBadgeIg) elBadgeIg.innerText = countInstagram;
    if (elBadgeLi) elBadgeLi.innerText = countLinkedin;
    if (elBadgeFb) elBadgeFb.innerText = countFacebook;

    const elNcCountAll = document.getElementById('ncCountAll');
    const elNcCountEmail = document.getElementById('ncCountEmail');
    const elNcCountIg = document.getElementById('ncCountInstagram');
    const elNcCountLi = document.getElementById('ncCountLinkedin');
    const elNcCountFb = document.getElementById('ncCountFacebook');

    if (elNcCountAll) elNcCountAll.innerText = countAll;
    if (elNcCountEmail) elNcCountEmail.innerText = countEmail;
    if (elNcCountIg) elNcCountIg.innerText = countInstagram;
    if (elNcCountLi) elNcCountLi.innerText = countLinkedin;
    if (elNcCountFb) elNcCountFb.innerText = countFacebook;

    let displayList = [...regionUnsentAll];

    if (selectedCategory !== 'all') {
        displayList = displayList.filter(c => (c.channel || 'email') === selectedCategory);
    }

    if (searchQuery) {
        displayList = displayList.filter(c =>
            (c.company && c.company.toLowerCase().includes(searchQuery)) ||
            (c.email && c.email.toLowerCase().includes(searchQuery)) ||
            (c.socialUrl && c.socialUrl.toLowerCase().includes(searchQuery)) ||
            (c.name && c.name.toLowerCase().includes(searchQuery))
        );
    }

    if (displayList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--mantine-color-dimmed); padding: 36px;">No unsent contacts in this category. All caught up!</td></tr>`;
        return;
    }

    tbody.innerHTML = '';

    displayList.forEach(contact => {
        const tr = document.createElement('tr');
        const channel = contact.channel || 'email';
        const urlLink = contact.url ? (contact.url.startsWith('http') ? contact.url : 'https://' + contact.url) : '';
        const companyDisplay = window.toTitleCase(contact.company);
        const nameDisplay = (!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name);

        let targetContent = '';
        if (channel === 'email') {
            targetContent = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${contact.email || '-'}</span>
                    ${contact.email ? `<button type="button" class="mantine-ActionIcon-root" style="width: 26px; height: 26px;" onclick="copyValueDirect('${contact.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                </div>
            `;
        } else {
            const socUrl = window.formatSocialUrl(contact.socialUrl, channel);
            targetContent = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <a href="${socUrl}" target="_blank" style="font-weight: 500;">${contact.socialUrl || 'View Handle'}</a>
                    ${contact.socialUrl ? `<button type="button" class="mantine-ActionIcon-root" style="width: 26px; height: 26px;" onclick="copyValueDirect('${contact.socialUrl}', this)" title="Copy Handle"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                </div>
            `;
        }

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong>${companyDisplay}</strong>
                    ${urlLink ? `<a href="${urlLink}" target="_blank" title="Visit Website"><span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span></a>` : ''}
                </div>
            </td>
            <td>${nameDisplay}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${window.getChannelBadge(channel)}
                    ${targetContent}
                </div>
            </td>
            <td><span class="mantine-Badge-root mantine-Badge-gray">${contact.country || 'UK'}</span></td>
            <td><span class="mantine-Badge-root mantine-Badge-teal"><span class="material-symbols-outlined" style="font-size: 14px;">fiber_new</span> Unsent Lead</span></td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="mantine-Button-root mantine-Button-light" style="height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="generateEmail('${contact.id}', 'initial')">
                        <span class="material-symbols-outlined" style="font-size: 16px;">edit_document</span> Draft Pitch
                    </button>
                    <button type="button" class="mantine-Button-root mantine-Button-filled" style="height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="quickMarkAsSent('${contact.id}')" title="Mark sent and move to Pipeline">
                        <span class="material-symbols-outlined" style="font-size: 16px;">send</span> Mark as Sent
                    </button>
                    <button type="button" class="mantine-ActionIcon-root mantine-ActionIcon-subtle-danger" onclick="deleteContact('${contact.id}', '${companyDisplay}')" title="Delete Lead">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const allUnsentTotal = window.contacts.filter(c => window.getContactStatusInfo(c).status === 'never_sent').length;
    const navNewBadge = document.getElementById('navNewBadge');
    if (navNewBadge) navNewBadge.innerText = allUnsentTotal;
};

// ==========================================================================
// 8. RENDER "PIPELINE & STAGES"
// ==========================================================================
window.renderContacts = function () {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;

    const searchQuery = (document.getElementById('pipelineSearchInput')?.value || '').toLowerCase().trim();
    const channelFilter = document.getElementById('pipelineChannelFilter')?.value || 'all';

    let list = window.contacts.filter(c => (c.country || 'UK') === window.activeWorkspaceRegion && window.getContactStatusInfo(c).status !== 'never_sent');

    if (searchQuery) {
        list = list.filter(c =>
            (c.company && c.company.toLowerCase().includes(searchQuery)) ||
            (c.email && c.email.toLowerCase().includes(searchQuery)) ||
            (c.name && c.name.toLowerCase().includes(searchQuery))
        );
    }

    if (channelFilter !== 'all') {
        list = list.filter(c => (c.channel || 'email') === channelFilter);
    }

    const countAll = list.length;
    const countDue = list.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const countSent = list.filter(c => window.getContactStatusInfo(c).status === 'sent_recent').length;

    const bAll = document.getElementById('badgeCountAll');
    const bDue = document.getElementById('badgeCountDue');
    const bSent = document.getElementById('badgeCountSent');

    if (bAll) bAll.innerText = countAll;
    if (bDue) bDue.innerText = countDue;
    if (bSent) bSent.innerText = countSent;

    if (window.activePipelineStage !== 'all') {
        list = list.filter(c => window.getContactStatusInfo(c).status === window.activePipelineStage);
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--mantine-color-dimmed); padding: 36px;">No active pipeline leads in this stage. Unsent leads are in the "New Contact List" tab!</td></tr>`;
        return;
    }

    list.sort((a, b) => {
        const isDueA = window.getContactStatusInfo(a).status === 'followup_due' ? 1 : 0;
        const isDueB = window.getContactStatusInfo(b).status === 'followup_due' ? 1 : 0;
        return isDueB - isDueA;
    });

    tbody.innerHTML = '';

    list.forEach(contact => {
        const tr = document.createElement('tr');
        const channel = contact.channel || 'email';
        const urlLink = contact.url ? (contact.url.startsWith('http') ? contact.url : 'https://' + contact.url) : '';
        const companyDisplay = window.toTitleCase(contact.company);
        const nameDisplay = (!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name);
        const statusInfo = window.getContactStatusInfo(contact);

        let statusBadge = '';
        let actionBtn = '';

        if (statusInfo.status === 'followup_due') {
            statusBadge = `
                <div style="display: flex; flex-direction: column; gap: 3px;">
                    <span class="mantine-Badge-root mantine-Badge-amber" style="font-weight: 700;">
                        <span class="material-symbols-outlined" style="font-size: 15px;">notification_important</span>
                        <span>Follow-up Due (${statusInfo.days}d)</span>
                    </span>
                    <span style="font-size: 11px; color: var(--mantine-color-amber-7); padding-left: 4px;">Initial sent ${statusInfo.days} days ago.</span>
                </div>
            `;
            actionBtn = `
                <button class="mantine-Button-root mantine-Button-filled" style="background-color: var(--mantine-color-amber-6); height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="generateEmail('${contact.id}', 'followup')">
                    <span class="material-symbols-outlined" style="font-size: 16px;">forward_to_inbox</span> Send Follow-Up
                </button>
            `;
        } else {
            statusBadge = `
                <div style="display: flex; flex-direction: column; gap: 3px;">
                    <span class="mantine-Badge-root mantine-Badge-teal">
                        <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span>
                        <span>Initial Sent (${statusInfo.days === 0 ? 'Today' : statusInfo.days + 'd ago'})</span>
                    </span>
                    <span style="font-size: 11px; color: var(--mantine-color-dimmed); padding-left: 4px;">Follow-up in ${statusInfo.daysRemaining} day(s)</span>
                </div>
            `;
            actionBtn = `
                <button class="mantine-Button-root mantine-Button-light" style="height: 34px; padding: 0 10px; font-size: 12px;" onclick="generateEmail('${contact.id}', 'followup')">
                    <span class="material-symbols-outlined" style="font-size: 15px;">forward_to_inbox</span> Draft Follow-up
                </button>
                <button class="mantine-Button-root mantine-Button-default" style="height: 34px; padding: 0 10px; font-size: 12px;" onclick="generateEmail('${contact.id}', 'initial')">
                    <span class="material-symbols-outlined" style="font-size: 15px;">edit_document</span> Draft Pitch
                </button>
            `;
        }

        let targetContent = '';
        if (channel === 'email') {
            targetContent = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${contact.email || '-'}</span>
                    ${contact.email ? `<button type="button" class="mantine-ActionIcon-root" style="width: 26px; height: 26px;" onclick="copyValueDirect('${contact.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                </div>
            `;
        } else {
            const socUrl = window.formatSocialUrl(contact.socialUrl, channel);
            targetContent = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <a href="${socUrl}" target="_blank" style="font-weight: 500;">${contact.socialUrl || 'View Handle'}</a>
                    ${contact.socialUrl ? `<button type="button" class="mantine-ActionIcon-root" style="width: 26px; height: 26px;" onclick="copyValueDirect('${contact.socialUrl}', this)" title="Copy Handle"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                </div>
            `;
        }

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong>${companyDisplay}</strong>
                    ${urlLink ? `<a href="${urlLink}" target="_blank" title="Visit Website"><span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span></a>` : ''}
                </div>
            </td>
            <td>${nameDisplay}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${window.getChannelBadge(channel)}
                    ${targetContent}
                </div>
            </td>
            <td><span class="mantine-Badge-root mantine-Badge-gray">${contact.country || 'UK'}</span></td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                    ${actionBtn}
                    <button type="button" class="mantine-ActionIcon-root mantine-ActionIcon-subtle-danger" onclick="deleteContact('${contact.id}', '${companyDisplay}')" title="Delete Lead">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const activePipelineTotal = window.contacts.filter(c => window.getContactStatusInfo(c).status !== 'never_sent').length;
    const navPipelineBadge = document.getElementById('navPipelineBadge');
    if (navPipelineBadge) navPipelineBadge.innerText = activePipelineTotal;
};

// ==========================================================================
// 9. ADD CONTACT & VALIDATION
// ==========================================================================
window.activeOutreachChannel = 'email';

window.setOutreachChannel = function (channel) {
    window.activeOutreachChannel = channel;
    const hidden = document.getElementById('outreachChannel');
    if (hidden) hidden.value = channel;

    ['channelBtnEmail', 'channelBtnInstagram', 'channelBtnLinkedin', 'channelBtnFacebook'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', id.toLowerCase().includes(channel.toLowerCase()));
    });

    const emailGroup = document.getElementById('emailInputGroup');
    const socialGroup = document.getElementById('socialUrlGroup');
    const socialInput = document.getElementById('socialUrl');
    const socialLabel = document.getElementById('socialUrlLabel');

    if (channel === 'email') {
        if (socialGroup) socialGroup.style.display = 'none';
        if (emailGroup) emailGroup.style.display = 'flex';
    } else {
        if (socialGroup) socialGroup.style.display = 'flex';
        if (socialLabel) socialLabel.textContent = `${channel.charAt(0).toUpperCase() + channel.slice(1)} Profile URL / Handle *`;
        if (socialInput) socialInput.placeholder = `https://${channel}.com/username`;
    }
};

window.checkEmailDuplicate = function () {
    const emailInput = document.getElementById('clientEmail');
    const warningEl = document.getElementById('emailDuplicateWarning');
    if (!emailInput || !warningEl) return;

    const emailVal = emailInput.value.trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@')) {
        warningEl.style.display = 'none';
        emailInput.classList.remove('error');
        return;
    }

    const existing = window.contacts.find(c => c.email && c.email.trim().toLowerCase() === emailVal);
    if (existing) {
        warningEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px;">warning</span> <span><strong>Duplicate Warning:</strong> Email registered for <strong>${existing.company}</strong> (${existing.country}).</span>`;
        warningEl.style.display = 'flex';
        emailInput.classList.add('error');
    } else {
        warningEl.style.display = 'none';
        emailInput.classList.remove('error');
    }
};

window.clearContactForm = function () {
    ['companyName', 'clientName', 'clientEmail', 'socialUrl', 'companyUrl'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const warningEl = document.getElementById('emailDuplicateWarning');
    if (warningEl) warningEl.style.display = 'none';
    const emailInput = document.getElementById('clientEmail');
    if (emailInput) emailInput.classList.remove('error');
    window.setOutreachChannel('email');
};

window.addContact = async function () {
    const channel = document.getElementById('outreachChannel')?.value || window.activeOutreachChannel || 'email';
    const companyRaw = document.getElementById('companyName')?.value.trim();
    const nameRaw = document.getElementById('clientName')?.value.trim();
    const emailRaw = document.getElementById('clientEmail')?.value.trim().toLowerCase();
    const socialUrl = document.getElementById('socialUrl')?.value.trim();
    const companyUrl = document.getElementById('companyUrl')?.value.trim();
    const country = document.getElementById('country')?.value || 'UK';

    if (!companyRaw) {
        window.showNotification({ title: 'Validation Error', message: 'Please enter Company / Studio Name.', color: 'red' });
        return;
    }

    if (channel === 'email' && !emailRaw) {
        window.showNotification({ title: 'Validation Error', message: 'Email address is required for email outreach.', color: 'red' });
        return;
    }

    if (channel !== 'email' && !socialUrl) {
        window.showNotification({ title: 'Validation Error', message: 'Profile URL or handle is required.', color: 'red' });
        return;
    }

    if (emailRaw) {
        const existing = window.contacts.find(c => c.email && c.email.trim().toLowerCase() === emailRaw);
        if (existing) {
            window.showNotification({
                title: 'Duplicate Detected',
                message: `Email is already registered under "${existing.company}" (${existing.country}).`,
                color: 'amber'
            });
            return;
        }
    }

    const newContactObj = {
        id: 'local_' + Date.now(),
        channel,
        company: window.toTitleCase(companyRaw),
        name: nameRaw ? window.toTitleCase(nameRaw) : 'Team',
        email: emailRaw || '',
        socialUrl: socialUrl || '',
        url: companyUrl || '',
        country,
        createdAt: new Date()
    };

    if (contactsCol) {
        try {
            const docRef = await contactsCol.add({
                channel,
                company: newContactObj.company,
                name: newContactObj.name,
                email: newContactObj.email,
                socialUrl: newContactObj.socialUrl,
                url: newContactObj.url,
                country: newContactObj.country,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            newContactObj.id = docRef.id;
        } catch (e) {
            console.warn("Firestore add contact warning:", e.message);
        }
    }

    if (!contactsCol || !unsubscribeContacts) {
        window.contacts.unshift(newContactObj);
        window.renderNewContacts();
        window.renderContacts();
        window.renderAnalytics();
    }

    window.showNotification({
        title: 'Lead Saved to New Contact List',
        message: `"${newContactObj.company}" is waiting in New Contact List for outreach.`,
        color: 'teal'
    });

    window.clearContactForm();
    window.ncActiveRegion = country;
    window.setNewContactRegion(country);
};

window.deleteContact = async function (contactId, companyName) {
    if (!confirm(`Remove "${companyName}" from database?`)) return;

    if (contactsCol) {
        try {
            await contactsCol.doc(contactId).delete();
        } catch (e) {
            console.warn("Firestore delete fallback:", e.message);
        }
    }

    window.contacts = window.contacts.filter(c => c.id !== contactId);
    window.renderNewContacts();
    window.renderContacts();
    window.renderAnalytics();

    window.showNotification({ title: 'Lead Deleted', message: `"${companyName}" removed.`, color: 'indigo' });
};

// ==========================================================================
// 10. TEMPLATE STUDIO (INITIAL PITCH & FOLLOW-UP DRAFT STUDIO)
// ==========================================================================
window.switchTemplateMarket = function (market) {
    window.activeTemplateMarket = market;
    window.renderCountryControls();
    window.initTemplateEditor();
};

window.switchTemplateType = function (type) {
    window.activeTemplateType = type;
    const btnInit = document.getElementById('tplTypeBtnInitial');
    const btnFu = document.getElementById('tplTypeBtnFollowup');
    const badge = document.getElementById('activeTemplateBadge');
    const bodyLabel = document.getElementById('templateBodyLabel');
    const saveBtn = document.getElementById('saveTemplateBtn');

    if (btnInit) btnInit.classList.toggle('active', type === 'initial');
    if (btnFu) btnFu.classList.toggle('active', type === 'followup');

    const marketInfo = window.countries.find(c => c.id === window.activeTemplateMarket) || { name: window.activeTemplateMarket };

    if (type === 'followup') {
        if (badge) {
            badge.className = 'mantine-Badge-root mantine-Badge-amber';
            badge.innerText = `Editing: ${marketInfo.name} Follow-Up Template`;
        }
        if (bodyLabel) bodyLabel.innerText = 'Follow-Up Message Body Template';
        if (saveBtn) {
            saveBtn.className = 'mantine-Button-root mantine-Button-filled';
            saveBtn.style.backgroundColor = 'var(--mantine-color-amber-6)';
            saveBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px;">save</span> <span>Save Follow-Up Template</span>`;
        }
    } else {
        if (badge) {
            badge.className = 'mantine-Badge-root mantine-Badge-indigo';
            badge.innerText = `Editing: ${marketInfo.name} Initial Pitch Template`;
        }
        if (bodyLabel) bodyLabel.innerText = 'Initial Pitch Body Template';
        if (saveBtn) {
            saveBtn.className = 'mantine-Button-root mantine-Button-filled';
            saveBtn.style.backgroundColor = 'var(--mantine-color-primary)';
            saveBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px;">save</span> <span>Save Initial Template</span>`;
        }
    }

    window.initTemplateEditor();
};

window.initTemplateEditor = function () {
    const market = window.activeTemplateMarket || 'UK';
    const type = window.activeTemplateType || 'initial';
    const tpl = window.templates[market] || window.templates.UK || {};

    const subInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    if (type === 'followup') {
        if (subInput) subInput.value = tpl.followupSubject || `Following up: Floor plan drafting support for {{Company}}`;
        if (bodyInput) bodyInput.value = tpl.followupBody || `Hi {{ContactName}},\n\nJust following up on my earlier message regarding floor plan drafting support for your shoots in ${market}.\n\nWe’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround whenever you have a shoot lined up this week.\n\nBest regards,\nThe Lavientra Studio Team`;
    } else {
        if (subInput) subInput.value = tpl.subject || `Floor plan drafting support for {{Company}}`;
        if (bodyInput) bodyInput.value = tpl.body || `Hi {{ContactName}},\n\nI’m from Lavientra Studio...`;
    }

    window.updateLiveTemplatePreview();
};

window.updateLiveTemplatePreview = function () {
    const subVal = document.getElementById('templateSubjectInput')?.value || '';
    const bodyVal = document.getElementById('templateBodyInput')?.value || '';

    const previewSub = document.getElementById('previewSubjectText');
    const previewBody = document.getElementById('previewBodyText');
    const previewTo = document.getElementById('previewToEmail');

    const sampleCompany = window.activeTemplateMarket === 'Australia' ? 'Apex Real Estate Photography' : 'Summit Property Media';
    const sampleName = 'Alex Morgan';

    if (previewTo) {
        previewTo.innerText = window.activeTemplateMarket === 'Australia' ? 'contact@apexphotography.com.au' : 'contact@summitmedia.co.uk';
    }

    const renderedSub = subVal.replace(/{{Company}}/g, sampleCompany).replace(/{{ContactName}}/g, sampleName).replace(/{{Region}}/g, window.activeTemplateMarket);
    const renderedBody = bodyVal.replace(/{{Company}}/g, sampleCompany).replace(/{{ContactName}}/g, sampleName).replace(/{{Region}}/g, window.activeTemplateMarket);

    if (previewSub) previewSub.innerText = renderedSub;
    if (previewBody) previewBody.innerText = renderedBody;
};

window.insertVariable = function (tag) {
    const bodyInput = document.getElementById('templateBodyInput');
    if (!bodyInput) return;
    const start = bodyInput.selectionStart;
    const end = bodyInput.selectionEnd;
    const text = bodyInput.value;
    bodyInput.value = text.substring(0, start) + tag + text.substring(end);
    bodyInput.focus();
    bodyInput.selectionStart = bodyInput.selectionEnd = start + tag.length;
    window.updateLiveTemplatePreview();
};

window.saveCurrentTemplate = function () {
    const market = window.activeTemplateMarket || 'UK';
    const type = window.activeTemplateType || 'initial';
    const sub = document.getElementById('templateSubjectInput')?.value || '';
    const body = document.getElementById('templateBodyInput')?.value || '';

    if (!window.templates[market]) {
        window.templates[market] = {};
    }

    if (type === 'followup') {
        window.templates[market].followupSubject = sub;
        window.templates[market].followupBody = body;
        localStorage.setItem('lavientra_templates', JSON.stringify(window.templates));
        window.showNotification({
            title: 'Follow-Up Template Saved',
            message: `${market} market 3-day follow-up template updated.`,
            color: 'amber'
        });
    } else {
        window.templates[market].subject = sub;
        window.templates[market].body = body;
        localStorage.setItem('lavientra_templates', JSON.stringify(window.templates));
        window.showNotification({
            title: 'Initial Template Saved',
            message: `${market} market initial pitch template updated.`,
            color: 'teal'
        });
    }
};

// ==========================================================================
// 11. OUTREACH MODAL & FOLLOW-UP GENERATION
// ==========================================================================
window.generateEmail = function (id, type = 'initial') {
    const contact = window.contacts.find(c => c.id === id);
    if (!contact) return;

    const modal = document.getElementById('emailModalOverlay');
    if (!modal) return;

    const channel = contact.channel || 'email';
    const company = window.toTitleCase(contact.company);
    const name = window.toTitleCase(contact.name);
    const market = contact.country || 'UK';

    const greeting = (!contact.name || contact.name === 'Team') ? `Hi ${company} Team,` : `Hi ${name},`;
    const tpl = window.templates[market] || window.templates.UK || {};

    const modalTitleEl = document.getElementById('modalDialogTitle');
    const modalBadgeEl = document.getElementById('modalSubBadge');
    const modalThemeIcon = document.getElementById('modalThemeIcon');
    const modalIconSymbol = document.getElementById('modalIconSymbol');
    const markSentBtn = document.getElementById('modalMarkAsSentBtn');

    let subject = '';
    let body = '';

    if (type === 'followup') {
        if (modalTitleEl) modalTitleEl.innerText = `Draft 3-Day Follow-Up Message`;
        if (modalBadgeEl) {
            modalBadgeEl.className = 'mantine-Badge-root mantine-Badge-amber';
            modalBadgeEl.innerText = '3-Day Follow-Up Reminder';
        }
        if (modalThemeIcon) {
            modalThemeIcon.style.backgroundColor = 'var(--mantine-color-amber-0)';
            modalThemeIcon.style.color = 'var(--mantine-color-amber-6)';
        }
        if (modalIconSymbol) modalIconSymbol.innerText = 'notification_important';
        if (markSentBtn) {
            markSentBtn.className = 'mantine-Button-root mantine-Button-filled';
            markSentBtn.style.backgroundColor = 'var(--mantine-color-amber-6)';
            markSentBtn.innerHTML = `<span class="material-symbols-outlined">forward_to_inbox</span> Mark Follow-Up as Sent`;
        }

        const fuSubjectTpl = tpl.followupSubject || `Following up: Floor plan drafting support for {{Company}}`;
        const fuBodyTpl = tpl.followupBody || `${greeting}\n\nJust following up on my message from earlier this week regarding floor plan drafting support for your shoots in ${market}.\n\nWe’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround whenever you have a shoot lined up this week.\n\nBest regards,\nThe Lavientra Studio Team`;

        subject = fuSubjectTpl.replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name);
        body = fuBodyTpl.replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name).replace(/{{Region}}/g, market);
    } else {
        if (modalTitleEl) modalTitleEl.innerText = `Draft Initial Pitch`;
        if (modalBadgeEl) {
            modalBadgeEl.className = 'mantine-Badge-root mantine-Badge-indigo';
            modalBadgeEl.innerText = 'Initial Outreach';
        }
        if (modalThemeIcon) {
            modalThemeIcon.style.backgroundColor = 'var(--mantine-color-indigo-0)';
            modalThemeIcon.style.color = 'var(--mantine-color-indigo-6)';
        }
        if (modalIconSymbol) modalIconSymbol.innerText = 'mail';
        if (markSentBtn) {
            markSentBtn.className = 'mantine-Button-root mantine-Button-filled';
            markSentBtn.style.backgroundColor = 'var(--mantine-color-primary)';
            markSentBtn.innerHTML = `<span class="material-symbols-outlined">send</span> Mark as Sent & Move to Pipeline`;
        }

        subject = (tpl.subject || `Floor plan drafting support for {{Company}}`).replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name);
        body = (tpl.body || `Hi {{ContactName}},\n\nI'm from Lavientra Studio...`).replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name).replace(/{{Region}}/g, market);
    }

    const subRow = document.getElementById('dialogSubjectRow');
    if (subRow) subRow.style.display = channel === 'email' ? 'block' : 'none';

    const targetAddressEl = document.getElementById('modalTargetAddress');
    const targetLabelEl = document.getElementById('modalTargetLabel');
    const targetVal = channel === 'email' ? (contact.email || '') : (contact.socialUrl || '');

    if (targetAddressEl) targetAddressEl.value = targetVal;
    if (targetLabelEl) targetLabelEl.innerText = channel === 'email' ? 'Recipient Email Address' : `${channel.charAt(0).toUpperCase() + channel.slice(1)} Profile / Handle`;

    document.getElementById('emailSubject').value = subject;
    document.getElementById('generatedEmail').value = body;
    document.getElementById('currentContactId').value = contact.id;
    document.getElementById('currentEmailTarget').value = targetVal;
    document.getElementById('currentEmailType').value = type;
    document.getElementById('currentChannelType').value = channel;

    modal.classList.add('opened');
};

window.closeTemplate = function () {
    const modal = document.getElementById('emailModalOverlay');
    if (modal) modal.classList.remove('opened');
};

// 1-Click Quick Mark As Sent directly from row
window.quickMarkAsSent = async function (contactId) {
    const targetContact = window.contacts.find(c => c.id === contactId);
    if (!targetContact) return;

    const channel = targetContact.channel || 'email';
    const email = targetContact.email || targetContact.socialUrl || '';
    const country = targetContact.country || 'UK';

    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isoDate = now.toISOString().split('T')[0];

    const logEntry = {
        id: 'log_' + Date.now(),
        contactId: targetContact.id,
        channel,
        email,
        company: targetContact.company || '',
        dateString,
        isoDate,
        country,
        createdAt: now
    };

    if (logsCol) {
        try {
            await logsCol.add({
                contactId: targetContact.id,
                channel,
                email,
                company: targetContact.company || '',
                dateString,
                isoDate,
                country,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (contactsCol) {
                await contactsCol.doc(targetContact.id).update({
                    lastSentDate: firebase.firestore.FieldValue.serverTimestamp(),
                    lastSentType: 'initial'
                });
            }
        } catch (e) {
            console.warn("Firestore log write warning:", e.message);
        }
    }

    targetContact.lastSentDate = now;
    targetContact.lastSentType = 'initial';
    window.logs.unshift(logEntry);

    window.renderNewContacts();
    window.renderContacts();
    window.renderAnalytics();

    window.showNotification({
        title: 'Moved to Pipeline',
        message: `"${targetContact.company}" marked as sent! 3-day follow-up reminder timer started.`,
        color: 'teal'
    });
};

// Mark as Sent from within Modal
window.markAsSent = async function () {
    const contactId = document.getElementById('currentContactId')?.value;
    const email = document.getElementById('currentEmailTarget')?.value || '';
    const type = document.getElementById('currentEmailType')?.value || 'initial';
    const channel = document.getElementById('currentChannelType')?.value || 'email';

    const targetContact = window.contacts.find(c => c.id === contactId);
    const country = targetContact ? targetContact.country : 'UK';
    const targetCol = type === 'followup' ? followupLogsCol : logsCol;

    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isoDate = now.toISOString().split('T')[0];

    const logEntry = {
        id: 'log_' + Date.now(),
        contactId: targetContact?.id || '',
        channel,
        email: email || targetContact?.socialUrl || '',
        company: targetContact?.company || '',
        dateString,
        isoDate,
        country,
        createdAt: now
    };

    if (targetCol) {
        try {
            await targetCol.add({
                contactId: targetContact?.id || '',
                channel,
                email: email || targetContact?.socialUrl || '',
                company: targetContact?.company || '',
                dateString,
                isoDate,
                country,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (targetContact && targetContact.id && contactsCol) {
                await contactsCol.doc(targetContact.id).update({
                    lastSentDate: firebase.firestore.FieldValue.serverTimestamp(),
                    lastSentType: type
                });
            }
        } catch (e) {
            console.warn("Firestore mark sent warning:", e.message);
        }
    }

    if (targetContact) {
        targetContact.lastSentDate = now;
        targetContact.lastSentType = type;
        if (type === 'followup') window.followupLogs.unshift(logEntry);
        else window.logs.unshift(logEntry);
    }

    window.closeTemplate();
    window.renderNewContacts();
    window.renderContacts();
    window.renderAnalytics();

    window.showNotification({
        title: type === 'followup' ? 'Follow-Up Logged' : 'Moved to Pipeline',
        message: type === 'followup'
            ? `Follow-up logged for "${targetContact?.company || 'contact'}".`
            : `Initial outreach logged for "${targetContact?.company || 'contact'}". 3-day reminder active!`,
        color: 'teal'
    });
};

// ==========================================================================
// 12. PROGRESS & ANALYTICS (DYNAMIC PER COUNTRY)
// ==========================================================================
window.renderAnalytics = function () {
    const contactsData = window.contacts;
    const logsData = window.logs;
    const followupData = window.followupLogs;

    const totalContacts = contactsData.length;
    const totalSent = logsData.length;
    const pendingFollowups = contactsData.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const newUnsent = contactsData.filter(c => window.getContactStatusInfo(c).status === 'never_sent').length;

    const elTotal = document.getElementById('metricTotalContacts');
    const elNewUnsent = document.getElementById('metricNewUnsent');
    const elPending = document.getElementById('metricPendingFollowups');
    const elSent = document.getElementById('metricTotalSent');

    if (elTotal) elTotal.innerText = totalContacts;
    if (elNewUnsent) elNewUnsent.innerText = newUnsent;
    if (elPending) elPending.innerText = pendingFollowups;
    if (elSent) elSent.innerText = totalSent;

    const alertBanner = document.getElementById('followupGlobalAlertBanner');
    const alertMsg = document.getElementById('followupAlertMessage');
    const headerPill = document.getElementById('headerFollowupReminderPill');
    const headerPillText = document.getElementById('headerFollowupReminderText');

    if (pendingFollowups > 0) {
        if (alertBanner) alertBanner.style.display = 'flex';
        if (alertMsg) alertMsg.innerText = `You have ${pendingFollowups} contact(s) that reached 3+ days since initial pitch. Review and send your follow-ups!`;
        if (headerPill) headerPill.style.display = 'inline-flex';
        if (headerPillText) headerPillText.innerText = `${pendingFollowups} Follow-ups Due (3+ Days)`;
    } else {
        if (alertBanner) alertBanner.style.display = 'none';
        if (headerPill) headerPill.style.display = 'none';
    }

    // Dynamic Country Progress Grid
    const analyticsGrid = document.getElementById('analyticsCountryGrid');
    if (analyticsGrid) {
        analyticsGrid.innerHTML = window.countries.map(c => {
            const countryContacts = contactsData.filter(contact => (contact.country || 'UK') === c.id);
            const countrySent = logsData.filter(l => (l.country || 'UK') === c.id).length;
            const countryFollowup = followupData.filter(l => (l.country || 'UK') === c.id).length;
            const countryPending = countryContacts.filter(contact => window.getContactStatusInfo(contact).status === 'followup_due').length;
            const countryNewUnsent = countryContacts.filter(contact => window.getContactStatusInfo(contact).status === 'never_sent').length;
            const completionRate = countryContacts.length > 0 ? Math.round((countrySent / countryContacts.length) * 100) : 0;

            return `
                <div class="mantine-Card-root">
                    <div class="mantine-Card-header">
                        <div class="mantine-Card-title">
                            <span>${c.flag} ${c.name}</span>
                        </div>
                        <span class="mantine-Badge-root mantine-Badge-indigo">${completionRate}% Done</span>
                    </div>

                    <div style="background-color: var(--mantine-color-surface-active); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
                        <div style="background-color: var(--mantine-color-primary); height: 100%; width: ${Math.min(100, completionRate)}%; transition: width 0.3s ease;"></div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                            <span style="color: var(--mantine-color-dimmed);">Total Registered Leads</span>
                            <strong>${countryContacts.length}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                            <span style="color: var(--mantine-color-dimmed);">Unsent New Leads</span>
                            <strong style="color: var(--mantine-color-teal-6);">${countryNewUnsent}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                            <span style="color: var(--mantine-color-dimmed);">3-Day Follow-ups Due</span>
                            <strong style="color: var(--mantine-color-amber-6);">${countryPending}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                            <span style="color: var(--mantine-color-dimmed);">Initial Mails Sent</span>
                            <strong style="color: var(--mantine-color-teal-6);">${countrySent}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                            <span style="color: var(--mantine-color-dimmed);">Follow-ups Sent</span>
                            <strong style="color: var(--mantine-color-indigo-6);">${countryFollowup}</strong>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    const allUnsentTotal = contactsData.filter(c => window.getContactStatusInfo(c).status === 'never_sent').length;
    const allPipelineTotal = contactsData.filter(c => window.getContactStatusInfo(c).status !== 'never_sent').length;

    const navNewBadge = document.getElementById('navNewBadge');
    const navPipelineBadge = document.getElementById('navPipelineBadge');
    if (navNewBadge) navNewBadge.innerText = allUnsentTotal;
    if (navPipelineBadge) navPipelineBadge.innerText = allPipelineTotal;
};

// ==========================================================================
// 13. FIRESTORE DATABASE SYNCHRONIZATION
// ==========================================================================
function startDatabaseSync() {
    if (!contactsCol || !logsCol || !followupLogsCol) return;

    try {
        stopDatabaseSync();

        unsubscribeContacts = contactsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            window.contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            window.renderNewContacts();
            window.renderContacts();
            window.renderAnalytics();
        }, err => console.warn("Contacts sync warning:", err.message));

        unsubscribeLogs = logsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            window.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            window.renderNewContacts();
            window.renderContacts();
            window.renderAnalytics();
        }, err => console.warn("Logs sync warning:", err.message));

        unsubscribeFollowupLogs = followupLogsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            window.followupLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            window.renderNewContacts();
            window.renderContacts();
            window.renderAnalytics();
        }, err => console.warn("Followup logs sync warning:", err.message));
    } catch (e) {
        console.warn("Firestore sync setup:", e.message);
    }
}

function stopDatabaseSync() {
    if (unsubscribeContacts) { unsubscribeContacts(); unsubscribeContacts = null; }
    if (unsubscribeLogs) { unsubscribeLogs(); unsubscribeLogs = null; }
    if (unsubscribeFollowupLogs) { unsubscribeFollowupLogs(); unsubscribeFollowupLogs = null; }
}

// ==========================================================================
// 14. INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.initTheme();
    window.renderCountryControls();
    window.initTemplateEditor();
    initFirebaseAuth();
    window.renderNewContacts();
    window.renderContacts();
    window.renderAnalytics();
});
