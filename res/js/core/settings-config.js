(function () {
    if (!window.vkify) return;

    const body = document.body;

    function setThemeSwitching() {
        body.classList.add('theme-switching');
        setTimeout(() => body.classList.remove('theme-switching'), 500);
    }

    function toggleTheme(enabled, bodyClass, styleId, styleName) {
        setThemeSwitching();
        body.classList.toggle(bodyClass, enabled);
        if (enabled) vkify.loadStyle(null, styleId, `${vkify.resourceUrl('css')}/${styleName}`);
        else vkify.unloadStyle(styleId);
    }

    vkify.registerSetting('darkMode', false, 'vk2020_darkmode');
    vkify.registerSetting('vkGraffiti', false, 'vk2020_graffiti');
    vkify.registerSetting('vkBranding', true, 'vk2020_branding');

    window.toggleDarkMode = function (enabled) {
        toggleTheme(enabled, 'dark-mode', 'dark-mode-css', 'dark-mode.css');
        window.toggleVkBranding?.(vkify.getSetting('vkBranding'));
    };

    /* VK branding: favicon vk.ico + лого vkblack/vkwhite по теме */
    window.toggleVkBranding = function (enabled) {
        const body = document.body;
        body.classList.toggle('vk-branding', !!enabled);

        const isDark = body.classList.contains('dark-mode');
        const favicon = document.querySelector('link[rel="shortcut icon"]');
        if (favicon) {
            favicon.href = enabled
                ? vkify.resourceUrl('icons') + '/vk.ico'
                : vkify.resourceUrl('icons') + '/default.ico';
        }
        const homeBg = document.querySelector('.home_button .home_button_bg');
        if (homeBg) {
            homeBg.classList.toggle('vk-branding-logo', !!enabled);
        }
    };

    if (vkify.getSetting('darkMode')) {
        window.toggleDarkMode(true);
    }
    window.toggleVkBranding(vkify.getSetting('vkBranding'));
    /* повторно применить лого, когда DOM готов */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.toggleVkBranding(vkify.getSetting('vkBranding')));
    } else {
        vkify.ready(() => window.toggleVkBranding(vkify.getSetting('vkBranding')));
    }

    function bindSettingsToggles() {
        const bindToggle = (name, settingKey, applyFn) => {
            const cb = document.querySelector(`#vkifySettings input[name="${name}"]`);
            if (!cb || cb.dataset.vkifyBound) return;
            cb.dataset.vkifyBound = '1';
            cb.checked = !!vkify.getSetting(settingKey);
            cb.onchange = function() {
                vkify.setSetting(settingKey, this.checked);
                if (applyFn) applyFn(this.checked);
                window.vkifyShowSavedLabel?.(this);
            };
        };
        bindToggle('theme_mode', 'darkMode', window.toggleDarkMode);
        bindToggle('vkgraffiti', 'vkGraffiti', null);
        bindToggle('vkbranding', 'vkBranding', window.toggleVkBranding);
    }

    vkify.onPageLifecycle('afterPageReady', bindSettingsToggles, 'after');
})();
