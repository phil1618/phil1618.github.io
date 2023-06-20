// const Keyboard = window.SimpleKeyboard.default;

// const myKeyboard = new Keyboard({
//   onChange: input => onChange(input),
//   onKeyPress: button => onKeyPress(button)
// });

// const keyboard = new Keyboard({
//   onChange: input => onChange(input),
//   onKeyPress: button => onKeyPress(button)
// });

// function onChange(input){
//   document.querySelector("input").value = input;
//   console.log("Input changed", input);
// }

// function onKeyPress(button){
//   console.log("Button pressed", button);
// }
//import KioskBoard from 'kioskboard';

const KioskBoard = window.KioskBoard
KioskBoard.run('.js-kioskboard-input', {})