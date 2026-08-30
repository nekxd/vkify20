/**
 * VK2020: обложки треков через iTunes Search API (бесплатный, без ключа).
 * Фолбэк: /assets/packages/static/openvk/img/song.jpg (уже стоит в src).
 * Кэш в localStorage на 30 дней.
 */
(function () {
    'use strict';

    const CACHE_PREFIX = 'vk2020cover:';
    const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 дней

    function cacheKey(performer, title) {
        return CACHE_PREFIX + performer + '::' + title;
    }

    function fetchCover(performer, title) {
        const key = cacheKey(performer, title);
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const { url, ts } = JSON.parse(cached);
                if (url && Date.now() - ts < CACHE_TTL) return Promise.resolve(url);
            }
        } catch (e) { /* ignore */ }

        const q = encodeURIComponent(performer + ' ' + title);
        const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=1`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);

        return fetch(url, { signal: controller.signal })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                clearTimeout(timer);
                if (data && data.results && data.results.length > 0) {
                    const art = data.results[0].artworkUrl100 || data.results[0].artworkUrl60;
                    if (art) {
                        // 100px достаточно для 32px-обложки
                        const cover = art.replace('100x100', '64x64');
                        try {
                            localStorage.setItem(key, JSON.stringify({ url: cover, ts: Date.now() }));
                        } catch (e) { /* quota */ }
                        return cover;
                    }
                }
                return null;
            })
            .catch(() => null);
    }

    function applyCovers(root) {
        (root || document).querySelectorAll('img.audioCoverImg[data-performer]').forEach(img => {
            if (img.dataset.coverLoaded) return;
            img.dataset.coverLoaded = '1';

            const performer = (img.dataset.performer || '').trim();
            const title = (img.dataset.title || '').trim();
            if (!performer || !title) return; // остаётся song.jpg

            fetchCover(performer, title).then(cover => {
                if (cover) img.src = cover;
            });
        });
    }

    /* ===== Обложка = кнопка воспроизведения ===== */
    function bindCoverClick(root) {
        (root || document).querySelectorAll('.audioCoverButton').forEach(btn => {
            if (btn.dataset.vk2020CoverClick) return;
            btn.dataset.vk2020CoverClick = '1';
            btn.addEventListener('click', e => {
                // НЕ stopPropagation: легаси al_music ловит клик на document.
                // Если клик пришёл прямо на обложку (не на playIcon) — дергаем playIcon,
                // дальше событие само всплывёт к легаси-обработчику.
                const icon = btn.querySelector('.playIcon');
                if (icon && e.target !== icon && !e.target.closest('.playIcon')) {
                    // клик по обложке: пересылаем на иконку (легаси сработает по всплытию)
                    icon.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }
                // если клик уже по playIcon — ничего, событие всплывёт само
            });
        });
    }

    function init(root) {
        applyCovers(root);
        bindCoverClick(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(document));
    } else {
        init(document);
    }
    window.addEventListener('vkify:pageReady', () => init(document));
    const mo = new MutationObserver(() => init(document));
    mo.observe(document.body, { childList: true, subtree: true });
})();
