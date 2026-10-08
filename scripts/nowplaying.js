(() => {
    const API_BASE = 'https://np.ryou.cafe';
    const ENDPOINT = API_BASE + '/api/now-playing';
    const POLL_MS = 30000;
    const TIMEOUT_MS = 10000;

    const widget = document.querySelector('.now-playing');
    if (!widget) return;

    const cover = widget.querySelector('.now-playing__cover');
    const title = widget.querySelector('.now-playing__title');
    const titleText = widget.querySelector('.now-playing__title-text');
    const artist = widget.querySelector('.now-playing__artist');

    let timer = null;
    let currentKey = null;
    let inFlight = false;

    function hide() {
        widget.hidden = true;
        currentKey = null;
    }

    function updateMarquee() {
        const shift = titleText.scrollWidth - title.clientWidth;
        title.classList.toggle('is-overflowing', shift > 0);
        title.style.setProperty('--marquee-shift', shift > 0 ? -shift + 'px' : '0px');
    }

    function render(data) {
        if (!data || !data.playing || data.stale || !data.title) {
            hide();
            return;
        }

        const key = [data.title, data.artist, data.coverUrl].join('\u0000');
        if (key === currentKey) return;
        currentKey = key;

        titleText.textContent = data.title;
        artist.textContent = data.artist || '';
        widget.setAttribute('aria-label', 'Now playing: ' + data.title + (data.artist ? ' by ' + data.artist : ''));

        if (data.coverUrl) {
            cover.src = new URL(data.coverUrl, API_BASE).href;
            cover.alt = data.album ? data.album + ' cover' : '';
            cover.hidden = false;
        } else {
            cover.removeAttribute('src');
            cover.hidden = true;
        }

        widget.hidden = false;
        requestAnimationFrame(updateMarquee);
    }

    async function poll() {
        clearTimeout(timer);
        if (inFlight) return;
        inFlight = true;
        try {
            const res = await fetch(ENDPOINT, {
                cache: 'no-store',
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            if (!res.ok) throw new Error(res.status);
            render(await res.json());
        } catch {
            hide();
        }
        inFlight = false;
        if (!document.hidden) timer = setTimeout(poll, POLL_MS);
    }

    cover.addEventListener('error', () => { cover.hidden = true; });
    window.addEventListener('resize', () => { if (!widget.hidden) updateMarquee(); });
    document.fonts.ready.then(() => { if (!widget.hidden) updateMarquee(); });

    document.addEventListener('visibilitychange', () => {
        clearTimeout(timer);
        if (!document.hidden) poll();
    });

    poll();
})();
