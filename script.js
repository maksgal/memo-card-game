const level = document.getElementById('slider'),
    container = document.getElementById('container'),
    header = document.getElementById('app-header'),
    back = document.getElementById('backpicker'),
    cards = document.getElementsByClassName("card"),
    playGround = document.getElementById('playground'),
    cardsTurned = document.getElementsByClassName('card_turned'),
    timer = document.getElementById('timer'),
    levelNum = document.getElementById('levelnumber'),
    current = document.getElementById('current'),
    settings = document.getElementById('settings'),
    newGame = document.createElement('button'),
    startButton = document.createElement('button');

// Изначальное время в секундах
let totalSecs = 60,
    //количество уровней (до 25)
    amountLevels = 10;

function createNewGameButton() {
    newGame.classList.add('button');
    newGame.innerText = 'Play again!';
    newGame.onclick = startNewGame;
}

function createStartButton() {
    startButton.classList.add('button');
    startButton.innerText = 'PRESS THE BUTTON TO START!';
    startButton.style.marginTop = '45vh';
    startButton.onclick = gameStarter;
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
            playGround.appendChild(newCard);
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
        setTimeout(() => {
        this.classList.remove('card_turned');
        this.style.background = back.value;},300)
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

            setTimeout(() => {
                cardsTurned[0].style.opacity = '0';
                cardsTurned[1].style.opacity = '0';

                setTimeout(() => {
                    cardsTurned[0].remove();
                    cardsTurned[0].remove();
                }, 400);
            }, 500)
        } else {

            setTimeout(() => {
                try {
                    cardsTurned[0].click();
                    cardsTurned[0].click();
                } catch (error) {
                    return
                }
            }, 500)
        }
    }
    setTimeout(() => {
        if (cards.length < 2) {
            levelUp();
            addCards();
        }
    }, 1500);
}

function levelUp() {
    totalSecs = totalSecs + 30;
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
}

function congrats() {
    gameOver();
    current.innerText = 'VICTORY!!! :)';
}

function gameStarter() {
    playGround.style.display = 'flex';
    header.style.display = 'flex';
    timerStarter = setInterval(timerRunner, 1000);
    startButton.remove();
}

function avoidCrazyClicking () {
        playGround.style.pointerEvents = 'none';
        setTimeout(() => {
            playGround.style.pointerEvents = 'auto';
        }, 700)
}

function runTheGame() {
    createStartButton();
    createNewGameButton();
    playGround.style.display = 'none';
    header.style.display = 'none';
    container.append(startButton);
    for (let card of cards) {
        card.onclick = openCloseCard;
    }
    back.onchange = changeBack;
    level.onchange = addCards;
    let timerStarter = setInterval(timerRunner, 1000);
    clearInterval(timerStarter);
    playGround.addEventListener('dblclick', avoidCrazyClicking )

}

runTheGame();



