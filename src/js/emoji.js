const emoji = '😀 😁 😂 😃 😄 🤣 😅 😆 😇 😉 😊 🙂 🙃 😋 😌 😍 🥰 😘 😗 😙 😚 🤪 😜 😝 😛 🤑 😶 😡 😱 😨 😰 😢 😥 👍 👎'.split(' ');

if (document) {
  const btnEmoji = document.getElementById('emoji-btn'); // Кнопка смайлик.
  const aside = document.getElementsByTagName('aside')[0]; // Боковая панель
  const emojiContainer = document.getElementById('emoji-container'); // Контейнер со смайликами

  emoji.forEach((emo) => {
    const div = document.createElement('div');
    div.innerHTML = emo;
    div.classList.add('emoji');
    div.addEventListener('click', (event) => { // Клик по смайлику
      const input = document.getElementById('input');
      if (input) input.value += event.target.innerHTML;
    });
    emojiContainer.appendChild(div);
  });

  // Клик по кнопке смайлик.
  btnEmoji.addEventListener('click', () => {
    aside.classList.toggle('hidden');
  });
}
