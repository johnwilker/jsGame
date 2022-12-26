function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barrier(reverse = false) {
  this.element = newElement('div', 'barrier');

  const border = newElement('div', 'border');
  const body = newElement('div', 'body');

  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setHeight = height => body.style.height = `${height}px`;

}

/* const b = new Barrier(true);
b.setHeight(300);
document.querySelector('[tp-flappy]').appendChild(b.element); */

function BarriersPair(height, opening, x) {
     this.element = newElement('div', 'barriers-pair');

     this.higher = new Barrier(true);
     this.bottom = new Barrier(false);

     this.element.appendChild(this.higher.element);
     this.element.appendChild(this.bottom.element);

     this.randomOpening = () => {
       const higherHeight = Math.random() * (height - opening);

       const bottomHeight = height - opening - higherHeight;

       this.higher.setHeight(higherHeight);

       this.bottom.setHeight(bottomHeight);
     }

     this.getX = () => parseInt(this.element.style.left.split('px')[0]);
     
     this.setX = x => this.element.style.left = `${x}px`;

     this.getWidth = () => this.element.clientWidth;
     
     this.randomOpening();
     this.setX(x);
}     
  
/* const b = new BarriersPair (700, 200, 800);
document.querySelector('[tp-flappy]').appendChild(b.element); */

function Barriers(height, width, opening, space, notifyPoint) {
  this.pairs = [
    new BarriersPair(height, opening, width),
    new BarriersPair(height, opening, width + space),
    new BarriersPair(height, opening, width + space * 2),
    new BarriersPair(height, opening, width + space * 3),
  ];

  const displacement = 4;

  this.animate = () => {
    this.pairs.forEach(pair => {
      pair.setX(pair.getX() - displacement);

      // When the element is out of the game area
      if(pair.getX() < - pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length);
        pair.randomOpening();
      };

      const middle = width / 2;
      const crossedTheMiddle = pair.getX() + displacement >= middle && pair.getX() < middle;
        if (crossedTheMiddle) notifyPoint();
    });
  }
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement('img', 'bird');
  this.element.src = '/public/images/bird.png';

  this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
  this.setY = y => this.element.style.bottom = `${y}px`;

  window.onkeydown = e => flying = true;
  window.onkeyup = e => flying = false;

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : - 5);
    const maxHeight = gameHeight - this.element.clientHeight;

    if(newY <= 0) {
      this.setY(0);
    } else if( newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  }
  
  this.setY(gameHeight / 2);
}

function Progress() {
  this.element = newElement('span', 'progress');

  this.updatePoints = points => {
    this.element.innerHTML = points;
  }

  this.updatePoints(0);
}

/*
const barriers = new Barriers(700, 1200, 200, 400);
const bird = new Bird(700);
const gameArea = document.querySelector('[tp-flappy]');
gameArea.appendChild(new Progress().element);
gameArea.appendChild(bird.element);
barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));
setInterval( () => {
  barriers.animate();
  bird.animate();
}, 20); */

function Overlap(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  return horizontal && vertical;
}

function Collided(bird, barriers) {
  let collided = false;

  barriers.pairs.forEach( barriersPair => {
    if(!collided) {

      const higher = barriersPair.higher.element;
      const bottom = barriersPair.bottom.element;

      collided = Overlap(bird.element, higher)
        || Overlap(bird.element, bottom);
    };
  });

  return collided;
}

function FlappyBird() {
  let points = 0;

  const gameArea = document.querySelector('[tp-flappy]');
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(height, width, 250, 400,
    () => progress.updatePoints(++points));

  const bird = new Bird(height);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);

  barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));

  this.start = () => {

    const timer = setInterval( () => {
      barriers.animate();
      bird.animate();

      if(Collided(bird, barriers)) {
        clearInterval(timer)
      };
    }, 20);
  }
}

new FlappyBird().start();