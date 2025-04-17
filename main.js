import { createServer } from 'miragejs';
import { stories } from './modules/stories';
  createServer({
    routes() {
      this.get('/api/stories', () => {
        return stories;

      });
  
      this.get('/api/stories/:id', (schema, request) => {
        let id = parseFloat(request.params.id);
        return stories.find(story => story.id === id);
      });
    },
  });
let mistakeCount = 0;
let currentIndex = 0;
let userInput = "";
let timeLeft = 60; 
let timerInterval;
let timerStarted = false;
let numWords =0;
let currentStory = {};
let typingStarted = false

const textDiv = document.querySelector('.text');
const nextBtn = document.querySelector('#Next-btn');
const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const timeEl = document.querySelector('#time');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');


fetch('/api/stories')
  .then(response => response.json())
  .then(data => {
    currentStory = data[0];
    renderStory(currentIndex);
    
  })
  .catch(error => console.error(error));

  

function renderStory(index) {
  if (stories.length === 0) return;
  userInput = "";
  const story = stories[index];

  titleEl.innerHTML = "";
  contentEl.innerHTML = "";

  for (let char of story.title) {
    const span = document.createElement('span');
    span.textContent = char;
    titleEl.appendChild(span);
  }

  for (let char of story.content) {
    const span = document.createElement('span');
    span.textContent = char;
    contentEl.appendChild(span);
  }

  textDiv.focus();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft === 0) {
      clearInterval(timerInterval);
       const date = new Date();
       const month =date.getMonth()+1;
       const day = date.getDate();
       const year = date.getFullYear();
       const accuracyText = document.querySelector('#accuracy').textContent;
       const li = document.createElement('li');
       li.textContent = `Date: ${month}/${day}/${year} & 
        ${accuracyText}`;
       document.querySelector("#score-history").appendChild(li);
       modalOverlay.classList.add('show');
    }
  }, 900);
}

function renderTextDiv(event){
  if(!typingStarted) return;
event.preventDefault();

const spans = Array.from(document.querySelectorAll('#title span, #content span'));

if (event.key === 'Backspace') {
  userInput = userInput.slice(0, -1);
} else if (event.key.length === 1) {
  userInput += event.key;
} else if (event.key === 'Enter') {
  userInput += '\n';
}
 mistakeCount = 0;
 checkMistakes(spans);
 updateTop()
 updateAccuracy()

}

 function checkMistakes(spans){
  for (let i = 0; i < spans.length; i++) {
    const char = userInput[i];
    const span = spans[i];

    if (!char) {
      span.style.color = 'gray';
    } else if (char === span.textContent) {
      span.style.color = 'black';
    } else {
      span.style.color = 'red';
      mistakeCount++;
    }
  }
 }

function updateTop(){
  document.getElementById('mistakes').textContent =` Mistakes: ${mistakeCount}`;
  numWords = userInput.trim().split(/\s+/).length;
  document.getElementById('wpm').textContent = `WPM: ${numWords}`;
}
  
function updateAccuracy(){
let correctChars =0;
const spans = Array.from(document.querySelectorAll('#title span, #content span'));
for(let i = 0 ; i < userInput.length && i < spans.length; i++){
  if(userInput[i] === spans[i].textContent){
    correctChars++
  }
}
const accuracy = userInput.length > 0 ?((correctChars / userInput.length)*100).toFixed(1):0;
console.log('accuracy:', accuracy);
document.querySelector('#accuracy').textContent = `Accuracy: ${accuracy}%`;
}

  function renderNext(){
    currentIndex = (currentIndex + 1) % stories.length;
    renderStory(currentIndex);
    reSet()
      }
  
function reSet(){
    userInput="";
    mistakeCount = 0;

    document.getElementById('mistakes').textContent = `Mistakes: ${mistakeCount}`;
    document.getElementById('wpm').textContent = `WPM: 0`;
  document.querySelector('#accuracy').textContent = `Accuracy: 0%`;
    const spans = Array.from(document.querySelectorAll('#title span, #content span'));
    spans.forEach(span => span.style.color = 'gray');
    renderStory(currentIndex);
    timeLeft = 60;
    timeEl.textContent = `Time: ${timeLeft}`;
    clearInterval(timerInterval);
    timerStarted = false;
    typingStarted = false;
    textDiv.focus();
    
  }
  function eventListeners(){
    document.querySelector('#start').addEventListener('click', () => {
      if (!timerStarted) {
        const startImage = document.getElementById('start-image');
    if (startImage) {
      startImage.style.display = 'none';
      if(titleEl){
        titleEl.style.display="block"; 
      }
      if(contentEl){
        contentEl.style.display="block"
      }
    }
        startTimer();
        timerStarted = true;
        typingStarted = true;
        textDiv.focus();
      }
    });
    textDiv.addEventListener('keydown',renderTextDiv);
    nextBtn.addEventListener('click', renderNext);
    resetBtn.addEventListener('click', reSet);
    openModalBtn.addEventListener('click', () => {
      modalOverlay.classList.add('show');
    });
    
    
    closeModalBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('show');
    });
    
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('show');
      }
    })
  }
function init(){
  timeEl.textContent=`Time:${timeLeft}`;
  eventListeners();
}
init()