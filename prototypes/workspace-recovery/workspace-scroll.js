(() => {
  const minimumThumb = 24;
  const railInset = 7;

  function mountScrollbar(content, index) {
    const modal = content.parentElement;
    modal.classList.add('rings-scroll-modal');
    content.classList.add('rings-scroll-body');
    content.id ||= `rings-scroll-content-${index + 1}`;

    const rail = document.createElement('div');
    rail.className = 'rings-floating-scroll';
    rail.hidden = true;
    rail.tabIndex = 0;
    rail.setAttribute('role', 'scrollbar');
    rail.setAttribute('aria-label', '滚动弹窗正文');
    rail.setAttribute('aria-controls', content.id);
    rail.setAttribute('aria-orientation', 'vertical');
    rail.setAttribute('aria-valuemin', '0');
    const thumb = document.createElement('span');
    thumb.className = 'rings-floating-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    rail.append(thumb);
    modal.append(rail);

    let scrollRange = 0;
    let thumbTravel = 0;
    let drag = null;
    let pendingUpdate = false;

    function syncPosition() {
      const ratio = scrollRange ? content.scrollTop / scrollRange : 0;
      thumb.style.top = `${ratio * thumbTravel}px`;
      rail.setAttribute('aria-valuenow', String(Math.round(content.scrollTop)));
    }

    function updateSize() {
      pendingUpdate = false;
      const box = content.getBoundingClientRect();
      const height = Math.max(0, content.clientHeight - railInset * 2);
      scrollRange = content.scrollHeight - content.clientHeight;
      rail.hidden = !box.height || height < minimumThumb || scrollRange <= 1;
      if (rail.hidden) return;
      const thumbHeight = Math.max(minimumThumb, height * content.clientHeight / content.scrollHeight);
      thumbTravel = height - thumbHeight;
      rail.style.top = `${box.top - modal.getBoundingClientRect().top - modal.clientTop + railInset}px`;
      rail.style.height = `${height}px`;
      thumb.style.height = `${thumbHeight}px`;
      rail.setAttribute('aria-valuemax', String(Math.round(scrollRange)));
      syncPosition();
    }

    function queueUpdate() {
      if (pendingUpdate) return;
      pendingUpdate = true;
      requestAnimationFrame(updateSize);
    }

    content.addEventListener('scroll', syncPosition, { passive: true });
    const resize = new ResizeObserver(queueUpdate);
    resize.observe(content);
    for (const child of content.children) resize.observe(child);
    new MutationObserver(records => {
      if (records.some(record => record.target === content && record.type === 'childList')) {
        for (const child of content.children) resize.observe(child);
      }
      queueUpdate();
    }).observe(content, { childList: true, subtree: true, attributes: true, characterData: true });

    rail.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      rail.focus({ preventScroll: true });
      if (event.target !== thumb) {
        const relative = event.clientY - rail.getBoundingClientRect().top - thumb.offsetHeight / 2;
        if (thumbTravel) content.scrollTop = relative / thumbTravel * scrollRange;
      }
      drag = { id: event.pointerId, y: event.clientY, scrollTop: content.scrollTop };
      rail.setPointerCapture(event.pointerId);
      rail.dataset.dragging = '';
    });
    rail.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId || !thumbTravel) return;
      content.scrollTop = drag.scrollTop + (event.clientY - drag.y) / thumbTravel * scrollRange;
    });
    rail.addEventListener('lostpointercapture', () => {
      drag = null;
      delete rail.dataset.dragging;
    });
    rail.addEventListener('keydown', event => {
      const offsets = { ArrowUp: -40, ArrowDown: 40, PageUp: -content.clientHeight, PageDown: content.clientHeight };
      if (event.key === 'Home') content.scrollTop = 0;
      else if (event.key === 'End') content.scrollTop = scrollRange;
      else if (Object.hasOwn(offsets, event.key)) content.scrollTop += offsets[event.key];
      else return;
      event.preventDefault();
    });
    queueUpdate();
  }

  document.querySelectorAll('.modal > .modal-scroll, .modal > .mbody').forEach(mountScrollbar);
})();
