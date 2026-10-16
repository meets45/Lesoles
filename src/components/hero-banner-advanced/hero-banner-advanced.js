import './hero-banner-advanced.scss';

const queries = {
  mobile: '(max-width: 749px)',
  tablet: '(min-width: 750px) and (max-width: 989px)',
};

const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canLoadExternalAutoplay = () => {
  // The editor is a merchant preview, not a visitor consent session.
  if (window.Shopify?.designMode) return true;

  const privacy = window.Shopify?.customerPrivacy;
  if (!privacy) return true;
  if (typeof privacy.marketingAllowed === 'function') return privacy.marketingAllowed() === true;

  const consent = privacy.currentVisitorConsent?.();
  return consent?.marketing === true || consent?.marketing === 'yes';
};
const isShown = (element) => element && element.getClientRects().length > 0;
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
};

class HeroBannerAdvanced extends HTMLElement {
  connectedCallback() {
    if (this.controller) return;
    this.controller = new AbortController();
    this.media = [...this.querySelectorAll('[data-media]')];
    this.dialog = this.querySelector('[data-video-dialog]');
    this.dialogMedia = this.querySelector('[data-dialog-media]');
    this.breakpoint = '';
    this.lastTrigger = null;
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.addEventListener('click', (event) => this.handleClick(event), { signal: this.controller.signal });
    window.addEventListener('resize', this.onResize, { signal: this.controller.signal });
    window.addEventListener('scroll', this.onScroll, { passive: true, signal: this.controller.signal });
    document.addEventListener('shopify:section:load', (event) => this.handleEditorEvent(event), {
      signal: this.controller.signal,
    });
    document.addEventListener('shopify:section:unload', (event) => this.handleEditorEvent(event), {
      signal: this.controller.signal,
    });
    document.addEventListener('shopify:section:reorder', (event) => this.handleEditorEvent(event), {
      signal: this.controller.signal,
    });
    document.addEventListener('shopify:block:select', (event) => this.handleBlockSelect(event), {
      signal: this.controller.signal,
    });
    document.addEventListener('visitorConsentCollected', () => this.refresh(), {
      signal: this.controller.signal,
    });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.media.forEach((media) => this.stopVideo(media));
          this.closeDialog();
        } else {
          this.refresh();
        }
      },
      { signal: this.controller.signal },
    );
    this.dialog?.addEventListener('close', () => this.closeDialog(), { signal: this.controller.signal });
    this.dialog?.addEventListener('cancel', () => this.closeDialog(), { signal: this.controller.signal });

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const media = entry.target;
          if (!entry.isIntersecting || !isShown(media)) {
            this.stopVideo(media);
          } else {
            media.dataset.entered = 'true';
            this.tryAutoplay(media);
          }
        }
      },
      { threshold: 0.15 },
    );
    this.media.forEach((media) => this.observer.observe(media));
    this.refresh();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.resizeFrame);
    cancelAnimationFrame(this.scrollFrame);
    this.controller?.abort();
    this.observer?.disconnect();
    this.media?.forEach((media) => this.stopVideo(media));
    this.closeDialog();
    this.controller = null;
  }

  device() {
    if (window.matchMedia(queries.mobile).matches) return 'mobile';
    if (window.matchMedia(queries.tablet).matches) return 'tablet';
    return 'desktop';
  }

  responsiveValue(element, name, device) {
    const desktop = element.dataset[`${name}Desktop`];
    const tablet = element.dataset.overrideTablet === 'true' ? element.dataset[`${name}Tablet`] : desktop;
    return device === 'mobile'
      ? element.dataset.overrideMobile === 'true'
        ? element.dataset[`${name}Mobile`]
        : tablet
      : device === 'tablet'
        ? tablet
        : desktop;
  }

  refresh() {
    const device = this.device();
    const changed = device !== this.breakpoint;
    this.breakpoint = device;
    if (changed) this.media.forEach((media) => this.stopVideo(media));
    if (!isShown(this)) this.closeDialog();

    const card = this.querySelector('.hb__media--secondary');
    const layout = this.querySelector('[data-layout-container]');
    const position = this.responsiveValue(this, 'position', device);
    const cardFirst = position === 'left' || position === 'above';
    if (card && layout) {
      const first = layout.firstElementChild;
      if (cardFirst && first !== card) layout.prepend(card);
      if (!cardFirst && first === card) layout.append(card);
      this.dataset.cardFirst = String(cardFirst);
      this.dataset.cardVisible = String(isShown(card));
    }

    const mainBody = this.querySelector('[data-main-body]');
    const mainMedia = this.querySelector('.hb__media--main');
    const content = this.querySelector('[data-main-content]');
    if (mainBody && mainMedia && content && !mainMedia.classList.contains('hb__media--background')) {
      const arrangement = isShown(mainMedia)
        ? this.responsiveValue(mainMedia, 'arrangement', device) || 'below'
        : 'below';
      const mediaFirst = arrangement === 'above' || arrangement === 'left';
      if (mediaFirst && mainBody.firstElementChild !== mainMedia) mainBody.prepend(mainMedia);
      if (!mediaFirst && mainBody.firstElementChild === mainMedia) mainBody.append(mainMedia);
      mainBody.dataset.mediaArrangement = arrangement;
      mainBody.dataset.mediaVertical = this.responsiveValue(mainMedia, 'mediaVertical', device) || 'end';
    }

    for (const media of this.media) {
      if (media.dataset.type !== 'video') continue;
      const template = this.sourceTemplate(media);
      const play = media.querySelector('[data-video-play]');
      if (play) play.hidden = !template?.content.querySelector('video, iframe');
    }
    for (const overlay of this.querySelectorAll('.hb__overlay')) {
      const style =
        device === 'mobile' && overlay.dataset.overlayStyleMobile !== 'inherit'
          ? overlay.dataset.overlayStyleMobile
          : overlay.dataset.overlayStyleDesktop;
      overlay.classList.remove(
        'hb__overlay--direct',
        'hb__overlay--gradient',
        'hb__overlay--pill',
        'hb__overlay--below',
      );
      overlay.classList.add(`hb__overlay--${style}`);
    }

    const ctaGroup = this.querySelector('[data-cta-group]');
    if (ctaGroup) {
      ctaGroup.hidden = false;
      ctaGroup.hidden = ![...ctaGroup.children].some(isShown);
    }

    this.resolveScrollPrompt();
    const footer = this.querySelector('.hb__footer');
    if (footer) {
      footer.hidden = false;
      footer.hidden = ![...footer.children].some(isShown);
    }
    this.onScroll();
    this.media.forEach((media) => {
      if (isShown(media) && isInViewport(media)) this.tryAutoplay(media);
    });
  }

  onResize() {
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => this.refresh());
  }

  onScroll() {
    if (this.dataset.progressMode !== 'synchronized') return;
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      const steps = [...this.querySelectorAll('[data-progress-step]')].filter(isShown);
      if (!steps.length) return;
      const top = this.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(this.getBoundingClientRect().height, 1);
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / distance));
      const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      steps.forEach((step, index) => {
        if (index === active) step.dataset.active = '';
        else delete step.dataset.active;
      });
    });
  }

  handleClick(event) {
    const play = event.target.closest('[data-video-play]');
    if (play && this.contains(play)) {
      const media = play.closest('[data-media]');
      if (media.dataset.modal === 'true' && media.dataset.playbackMode !== 'background') {
        this.openDialog(media, play);
      } else {
        this.startVideo(media, true);
      }
      return;
    }
    const pause = event.target.closest('[data-video-pause]');
    if (pause && this.contains(pause)) {
      this.stopVideo(pause.closest('[data-media]'));
      return;
    }
    if (event.target.closest('[data-dialog-close]')) {
      this.dialog?.close();
      return;
    }
    const prompt = event.target.closest('[data-scroll-prompt]');
    if (prompt && this.contains(prompt)) this.scrollToTarget(prompt);
  }

  sourceTemplate(media) {
    const device = this.device();
    let selected = device;
    if (selected === 'mobile' && media.dataset.sourceMobile === 'inherit') selected = 'tablet';
    if (selected === 'tablet' && media.dataset.sourceTablet === 'inherit') selected = 'desktop';
    return media.querySelector(`template[data-video-template][data-device="${selected}"]`);
  }

  autoplayEnabled(media) {
    const device = this.device();
    const value =
      device === 'mobile'
        ? media.dataset.autoplayMobile
        : device === 'tablet'
          ? media.dataset.autoplayTablet
          : media.dataset.autoplayDesktop;
    return media.dataset.playbackMode === 'background' && value === 'true' && !isReducedMotion();
  }

  tryAutoplay(media) {
    if (!isShown(media) || !isInViewport(media) || !this.autoplayEnabled(media) || media.dataset.playing === 'true')
      return;
    const template = this.sourceTemplate(media);
    if (!template?.content.querySelector('video, iframe')) return;
    if (template.dataset.source !== 'shopify' && !canLoadExternalAutoplay()) return;
    this.startVideo(media, false);
  }

  createPlayer(media, userInitiated) {
    const template = this.sourceTemplate(media);
    if (!template) return null;
    const element = template.content.querySelector('video, iframe')?.cloneNode(true);
    if (!element) return null;
    const muted = media.dataset.playbackMode === 'background' || !userInitiated || media.dataset.mute === 'true';
    if (element.tagName === 'VIDEO') {
      element.controls = media.dataset.controls === 'true' && media.dataset.playbackMode !== 'background';
      element.muted = muted;
      element.loop = media.dataset.loop === 'true';
      element.playsInline = true;
      element.preload = 'metadata';
      element.addEventListener('error', () => this.stopVideo(media), { once: true });
    } else {
      const raw = element.dataset.src;
      if (!raw) return null;
      let url;
      try {
        url = new URL(raw, window.location.origin);
      } catch {
        return null;
      }
      const allowed = ['www.youtube.com', 'www.youtube-nocookie.com', 'youtube.com', 'player.vimeo.com'];
      if (!allowed.includes(url.hostname)) return null;
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('mute', muted ? '1' : '0');
      url.searchParams.set('muted', muted ? '1' : '0');
      url.searchParams.set('loop', media.dataset.loop === 'true' ? '1' : '0');
      if (url.hostname.includes('youtube')) {
        url.searchParams.set('enablejsapi', '1');
        url.searchParams.set('playsinline', '1');
        url.searchParams.set('controls', media.dataset.controls === 'true' ? '1' : '0');
        if (media.dataset.loop === 'true') url.searchParams.set('playlist', url.pathname.split('/').pop());
      }
      element.src = url.toString();
      element.loading = 'eager';
    }
    return element;
  }

  startVideo(media, userInitiated) {
    if (!media || media.dataset.playing === 'true' || (!userInitiated && !isShown(media))) return;
    const template = this.sourceTemplate(media);
    if (!template) return;
    if (template.dataset.source !== 'shopify' && !userInitiated && !canLoadExternalAutoplay()) return;
    const player = this.createPlayer(media, userInitiated);
    if (!player) return;
    const mount = media.querySelector('[data-player]');
    if (!mount) return;
    mount.replaceChildren(player);
    media.dataset.playing = 'true';
    if (player.tagName === 'VIDEO') {
      const result = player.play();
      result?.catch(() => this.stopVideo(media));
    }
  }

  stopVideo(media) {
    if (!media) return;
    const mount = media.querySelector('[data-player]');
    const video = mount?.querySelector('video');
    video?.pause();
    mount?.replaceChildren();
    delete media.dataset.playing;
  }

  openDialog(media, trigger) {
    if (!this.dialog || !this.dialogMedia || !this.sourceTemplate(media)) return;
    const player = this.createPlayer(media, true);
    if (!player) return;
    this.lastTrigger = trigger;
    this.dialogMedia.replaceChildren(player);
    this.dialog.showModal();
    if (player.tagName === 'VIDEO') player.play()?.catch(() => this.dialog.close());
  }

  closeDialog() {
    this.dialogMedia?.querySelector('video')?.pause();
    this.dialogMedia?.replaceChildren();
    if (this.dialog?.open) this.dialog.close();
    if (this.lastTrigger?.isConnected) this.lastTrigger.focus();
    this.lastTrigger = null;
  }

  resolveScrollPrompt() {
    const prompt = this.querySelector('[data-scroll-prompt]');
    if (!prompt) return;
    const target = this.findScrollTarget(prompt);
    prompt.hidden = !target;
  }

  findScrollTarget(prompt) {
    if (prompt.dataset.target === 'anchor') {
      const anchor = prompt.dataset.anchor;
      return anchor ? document.getElementById(anchor) : null;
    }
    let sibling = this.closest('.shopify-section')?.nextElementSibling;
    while (sibling && !isShown(sibling)) sibling = sibling.nextElementSibling;
    return sibling;
  }

  scrollToTarget(prompt) {
    const target = this.findScrollTarget(prompt);
    if (!target) return;
    const header = document.querySelector('.header');
    const headerHeight =
      header && getComputedStyle(header).position === 'fixed' ? header.getBoundingClientRect().height : 0;
    const promoHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-top-offset')) || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - promoHeight - 12;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: isReducedMotion() ? 'auto' : 'smooth' });
  }

  handleEditorEvent(event) {
    if (!event.target?.contains(this)) return;
    if (event.type === 'shopify:section:unload') {
      this.media.forEach((media) => this.stopVideo(media));
      this.closeDialog();
    } else this.refresh();
  }

  handleBlockSelect(event) {
    const block = event.detail?.blockId
      ? this.querySelector(`#HeroBlock-${CSS.escape(event.detail.blockId)}`)
      : event.target;
    if (!block || !this.contains(block)) return;
    block.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
  }
}

export default () => {
  if (!customElements.get('hero-banner-advanced')) customElements.define('hero-banner-advanced', HeroBannerAdvanced);
};
