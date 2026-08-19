// ==========================================================================
// LAVIENTRA STUDIO COMMAND CENTER — CRM & MANTINE UI ENGINE (v7+)
// Manual Outreach Workflow: Copy Address, Subject, Body + Mark as Sent
// ==========================================================================

window.contacts = [];
window.logs = [];
window.followupLogs = [];
window.activeWorkspaceRegion = 'UK';
window.activeMainTab = 'workspace';
window.activePipelineStage = 'all';
window.activeTemplateMarket = 'UK';

// Default Market Pitch Templates
window.templates = {
    UK: {
        subject: "Floor plan drafting support for {{Company}}",
        body: `Hi {{ContactName}},\n\nI’m from Lavientra Studio, and we help busy UK property photographers offload their floor plan drafting with a guaranteed 24-hour turnaround. We specialize in clean, RICS-compliant 2D layouts customized to your brand standards.\n\nIf you’d like to review our work or check our standard drafting workflow, feel free to visit us at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nWe’d love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`
    },
    Australia: {
        subject: "Floor plan drafting support for {{Company}}",
        body: `Hi {{ContactName}},\n\nI came across your work in Australia and love your property photography style! I'm with Lavientra Studio—we provide dedicated 24-hr turnaround floor plan drafting tailored to your brand.\n\nWe'd love to draft your first floor plan completely free as a test run on your next shoot this week! Feel free to check out lavientra.com or message back here if you'd like to try us out.\n\nBest,\n\nThe Lavientra Studio Team`
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
        iconName = 'warning';
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
// 2. THEME & APP SHELL NAVIGATION
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
        message: `Interface theme switched to ${isDark ? 'Dark Slate' : 'Clean Light'}.`,
        color: 'indigo'
    });
};

window.toggleSidebar = function () {
    const navbar = document.getElementById('appNavbar');
    if (navbar) navbar.classList.toggle('opened');
};

window.switchMainTab = function (tab) {
    window.activeMainTab = tab;

    // Update NavLinks
    ['workspace', 'pipeline', 'templates', 'analytics'].forEach(t => {
        const navEl = document.getElementById(`nav${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const modEl = document.getElementById(`${t}Module`);
        if (navEl) navEl.classList.toggle('active', t === tab);
        if (modEl) modEl.style.display = t === tab ? 'block' : 'none';
    });

    // Update Breadcrumb
    const currentModEl = document.getElementById('headerCurrentModule');
    if (currentModEl) {
        const titles = {
            workspace: 'Workspace Dashboard',
            pipeline: 'Pipeline & Stage Manager',
            templates: 'Template Studio',
            analytics: 'Progress & Analytics'
        };
        currentModEl.innerText = titles[tab] || tab;
    }

    const navbar = document.getElementById('appNavbar');
    if (navbar && window.innerWidth <= 1024) navbar.classList.remove('opened');

    if (tab === 'analytics') window.renderAnalytics();
    if (tab === 'pipeline') window.renderContacts();
    if (tab === 'templates') window.initTemplateEditor();
    if (tab === 'workspace') window.renderAnalytics();
};

window.setWorkspaceRegion = function (region) {
    window.activeWorkspaceRegion = region;
    ['wsBtnUK', 'wsBtnAus', 'wsBtnUS'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', (id === 'wsBtnUK' && region === 'UK') || (id === 'wsBtnAus' && region === 'Australia') || (id === 'wsBtnUS' && region === 'US'));
    });
    window.renderContacts();
};

window.setPipelineStageFilter = function (stage) {
    window.activePipelineStage = stage;
    ['tabStageAll', 'tabStageDue', 'tabStageNever', 'tabStageSent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const matches = (id === 'tabStageAll' && stage === 'all') ||
                (id === 'tabStageDue' && stage === 'followup_due') ||
                (id === 'tabStageNever' && stage === 'never_sent') ||
                (id === 'tabStageSent' && stage === 'sent_recent');
            el.classList.toggle('active', matches);
        }
    });
    window.renderContacts();
};

// ==========================================================================
// 3. COPY HELPER FUNCTIONS (EMAIL, SUBJECT, BODY, ALL)
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
    const el = document.getElementById('templateSubjectInput');
    if (el) window.copyFieldValue('templateSubjectInput', btnElement);
};

window.copyTemplateBody = function (btnElement) {
    const el = document.getElementById('templateBodyInput');
    if (el) window.copyFieldValue('templateBodyInput', btnElement);
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
// 4. CONTACTS & PIPELINE RENDERING
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
        facebook: 'mantine-Badge-indigo'
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
        return { status: 'never_sent', days: null, label: 'Not Sent' };
    }

    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
        return { status: 'followup_due', days: diffDays, label: `Follow-up Due (${diffDays}d ago)` };
    } else {
        const dayText = diffDays === 0 ? 'Today' : `${diffDays}d ago`;
        return { status: 'sent_recent', days: diffDays, label: `Sent (${dayText})` };
    }
};

window.renderContacts = function () {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;

    const searchQuery = (document.getElementById('pipelineSearchInput')?.value || '').toLowerCase().trim();
    const channelFilter = document.getElementById('pipelineChannelFilter')?.value || 'all';

    let list = window.contacts.filter(c => c.country === window.activeWorkspaceRegion);

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
    const countNever = list.filter(c => window.getContactStatusInfo(c).status === 'never_sent').length;
    const countSent = list.filter(c => window.getContactStatusInfo(c).status === 'sent_recent').length;

    const bAll = document.getElementById('badgeCountAll');
    const bDue = document.getElementById('badgeCountDue');
    const bNever = document.getElementById('badgeCountNever');
    const bSent = document.getElementById('badgeCountSent');

    if (bAll) bAll.innerText = countAll;
    if (bDue) bDue.innerText = countDue;
    if (bNever) bNever.innerText = countNever;
    if (bSent) bSent.innerText = countSent;

    if (window.activePipelineStage !== 'all') {
        list = list.filter(c => window.getContactStatusInfo(c).status === window.activePipelineStage);
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--mantine-color-dimmed); padding: 36px;">No contacts matching the selected criteria.</td></tr>`;
        return;
    }

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
            statusBadge = `<span class="mantine-Badge-root mantine-Badge-amber"><span class="material-symbols-outlined" style="font-size: 14px;">warning</span> Follow-up Due (${statusInfo.days}d)</span>`;
            actionBtn = `<button class="mantine-Button-root mantine-Button-light" style="height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="generateEmail('${contact.id}', 'followup')"><span class="material-symbols-outlined" style="font-size: 16px;">forward_to_inbox</span> Follow Up</button>`;
        } else if (statusInfo.status === 'sent_recent') {
            statusBadge = `<span class="mantine-Badge-root mantine-Badge-teal"><span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> ${statusInfo.label}</span>`;
            actionBtn = `<button class="mantine-Button-root mantine-Button-default" style="height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 16px;">edit_document</span> Draft</button>`;
        } else {
            statusBadge = `<span class="mantine-Badge-root mantine-Badge-gray"><span class="material-symbols-outlined" style="font-size: 14px;">schedule</span> Not Sent</span>`;
            actionBtn = `<button class="mantine-Button-root mantine-Button-filled" style="height: 34px; padding: 0 12px; font-size: 12.5px;" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 16px;">send</span> Pitch</button>`;
        }

        let targetContent = '';
        const targetVal = channel === 'email' ? contact.email : contact.socialUrl;

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
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                    ${actionBtn}
                    <button type="button" class="mantine-ActionIcon-root mantine-ActionIcon-subtle-danger" onclick="deleteContact('${contact.id}', '${companyDisplay}')" title="Delete Lead">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const navPipelineBadge = document.getElementById('navPipelineBadge');
    if (navPipelineBadge) navPipelineBadge.innerText = window.contacts.length;
};

// ==========================================================================
// 5. ADD CONTACT & VALIDATION
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
                message: `Email is already in pipeline under "${existing.company}" (${existing.country}).`,
                color: 'amber'
            });
            return;
        }
    }

    if (!contactsCol) {
        window.showNotification({ title: 'Connection Error', message: 'Database connecting... Please retry.', color: 'red' });
        return;
    }

    try {
        await contactsCol.add({
            channel,
            company: window.toTitleCase(companyRaw),
            name: nameRaw ? window.toTitleCase(nameRaw) : 'Team',
            email: emailRaw || '',
            socialUrl: socialUrl || '',
            url: companyUrl || '',
            country,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.showNotification({
            title: 'Lead Added Successfully',
            message: `"${window.toTitleCase(companyRaw)}" added to ${country} outreach pipeline.`,
            color: 'teal'
        });

        window.clearContactForm();
        window.setWorkspaceRegion(country);
    } catch (e) {
        window.showNotification({ title: 'Save Failed', message: e.message, color: 'red' });
    }
};

window.deleteContact = async function (contactId, companyName) {
    if (!confirm(`Remove "${companyName}" from cloud database?`)) return;
    try {
        await contactsCol.doc(contactId).delete();
        window.showNotification({ title: 'Lead Deleted', message: `"${companyName}" removed from pipeline.`, color: 'indigo' });
    } catch (e) {
        window.showNotification({ title: 'Error Deleting', message: e.message, color: 'red' });
    }
};

// ==========================================================================
// 6. TEMPLATE STUDIO & LIVE PREVIEW
// ==========================================================================
window.switchTemplateMarket = function (market) {
    window.activeTemplateMarket = market;
    const btnUK = document.getElementById('tplBtnUK');
    const btnAus = document.getElementById('tplBtnAus');
    if (btnUK) btnUK.classList.toggle('active', market === 'UK');
    if (btnAus) btnAus.classList.toggle('active', market === 'Australia');
    window.initTemplateEditor();
};

window.initTemplateEditor = function () {
    const market = window.activeTemplateMarket || 'UK';
    const tpl = window.templates[market] || window.templates.UK;

    const subInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    if (subInput) subInput.value = tpl.subject;
    if (bodyInput) bodyInput.value = tpl.body;

    window.updateLiveTemplatePreview();
};

window.updateLiveTemplatePreview = function () {
    const subVal = document.getElementById('templateSubjectInput')?.value || '';
    const bodyVal = document.getElementById('templateBodyInput')?.value || '';

    const previewSub = document.getElementById('previewSubjectText');
    const previewBody = document.getElementById('previewBodyText');

    const sampleCompany = window.activeTemplateMarket === 'Australia' ? 'Apex Real Estate Photography' : 'Summit Property Media';
    const sampleName = 'Alex Morgan';

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
    const sub = document.getElementById('templateSubjectInput')?.value || '';
    const body = document.getElementById('templateBodyInput')?.value || '';

    window.templates[market] = { subject: sub, body };
    window.showNotification({
        title: 'Template Saved',
        message: `${market} market outreach template updated.`,
        color: 'teal'
    });
};

// ==========================================================================
// 7. OUTREACH MODAL & MARK AS SENT ACTION
// ==========================================================================
window.generateEmail = function (id, type = 'initial') {
    const contact = window.contacts.find(c => c.id === id);
    if (!contact) return;

    const modal = document.getElementById('emailModalOverlay');
    if (!modal) return;

    const channel = contact.channel || 'email';
    const company = window.toTitleCase(contact.company);
    const name = window.toTitleCase(contact.name);
    const market = contact.country === 'Australia' ? 'Australia' : 'UK';

    const greeting = (!contact.name || contact.name === 'Team') ? `Hi ${company} Team,` : `Hi ${name},`;
    const tpl = window.templates[market] || window.templates.UK;

    let subject = tpl.subject.replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name);
    let body = tpl.body.replace(/{{Company}}/g, company).replace(/{{ContactName}}/g, name).replace(/{{Region}}/g, market);

    if (type === 'followup') {
        subject = `Following up: Floor plan drafting support for ${company}`;
        body = `${greeting}\n\nJust following up on my email from earlier this week regarding floor plan drafting support for your shoots in ${market}.\n\nWe’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround whenever you have a shoot lined up this week.\n\nBest regards,\nThe Lavientra Studio Team`;
    }

    const subRow = document.getElementById('dialogSubjectRow');
    if (subRow) subRow.style.display = channel === 'email' ? 'block' : 'none';

    // Target field
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

// Core "Mark as Sent" Action
window.markAsSent = async function () {
    const contactId = document.getElementById('currentContactId')?.value;
    const email = document.getElementById('currentEmailTarget')?.value || '';
    const type = document.getElementById('currentEmailType')?.value || 'initial';
    const channel = document.getElementById('currentChannelType')?.value || 'email';
    const subject = document.getElementById('emailSubject')?.value || '';

    const targetContact = window.contacts.find(c => c.id === contactId);
    const country = targetContact ? targetContact.country : 'UK';
    const targetCol = type === 'followup' ? followupLogsCol : logsCol;

    if (!targetCol) {
        window.showNotification({ title: 'Database Error', message: 'Database connection not ready.', color: 'red' });
        return;
    }

    try {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const isoDate = now.toISOString().split('T')[0];

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

        window.closeTemplate();
        window.showNotification({
            title: 'Marked as Sent',
            message: `Logged ${type === 'followup' ? 'follow-up' : 'initial outreach'} for ${targetContact?.company || 'contact'}.`,
            color: 'teal'
        });
    } catch (e) {
        window.showNotification({ title: 'Error Logging Sent', message: e.message, color: 'red' });
    }
};

// ==========================================================================
// 8. PROGRESS & ANALYTICS
// ==========================================================================
window.renderAnalytics = function () {
    const todayIso = new Date().toISOString().split('T')[0];
    const contactsData = window.contacts;
    const logsData = window.logs;
    const followupData = window.followupLogs;

    const totalContacts = contactsData.length;
    const totalSent = logsData.length;
    const pendingFollowups = contactsData.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const sentToday = logsData.filter(l => l.isoDate === todayIso).length + followupData.filter(l => l.isoDate === todayIso).length;

    const elTotal = document.getElementById('metricTotalContacts');
    const elPending = document.getElementById('metricPendingFollowups');
    const elSent = document.getElementById('metricTotalSent');
    const elToday = document.getElementById('metricSentToday');

    if (elTotal) elTotal.innerText = totalContacts;
    if (elPending) elPending.innerText = pendingFollowups;
    if (elSent) elSent.innerText = totalSent;
    if (elToday) elToday.innerText = sentToday;

    // UK Analytics
    const ukContacts = contactsData.filter(c => c.country === 'UK');
    const ukSent = logsData.filter(l => l.country === 'UK').length;
    const ukFollowup = followupData.filter(l => l.country === 'UK').length;
    const ukPending = ukContacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const ukRate = ukContacts.length > 0 ? Math.round((ukSent / ukContacts.length) * 100) : 0;

    const elUkList = document.getElementById('ukListCount');
    const elUkPending = document.getElementById('ukPendingFollowups');
    const elUkSent = document.getElementById('ukSentCount');
    const elUkFollow = document.getElementById('ukFollowupCount');
    const elUkBadge = document.getElementById('ukCompletionBadge');
    const elUkBar = document.getElementById('ukProgressBar');

    if (elUkList) elUkList.innerText = ukContacts.length;
    if (elUkPending) elUkPending.innerText = ukPending;
    if (elUkSent) elUkSent.innerText = ukSent;
    if (elUkFollow) elUkFollow.innerText = ukFollowup;
    if (elUkBadge) elUkBadge.innerText = `${ukRate}% Done`;
    if (elUkBar) elUkBar.style.width = `${Math.min(100, ukRate)}%`;

    // Australia Analytics
    const ausContacts = contactsData.filter(c => c.country === 'Australia');
    const ausSent = logsData.filter(l => l.country === 'Australia').length;
    const ausFollowup = followupData.filter(l => l.country === 'Australia').length;
    const ausPending = ausContacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const ausRate = ausContacts.length > 0 ? Math.round((ausSent / ausContacts.length) * 100) : 0;

    const elAusList = document.getElementById('ausListCount');
    const elAusPending = document.getElementById('ausPendingFollowups');
    const elAusSent = document.getElementById('ausSentCount');
    const elAusFollow = document.getElementById('ausFollowupCount');
    const elAusBadge = document.getElementById('ausCompletionBadge');
    const elAusBar = document.getElementById('ausProgressBar');

    if (elAusList) elAusList.innerText = ausContacts.length;
    if (elAusPending) elAusPending.innerText = ausPending;
    if (elAusSent) elAusSent.innerText = ausSent;
    if (elAusFollow) elAusFollow.innerText = ausFollowup;
    if (elAusBadge) elAusBadge.innerText = `${ausRate}% Done`;
    if (elAusBar) elAusBar.style.width = `${Math.min(100, ausRate)}%`;
};

// ==========================================================================
// 9. FIREBASE AUTH & FIRESTORE INTEGRATION
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

function startDatabaseSync() {
    stopDatabaseSync();
    if (!contactsCol || !logsCol || !followupLogsCol) return;

    unsubscribeContacts = contactsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderAnalytics();
    }, err => console.error("Contacts sync error:", err));

    unsubscribeLogs = logsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderAnalytics();
    }, err => console.error("Logs sync error:", err));

    unsubscribeFollowupLogs = followupLogsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.followupLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderAnalytics();
    }, err => console.error("Followup logs sync error:", err));
}

function stopDatabaseSync() {
    if (typeof unsubscribeContacts === 'function') { unsubscribeContacts(); unsubscribeContacts = null; }
    if (typeof unsubscribeLogs === 'function') { unsubscribeLogs(); unsubscribeLogs = null; }
    if (typeof unsubscribeFollowupLogs === 'function') { unsubscribeFollowupLogs(); unsubscribeFollowupLogs = null; }
}

function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
        setTimeout(initFirebase, 200);
        return;
    }

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    contactsCol = db.collection("contacts");
    logsCol = db.collection("logs");
    followupLogsCol = db.collection("followup_logs");

    firebase.auth().onAuthStateChanged((user) => {
        const loginContainer = document.getElementById('loginContainer');
        const appContainer = document.getElementById('appContainer');

        if (user) {
            const userEmail = (user.email || '').toLowerCase().trim();
            if (ALLOWED_EMAILS.includes(userEmail)) {
                if (loginContainer) loginContainer.style.display = 'none';
                if (appContainer) appContainer.style.display = 'flex';
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
// 10. INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.initTheme();
    window.initTemplateEditor();
    initFirebase();
});
