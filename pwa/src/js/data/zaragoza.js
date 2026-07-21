export const zaragoza = {
  id: 'zaragoza',
  name: 'Saragosse',
  country: 'Espagne',
  flag: '🇪🇸',
  center: [41.6488, -0.8891],
  zoom: 13,
  gradient: 'linear-gradient(135deg, #173B7A 0%, #8B4513 100%)',
  categories: {
    monuments: { label: 'Monuments', icon: '🏛️', color: '#AB47BC' },
    viewpoints: { label: 'Points de vue', icon: '🔭', color: '#42A5F5' },
    nature: { label: 'Nature', icon: '🌿', color: '#66BB6A' },
    streetart: { label: 'Street Art', icon: '🎨', color: '#EC407A' },
    architecture: { label: 'Architecture', icon: '🏗️', color: '#5C6BC0' },
    unusual: { label: 'Insolite', icon: '✨', color: '#FFA726' },
    culture: { label: 'Culture', icon: '🎭', color: '#26C6DA' },
    gastronomy: { label: 'Gastronomie', icon: '🍷', color: '#EF5350' }
  },
  pois: [
    { id: 'z01', name: 'Basilique del Pilar', description: 'L\'un des plus grands sanctuaires mariaux au monde. Chef-d\'œuvre baroque aux coupoles colorées.', lat: 41.6558, lng: -0.8790, category: 'monuments', emoji: '⛪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Bas%C3%ADlica_del_Pilar_%28Zaragoza%29_02.jpg/400px-Bas%C3%ADlica_del_Pilar_%28Zaragoza%29_02.jpg' },
    { id: 'z02', name: 'Cathédrale de la Salvator', description: 'Cathédrale gothique-mudéjare, seule cathédrale de style mudéjare au monde.', lat: 41.6535, lng: -0.8765, category: 'monuments', emoji: '🏰', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Seo_del_Salvador_%28Zaragoza%29.jpg/400px-Seo_del_Salvador_%28Zaragoza%29.jpg' },
    { id: 'z03', name: 'Aljafería', description: 'Palais musulman du XIe siècle, joyau de l\'art hispano-mauresque et siège des Cortes d\'Aragon.', lat: 41.6577, lng: -0.8930, category: 'monuments', emoji: '🕌', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Palacio_de_la_Aljafer%C3%ADa_%28Zaragoza%29.jpg/400px-Palacio_de_la_Aljafer%C3%ADa_%28Zaragoza%29.jpg' },
    { id: 'z04', name: 'Torres de la Magdalena', description: 'Ruines des anciennes tours défensives médiévales sur l\'Ebre.', lat: 41.6580, lng: -0.8720, category: 'architecture', emoji: '🏰', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Torres_de_la_Magdalena_%28Zaragoza%29.jpg/400px-Torres_de_la_Magdalena_%28Zaragoza%29.jpg' },
    { id: 'z05', name: 'Mirador del Ebro', description: 'Point de vue exceptionnel sur le fleuve Ebre et la basilique.', lat: 41.6600, lng: -0.8850, category: 'viewpoints', emoji: '🔭', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Zaragoza_-_Puento_de_Piedra_y_Basilica_del_Pilar.jpg/400px-Zaragoza_-_Puento_de_Piedra_y_Basilica_del_Pilar.jpg' },
    { id: 'z06', name: 'Parc de la Milla Digital', description: 'Parc urbain moderne le long de l\'Ebre avec art contemporain et espaces verts.', lat: 41.6630, lng: -0.8820, category: 'nature', emoji: '🌿', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Parque_de_la_Milla_Digital_%28Zaragoza%29.jpg/400px-Parque_de_la_Milla_Digital_%28Zaragoza%29.jpg' },
    { id: 'z07', name: 'Galería del Color', description: 'Passage piéton coloré unique en Europe avec des œuvres d\'art contemporain.', lat: 41.6502, lng: -0.8820, category: 'streetart', emoji: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Galer%C3%ADa_del_Color_%28Zaragoza%29.jpg/400px-Galer%C3%ADa_del_Color_%28Zaragoza%29.jpg' },
    { id: 'z08', name: 'Plaza del Torico', description: 'Petite place pittoresque avec la fontaine Torico, symbole de la ville.', lat: 41.6510, lng: -0.8805, category: 'culture', emoji: '⛲', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Plaza_del_Torico_%28Zaragoza%29.jpg/400px-Plaza_del_Torico_%28Zaragoza%29.jpg' },
    { id: 'z09', name: 'Casa de los Picos', description: 'Palais gothique du XVe siècle avec sa façade couverte de pyramides de pierre.', lat: 41.6525, lng: -0.8790, category: 'architecture', emoji: '🏠', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Casa_de_los_Picos_%28Zaragoza%29.jpg/400px-Casa_de_los_Picos_%28Zaragoza%29.jpg' },
    { id: 'z10', name: 'Puente de Piedra', description: 'Pont de pierre du XVIIIe siècle, point de vue idéal sur la basilique.', lat: 41.6545, lng: -0.8755, category: 'monuments', emoji: '🌉', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Zaragoza_-_Puento_de_Piedra_y_Basilica_del_Pilar.jpg/400px-Zaragoza_-_Puento_de_Piedra_y_Basilica_del_Pilar.jpg' },
    { id: 'z11', name: 'Museo del Foro de Caesaraugusta', description: 'Ruines du forum romain de la Caesaraugusta antique.', lat: 41.6500, lng: -0.8860, category: 'culture', emoji: '🏛️', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Foro_de_Caesaraugusta_%28Zaragoza%29.jpg/400px-Foro_de_Caesaraugusta_%28Zaragoza%29.jpg' },
    { id: 'z12', name: 'Street Art El Gancho', description: 'Le quartier El Gancho regorge de fresques murales colorées et engagées.', lat: 41.6480, lng: -0.8860, category: 'streetart', emoji: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Barrio_del_Gancho_%28Zaragoza%29.jpg/400px-Barrio_del_Gancho_%28Zaragoza%29.jpg' },
    { id: 'z13', name: 'Basílica del Pilar - Coupoles', description: 'Les 10 coupoles peintes par Goya de la basilique, vues depuis l\'intérieur.', lat: 41.6556, lng: -0.8788, category: 'monuments', emoji: '⛪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Bas%C3%ADlica_del_Pilar_%28Zaragoza%29_02.jpg/400px-Bas%C3%ADlica_del_Pilar_%28Zaragoza%29_02.jpg' },
    { id: 'z14', name: 'Promenade de l\'Ebre', description: 'Promenade le long du fleuve Ebre entre les ponts historiques.', lat: 41.6550, lng: -0.8820, category: 'nature', emoji: '🌊', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/R%C3%ADo_Ebro_%28Zaragoza%29.jpg/400px-R%C3%ADo_Ebro_%28Zaragoza%29.jpg' },
    { id: 'z15', name: 'Mercado Central', description: 'Marché central art déco, temple de la gastronomie aragonaise.', lat: 41.6498, lng: -0.8880, category: 'gastronomy', emoji: '🏪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mercado_Central_de_Zaragoza.jpg/400px-Mercado_Central_de_Zaragoza.jpg' },
    { id: 'z16', name: 'Jardins de l\'Aljafería', description: 'Jardins du palais musulman avec fontaines et orangers.', lat: 41.6580, lng: -0.8935, category: 'nature', emoji: '🌺', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Palacio_de_la_Aljafer%C3%ADa_%28Zaragoza%29.jpg/400px-Palacio_de_la_Aljafer%C3%ADa_%28Zaragoza%29.jpg' },
    { id: 'z17', name: 'Barrio de Tubo', description: 'Le plus animé des quartiers historiques, labyrinthe de rues et de bars.', lat: 41.6520, lng: -0.8830, category: 'gastronomy', emoji: '🍷', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Plaza_del_Torico_%28Zaragoza%29.jpg/400px-Plaza_del_Torico_%28Zaragoza%29.jpg' },
    { id: 'z18', name: 'Teatro de la Zarzuela', description: 'Théâtre néo-baroque dédié à la zarzuela, spectacle lyrique espagnol.', lat: 41.6510, lng: -0.8870, category: 'architecture', emoji: '🎭', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Teatro_de_la_Zarzuela_%28Zaragoza%29.jpg/400px-Teatro_de_la_Zarzuela_%28Zaragoza%29.jpg' },
    { id: 'z19', name: 'Jardines de Parque Grande', description: 'Le plus grand parc de Saragosse avec son palais et ses fontaines.', lat: 41.6420, lng: -0.8930, category: 'nature', emoji: '🌿', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Parque_Grande_%28Zaragoza%29.jpg/400px-Parque_Grande_%28Zaragoza%29.jpg' },
    { id: 'z20', name: 'Street Art Las Fuentes', description: 'Le quartier Las Fuentes est une galerie à ciel ouvert de street art militant.', lat: 41.6400, lng: -0.8780, category: 'streetart', emoji: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Barrio_del_Gancho_%28Zaragoza%29.jpg/400px-Barrio_del_Gancho_%28Zaragoza%29.jpg' }
  ],
  routes: [
    {
      id: 'zr01',
      name: 'Saragosse Monumentale',
      description: 'Un voyage à travers les monuments emblématiques de la capitale aragonaise.',
      emoji: '🏰',
      difficulty: 'Facile',
      duration: '3h',
      distance: '3.5 km',
      color: '#AB47BC',
      city: 'zaragoza',
      steps: [
        { id: 'zr01s01', poiId: 'z01', name: 'Basilique del Pilar', description: 'Commencez par le monument le plus iconique de Saragosse. Les coupoles peintes par Goya sont à couper le souffle.', lat: 41.6558, lng: -0.8790, category: 'monuments', challenges: [
          { id: 'chz01', type: 'photo', title: 'La vue depuis le pont', description: 'Reproduisez la vue emblématique de la basilique depuis le Puente de Piedra.', points: 150 },
          { id: 'chz02', type: 'find', title: 'Le pilier original', description: 'Photographiez le pilier de jaspe vénéré dans la basilique.', points: 100 }
        ]},
        { id: 'zr01s02', poiId: 'z02', name: 'Cathédrale de la Salvator', description: 'La seule cathédrale de style mudéjare au monde, mélange unique de gothique et d\'architecture islamique.', lat: 41.6535, lng: -0.8765, category: 'monuments', challenges: [
          { id: 'chz03', type: 'photo', title: 'La tour mudéjare', description: 'Photographiez la tour de style mudéjare unique en son genre.', points: 120 }
        ]},
        { id: 'zr01s03', poiId: 'z10', name: 'Puente de Piedra', description: 'Traversez le pont de pierre et profitez de la vue imprenable sur la basilique.', lat: 41.6545, lng: -0.8755, category: 'architecture', challenges: [
          { id: 'chz04', type: 'photo', title: 'Reflet dans l\'Ebre', description: 'Capturez le reflet de la basilique dans les eaux de l\'Ebre.', points: 130 }
        ]},
        { id: 'zr01s04', poiId: 'z09', name: 'Casa de los Picos', description: 'Admirez cette façade unique couverte de pyramides de pierre, vestige du gothique aragonais.', lat: 41.6525, lng: -0.8790, category: 'architecture', challenges: [] },
        { id: 'zr01s05', poiId: 'z08', name: 'Plaza del Torico', description: 'Terminez sur cette place charmante avec sa fontaine Torico, le petit taureau.', lat: 41.6510, lng: -0.8805, category: 'culture', challenges: [
          { id: 'chz05', type: 'find', title: 'Le Torico', description: 'Photographiez la petite sculpture de taureau au sommet de la fontaine.', points: 90 }
        ]}
      ]
    },
    {
      id: 'zr02',
      name: 'Art & Couleurs de Saragosse',
      description: 'Parcourez les rues colorées et le street art engagé de Saragosse.',
      emoji: '🎨',
      difficulty: 'Moyen',
      duration: '4h',
      distance: '5.2 km',
      color: '#EC407A',
      city: 'zaragoza',
      steps: [
        { id: 'zr02s01', poiId: 'z07', name: 'Galería del Color', description: 'Commencez par cette galerie piéton colorée unique en Europe.', lat: 41.6502, lng: -0.8820, category: 'streetart', challenges: [
          { id: 'chz06', type: 'color', title: 'L\'arc-en-ciel', description: 'Photographiez l\'élément contenant le plus de couleurs différentes dans la galerie.', points: 120 }
        ]},
        { id: 'zr02s02', poiId: 'z12', name: 'Street Art El Gancho', description: 'Le quartier El Gancho est un musée à ciel ouvert de street art social et politique.', lat: 41.6480, lng: -0.8860, category: 'streetart', challenges: [
          { id: 'chz07', type: 'photo', title: 'La fresque géante', description: 'Photographiez la plus grande fresque du quartier El Gancho.', points: 130 }
        ]},
        { id: 'zr02s03', poiId: 'z20', name: 'Street Art Las Fuentes',         description: 'Le quartier Las Fuentes et ses muralles engagées et colorées.', lat: 41.6400, lng: -0.8780, category: 'streetart', challenges: [
          { id: 'chz08', type: 'color', title: 'Le rouge militant', description: 'Trouvez la fresque dominée par la couleur rouge dans Las Fuentes.', points: 110 }
        ]},
        { id: 'zr02s04', poiId: 'z11', name: 'Museo del Foro de Caesaraugusta', description: 'Découvrez les ruines du forum romain, témoins de 2000 ans d\'histoire.', lat: 41.6500, lng: -0.8860, category: 'culture', challenges: [
          { id: 'chz09', type: 'photo', title: 'La colonne romaine', description: 'Photographiez la colonne romaine la mieux préservée du forum.', points: 100 }
        ]}
      ]
    },
    {
      id: 'zr03',
      name: 'Les Secrets de l\'Aljafería',
      description: 'Plongez dans l\'histoire musulmane et chrétienne de ce palais extraordinaire.',
      emoji: '🕌',
      difficulty: 'Facile',
      duration: '2h',
      distance: '2.5 km',
      color: '#FFA726',
      city: 'zaragoza',
      steps: [
        { id: 'zr03s01', poiId: 'z03', name: 'Aljafería', description: 'Explorez ce palais musulman du XIe siècle, sommet de l\'art hispano-mauresque.', lat: 41.6577, lng: -0.8930, category: 'monuments', challenges: [
          { id: 'chz10', type: 'photo', title: 'L\'oratoire de la reine', description: 'Photographiez les arcs polylobés de l\'oratoire, joyau de l\'architecture islamique.', points: 150 },
          { id: 'chz11', type: 'color', title: 'Le stuc doré', description: 'Trouvez et photographiez les décors en stuc doré du palais.', points: 130 }
        ]},
        { id: 'zr03s02', poiId: 'z16', name: 'Jardins de la Aljafería', description: 'Promenez-vous dans les jardins avec leurs fontaines et orangers centenaires.', lat: 41.6580, lng: -0.8935, category: 'nature', challenges: [
          { id: 'chz12', type: 'find', title: 'L\'oranger centenaire', description: 'Photographiez le plus bel oranger du jardin.', points: 90 }
        ]},
        { id: 'zr03s03', poiId: 'z04', name: 'Torres de la Magdalena', description: 'Les vestiges des tours défensives médiévales sur les rives de l\'Ebre.', lat: 41.6580, lng: -0.8720, category: 'architecture', challenges: [
          { id: 'chz13', type: 'photo', title: 'Les tours au coucher du soleil', description: 'Si c\'est possible, photographiez les tours au coucher du soleil.', points: 140 }
        ]}
      ]
    },
    {
      id: 'zr04',
      name: 'Gastronomie Aragonaise',
      description: 'Découvrez les saveurs authentiques de l\'Aragon à travers marché et bars.',
      emoji: '🍷',
      difficulty: 'Facile',
      duration: '2h30',
      distance: '2.2 km',
      color: '#EF5350',
      city: 'zaragoza',
      steps: [
        { id: 'zr04s01', poiId: 'z15', name: 'Mercado Central', description: 'Le temple art déco de la gastronomie aragonaise. Fromages, jambons, fruits...', lat: 41.6498, lng: -0.8880, category: 'gastronomy', challenges: [
          { id: 'chz14', type: 'photo', title: 'Le meilleur étal', description: 'Photographiez le plus bel étal du Mercado Central.', points: 100 }
        ]},
        { id: 'zr04s02', poiId: 'z17', name: 'Barrio de Tubo', description: 'Le quartier des bars et des tapas. Labyrinthe de rues animées.', lat: 41.6520, lng: -0.8830, category: 'gastronomy', challenges: [
          { id: 'chz15', type: 'photo', title: 'La tapa parfaite', description: 'Photographiez la plus belle tapa que vous dégustez dans le Tubo.', points: 110 }
        ]},
        { id: 'zr04s03', poiId: 'z05', name: 'Mirador del Ebro', description: 'Terminez avec une vue panoramique sur l\'Ebre et la basilique illuminée.', lat: 41.6600, lng: -0.8850, category: 'viewpoints', challenges: [
          { id: 'chz16', type: 'photo', title: 'Basilique de nuit', description: 'Photographiez la basilique del Pilar illuminée depuis le mirador.', points: 150 }
        ]}
      ]
    }
  ],
  utility: [
    { id: 'zu01', type: 'toilet', name: 'Toilettes - Plaza del Pilar', lat: 41.6555, lng: -0.8780, emoji: '🚻' },
    { id: 'zu02', type: 'toilet', name: 'Toilettes - Tubo', lat: 41.6518, lng: -0.8825, emoji: '🚻' },
    { id: 'zu03', type: 'toilet', name: 'Toilettes - Mercado Central', lat: 41.6500, lng: -0.8875, emoji: '🚻' },
    { id: 'zu04', type: 'toilet', name: 'Toilettes - Aljafería', lat: 41.6578, lng: -0.8928, emoji: '🚻' },
    { id: 'zu05', type: 'toilet', name: 'Toilettes - Parque Grande', lat: 41.6425, lng: -0.8925, emoji: '🚻' },
    { id: 'zu06', type: 'fountain', name: 'Fontaine - Torico', lat: 41.6510, lng: -0.8803, emoji: '🚰' },
    { id: 'zu07', type: 'fountain', name: 'Fontaine - Ebre', lat: 41.6548, lng: -0.8760, emoji: '🚰' },
    { id: 'zu08', type: 'fountain', name: 'Fontaine - Pilar', lat: 41.6558, lng: -0.8795, emoji: '🚰' },
    { id: 'zu09', type: 'fountain', name: 'Fontaine - Milla Digital', lat: 41.6625, lng: -0.8815, emoji: '🚰' },
    { id: 'zu10', type: 'fountain', name: 'Fontaine - Parque Grande', lat: 41.6430, lng: -0.8935, emoji: '🚰' }
  ]
};
