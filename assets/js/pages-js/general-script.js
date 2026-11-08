/*
 * general-script.js - About pages, 404 and other generic pages (layouts: about, default).
 * Shared behaviour (config overlay, theme, back, notify, ...) is in ../common.js.
 */
(function () {
    function getAboutLangFromPath(pathname) {
        const match = pathname.match(/\/about-yuk-(en|vi|ja)(?:\/)?$/);
        return match ? match[1] : null;
    }

    function buildAboutUrlForLang(lang) {
        const url = new URL(window.location.href);
        url.pathname = `/about-yuk-${lang}`;
        return url.toString();
    }

    function hasSameOriginReferrer() {
        if (!document.referrer) return false;
        try {
            return new URL(document.referrer).origin === window.location.origin;
        } catch (error) {
            return false;
        }
    }

    // Arriving on an About page from elsewhere on the site: show it in the language last read.
    function maybeRedirectAboutLanguage() {
        const currentLang = getAboutLangFromPath(window.location.pathname);
        if (!currentLang || !hasSameOriginReferrer()) return false;
        const preferredLang = Site.getPreferredLanguage();
        if (!preferredLang || preferredLang === currentLang) return false;
        window.location.replace(buildAboutUrlForLang(preferredLang));
        return true;
    }

    if (!maybeRedirectAboutLanguage()) {
        Site.rememberPreferredLanguage(document.documentElement.lang);
    }

    // Translate button: cycle en -> vi -> ja
    window.switchLanguage = function switchLanguage() {
        const langs = Site.langs;
        const currentLang = getAboutLangFromPath(window.location.pathname) || document.documentElement.lang || 'en';
        const nextLang = langs[(langs.indexOf(currentLang) + 1) % langs.length];
        Site.rememberPreferredLanguage(nextLang);
        window.location.href = buildAboutUrlForLang(nextLang);
    };

    Site.initScrollHeader({
        header: '#general-header',
        title: '#general-header-title',
        titleSize: '1.7em',
        navSize: '1.125rem'
    });
})();
