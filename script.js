const level = document.getElementById('slider'),
    container = document.getElementById('container'),
    leadersSection = document.getElementById('leaders')
    header = document.getElementById('app-header'),
    back = document.getElementById('backpicker'),
    cards = document.getElementsByClassName("card"),
    playGround = document.getElementById('playground'),
    cards_field = document.getElementById('cards'),
    cardsTurned = document.getElementsByClassName('card_turned'),
    cardsInactive = document.getElementsByClassName('card_inactive'),
    timer = document.getElementById('timer'),
    levelNum = document.getElementById('levelnumber'),
    current = document.getElementById('current'),
    settings = document.getElementById('settings'),
    newGame = document.createElement('button'),
    startButton = document.createElement('button'),
    userNameInput = document.createElement('input');
//адрес для получения таблицы лидеров
const DB_GET_URL = "https://firestore.googleapis.com/v1/projects/learn-firebase-ja/databases/(default)/documents/MemoLeaderBoard?key=AIzaSyD0EyxZlN5acWPij9qFmCTqCrQp5pyVjVI";

//адрес для создания нового документа (будте внимательны к последнему URL param) первый раз
const DB_POST_URL = "https://firestore.googleapis.com/v1/projects/learn-firebase-ja/databases/(default)/documents/MemoLeaderBoard?key=AIzaSyD0EyxZlN5acWPij9qFmCTqCrQp5pyVjVI&documentId=${ВАШЕ_ИМЯ_И_ФАМИЛЛИЯ_В_CAMELCASE}";

//адрес для изменения вашей записи
const DB_PATCH_URL = "https://firestore.googleapis.com/v1/projects/learn-firebase-ja/databases/(default)/documents/MemoLeaderBoard/maksimGalimov?key=AIzaSyD0EyxZlN5acWPij9qFmCTqCrQp5pyVjVI";

let secCounter = 0,
    matchCounter = 0,
    points,
    userName,
    fetched,
    currentPlayer,
    savedArr,
    myObj = {};


function Leader(name, numberOfPairs, secondsToComplete) {
    this.name = {
        'stringValue': name
    }
    this.numberOfPairs = {
        'integerValue': numberOfPairs
    }
    this.secondsToComplete = {
        'integerValue': secondsToComplete
    }
}


// Start time in seconds(increases by 30 each round)
let totalSecs = 10,
    // Number of levels (up to 25) 
    amountLevels = 20;
level.setAttribute('max', amountLevels)

function createNewGameButton() {
    newGame.classList.add('button');
    newGame.innerText = 'Play again!';
    newGame.onclick = startNewGame;
}

function createStartButton() {
    startButton.classList.add('button');
    startButton.innerText = 'PRESS THE BUTTON TO START!';
    startButton.style.marginTop = '5vh';
    startButton.onclick = gameStarter;
}

function createUserNameInput() {
    userNameInput.classList.add('username_input')
    userNameInput.style.marginTop = '40vh';
    userNameInput.setAttribute('placeholder', 'Enter Your name')
}

function changeBack() {
    for (card of cards) {
        if (!card.classList.contains('card_turned')) {
            card.style.background = back.value
        }
    }
}

function addCards() {
    document.querySelectorAll('.card').forEach(e => e.remove());
    let arOfValues = []
    for (let i = 0; i < level.value; i++) {
        for (let j = 0; j < 2; j++) {}
        for (let k = 0; k < 2; k++) {
            let newCard = document.createElement("div");
            newCard.classList.add('card');
            cards_field.appendChild(newCard);
            arOfValues.push(i);

        }
        arOfValues.sort(() => Math.random() - 0.48);
        let arOfCards = [...cards]
        arOfCards.forEach((card, index) => {
            card.onclick = openCloseCard;
            card.setAttribute('value', arOfValues[index])
        })
        changeBack()
        levelNum.innerText = level.value;
    }
}

function openCloseCard() {
    if (this.classList.contains('card_turned')) {
        this.classList.remove('card_turned')
        this.style.background = back.value;
    } else {
        this.classList.add('card_turned');
        for (let card of cardsTurned) {
            card.style.background = `url('img/${card.getAttribute('value')}.jpeg') no-repeat center center / cover`
        }
    }
    matchingCards();
}

function matchingCards() {
    if (cardsTurned.length > 1 && cardsTurned.length < 3) {
        if (cardsTurned[0].getAttribute('value') === cardsTurned[1].getAttribute('value')) {
            console.log('match!')
            matchCounter++;
            console.log(matchCounter)

            setTimeout(() => {
                cardsTurned[0].style.opacity = '0';
                cardsTurned[1].style.opacity = '0';
                cardsTurned[0].classList.add('card_inactive');
                cardsTurned[1].classList.add('card_inactive');
                cardsTurned[0].classList.remove('card_turned');
                setTimeout(() => {
                    if (cardsTurned.length == 2) {
                        cardsTurned[1].classList.remove('card_turned');
                    } else {
                        cardsTurned[0].classList.remove('card_turned')
                    }
                }, 100)
            }, 500)
        } else {

            setTimeout(() => {
                try {
                    cardsTurned[0].click();
                    setTimeout(() => {
                        cardsTurned[0].click();
                    }, 100)
                } catch (error) {
                    return
                }
            }, 500)
        }
    }
    setTimeout(() => {
        if (cardsInactive.length == cards.length) {
            levelUp();
            addCards();
        }
    }, 1500);
}

function levelUp() {
    totalSecs = totalSecs + 4;
    level.value++;
    if (level.value > amountLevels) {
        congrats();
    }
    levelNum.innerText = level.value;
}

function timerRunner() {

    let mins = Math.floor(totalSecs / 60);
    let secs = totalSecs % 60;
    secs = secs < 10 ? '0' + secs : secs;
    timer.innerText = `${mins}:${secs}`
    totalSecs--;
    secCounter++;
    console.log(secCounter)
    if (totalSecs < 0) {
        gameOver();
    }
}

function startNewGame() {
    location.reload();
}

function gameOver() {
    clearInterval(timerStarter)
    settings.style.display = 'none';
    current.innerText = 'GAME OVER :(';
    container.style.justifyContent = 'center';
    timer.style.display = 'none';
    playGround.style.display = 'none';
    container.append(newGame);
    points = matchCounter / secCounter;
    console.log(points);
    console.log(userName);
    currentPlayer = new Leader(userName, matchCounter, secCounter);
    databaseHandler();
    leadersSection.style.display = 'block'
}

function congrats() {
    gameOver();
    current.innerText = 'VICTORY!!! :)';
    
}

function gameStarter() {
    playGround.style.display = 'flex';
    header.style.display = 'flex';
    timerStarter = setInterval(timerRunner, 1000);
    userName = userNameInput.value;
    startButton.remove();
    userNameInput.remove();
    leadersSection.innerHTML = '';
    leadersSection.style.display = 'none'
}

function avoidCrazyClicking() {
    playGround.style.pointerEvents = 'none';
    setTimeout(() => {
        playGround.style.pointerEvents = 'auto';
    }, 300)
}

function runTheGame() {
    createStartButton();
    createUserNameInput();
    createNewGameButton();
    leadersSection.style.display = 'block'
    playGround.style.display = 'none';
    header.style.display = 'none';
    container.append(userNameInput),
    container.append(startButton);
    createTable()
    for (let card of cards) {
        card.onclick = openCloseCard;
    }
    back.onchange = changeBack;
    level.onchange = addCards;
    let timerStarter = setInterval(timerRunner, 1000);
    clearInterval(timerStarter);
    playGround.addEventListener('click', avoidCrazyClicking)
}

function databaseHandler() {

    fetch(DB_GET_URL).then(response => response.json())
        .then(data => data.documents)
        .then(array => localStorage.setItem('fetched', JSON.stringify(array)))
        .then(function () {
            savedArr = JSON.parse(localStorage.getItem('fetched'));
        })
        .then(() => {
            return savedArr.filter(elem => elem.name === 'projects/learn-firebase-ja/databases/(default)/documents/MemoLeaderBoard/maksimGalimov')[0].fields
        })
        .then((localObj) => {
            console.log(localObj);
            myObj.fields = JSON.parse(JSON.stringify(localObj))
            console.log(myObj)
            for (let key in myObj.fields) {
                if (+(myObj.fields[key].mapValue.fields.numberOfPairs.integerValue) / (+(myObj.fields[key].mapValue.fields.secondsToComplete[Object.keys(myObj.fields[key].mapValue.fields.secondsToComplete)[0]])) < points) {
                    myObj.fields[key].mapValue.fields = new Leader(userName, matchCounter, secCounter);
                    return;
                }
            }

        })
        .then(() => fetch(DB_PATCH_URL, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(myObj)
        }))
        .then(response => console.log(response))
        .then(() => createTable())
}

function createTable () {
fetch(DB_GET_URL).then(response => response.json()).then(data => data.documents).then(array => localStorage.setItem('fetched', JSON.stringify(array))).then(function () {

    savedArr = JSON.parse(localStorage.getItem('fetched'));

    let arrOfLeaders = savedArr.map(el => el.fields.Top_1);

    let sortedArr = arrOfLeaders.sort((a, b) => {
      let arate = (+(a.mapValue.fields.numberOfPairs.integerValue)) / (+(a.mapValue.fields.
          //так как у одного из профилей по ошибке вместо secondsToComplete.integerValue, стоит secondsToComplete.stringValue:
          secondsToComplete[Object.keys(a.mapValue.fields.secondsToComplete)[0]])),
        brate = (+(b.mapValue.fields.numberOfPairs.integerValue)) / (+(b.mapValue.fields.secondsToComplete[Object.keys(b.mapValue.fields.secondsToComplete)[0]]));
      return brate - arate;
    });
    let leadersHeader =document.createElement('h2');
    leadersHeader.classList.add('leaders_header');
    leadersSection.append(leadersHeader);
    let table = document.createElement('table');
    table.style.margin ='0 auto';
    table.style.minWidth ='700px';
    table.innerHTML = `

        <tr style = "margin-bottom: 45px">
          <th id = "place">Place</th>  
          <th id = "name">Name</th>
          <th id = "pairs">Pairs</th>
          <th id = "seconds">Seconds</th>
        </tr>`;
    
    leadersSection.append(table);
  leadersHeader.innerText = 'Table of Leaders!';
    function createRows() {
      for (let i = 0; i < sortedArr.length; i++) {
        let newRow = document.createElement('tr')
        newRow.classList.add('row');
        newRow.classList.add(`row_${i}`);
        table.append(newRow);

        for (let j = 0; j < 4; j++) {
          let newBox = document.createElement('th')
          newBox.classList.add('box');
          newBox.classList.add(`box_${j}`);
          newRow.append(newBox);
          if (newBox.classList.contains('box_0')) {
            newBox.innerText = i + 1;
          }
          if (newBox.classList.contains('box_1')) {
            newBox.innerText = sortedArr[i].mapValue.fields.name.stringValue
          }
          if (newBox.classList.contains('box_2')) {
            newBox.innerText = sortedArr[i].mapValue.fields.numberOfPairs.integerValue
          }
          if (newBox.classList.contains('box_3')) {
            newBox.innerText = sortedArr[i].mapValue.fields.secondsToComplete[Object.keys(sortedArr[i].mapValue.fields.secondsToComplete)[0]]
          }
        }
      }
    }

    createRows();
  })}

runTheGame();
