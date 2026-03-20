let searchString  = "$Dhiren^Dantani_Dhiren@gmail.com@9316113472"

const dolPos = searchString.indexOf('$');
const caretPos = searchString.indexOf('^');

if(dolPos !== -1){
    let start = dolPos + 1;
    let end = (caretPos !== -1) ? caretPos : searchString.length;
    
    let firstame = searchString.substring(start,end).trim();

    console.log(firstame);
}
