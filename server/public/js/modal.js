//open the popup
document.getElementById('button-playnow').addEventListener('click',function(){
    document.querySelector('.bg-modal').style.display = 'flex';
});

//close the popup
document.querySelector('.close').addEventListener('click',function(){
    document.querySelector('.bg-modal').style.display = 'none';
});
