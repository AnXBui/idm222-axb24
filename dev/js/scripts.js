gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);

function reParent(target, parent) {
  parent.appendChild(target);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getWidthTotal(targets) {
  let total = 0;
  targets.forEach(target => {
    console.log(target.clientWidth);
    total += target.clientWidth;
    // total -= 32;
    // console.log('total is ' + total);
  });
  // console.log(total);
  // console.log(total);
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

  // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
  if (typeof window.innerWidth != 'undefined') {
    viewPortWidth = window.innerWidth,
      viewPortHeight = window.innerHeight
  }

  // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
  else if (typeof document.documentElement != 'undefined' &&
    typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
    viewPortWidth = document.documentElement.clientWidth,
      viewPortHeight = document.documentElement.clientHeight
  }

  // older versions of IE
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
// Each object in array is a animation, from generic to specific.
// from, to could be String (matched route), Regex, string of custom transition (from data-swup-transition)
// use onComplete next or next() after animation to trigger transition.
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
// let navBarHeight = document.querySelector('.menuBar').offsetHeight;
// console.log(navBarHeight);


gsap.defaults({
  ease: "power2",
  duration: dur
});


const swupJS = [{
    from: '(.*)',
    to: '(.*)',
    in: (next) => {
      menu.hide();
      gsap.fromTo(document.querySelector('#swup'), 0.25, {
        opacity: 0
      }, {
        opacity: 1,
        onComplete: next
      });
    },
    out: (next) => {
      // console.log('code out');
      document.querySelector('#swup').style.opacity = 1;
      gsap.fromTo(document.querySelector('#swup'), 0.25, {
        opacity: 1
      }, {
        opacity: 0,
        onComplete: next
      });
    }
  },
  {
    from: '(.*)',
    to: 'project',
    in: (next) => {
      disableBodyScroll();

      gsap.fromTo('#swup',0.5,{opacity: 0},{opacity: 1, onComplete: () => {
        transitioning = false;
        enableBodyScroll();
        next();
      }});

    },
    out: (next) => {
      let target = projectLink;
      let state = Flip.getState(target);
      transitioning = true;
      document.querySelector('.fixedCoverWrapper').appendChild(target);
      addClass(projectLink, 'fullScreen');

      let tl = gsap.timeline({onComplete:() => {
        next();
      }});

      let flip = Flip.from(state, {
        duration: 1,
        ease: 'expo',
        zIndex: 5
        }
      );

      tl.fromTo('#swup', 0.5, {
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
    // console.log('init');

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
    }, 250);

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

    // rmvClass(document.querySelector('main'),'bodyLock');

    rmvClass(this.bar, 'dark');
    this.out.restart();
    this.active = false;
    // }
  }

  show() {
    // this.in.restart(false, true);
    this.animating = true;
    // addClass(document.querySelector('main'),'bodyLock');
    rmvClass(this.menu, 'inactive');
    addClass(this.bar, 'dark');
    this.in.restart();
    this.active = true;
  }
}

let viewSize = getViewport()[0];
let observerList = [];

const scrollHandler = (entries, observer) => {
  entries.forEach(entry => {
    let elem = entry.target;
    observerList.push(elem);
    if (entry.isIntersecting) {
      console.log('entry viewed');
      ScrollTrigger.refresh();
      effectObserver.unobserve(elem);
      const index = entries.indexOf(elem);
      if (index > -1){
        observerList.splice(index,1);
      }
    }
  })
}

var effectObserver = new IntersectionObserver (scrollHandler);



class PageEffects {
  constructor() {

    this.fxArray = [];
    this.paraArray = [];
    this.saveStyles = [];
    this.killList = [];

    this.refetch();

    const refactor = this.refactor();

    document.addEventListener('resize', refactor);
  }


  fetchSections() {
    if (document.querySelector('.effectWrapper')) {
      document.querySelectorAll('.effectWrapper').forEach(element => {
        const effect = new EffectSection(element);
        const preStyles = effect.getPreStyles();
        if (preStyles != null){
          preStyles.forEach(style => {
            this.saveStyles.push(style);
          })
        }
        this.fxArray.push(effect);
      })
    }

    if (document.querySelector('.parallaxSection')) {
      document.querySelectorAll('.parallaxSection').forEach(element => {
        // console.log('parallax created');
        const parallax = new ParallaxSection(element);

        if (parallax.active) {
          parallax.layers.forEach(layer => {
            this.saveStyles.push(layer);
            this.paraArray.push(parallax);
          })
        }
      })
    }
  }

  killAll() {
    // console.log('killing all page effects');

    if (this.killList){
      this.killList.forEach(effect => {
        effect.kill();
      })
    }

    if (observerList != null){
      observerList.forEach(elem => {
        effectObserver.unobserve(elem);
      })
    }

    ScrollTrigger.clearMatchMedia();
    this.fxArray = [];
    this.paraArray = [];
    this.saveStyles = [];
    this.killList = [];


  }

  refetch(){
    if (this.saveStyles){
      this.saveStyles = [];
    }
    this.fetchSections();
    this.applyEffects();
  }

  refactor(){
    console.log('refactored');
  }


  applyEffects() {
    ScrollTrigger.saveStyles(this.saveStyles);
    // console.log('applying page effects');
    ScrollTrigger.matchMedia({
      // desktop only
      "(min-width: 992px)": () => {
        this.fxArray.forEach(fx => {
          fx.getEffects('desktop');
          this.killList.push(fx);
        })

        this.paraArray.forEach(parallax => {
          // console.log('playing parallax');
          parallax.getParallax();
          // console.log('parallax played');
          this.killList.push(parallax);
          // fx.getEffects('desktop');
        })

        return () => {
          console.log('killing via media');
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
    console.log('fadeout');
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

    this.killList.push({media:'all', fx: effect});
    this.killList.push({media:'all', fx: scroll});
  }

  fadein(el){
    let media = 'all';
    console.log('fadein');
    let effect = gsap.fromTo(el, 0.5, {
      alpha: 0
    },{alpha: 1})
    //
    let scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: "top center",
      animation: effect,
      once: true
    });
    //
    this.killList.push({media:'all', fx: effect});
    this.killList.push({media:'all', fx: scroll});
  }

  autoSlide(el) {
    let endPoint = '90% top';
    let startPoint = '10% bottom';
    if (hasClass(this.wrapper, 'autoSticky')) {
      startPoint = 'top top';
      endPoint = 'bottom bottom';
    }

    this.wrapper.querySelectorAll('.lazyload').forEach(img => {
      addClass(img,'lazypreload');
    })

    console.log('autoSliding elements');

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
        ease: 'linear'
      });
    }else {
      slide.fromTo(el, 1,{x:'+=40vw', xPercent: 0},{
        xPercent: -100,
        x: '+=20vw',
        ease: 'linear'
      });
    }



    if (zoom) {
      slide.to(children, 0.1, {
        scale: 1
      })
    }

    effectObserver.observe(this.wrapper);

    this.killList.push({media:'desktop', fx: slide});
    this.killList.push({media:'desktop', fx: scroll});
  }

  getPreStyles() {
    this.elements.forEach((element) => {
      let effect = element.dataset.effect;
      switch (effect) {

        case 'autoSlide':
            this.saveStyles.push(element);
          break;

        default:
          console.log('no effect');
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
            console.log('autoSlide');
          }
          break;

        default:
          console.log('no effect');
      }
    })


  }

  kill(media = 'all') {
    if (this.killList){
      this.killList.forEach(effect => {
        if (effect.media == media || media == 'all'){
          effect.fx.kill();
          console.log('effect killed');
        }
      });
    }

    if (media == 'all'){
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
    this.killList = [];

    if (this.wrapper.querySelectorAll('[data-depth]')) {
      this.active = true;
      this.layers = this.wrapper.querySelectorAll('[data-depth]');
    }
  }

  getParallax() {
    // console.log('parallaxed')
    this.tl = gsap.timeline({});
    let scroll = ScrollTrigger.create({
      trigger: this.wrapper,
      start: "top bottom",
      end: "bottom top",
      animation: this.tl,
      scrub: true
    });

    gsap.utils.toArray(this.layers).forEach(layer => {
      let depth = layer.dataset.depth;
      let chain = 0;
      if (layer.dataset.hasOwnProperty('chain')) {
        chain = (layer.dataset.chain - 1) * 0.25;
      }
      let mov = -(100 * depth);
      this.tl.fromTo(layer, 0.25, {
        yPercent: -mov
      }, {
        yPercent: mov,
        ease: 'linear'
      }, 0);
    });
    this.killList.push(scroll);
    this.killList.push(this.tl);
  }

  kill() {
    if (this.active) {
      console.log('killing parallax');
      this.killList.forEach(effect => {
        effect.kill();
      })
    }
  }
}






let menu = new Menu(document.querySelector('header'));
let homeProj;
// console.log(menu);



// document init function, based on page #id or object inside page
function init() {
  console.log('init');

  document.querySelectorAll('[data-swup-preload]').forEach(link => {
    const url = link.getAttribute("href");
    swup.preloadPage(url);
  })

  ScrollTrigger.refresh();

  enableBodyScroll();
  lastScrollTop = 0;
  if (projectLink != null) {
    gsap.to(projectLink, 1, {
      alpha: 0,
      delay: 0.5,
      onComplete: () => {
        projectLink.remove();
      }
    })
  }
  menu.showBar();

  // if (document.querySelector('.effectWrapper')) {
  // }
}

// document cleanup function for Javascript stuff
function unload() {
  pageEffects.killAll();
}





swup.on('clickLink', (e) => {
  // console.log('target clicked is ' + e.delegateTarget);
  let link = e.delegateTarget.getAttribute('data-swup-transition');
  if (link == 'project') {
    projectLink = e.target;
  }
});

swup.on('samePageWithHash', (e) => {
  // console.log('target clicked is ' + e.delegateTarget);
  // console.log(e);
  let target = e.delegateTarget;
  let id = target.getAttribute('href');
  // console.log(id);
  let offset = document.querySelector(id).offsetHeight;
  // console.log(offset);
  gsap.to(window, 0.5, {
    scrollTo: id
  });
  // }
});







init();
let pageEffects = new PageEffects();

swup.on('contentReplaced', () => {
  console.log('contentReplaced');
  firstPage = false;
  init();
  pageEffects.refetch();
});
swup.on('willReplaceContent', unload);
