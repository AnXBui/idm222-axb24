let projectLink;
let scrollPosition = 0;
let dur = 0.25;
let dur2 = dur * 2;
let dur3 = dur * 4;
let durmin2 = dur / 2;
let durmin3 = dur / 4;
let lastScrollTop = 0;
let delta = 30;
let transitioning = false;
let firstPage = true;


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);
gsap.defaults({
  ease: "power2",
  duration: dur
});

function reParent(target, parent) {
  parent.appendChild(target);
}



const getMousePos = (e) => {
  let posx = 0;
  let posy = 0;
  if (!e) e = window.event;
  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return {
    x: posx,
    y: posy
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getWidthTotal(targets) {
  let total = 0;
  targets.forEach(target => {
    total += target.clientWidth;
  });
  return total;
}


function hasClass(element, clss) {
  return element.classList.contains(clss);
}

function addClass(element, clss) {
  element.classList.add(clss);
}

function rmvClass(element, clss) {
  element.classList.remove(clss);
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function getViewport() {

  var viewPortWidth;
  var viewPortHeight;

  if (typeof window.innerWidth != 'undefined') {
    viewPortWidth = window.innerWidth,
      viewPortHeight = window.innerHeight
  }

  else if (typeof document.documentElement != 'undefined' &&
    typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
    viewPortWidth = document.documentElement.clientWidth,
      viewPortHeight = document.documentElement.clientHeight
  }

  else {
    viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
      viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
  }
  return [viewPortWidth, viewPortHeight];
}

function enableBodyScroll() {
  if (document.readyState === 'complete') {
    document.body.style.position = '';
    document.body.style.overflowY = '';

    if (document.body.style.marginTop) {
      const scrollTop = -parseInt(document.body.style.marginTop, 10);
      document.body.style.marginTop = '';
      window.scrollTo(window.pageXOffset, scrollTop);
    }
  } else {
    window.addEventListener('load', enableBodyScroll);
  }
}

function disableBodyScroll({
  savePosition = false
} = {}) {
  if (document.readyState === 'complete') {
    if (document.body.scrollHeight > window.innerHeight) {
      if (savePosition) document.body.style.marginTop = `-${window.pageYOffset}px`;
      document.body.style.position = 'fixed';
      document.body.style.overflowY = 'scroll';
    }
  } else {
    window.addEventListener('load', () => disableBodyScroll({
      savePosition
    }));
  }
}



// Page Transitions
const swupJS = [{
    from: '(.*)',
    to: '(.*)',
    in: (next) => {
      if (menu.active) {
        menu.hide();
      }
      // disableBodyScroll();
      gsap.fromTo(document.querySelector('#swup'), 0.75, {
        opacity: 0
      }, {
        opacity: 1,
        onComplete: () => {
          next();
        }
      });
    },
    out: (next) => {
      document.querySelector('#swup').style.opacity = 1;

      gsap.fromTo(document.querySelector('#swup'), 0.75, {
        opacity: 1
      }, {
        opacity: 0,
        onComplete: () => {
          gsap.set(window, {
            scrollTo: 0
          });
          next();
        }
      });
    }
  },
  {
    from: '(.*)',
    to: 'project',
    in: (next) => {
      if (menu.active) {
        menu.hide();
      }
      disableBodyScroll();

      gsap.fromTo('#swup', 1, {
        opacity: 0
      }, {
        opacity: 1,
        onComplete: () => {
          transitioning = false;
          // enableBodyScroll();
          next();
        }
      });

    },
    out: (next) => {
      let target = projectLink;
      let state = Flip.getState(target);
      transitioning = true;
      document.querySelector('.fixedCoverWrapper').appendChild(target);
      addClass(projectLink, 'fullScreen');

      let tl = gsap.timeline({
        onComplete: () => {
          next();
        }
      });

      let flip = Flip.from(state, {
        duration: 0.75,
        ease: 'expo',
        zIndex: 5
      });

      tl.fromTo('#swup', 0.75, {
        opacity: 1
      }, {
        opacity: 0
      }, "start");
      tl.add(flip, "start")
    }
  }
]

const swupOptions = {
  linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[data-swup-link]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
  plugins: [new SwupJsPlugin(swupJS), new SwupA11YPlugin(), new SwupPreloadPlugin()]
}

const swup = new Swup(swupOptions);

class Menu {
  constructor(header) {
    this.menu = header;
    this.main = header.querySelector('.menuMain');
    this.bar = header.querySelector('.menuBar');
    this.animate = header.querySelectorAll('*[data-animate]');
    // this.animate2 = header.querySelectorAll('*[data-animate="2"]');
    // this.animate3 = header.querySelectorAll('*[data-animate="3"]');


    this.button = {
      main: header.querySelector('.menuButton'),
      top: header.querySelector('.barTop'),
      cen1: header.querySelector('.barCenter1'),
      cen2: header.querySelector('.barCenter2'),
      bot: header.querySelector('.barBot')
    }
    this.links = header.querySelectorAll('a[data-swup-link]');
    this.fill = header.querySelector('.menuFill');

    this.active = false;
    this.animating = false;
    this.didScroll = false;
    this.scrollPos = 0;

    gsap.set(this.button.cen1, {
      transformOrigin: "center"
    });
    gsap.set(this.button.cen2, {
      transformOrigin: "center"
    });
    gsap.set(this.fill, {
      transformOrigin: "90% 10%"
    });

    this.in = gsap.timeline({
        paused: true,
        onComplete: () => {
          this.animating = false;
          disableBodyScroll({
            savePosition: true
          });
        }
      })
      .to(this.button.top, dur, {
        scaleX: 0
      }, 'start')
      .to(this.button.bot, dur, {
        scaleX: 0
      }, 'start')
      .to(this.button.cen1, dur, {
        rotate: 45
      }, 'start')
      .to(this.button.cen2, dur, {
        rotate: -45
      }, 'start')
      .fromTo(this.fill, dur2, {
        scale: 0
      }, {
        scale: 1
      }, 'start')
      .fromTo(this.main, dur, {
        alpha: 0
      }, {
        alpha: 1
      }, 'start+=0.15')
      .fromTo(this.animate, dur, {
        alpha: 0,
        yPercent: 10
      }, {
        alpha: 1,
        yPercent: 0,
        stagger: durmin2
      }, 'start+=0.2')


    this.out = gsap.timeline({
        paused: true,
        onComplete: () => {
          addClass(this.menu, 'inactive');
          this.animating = false;
        }
      })
      .to(this.main, dur, {
        alpha: 0
      }, 'start')
      .to(this.fill, dur2, {
        scale: 0
      }, 'start')
      .to(this.button.top, dur, {
        scaleX: 1
      }, 'start')
      .to(this.button.bot, dur, {
        scaleX: 1
      }, 'start')
      .to(this.button.cen1, dur, {
        rotate: 0
      }, 'start')
      .to(this.button.cen2, dur, {
        rotate: 0
      }, 'start')

    this.init();

  }

  init() {
    this.button.main.addEventListener('click', () => {
      if (!this.animating) {
        if (this.active) {
          this.hide();
        } else {
          this.show();
        }
      }

    })

    this.links.forEach((element) => {
      element.addEventListener('click', () => {
        let href = element.href;
        if (!this.animating && this.active) {
          if (href.indexOf(window.location.href) > -1) {
            this.hide();
          }
        }
      })
    });

    window.addEventListener('scroll', () => {
      this.didScroll = true;
    })

    // run hasScrolled() and reset didScroll status
    setInterval(() => {
      if (this.didScroll) {
        this.hasScrolled();
        this.didScroll = false;
      }
    }, 150);

  }

  hasScrolled() {
    let st = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(lastScrollTop - st) <= delta)
      return;

    if (this.active || this.animating) return;

    if (st > lastScrollTop) {
      addClass(this.menu, 'up');
      // Scroll Down
    } else {
      // Scroll Up
      rmvClass(this.menu, 'up');
    }

    lastScrollTop = st;
  }

  showBar() {
    rmvClass(this.menu, 'up');
    lastScrollTop = 0;
  }

  hide() {
    // if (this.active){
    this.animating = true;
    enableBodyScroll();
    if (document.querySelector('.projectControlTitle')){
      gsap.to('.projectControlTitle',0.25,{opacity: 1, yPercent: 0});
      gsap.to('.projectControlPrev',0.25,{opacity: 1, xPercent: 0});
      gsap.to('.projectControlNext',0.25,{opacity: 1, xPercent: 0});
    }

    rmvClass(this.bar, 'dark');
    this.out.restart();
    this.active = false;
  }

  show() {
    // this.in.restart(false, true);
    this.animating = true;
    // addClass(document.querySelector('main'),'bodyLock');
    rmvClass(this.menu, 'inactive');
    addClass(this.bar, 'dark');
    this.in.restart();
    this.active = true;

    if (document.querySelector('.projectControlTitle')){
      gsap.to('.projectControlTitle',0.25,{opacity: 0, yPercent: -100});
      gsap.to('.projectControlPrev',0.25,{opacity: 0, xPercent: -100});
      gsap.to('.projectControlNext',0.25,{opacity: 0, xPercent: 100});
    }
  }
}

let viewSize = getViewport()[0];
let observerList = [];

const scrollHandler = (entries, observer) => {
  entries.forEach(entry => {
    let elem = entry.target;
    observerList.push(elem);
    if (entry.isIntersecting) {
      ScrollTrigger.refresh();
      effectObserver.unobserve(elem);
      const index = entries.indexOf(elem);
      if (index > -1) {
        observerList.splice(index, 1);
      }
    }
  })
}

var effectObserver = new IntersectionObserver(scrollHandler);



class PageEffects {
  constructor() {

    this.fxArray = [];
    this.paraArray = [];
    this.saveStyles = [];
    this.killList = [];
    this.nextProject = null;

    this.refetch();

    // const refactor = this.refactor();

    // document.addEventListener('resize', refactor);
  }


  fetchSections() {
    if (document.querySelector('.effectWrapper')) {
      document.querySelectorAll('.effectWrapper').forEach(element => {
        const effect = new EffectSection(element);
        const preStyles = effect.getPreStyles();
        if (preStyles != null) {
          preStyles.forEach(style => {
            this.saveStyles.push(style);
          })
        }
        this.fxArray.push(effect);
      })
    }

    if (document.querySelector('.projectConclusion')) {
      this.nextProject = document.querySelector('.projectConclusion');
      let tl = gsap.timeline();

      const scroll = ScrollTrigger.create({
        trigger: this.nextProject,
        start: "top bottom",
        animation: tl,
        // markers: true,
        toggleActions: "play complete restart reset"
      });

      tl.to('.projectControls', dur, {
        alpha: 0
      });

      this.killList.push(scroll);
    }
  }

  killAll() {
    if (this.killList) {
      this.killList.forEach(effect => {
        effect.kill();
      })
    }

    if (observerList != null) {
      observerList.forEach(elem => {
        effectObserver.unobserve(elem);
      })
    }

    ScrollTrigger.clearMatchMedia();
    this.fxArray = [];
    this.paraArray = [];
    this.saveStyles = [];
    this.killList = [];
    this.nextProject = null;
  }

  refetch() {
    if (this.saveStyles) {
      this.saveStyles = [];
    }
    this.fetchSections();
    this.applyEffects();
  }


  applyEffects() {
    ScrollTrigger.saveStyles(this.saveStyles);
    ScrollTrigger.matchMedia({
      // desktop only
      "(min-width: 992px)": () => {
        this.fxArray.forEach(fx => {
          fx.getEffects('desktop');
          this.killList.push(fx);
        })

        this.paraArray.forEach(parallax => {
          parallax.getParallax();
          this.killList.push(parallax);
        })

        return () => {
          // console.log('killing via media');
        }
      },

      "all": () => {
        this.fxArray.forEach(fx => {
          fx.getEffects();
        })
      }
    });
  }

}

class EffectSection {
  constructor(section) {
    this.wrapper = section;
    this.elements = this.wrapper.querySelectorAll('[data-effect]');
    this.killList = [];
    this.saveStyles = [];
    this.tl = gsap.timeline();
  }

  fadeout(el) {
    let media = 'all';
    let effect = gsap.to(el, 0.5, {
      alpha: 0
    })

    let scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: "top top",
      end: getViewport()[1],
      animation: effect,
      scrub: true
    });

    this.killList.push({
      media: 'all',
      fx: effect
    });
    this.killList.push({
      media: 'all',
      fx: scroll
    });
  }

  fadein(el) {
    let media = 'all';
    let effect = gsap.fromTo(el, 0.5, {
      alpha: 0
    }, {
      alpha: 1
    })
    //
    let scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: "top center",
      animation: effect,
      once: true
    });
    //
    this.killList.push({
      media: 'all',
      fx: effect
    });
    this.killList.push({
      media: 'all',
      fx: scroll
    });
  }

  autoSlide(el) {
    let endPoint = '90% top';
    let startPoint = '10% bottom';
    if (hasClass(this.wrapper, 'autoSticky')) {
      startPoint = 'top top';
      endPoint = 'bottom bottom';
    }

    this.wrapper.querySelectorAll('.lazyload').forEach(img => {
      addClass(img, 'lazypreload');
    })


    let slide = gsap.timeline();
    let scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: startPoint,
      end: endPoint,
      animation: slide,
      scrub: true
    });

    let zoom = el.dataset.scale;
    let children = el.querySelectorAll('picture');
    if (zoom) {
      slide.to(children, 0.1, {
        scale: 0.75
      })
    }

    if (hasClass(this.wrapper, 'autoSticky')) {
      slide.to(el, 1, {
        xPercent: -100,
        x: '+=100vw',
        ease: 'none'
      });
    } else {
      slide.fromTo(el, 1, {
        x: '+=40vw',
        xPercent: 0
      }, {
        xPercent: -100,
        x: '+=20vw',
        ease: 'none'
      });
    }



    if (zoom) {
      slide.to(children, 0.1, {
        scale: 1
      })
    }

    effectObserver.observe(this.wrapper);

    this.killList.push({
      media: 'desktop',
      fx: slide
    });
    this.killList.push({
      media: 'desktop',
      fx: scroll
    });
  }

  getPreStyles() {
    this.elements.forEach((element) => {
      let effect = element.dataset.effect;
      switch (effect) {

        case 'autoSlide':
          this.saveStyles.push(element);
          break;

        default:
          // console.log('no effect');
      }
    })
    return this.saveStyles;
  }



  getEffects(media = 'all') {
    this.elements.forEach(element => {
      let effect = element.dataset.effect;
      switch (effect) {
        case 'fadeout':
          if (media == 'all') {
            this.fadeout(element);
          }
          break;

        case 'fadein':
          if (media == 'all') {
            this.fadein(element);
          }
          break;

        case 'autoSlide':
          if (media == 'desktop') {
            this.autoSlide(element);
          }
          break;

        default:
          // console.log('no effect');
      }
    })


  }

  kill(media = 'all') {
    if (this.killList) {
      this.killList.forEach(effect => {
        if (effect.media == media || media == 'all') {
          effect.fx.kill();
          // console.log('effect killed');
        }
      });
    }

    if (media == 'all') {
      this.wrapper = null;
      this.elements = null;
      this.killList = null;
      this.saveStyles = null;
    }
  }
}

class ParallaxSection {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.active = false;
    this.running = false;
    this.killList = [];

    if (this.wrapper.querySelectorAll('[data-depth]')) {
      this.active = true;
      this.layers = this.wrapper.querySelectorAll('[data-depth]');
      this.tl = gsap.timeline({
        paused: true
      });
    }
  }

  getParallax() {

    const scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: "top bottom",
      end: "bottom top",
      animation: this.tl,
      markers: true,
      scrub: true
    });


    this.layers.forEach((layer, index) => {
      const depth = layer.dataset.depth;
      const mov = -(100 * depth);

      this.tl.fromTo(layer, 1, {
        yPercent: -mov,
        ease: 'none'
      }, {
        yPercent: mov,
        ease: 'none'
      }, "start");
    });
    this.killList.push(scroll);
    // this.killList.push(this.tl);
  }

  kill() {
    if (this.active) {
      this.killList.forEach(effect => {
        effect.kill();
      })
    }
  }
}






let menu = new Menu(document.querySelector('header'));



function init() {
  document.querySelectorAll("[data-swup-transition='project']").forEach(link => new HoverImgF(link));


  document.querySelectorAll('[data-swup-preload]').forEach(link => {
    const url = link.getAttribute("href");
    swup.preloadPage(url);
  })

  ScrollTrigger.refresh();

  lastScrollTop = 0;

  if (projectLink != null) {
    gsap.to(projectLink, 0.5, {
      alpha: 0,
      delay: 0.5,
      onComplete: () => {
        projectLink.remove();
        enableBodyScroll();
      }
    })
  } else {
    enableBodyScroll();
  }
  menu.showBar();
}

// document cleanup function for Javascript stuff
function unload() {
  pageEffects.killAll();
}

swup.on('clickLink', (e) => {
  let link = e.delegateTarget.getAttribute('data-swup-transition');
  if (link == 'project') {
    projectLink = e.target;
  }
});

swup.on('samePageWithHash', (e) => {

  let target = e.delegateTarget;
  let id = target.getAttribute('href');
  let offset = document.querySelector(id).offsetHeight;
  gsap.to(window, 0.5, {
    scrollTo: id
  });
  // }
});

class HoverImgF {
  constructor(el) {
    this.DOM = {
      el: el
    };
    this.DOM.reveal = document.createElement('div');
    this.DOM.reveal.innerHTML = `<div class="hoverInner"></div>`;
    this.DOM.reveal.className = 'hoverReveal';
    this.DOM.el.appendChild(this.DOM.reveal);
    this.initEvents();
    this.DOM.reveal.style.visibility = "hidden";
  }
  initEvents() {
    this.positionElement = (ev) => {
      const mousePos = getMousePos(ev);
      const docScrolls = {
        left: document.body.scrollLeft + document.documentElement.scrollLeft,
        top: document.body.scrollTop + document.documentElement.scrollTop
      };
      const objectWidth = this.DOM.reveal.offsetWidth / 2;
      const objectHeight = this.DOM.reveal.offsetHeight / 2;
      const topY = mousePos.y - objectHeight - docScrolls.top;
      const topX = mousePos.x - objectWidth - docScrolls.left;
      gsap.set(this.DOM.reveal, {
        x: topX,
        y: topY
      })
    };
    this.mouseenterFn = (ev) => {
      this.positionElement(ev);
      this.showImage();
      this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
      this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
    };
    this.mousemoveFn = ev => requestAnimationFrame(() => {
      this.positionElement(ev);
    });
    this.mouseleaveFn = () => {
      this.hideImage();
      this.DOM.el.removeEventListener('mousemove', this.mousemoveFn);
      this.DOM.el.removeEventListener('mouseleave', this.mouseleaveFn);
    };

    this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);

  }
  showImage() {
    this.tl = gsap.timeline({
        onStart: () => {
          this.DOM.reveal.style.visibility = "visible";
        }
      })
      .add('begin')
      .fromTo(this.DOM.reveal, 0.25, {
        alpha: 0,
        scale: 0
      }, {
        alpha: 1,
        scale: 1
      }, 'begin')
  }
  hideImage() {
    this.tl = gsap.timeline({
        onComplete: () => {
          this.DOM.reveal.style.visibility = "hidden";
        }
      })
      .add('begin')
      .to(this.DOM.reveal, 0.25, {
        opacity: 0,
        scale: 0

      }, 'begin')
  }
}




gsap.set('body', {
  alpha: 0
});
window.addEventListener('load', () => {
  gsap.to('body', 0.5, {
    alpha: 1
  });
});
init();
let pageEffects = new PageEffects();

swup.on('contentReplaced', () => {
  firstPage = false;
  init();
  pageEffects.refetch();
});
swup.on('willReplaceContent', unload);
