function randomNumbers(numeros) {
  let array = [];
  for (i = 0; i < parseInt(numeros); i++) {
    let randomNum = Math.floor(Math.random() * (2 - 1 + 1) + 1);
    let firstObj = {};
    firstObj[randomNum] = 1;
    array.push(firstObj);
  }
  const obj = {};
  array.forEach((objeto) => {
    const [key] = Object.keys(objeto);
    obj[key] = obj[key] ? obj[key] + 1 : 1;
  });

  return obj;
}

process.on("message", (msg) => {
  const numbers = randomNumbers(msg);
  process.send(numbers);
});
