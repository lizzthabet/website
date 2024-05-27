// sourceText variables

var sourceText1 = 'Without the long enough room. Proverbs terry looked ready to sleep. Stan called you sleep from abby. Something really good thing to cut herself. Should be happy for so much time. Well enough for being so good. Except for dinner on those tears. Clock in those tears and waved back. Other side of course if maddie. Izumi called from terry pressed the hall. Someone else to stop in his daddy. Snyder had been helping her tears. Beside him out with my apartment. Okay terry has he liked to turn. Know her feet away from thinking. Psalm terry helped her feet away. Dick laughed as well but the window.';

var sourceText2 = 'Of the countless living things raging and frantic extensively squealing Windy and wet the next thing i knew';

var sourceText3 = 'Please help her father had enough. Please help adam watched charlie. Cried charlie quickly shook hands. There would it might be right. Apologized adam warned charlie realized he answered. Pressed charlie ran his hands. Grinned adam took her go through. Being so much attention was actually going. Uncle adam followed him away. Well for vera smiled good. Answered his family for lunch time that. Got back with each other hand. Mumbled charlie went to know. Maggie and so vera looked over. Explained to keep quiet for some rest. Replied the hotel door open and then. Shouted adam leaned forward to back. Hesitated adam placed on our baby. Hearing the new piano and sighed. Maggie was struggling to sound asleep. Shook her hands and mike. Chuckled adam looked at villa rosa. Our baby is the bathroom door. Remarked charlie held her at this. Melissa barnes and greeted them inside charlie. Grinned at villa rosa before. Villa rosa had gone down. Does that could go wash up here. Could use it just said. Closing the doors of this is adam. Behind him from under the house. Attention was seated her hair away.'

function generatePoem(text, lines, wordsPerLine) {
  var wordPairObject = makeWordPairs(removePunctuation(text));
  var poem = [];
  while (lines >= 0){
    poem.push(writeLine(wordPairObject, wordsPerLine));
    lines--;
  }
  return(poem.join('<br/>'));
}

function removePunctuation(string) {
  var punctuation = '?\'.,:-!;';
  string = string.toLowerCase();
  
  // base case
  if (string.length === 0){
    return '';
  }
  
  // recursive case checks for punctuation marks
  if (punctuation.indexOf(string[0]) === -1){
    return string[0] + removePunctuation(string.slice(1));
  } else {
    return removePunctuation(string.slice(1));
  }
}

// makes the word pair object with string input text
function makeWordPairs(string) {
  var wordsArray = string.split(' ');
  var wordPairs = {};
  
  // for each word in the array
  for (var i = 0; i < wordsArray.length - 1; i++) {
    var currentWord = wordsArray[i];
    var followingWord = wordsArray[i + 1];
    
    // if key doesn't exist, make key with word array
    if (!wordPairs[currentWord]){
      wordPairs[currentWord] = [followingWord];
    } 
    // if key does exist, push a new word to the array
    else {
      wordPairs[currentWord].push(followingWord);
    }
  }
  return wordPairs;
}


// picks a random index value of a given array
function randomIndexValue(array){
  return Math.floor(Math.random()*(array.length));
}

// picks a random word key, then a random word from its array
function choseWord(object, number) {
  var keyArray = Object.keys(object);
  // uses the random index helper function
  var randomWordKey = keyArray[randomIndexValue(keyArray)];
  
  if (object[randomWordKey] === []){
    randomWordKey = keyArray[randomIndexValue(object)];
  }
  else {
    // find a random word in the array
    var randomWord = object[randomWordKey][randomIndexValue(object[randomWordKey])];
  }
 return randomWordKey + ' ' + randomWord; // MODIFIED
}

function writeLine(object, numberOfWords) {
  var line = [];
  for (var word = 1; word <= numberOfWords; word++) {
    line.push(choseWord(object));
  }
  return line.join(' ');
}
