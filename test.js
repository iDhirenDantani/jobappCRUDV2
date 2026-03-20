let pattern = "$chi^bhi-901[ahmebadad";
let symbolString = "$^-[]";
let symbols = [
  ["$", "first_name"],
  ["^", "last_name"],
  ["-", "phone"],
  ["[", "email"],
  ["]", "city"],
];
let currentSymbol = pattern.charAt(0)

for (let index = 0; index < pattern.length; index++) {
  let j = index + 1;

  while (symbolString.indexOf(pattern.charAt(j)) == -1) {
    j++;
  }

  if (index == 0) {
    console.log(currentSymbol, pattern.substring(1, j));
    currentSymbol = pattern.charAt(j);
  } else {
    console.log(currentSymbol, pattern.substring(index, j));
    currentSymbol = pattern.charAt(j);
  }
  index = j
}
