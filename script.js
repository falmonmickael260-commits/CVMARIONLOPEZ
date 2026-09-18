(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var isDesktop = window.matchMedia('(min-width:900px)').matches;
  var body = document.body;
  var hasGSAP = typeof window.gsap !== 'undefined';

  if(hasGSAP && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }

  /* ============================================================ */
  /* VIDEO INTRO (Remotion)                                         */
  /* ============================================================ */
  var videoIntro = document.getElementById('videoIntro');
  var introVideo = document.getElementById('introVideo');
  var introSkip = document.getElementById('introSkip');
  var ALREADY_PLAYED_KEY = 'ml-intro-played';

  function endIntro(){
    body.classList.remove('no-scroll');
    if(videoIntro){
      videoIntro.classList.add('hide');
      setTimeout(function(){ videoIntro.style.display = 'none'; }, 950);
    }
    var heroPhotoPanel = document.querySelector('.hero-photo-panel');
    if(heroPhotoPanel){ heroPhotoPanel.classList.add('in-view'); }
    runHeroReveal();
  }

  var skipIntro = reduceMotion || sessionStorage.getItem(ALREADY_PLAYED_KEY) === '1';

  // Triggered at the bottom of this file, once heroCharEls / runHeroReveal are ready.
  function initIntro(){
    if(skipIntro){
      if(videoIntro){ videoIntro.style.display = 'none'; }
      body.classList.remove('no-scroll');
      var heroPhotoPanelEarly = document.querySelector('.hero-photo-panel');
      if(heroPhotoPanelEarly){ heroPhotoPanelEarly.classList.add('in-view'); }
      runHeroReveal();
    } else {
      try{ sessionStorage.setItem(ALREADY_PLAYED_KEY, '1'); }catch(e){}
      var introFallback = setTimeout(endIntro, 7500);
      if(introVideo){
        introVideo.addEventListener('ended', function(){ clearTimeout(introFallback); endIntro(); });
        introVideo.addEventListener('error', function(){ clearTimeout(introFallback); endIntro(); });
        var playPromise = introVideo.play();
        if(playPromise && playPromise.catch){ playPromise.catch(function(){ clearTimeout(introFallback); endIntro(); }); }
      } else {
        clearTimeout(introFallback);
        endIntro();
      }
      if(introSkip){
        introSkip.addEventListener('click', function(){
          clearTimeout(introFallback);
          if(introVideo){ introVideo.pause(); }
          endIntro();
        });
      }
    }
  }

  /* ============================================================ */
  /* CUSTOM CURSOR                                                  */
  /* ============================================================ */
  if(isFinePointer && !reduceMotion){
    body.classList.add('has-cursor');
    var cursor = document.getElementById('cursor');
    var cursorLabel = document.getElementById('cursorLabel');
    var ringX, ringY, dotX, dotY, labelX, labelY;

    if(hasGSAP){
      ringX = gsap.quickTo(cursor.querySelector('.cursor-ring'), 'x', { duration:.5, ease:'power3.out' });
      ringY = gsap.quickTo(cursor.querySelector('.cursor-ring'), 'y', { duration:.5, ease:'power3.out' });
      dotX = gsap.quickTo(cursor.querySelector('.cursor-dot'), 'x', { duration:.15, ease:'power3.out' });
      dotY = gsap.quickTo(cursor.querySelector('.cursor-dot'), 'y', { duration:.15, ease:'power3.out' });
      labelX = gsap.quickTo(cursorLabel, 'x', { duration:.4, ease:'power3.out' });
      labelY = gsap.quickTo(cursorLabel, 'y', { duration:.4, ease:'power3.out' });
    }

    window.addEventListener('mousemove', function(e){
      cursor.style.left = '0px'; cursor.style.top = '0px';
      if(hasGSAP){
        ringX(e.clientX); ringY(e.clientY);
        dotX(e.clientX); dotY(e.clientY);
        labelX(e.clientX); labelY(e.clientY + 34);
      } else {
        cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      }
      cursor.classList.add('active');
    }, { passive:true });

    document.addEventListener('mouseleave', function(){ cursor.classList.remove('active'); });

    var hoverTargets = 'a, button, [data-magnetic], .skill-block, .manifesto-row';
    document.addEventListener('mouseover', function(e){
      var t = e.target.closest(hoverTargets);
      if(t){
        cursor.classList.add('hover');
        cursorLabel.textContent = t.tagName === 'A' && t.hasAttribute('download') ? 'Télécharger' : (t.closest('a') ? 'Voir' : '');
      }
    });
    document.addEventListener('mouseout', function(e){
      var t = e.target.closest(hoverTargets);
      if(t){ cursor.classList.remove('hover'); }
    });
  }

  /* ============================================================ */
  /* MAGNETIC BUTTONS                                               */
  /* ============================================================ */
  if(hasGSAP && isFinePointer && !reduceMotion){
    document.querySelectorAll('[data-magnetic]').forEach(function(el){
      var xTo = gsap.quickTo(el, 'x', { duration:.5, ease:'elastic.out(1,0.4)' });
      var yTo = gsap.quickTo(el, 'y', { duration:.5, ease:'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width/2) * 0.28);
        yTo((e.clientY - r.top - r.height/2) * 0.35);
      });
      el.addEventListener('mouseleave', function(){ xTo(0); yTo(0); });
    });
  }

  /* ============================================================ */
  /* NAV: scroll state + active section                            */
  /* ============================================================ */
  var nav = document.getElementById('siteNav');
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  var navLinks = document.querySelectorAll('.desktop-links a[data-section]');
  var sections = Array.prototype.map.call(navLinks, function(a){
    return document.getElementById(a.getAttribute('data-section'));
  }).filter(Boolean);

  if('IntersectionObserver' in window && sections.length){
    var navIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.id;
          navLinks.forEach(function(a){
            a.classList.toggle('active', a.getAttribute('data-section') === id);
          });
        }
      });
    }, { rootMargin:'-45% 0px -45% 0px', threshold:0 });
    sections.forEach(function(s){ navIO.observe(s); });
  }

  /* ============================================================ */
  /* MOBILE MENU                                                    */
  /* ============================================================ */
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.classList.toggle('no-scroll', open);
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      body.classList.remove('no-scroll');
    });
  });

  /* ============================================================ */
  /* SCROLL PROGRESS ROUTE (desktop)                                */
  /* ============================================================ */
  var scrollRouteFill = document.getElementById('scrollRouteFill');
  var scrollRoutePin = document.getElementById('scrollRoutePin');
  if(scrollRouteFill && scrollRoutePin){
    var ticking = false;
    function updateScrollRoute(){
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var p = height > 0 ? Math.min(1, scrolled / height) : 0;
      scrollRouteFill.style.height = (p * 100) + '%';
      scrollRoutePin.style.top = (p * 100) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if(!ticking){ requestAnimationFrame(updateScrollRoute); ticking = true; }
    }, { passive:true });
    updateScrollRoute();
  }

  /* ============================================================ */
  /* HERO: split-letter reveal                                     */
  /* ============================================================ */
  function splitChars(el){
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    text.split('').forEach(function(ch){
      var span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
    return el.querySelectorAll('.char');
  }

  var heroCharEls = [];
  document.querySelectorAll('[data-split]').forEach(function(el){
    if(reduceMotion){ return; }
    heroCharEls.push(splitChars(el));
  });

  var heroRevealDone = false;
  function runHeroReveal(){
    if(heroRevealDone) return;
    heroRevealDone = true;
    var heroEyebrowRow = document.querySelector('.hero .eyebrow-row');
    if(reduceMotion){
      document.querySelectorAll('.hero [data-reveal]').forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    if(hasGSAP){
      var tl = gsap.timeline({ defaults:{ ease:'expo.out' } });
      if(heroEyebrowRow){ gsap.set(heroEyebrowRow, { opacity:0, y:16 }); tl.to(heroEyebrowRow,{opacity:1,y:0,duration:.6},0); }
      heroCharEls.forEach(function(chars, i){
        gsap.set(chars, { yPercent:110, opacity:0, rotateZ:4 });
        tl.to(chars, { yPercent:0, opacity:1, rotateZ:0, duration:.9, stagger:.028 }, i === 0 ? .1 : .16);
      });
      gsap.set('.hero-role', { opacity:0, y:16 });
      tl.to('.hero-role', { opacity:1, y:0, duration:.7 }, '-=.5');
      gsap.set('.hero-line', { opacity:0, y:16 });
      tl.to('.hero-line', { opacity:1, y:0, duration:.7 }, '-=.55');
      gsap.set('.hero-tags', { opacity:0, y:16 });
      tl.to('.hero-tags', { opacity:1, y:0, duration:.7 }, '-=.55');
      gsap.set('.hero-actions', { opacity:0, y:16 });
      tl.to('.hero-actions', { opacity:1, y:0, duration:.7 }, '-=.55');
    } else {
      document.querySelectorAll('.hero [data-reveal]').forEach(function(el){ el.classList.add('in-view'); });
      heroCharEls.forEach(function(chars){ chars.forEach(function(c){ c.style.transform='none'; c.style.opacity=1; }); });
    }
  }

  /* ============================================================ */
  /* GENERIC SCROLL REVEAL                                         */
  /* ============================================================ */
  var revealEls = document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.15, rootMargin:'0px 0px -8% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ============================================================ */
  /* TIMELINE: route draw + active pin                              */
  /* ============================================================ */
  var timeline = document.getElementById('timeline');
  var timelineFill = document.getElementById('timelineFill');
  var timelineItems = document.querySelectorAll('.timeline-item');

  if(timeline && timelineFill){
    if(hasGSAP && isDesktop && !reduceMotion){
      gsap.to(timelineFill, {
        scaleY:1, ease:'none',
        scrollTrigger:{ trigger:timeline, start:'top 70%', end:'bottom 65%', scrub:.6 }
      });
      timelineItems.forEach(function(item){
        ScrollTrigger.create({
          trigger:item, start:'top 60%', end:'bottom 60%',
          onEnter:function(){ item.classList.add('active'); },
          onEnterBack:function(){ item.classList.add('active'); }
        });
        var bullets = item.querySelectorAll('ul li');
        if(bullets.length){
          gsap.from(bullets, {
            opacity:0, x:-10, duration:.5, stagger:.06, ease:'power2.out',
            scrollTrigger:{ trigger:item, start:'top 75%' }
          });
        }
      });
    } else if('IntersectionObserver' in window){
      var tio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            timelineFill.style.transform = 'scaleY(1)';
            timelineFill.style.transition = 'transform 1.6s ' + 'cubic-bezier(.22,1,.36,1)';
          }
        });
      }, { threshold:.1 });
      tio.observe(timeline);
      var itemIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('active'); }
        });
      }, { threshold:.4 });
      timelineItems.forEach(function(item){ itemIO.observe(item); });
    } else {
      timelineFill.style.transform = 'scaleY(1)';
      timelineItems.forEach(function(item){ item.classList.add('active'); });
    }
  }

  /* ============================================================ */
  /* STATS COUNT-UP                                                 */
  /* ============================================================ */
  var counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        counterIO.unobserve(el);
        if(reduceMotion){ el.textContent = target; return; }
        var startTs = null, duration = 900;
        function step(ts){
          if(!startTs) startTs = ts;
          var p = Math.min(1, (ts - startTs) / duration);
          el.textContent = Math.round(p * target);
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold:.6 });
    counters.forEach(function(el){ counterIO.observe(el); });
  }

  /* ============================================================ */
  /* ROUTE VISUAL (mobility cachet)                                 */
  /* ============================================================ */
  var routeVisual = document.getElementById('routeVisual');
  if(routeVisual && 'IntersectionObserver' in window){
    var rio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          rio.unobserve(entry.target);
        }
      });
    }, { threshold:.3 });
    rio.observe(routeVisual);
  } else if(routeVisual){
    routeVisual.classList.add('in-view');
  }

  /* ============================================================ */
  /* HERO PHOTO PANEL PARALLAX                                      */
  /* ============================================================ */
  var heroPhotoImg = document.querySelector('.hero-photo-frame img');
  if(heroPhotoImg && hasGSAP && isDesktop && !reduceMotion){
    gsap.to(heroPhotoImg, {
      yPercent:10, ease:'none',
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.6 }
    });
  }

  /* ============================================================ */
  /* CONTACT: word split + live clock                              */
  /* ============================================================ */
  document.querySelectorAll('[data-split-words]').forEach(function(el){
    var words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(function(w){ return '<span class="word">' + w + '</span>'; }).join(' ');
  });

  var clockEl = document.getElementById('localClock');
  function updateClock(){
    if(!clockEl) return;
    try{
      var fmt = new Intl.DateTimeFormat('fr-FR', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Paris' });
      clockEl.textContent = fmt.format(new Date());
    } catch(e){}
  }
  updateClock();
  setInterval(updateClock, 30000);

  var fYear = document.getElementById('fYear');
  if(fYear){ fYear.textContent = new Date().getFullYear(); }

  /* ============================================================ */
  /* RESIZE                                                         */
  /* ============================================================ */
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      if(hasGSAP && window.ScrollTrigger){ ScrollTrigger.refresh(); }
    }, 200);
  });

  /* ============================================================ */
  /* KICK OFF INTRO (now that heroCharEls / runHeroReveal exist)    */
  /* ============================================================ */
  initIntro();

})();
