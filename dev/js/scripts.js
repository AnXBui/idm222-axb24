gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);


function reParent(target, parent) {
  parent.appendChild(target);
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
    to: 'scale',
    in: (next) => {
      // console.log('code worked!');
      gsap.fromTo(document.querySelector('#swup'), 0.25, {
        scale: 0
      }, {
        scale: 1,
        onComplete: next
      });
    },
    out: (next) => {
      // console.log('code out');
      document.querySelector('#swup').style.opacity = 1;
      gsap.fromTo(document.querySelector('#swup'), 0.25, {
        scale: 1
      }, {
        scale: 0,
        onComplete: next
      });
    }
  },
  {
    from: '(.*)',
    to: 'project',
    in: (next) => {
      disableBodyScroll();
      let tl = gsap.timeline();
      tl.to(document, 0.5, {
        scrollTo: 0
      });
      if (projectLink != null) {
        tl.to(projectLink, 0.5, {
          alpha: 0,
          onComplete: () => {
            if (projectLink != null) {
              projectLink.remove();
              enableBodyScroll();
              next();
              tl.kill();
              transitioning = false;
            }
          }
        })
      }

    },
    out: (next) => {


      let target = projectLink;
      console.log('target animated is ' + target);
      let state = Flip.getState(target);
      transitioning = true;
      // addClass(target,'fullScreen');
      document.querySelector('.fixedCoverWrapper').appendChild(target);
      addClass(projectLink, 'fullScreen');

      gsap.set(document, {
        scrollTo: scrollPosition
      });

      let tl = gsap.timeline();

      let flip = Flip.from(state, {
        duration: 0.75,
        zIndex: 5,
        onComplete: () => {
          next();
        }
      });

      tl.fromTo('#swup', 0.5, {
        opacity: 1
      }, {
        opacity: 0
      }, "start");
      tl.to(document, 0.5, {
        scrollTo: 0
      });
      tl.add(flip, "start")



    }
  }
]

const swupOptions = {
  linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[data-swup-link]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
  plugins: [new SwupJsPlugin(swupJS), new SwupA11YPlugin()]
}

const swup = new Swup(swupOptions);


// Create function and classes to define here, include clean up function
// class Console{
//   constructor(input){
//     let text = input;
//     console.log('this page is ' + input);
//   }
//
//   cleanup(){
//     let text = null;
//   }
//
//   reset(){
//
//   }
// }

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

let viewSize = getViewport()[0]

class HomeProject {
  constructor() {
    this.main = document.querySelector('.homeProjectList');
    this.target = this.main.querySelector('.groupScroller');
    this.tl = gsap.timeline();
    this.active = false;

    this.start();
  }

  start() {
    this.active = true;
    let obj = this;
    console.log('starting home anim');
    console.log(obj);
    ScrollTrigger.matchMedia({
      // desktop only
      "(min-width: 992px)": () => {
        obj.tl.to(obj.target, 0.5, {
          yPercent: -100,
          ease: 'linear',
          scrollTrigger: {
            trigger: obj.main,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true
          }
        });
      }
    });
  }

  kill() {
    this.active = false;
    this.tl.kill();
    this.main = null;
    this.target = null;
  }
}


let menu = new Menu(document.querySelector('header'));
let homeProj;
// console.log(menu);


// document init function, based on page #id or object inside page
function init() {
  gsap.to(window, 0.01, {
    scrollTo: 0
  });
  // rmvClass(document.querySelector('main'),'bodyLock');
  enableBodyScroll();
  lastScrollTop = 0;
  if (projectLink != null) {
    gsap.to(projectLink, 0.15, {
      alpha: 0,
      delay: 0.15,
      onComplete: () => {
        projectLink.remove();
      }
    })
  }

  menu.showBar();
  // menu.hide();

  if (document.querySelector('.homeProjectList')) {
    console.log('home projected');
    homeProj = new HomeProject();
  }


  if (document.querySelector('.about')) {
    // let text = new Console('About Page');

    // something like $('#lightbox').lightbox()
  }

  if (document.querySelector('.contact')) {
    // let text = new Console('Contact Page');
    // ...
  }
}

// document cleanup function for Javascript stuff
function unload() {
  gsap.globalTimeline.clear();

  if (homeProj != null) {
    homeProj.kill();
    homeProj = null;
  }

  if (document.querySelector('#carousel')) {
    // could use but be careful on effects on transition?
    // clearing all timeline and tween in page

    // carousel.destroy()
  }
}





swup.on('clickLink', (e) => {
  console.log('target clicked is ' + e.delegateTarget);
  let link = e.delegateTarget.getAttribute('data-swup-transition');
  if (link == 'project') {
    projectLink = e.target;
  }
});

swup.on('samePageWithHash', (e) => {
  console.log('target clicked is ' + e.delegateTarget);
  console.log(e);
  // let link = e.delegateTarget.getAttribute('data-swup-transition');
  // if (link == 'project'){
  //   projectLink = e.target;
  let target = e.delegateTarget;
  let id = target.getAttribute('href');
  console.log(id);
  let offset = document.querySelector(id).offsetHeight;
  console.log(offset);
  gsap.to(window, 0.5, {
    scrollTo: id
  });
  // }
});







init();
swup.on('contentReplaced', init);
swup.on('willReplaceContent', unload);
