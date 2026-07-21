export const bilbao = {
  id: 'bilbao',
  name: 'Bilbao',
  country: 'Espagne',
  flag: '🇪🇸',
  center: [43.2630, -2.9350],
  zoom: 13,
  gradient: 'linear-gradient(135deg, #173B7A 0%, #0e8a5f 100%)',
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
    { id: 'b01', name: 'Guggenheim Bilbao', description: 'Musée d\'art contemporain conçu par Frank Gehry, emblème de la ville avec son architecture titane spectaculaire.', lat: 43.2677, lng: -2.9340, category: 'monuments', emoji: '🏛️', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/GuggenheimBilbao.jpg/400px-GuggenheimBilbao.jpg' },
    { id: 'b02', name: 'Cathédrale de Santiago', description: 'Cathédrale gothique du XIIIe siècle, chef-d\'œuvre architectural au cœur de la vieille ville.', lat: 43.2630, lng: -2.9276, category: 'monuments', emoji: '⛪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Catedral_de_Santiago_de_Bilbao_001.jpg/400px-Catedral_de_Santiago_de_Bilbao_001.jpg' },
    { id: 'b03', name: 'Palais d\'Arts Reina Sofía', description: 'Complexe culturel monumental de Calatrava, hébergeant opéra et spectacles.', lat: 43.2685, lng: -2.9938, category: 'architecture', emoji: '🎭', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Palacio_de_las_Artes_Reina_Sof%C3%ADa_%28Valencia%29.jpg/400px-Palacio_de_las_Artes_Reina_Sof%C3%ADa_%28Valencia%29.jpg' },
    { id: 'b04', name: 'Pont Zubizuri', description: 'Pont suspendu en verre de Calatrava, joyau architectural sur la Nervion.', lat: 43.2628, lng: -2.9304, category: 'architecture', emoji: '🌉', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Puente_Zubizuri%2C_Bilbao.jpg/400px-Puente_Zubizuri%2C_Bilbao.jpg' },
    { id: 'b05', name: 'Mirador de Artxanda', description: 'Point de vue panoramique sur toute la ville depuis la montagne.', lat: 43.2850, lng: -2.9200, category: 'viewpoints', emoji: '🔭', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bilbao_desde_Artxanda.jpg/400px-Bilbao_desde_Artxanda.jpg' },
    { id: 'b06', name: 'Parc d\'Etxebarria', description: 'Vaste parc verdoyant sur l\'ancien site industriel d\'Altos Hornos.', lat: 43.2670, lng: -2.9150, category: 'nature', emoji: '🌿', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Parque_de_Etxebarria_%28Bilbao%29.jpg/400px-Parque_de_Etxebarria_%28Bilbao%29.jpg' },
    { id: 'b07', name: 'Jardins de Albia', description: 'Jardins élégants du XIXe siècle, havre de paix urbain.', lat: 43.2588, lng: -2.9320, category: 'nature', emoji: '🌺', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jardines_de_Albia_%28Bilbao%29.jpg/400px-Jardines_de_Albia_%28Bilbao%29.jpg' },
    { id: 'b08', name: 'Casco Viejo (Vieille Ville)', description: 'Le quartier historique Siete Calles avec ses rues médiévales et ses pintxos bars.', lat: 43.2616, lng: -2.9260, category: 'culture', emoji: '🏘️', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bilbao_-_Casco_Viejo.jpg/400px-Bilbao_-_Casco_Viejo.jpg' },
    { id: 'b09', name: 'Mercado de la Ribera', description: 'Plus grand marché couvert d\'Europe, pittoresque sur les rives de la Nervion.', lat: 43.2584, lng: -2.9288, category: 'gastronomy', emoji: '🏪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Mercado_de_la_Ribera_%28Bilbao%29.jpg/400px-Mercado_de_la_Ribera_%28Bilbao%29.jpg' },
    { id: 'b10', name: 'Azkuna Zentroa', description: 'Centre culturel réhabilité par Philippe Starck, ancien marché aux abattoirs.', lat: 43.2612, lng: -2.9392, category: 'culture', emoji: '🎪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Azkuna_Zentroa_%28Bilbao%29.jpg/400px-Azkuna_Zentroa_%28Bilbao%29.jpg' },
    { id: 'b11', name: 'Funiculaire d\'Artxanda', description: 'Funiculaire offrant une ascent rapide vers le mirador panoramique.', lat: 43.2706, lng: -2.9285, category: 'unusual', emoji: '🚡', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Funicular_de_Artxanda%2C_Bilbao.jpg/400px-Funicular_de_Artxanda%2C_Bilbao.jpg' },
    { id: 'b12', name: 'Street Art Ensanche', description: 'Quartier Ensanche richement décoré de fresques murales contemporaines.', lat: 43.2618, lng: -2.9330, category: 'streetart', emoji: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bilbao_Ensanche.jpg/400px-Bilbao_Ensanche.jpg' },
    { id: 'b13', name: 'Église de San Nicolás', description: 'Église baroque du XVIIIe surnommée "Cathédrale des pintxos".', lat: 43.2632, lng: -2.9268, category: 'monuments', emoji: '⛪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Iglesia_de_San_Nicol%C3%A1s%2C_Bilbao.jpg/400px-Iglesia_de_San_Nicol%C3%A1s%2C_Bilbao.jpg' },
    { id: 'b14', name: 'Promenade de la Nervion', description: 'Promenade le long de la rivière Nervion entre le Guggenheim et la Cathédrale.', lat: 43.2620, lng: -2.9310, category: 'nature', emoji: '🌊', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Bilbao_-_R%C3%ADo_Nervi%C3%B3n.jpg/400px-Bilbao_-_R%C3%ADo_Nervi%C3%B3n.jpg' },
    { id: 'b15', name: 'Circuit des bars à pintxos', description: 'Circuit des meilleurs bars à pintxos du Casco Viejo.', lat: 43.2614, lng: -2.9255, category: 'gastronomy', emoji: '🍢', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pintxos_en_Bilbao.jpg/400px-Pintxos_en_Bilbao.jpg' },
    { id: 'b16', name: 'Teatro Arriaga', description: 'Théâtre néo-baroque inspiré de l\'Opéra Garnier, joyau architectural.', lat: 43.2598, lng: -2.9272, category: 'architecture', emoji: '🎭', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Teatro_Arriaga%2C_Bilbao.jpg/400px-Teatro_Arriaga%2C_Bilbao.jpg' },
    { id: 'b17', name: 'Abandoibarra', description: 'Zone de régénération urbaine le long de la rivière avec sculptures contemporaines.', lat: 43.2650, lng: -2.9310, category: 'streetart', emoji: '🗿', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Abandoibarra%2C_Bilbao.jpg/400px-Abandoibarra%2C_Bilbao.jpg' },
    { id: 'b18', name: 'Doña Casilda Park', description: 'Principal parc urbain avec étang, paons et musée des Beaux-Arts.', lat: 43.2712, lng: -2.9430, category: 'nature', emoji: '🦚', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Parque_de_Doa_Casilda%2C_Bilbao.jpg/400px-Parque_de_Doa_Casilda%2C_Bilbao.jpg' },
    { id: 'b19', name: 'Basílica de Begoña', description: 'Basílique gothique-Renaissance, patronne de Biscaye, perchée sur la colline.', lat: 43.2668, lng: -2.9180, category: 'monuments', emoji: '⛪', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Bas%C3%ADlica_de_Bego%C3%B1a%2C_Bilbao.jpg/400px-Bas%C3%ADlica_de_Bego%C3%B1a%2C_Bilbao.jpg' },
    { id: 'b20', name: 'Zorrotzaire Murals', description: 'Quartier Zorrotzaire couvert de murales géants signés par des artistes internationaux.', lat: 43.2750, lng: -2.9420, category: 'streetart', emoji: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Zorrotzaurre_Bilbao.jpg/400px-Zorrotzaurre_Bilbao.jpg' }
  ],
  routes: [
    {
      id: 'br01',
      name: 'Bilbao Monumental',
      description: 'Découvrez les joyaux architecturaux de Bilbao en un parcours inoubliable.',
      emoji: '🏛️',
      difficulty: 'Facile',
      duration: '3h',
      distance: '4.2 km',
      color: '#AB47BC',
      city: 'bilbao',
      steps: [
        { id: 'br01s01', poiId: 'b01', name: 'Guggenheim Bilbao', description: 'Commencez par le chef-d\'œuvre de Frank Gehry. Admirez les courbes de titane et les sculptures monumentales.', lat: 43.2677, lng: -2.9340, category: 'monuments', challenges: [
          { id: 'ch01', type: 'photo', title: 'Reproduire la vue du Guggenheim', description: 'Prenez une photo identique à la vue emblématique du musée depuis le pont.', points: 150 },
          { id: 'ch02', type: 'find', title: 'Trouver le "Puppy" géant', description: 'Photographiez la sculpture florale "Puppy" de Jeff Koons devant l\'entrée.', points: 100 }
        ]},
        { id: 'br01s02', poiId: 'b04', name: 'Pont Zubizuri', description: 'Traversez le pont en verre de Calatrava et profitez de la vue sur la rivière.', lat: 43.2628, lng: -2.9304, category: 'architecture', challenges: [
          { id: 'ch03', type: 'photo', title: 'Photo du reflet', description: 'Capturez votre reflet dans le sol en verre du pont.', points: 120 }
        ]},
        { id: 'br01s03', poiId: 'b16', name: 'Teatro Arriaga', description: 'Admirez ce théâtre néo-baroque qui rivalise avec l\'Opéra Garnier.', lat: 43.2598, lng: -2.9272, category: 'architecture', challenges: [] },
        { id: 'br01s04', poiId: 'b02', name: 'Cathédrale de Santiago', description: 'Explorez cette cathédrale gothique du XIIIe siècle, joyau de la vieille ville.', lat: 43.2630, lng: -2.9276, category: 'monuments', challenges: [
          { id: 'ch04', type: 'find', title: 'Le portail gothique', description: 'Photographiez le portail principal avec ses sculptures médiévales.', points: 100 }
        ]},
        { id: 'br01s05', poiId: 'b13', name: 'Église de San Nicolás', description: 'Découvrez la "Cathédrale des Pintxos" avec son magnifique retable baroque.', lat: 43.2632, lng: -2.9268, category: 'monuments', challenges: [
          { id: 'ch05', type: 'color', title: 'Le bleu du retable', description: 'Trouvez et photographiez l\'élément bleu dominant du retable baroque.', points: 130 }
        ]}
      ]
    },
    {
      id: 'br02',
      name: 'Parcours Art & Street Art',
      description: 'Un parcours urbain à la rencontre de l\'art contemporain et du street art.',
      emoji: '🎨',
      difficulty: 'Moyen',
      duration: '4h',
      distance: '5.8 km',
      color: '#EC407A',
      city: 'bilbao',
      steps: [
        { id: 'br02s01', poiId: 'b10', name: 'Azkuna Zentroa', description: 'Le centre culturel de Philippe Starck avec ses 43 colonnes dorées.', lat: 43.2612, lng: -2.9392, category: 'culture', challenges: [
          { id: 'ch06', type: 'find', title: 'Les colonnes multicolores', description: 'Photographiez les colonnes de l\'atrium dans les différentes couleurs.', points: 110 }
        ]},
        { id: 'br02s02', poiId: 'b17', name: 'Abandoibarra', description: 'Promenez-vous parmi les sculptures contemporaines le long de la rivière.', lat: 43.2650, lng: -2.9310, category: 'streetart', challenges: [
          { id: 'ch07', type: 'photo', title: 'La toile géante', description: 'Reproduisez la vue de la fresque murale la plus imposante du quartier.', points: 130 }
        ]},
        { id: 'br02s03', poiId: 'b12', name: 'Street Art Ensanche', description: 'Le quartier Ensanche regorge de fresques murales colorées et surprenantes.', lat: 43.2618, lng: -2.9330, category: 'streetart', challenges: [
          { id: 'ch08', type: 'color', title: 'Le rouge vif', description: 'Trouvez et photographiez l\'élément le plus rouge du quartier.', points: 100 }
        ]},
        { id: 'br02s04', poiId: 'b20', name: 'Zorrotzaire Murals', description: 'Découvrez les murales géants du quartier Zorrotzaire, œuvres d\'artistes internationaux.', lat: 43.2750, lng: -2.9420, category: 'streetart', challenges: [
          { id: 'ch09', type: 'photo', title: 'Le plus grand murale', description: 'Photographiez le plus grand murale du quartier en entier.', points: 150 }
        ]}
      ]
    },
    {
      id: 'br03',
      name: 'Nature & Panoramas',
      description: 'Montez aux points de vue et profitez des espaces verts de Bilbao.',
      emoji: '🌿',
      difficulty: 'Moyen',
      duration: '3h30',
      distance: '6.5 km',
      color: '#66BB6A',
      city: 'bilbao',
      steps: [
        { id: 'br03s01', poiId: 'b06', name: 'Parc d\'Etxebarria', description: 'Commencez par ce vaste parc verdoyant, poumon vert de Bilbao.', lat: 43.2670, lng: -2.9150, category: 'nature', challenges: [
          { id: 'ch10', type: 'find', title: 'La roue métallique', description: 'Photographiez la structure métallique restée de l\'ancienne usine.', points: 80 }
        ]},
        { id: 'br03s02', poiId: 'b11', name: 'Funicular d\'Artxanda', description: 'Montez en funiculaire jusqu\'au sommet pour un panorama exceptionnel.', lat: 43.2706, lng: -2.9285, category: 'unusual', challenges: [
          { id: 'ch11', type: 'photo', title: 'Vue du funiculaire', description: 'Prenez une photo depuis le funiculaire pendant l\'ascension.', points: 120 }
        ]},
        { id: 'br03s03', poiId: 'b05', name: 'Mirador de Artxanda', description: 'Le point de vue le plus spectaculaire de Bilbao. 360° de ville et de montagnes.', lat: 43.2850, lng: -2.9200, category: 'viewpoints', challenges: [
          { id: 'ch12', type: 'photo', title: 'Panorama complet', description: 'Capturez le panorama complet de Bilbao depuis le mirador.', points: 200 }
        ]},
        { id: 'br03s04', poiId: 'b18', name: 'Doña Casilda Park', description: 'Terminez dans ce parc élégant avec ses paons et son étang.', lat: 43.2712, lng: -2.9430, category: 'nature', challenges: [
          { id: 'ch13', type: 'find', title: 'Le paon', description: 'Photographiez un paon dans le parc (si vous en trouvez un !).', points: 100 }
        ]}
      ]
    },
    {
      id: 'br04',
      name: 'Pintxos & Traditions',
      description: 'Plongez dans la culture gastronomique et traditionnelle de Bilbao.',
      emoji: '🍷',
      difficulty: 'Facile',
      duration: '2h30',
      distance: '2.8 km',
      color: '#EF5350',
      city: 'bilbao',
      steps: [
        { id: 'br04s01', poiId: 'b09', name: 'Mercado de la Ribera', description: 'Le plus grand marché couvert d\'Europe. Goûtez aux specialités locales.', lat: 43.2584, lng: -2.9288, category: 'gastronomy', challenges: [
          { id: 'ch14', type: 'photo', title: 'Le étal de poissons', description: 'Photographiez le plus beau stand de poissons du marché.', points: 100 }
        ]},
        { id: 'br04s02', poiId: 'b15', name: 'Circuit des bars à pintxos', description: 'Le circuit des meilleurs bars à pintxos du Casco Viejo. Goûtez et votez !', lat: 43.2614, lng: -2.9255, category: 'gastronomy', challenges: [
          { id: 'ch15', type: 'photo', title: 'Le pintxo parfait', description: 'Photographiez le plus beau pintxo que vous trouvez.', points: 110 }
        ]},
        { id: 'br04s03', poiId: 'b08', name: 'Casco Viejo', description: 'Explorez les Siete Calles historiques et leur ambiance unique.', lat: 43.2616, lng: -2.9260, category: 'culture', challenges: [
          { id: 'ch16', type: 'find', title: 'La plaque de la calle', description: 'Trouvez la plaque de la rue la plus ancienne du Casco Viejo.', points: 90 }
        ]}
      ]
    }
  ],
  utility: [
    { id: 'bu01', type: 'toilet', name: 'Toilettes - Casco Viejo', lat: 43.2625, lng: -2.9265, emoji: '🚻' },
    { id: 'bu02', type: 'toilet', name: 'Toilettes - Guggenheim', lat: 43.2682, lng: -2.9340, emoji: '🚻' },
    { id: 'bu03', type: 'toilet', name: 'Toilettes - Plaza Nueva', lat: 43.2608, lng: -2.9275, emoji: '🚻' },
    { id: 'bu04', type: 'toilet', name: 'Toilettes - Abando', lat: 43.2620, lng: -2.9310, emoji: '🚻' },
    { id: 'bu05', type: 'toilet', name: 'Toilettes - Deusto', lat: 43.2690, lng: -2.9430, emoji: '🚻' },
    { id: 'bu06', type: 'fountain', name: 'Fontaine - Ribera', lat: 43.2585, lng: -2.9290, emoji: '🚰' },
    { id: 'bu07', type: 'fountain', name: 'Fontaine - Arriaga', lat: 43.2615, lng: -2.9260, emoji: '🚰' },
    { id: 'bu08', type: 'fountain', name: 'Fontaine - Alameda Rekalde', lat: 43.2570, lng: -2.9350, emoji: '🚰' },
    { id: 'bu09', type: 'fountain', name: 'Fontaine - Abandoibarra', lat: 43.2650, lng: -2.9335, emoji: '🚰' },
    { id: 'bu10', type: 'fountain', name: 'Fontaine - Gran Vía', lat: 43.2630, lng: -2.9310, emoji: '🚰' }
  ]
};
