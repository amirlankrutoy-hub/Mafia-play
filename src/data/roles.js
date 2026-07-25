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
    description: 'Соблозняет одного игрока на ночь,если кто то попытается ее убить то умрет соблозненный а не она',
    ability: 'соблозняет любого персонажа на одну ночь.'
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
    description: 'Глава мафии,может заблокировать чей то голос на голосовании мирных жителей.',
    ability: 'Можеть заблокировать голос одного игрока за голосованое'
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
    description: 'Опасный персонаж,можеть устронять любых людей с какой нибудь ролью обывателей убивать не может.',
    ability: 'Убивает всех кроме обывателей.'
  },
  {
    id: 'sherif',
    name: 'Шериф',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Sherif.jpg',
    description: 'Ночью может устранить выбранного игрока.',
    ability: 'Может убить мафию'
  },
  {
    id: 'stukach',
    name: 'Стукач',
    category: 'neutrals',
    team: 'Одиночка',
    image: '/Stukach.jpg',
    description: 'Передаёт ценную информацию одной из сторон,Выигрывает вместе с той стороной которой помог с информацией.',
    ability: 'Раскрывает информацию о статусе игрока.'
  },
  {
    id: 'sveshennik',
    name: 'Священник',
    category: 'civilians',
    team: 'Мирные жители',
    image: '/Sveshennik.jpg',
    description: 'Может либо проверить игрока либо устранить его.',
    ability: 'Проверяет или убивает игроков'
  }
];

export default roles;