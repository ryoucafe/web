const today = new Date();
if (today.getMonth() === 3 && today.getDate() === 1) {
    document.documentElement.classList.add('april-fools');
}

document.querySelector('.theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});
