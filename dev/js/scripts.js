gsap.registerPlugin(ScrollToPlugin, Flip);

function reParent(target, parent){
  parent.appendChild(target);
}

function addClass(element, clss){
  element.classList.add(clss);
}



// Page Transitions
// Each object in array is a animation, from generic to specific.
// from, to could be String (matched route), Regex, string of custom transition (from data-swup-transition)
// use onComplete next or next() after animation to trigger transition.
let projectLink;
let scrollPosition = 0;


const swupJS = [
  {
    from: '(.*)',
    to: '(.*)',
    in: (next) => {
      gsap.fromTo(document.querySelector('#swup'), 0.25, {
        opacity: 0
      },
      {
        opacity: 1,
        onComplete: next
      });
    },
    out: (next) => {
      // console.log('code out');
      document.querySelector('#swup').style.opacity = 1;
      gsap.fromTo(document.querySelector('#swup'), 0.25,
      {
        opacity: 1
      },
      {
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
      },
      {
        scale: 1,
        onComplete: next
      });
    },
    out: (next) => {
      // console.log('code out');
      document.querySelector('#swup').style.opacity = 1;
      gsap.fromTo(document.querySelector('#swup'), 0.25,
      {
        scale: 1
      },
      {
        scale: 0,
        onComplete: next
      });
    }
  },
  {
    from: '(.*)',
    to: 'project',
    in: (next) => {


      gsap.to(document, 0.5, {scrollTo: 0, onComplete:() => {
        if (projectLink != null){
          projectLink.remove();
          next();
        }
      }});
    },
    out: (next) => {

      let target = projectLink;
      let state = Flip.getState(target);
      // addClass(target,'fullScreen');
      document.querySelector('.fixedCoverWrapper').appendChild(target);
      addClass(projectLink, 'fullScreen');

      gsap.set(document,{scrollTo:scrollPosition});
      console.log(scrollPosition);

      let tl = gsap.timeline();

      let flip = Flip.from(state, {duration: 0.75, zIndex: 5, onComplete:() => {
        console.log('animated transiiton');
        next();
      }});

      tl.fromTo('#swup',0.5,{opacity:1},{opacity:0}, "start");
      tl.to(document,0.5,{scrollTo: 0});
      tl.add(flip, "start")



    }
  }
]

const swupOptions ={
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


// document init function, based on page #id or object inside page
function init() {
    gsap.to(window, 0.01, {scrollTo:0});
    if (document.querySelector('.home')) {
      // let text = new Console('Home Page');
        // something like new Carousel('#carousel')
    }

    if (document.querySelector('.about')) {
      // let text = new Console('About Page');

        // something like $('#lightbox').lightbox()
    }

    if (document.querySelector('.contact')) {
      // let text = new Console('Contact Page');
        // ...
    }

    // if (document.querySelector("a[data-swup-transition='project']")) {
    //   // let text = new Console('Contact Page');
    //   document.querySelectorAll("a[data-swup-transition='project']").forEach((element) => {
    //     // console.log('this is a project link ' + element);
    //   });
    //     // ...
    // }
}

// document cleanup function for Javascript stuff
function unload(){
  gsap.globalTimeline.clear();

  if (document.querySelector('#carousel')) {
      // could use but be careful on effects on transition?
      // clearing all timeline and tween in page

        // carousel.destroy()
    }
}

swup.on('clickLink', (e) => {
  // console.log(e.target);
  projectLink = e.target;
});
//
// document.querySelector('.flipButton').addEventListener('click', () => {
//   let target = document.querySelector('.imageContent');
//   // console.log(projectLink);
//   let state = Flip.getState(target);
//   addClass(target,'fullScreen');
//   // document.querySelector('.fixedCoverWrapper').appendChild(target);
//
//   Flip.from(state, {duration: 0.5, zIndex: 5, onComplete:() => {
//     console.log('animated transiiton');
//   }});
// })




init();
swup.on('contentReplaced', init);
swup.on('willReplaceContent', unload);
