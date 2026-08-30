/**
 * VK-style tooltips for verification checkmarks.
 * User page: "Верифицированная страница / Страница (Имя) подтверждена."
 * Group page: "Верифицированное сообщество / Это официальное сообщество известной персоны или организации."
 */
(function () {
    'use strict';

    function bindVerifyTooltips() {
        document.querySelectorAll('a.page_verified:not([data-vk2020-tt])').forEach(el => {
            el.setAttribute('data-vk2020-tt', '1');
            const isGroup = !!el.closest('.group_info_block, [data-group-page], #groupPage');
            // Group markers rendered inside club pages: detect by URL
            const isClubUrl = /^\/(club|public|event)/.test(location.pathname);
            const name = el.getAttribute('data-verified-name') || (document.querySelector('.page_name')?.textContent || '').trim();

            let title, subtitle;
            if (isGroup || isClubUrl) {
                title = 'Верифицированное сообщество';
                subtitle = 'Это официальное сообщество известной персоны или организации.';
            } else {
                title = 'Верифицированная страница';
                subtitle = name ? `Страница «${name}» подтверждена.` : 'Страница подтверждена.';
            }

            const content = `<div style="text-align:left;line-height:1.45">
                <div style="font-weight:600;font-size:13px;margin-bottom:3px">${title}</div>
                <div style="font-size:12.5px;color:inherit;opacity:.85">${subtitle}</div>
            </div>`;

            if (window.tippy) {
                tippy(el, {
                    content,
                    allowHTML: true,
                    theme: 'vk2020-verify',
                    placement: 'bottom-start',
                    offset: [0, 8],
                    animation: 'shift-away',
                    duration: [120, 120],
                    maxWidth: 280,
                });
                el.removeAttribute('title');
            }
            // no tippy -> native title stays as fallback
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindVerifyTooltips);
    } else {
        bindVerifyTooltips();
    }
    window.addEventListener('vkify:pageReady', bindVerifyTooltips);
    // SPA-ish re-render hook
    const mo = new MutationObserver(() => bindVerifyTooltips());
    mo.observe(document.body, { childList: true, subtree: true });
})();
