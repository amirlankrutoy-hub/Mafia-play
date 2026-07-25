const roles = [
  {
    id: 'doctor',
    name: 'Доктор',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Doctor.jpg',
    description: 'Лечит одного из игроков ночью, спасая от выстрела.',
    ability: 'Спасает выбранного игрока от гибели ночью.'
  },
  {
    id: 'krasotka',
    name: 'Красотка',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Krasotka.jpg',
    description: 'Соблазняет одного игрока на ночь. Если кто-то попытается её убить, то умрёт соблазнённый, а не она.',
    ability: 'Соблазняет любого персонажа на одну ночь.'
  },
  {
    id: 'mafia',
    name: 'Мафиози',
    category: 'mafia',
    team: 'Мафия',
    image: '/Mafia.jpg',
    description: 'Член преступной группировки, ночью выбирает жертву.',
    ability: 'Участвует в ночном голосовании мафии.'
  },
  {
    id: 'manyak',
    name: 'Маньяк',
    category: 'neutrals',
    team: 'Одиночка',
    image: '/Manyak.jpg',
    description: 'Играет сам за себя, совершает убийства каждую ночь.',
    ability: 'Убивает любого игрока каждую ночь.'
  },
  {
    id: 'otez',
    name: 'Крёстный отец',
    category: 'mafia',
    team: 'Мафия',
    image: '/Otez.jpg',
    description: 'Глава мафии, может заблокировать чей-то голос на голосовании мирных жителей.',
    ability: 'Может заблокировать голос одного игрока на голосовании.'
  },
  {
    id: 'poklon',
    name: 'Поклонница',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Poklonniza.jpg',
    description: 'Следит за выбранным игроком и узнаёт его роль или действия.',
    ability: 'Узнаёт действия выбранного игрока.'
  },
  {
    id: 'potroshitel',
    name: 'Потрошитель',
    category: 'neutrals',
    team: 'Одиночка',
    image: '/Potroshitel.jpg',
    description: 'Опасный персонаж, может устранять любых игроков с активной ролью. Обывателей убивать не может.',
    ability: 'Убивает всех, кроме обывателей.'
  },
  {
    id: 'sherif',
    name: 'Шериф',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Sherif.jpg',
    description: 'Ночью может устранить выбранного игрока.',
    ability: 'Может проверять или вычислять мафию.'
  },
  {
    id: 'stukach',
    name: 'Стукач',
    category: 'neutrals',
    team: 'Одиночка',
    image: '/Stukach.jpg',
    description: 'Передаёт ценную информацию одной из сторон. Выигрывает вместе с той стороной, которой помог.',
    ability: 'Раскрывает информацию о статусе игрока.'
  },
  {
    id: 'sveshennik',
    name: 'Священник',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Sveshennik.jpg',
    description: 'Может либо проверить игрока, либо устранить его.',
    ability: 'Проверяет или устраняет игроков.'
  }
];

export default roles;