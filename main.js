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
let originalText = "";


const textDiv = document.querySelector('.text');
const nextBtn = document.querySelector('#Next-btn');
const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const timeEl = document.querySelector('#time');
timeEl.textContent = `Time: ${timeLeft}`;
let currentStory = null;

fetch('/api/stories')
  .then(response => response.json())
  .then(data => {
    currentStory = data[0];
    renderStory(currentIndex);
    
  })
  .catch(error => console.error(error));
  document.querySelector('.text').addEventListener('keydown', () => {
    if (!timerStarted) {
      startTimer();
      timerStarted = true;
    }
  });
  

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
      alert("Time's up!");
    }
  }, 900);
}

textDiv.addEventListener('keydown', (event) => {
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
  document.getElementById('mistakes').textContent =` Mistakes: ${mistakeCount}`;
  numWords = userInput.trim().split(/\s+/).length;
  document.getElementById('wpm').textContent = `Words: ${numWords}`;
  let correctChars = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === originalText[i]) {
      correctChars++;
    }
  }
  let accuracy = originalText.length > 0 ? (correctChars / originalText.length) * 100 : 0;
  document.getElementById('accuracy').textContent = `Accuracy: ${accuracy.toFixed(2)}%`;

});
resetBtn.addEventListener('click', reSet);
renderStory(currentIndex);
nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % stories.length;
  renderStory(currentIndex);
  mistakeCount = 0;
  document.getElementById('mistakes').textContent = `Mistakes: ${mistakeCount}`;
  document.getElementById('wpm').textContent = `WPM: 0`;
  document.getElementById('accuracy').textContent = `Accuracy: 0%`;

  timeLeft = 60;
  timeEl.textContent = `Time: ${timeLeft}`;
  clearInterval(timerInterval);
  timerStarted = false;
});

function reSet(){
    userInput="";
    mistakeCount = 0
    document.getElementById('mistakes').textContent = `Mistakes: ${mistakeCount}`;
    document.getElementById('wpm').textContent = `WPM: 0`;
    document.getElementById('accuracy').textContent = `Accuracy: 0%`;

    const spans = Array.from(document.querySelectorAll('#title span, #content span'));
    spans.forEach(span => span.style.color = 'gray');
    renderStory(currentIndex);
    timeLeft = 60;
    timeEl.textContent = `Time: ${timeLeft}`;
    clearInterval(timerInterval);
    timerStarted = false;
  }
