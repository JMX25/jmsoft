const start = document.querySelector('#startDate');
const end = document.querySelector('#endDate');
const btn = document.querySelector('#btn');
start.addEventListener('change', (event) => {
    if(start.value > end.value){
        btn.disabled = true;
    }else{
        btn.disabled = false;
    }
});

end.addEventListener('change', (event) => {
    if(start.value > end.value){
        btn.disabled = true;
        window.alert('End date can\'t be earlier than starting date');
    }else{
        btn.disabled = false;
    }
});