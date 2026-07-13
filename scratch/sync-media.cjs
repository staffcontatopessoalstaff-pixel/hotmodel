const fs = require('fs');
const path = require('path');

const BACKUP_DIR = '/home/wiu/Downloads/backup_exclusive_models_2026-07-13';
const PUBLIC_MODELS_DIR = '/home/wiu/projetos_organizados/produtos/hotmodel/public/models';
const INITIAL_MODELS_PATH = '/home/wiu/projetos_organizados/produtos/hotmodel/src/initialModels.json';

const userListData = `
Milena Avelino
2738 Fotos
Rafaela Ataíde
3264 Fotos
Luana Assumpção
Premium 1724 Fotos
Beatriz Assad
Premium 1890 Fotos
Nicole Arrighi
651 Fotos
Alice Arraes
Premium 1366 Fotos
Mariana Arcoverde
1172 Fotos
Letícia Aoki
Premium 2031 Fotos
Camila Antunes
Premium 638 Fotos
Júlia Antolini
158 Fotos
Carolina AnselmoCarolina Anselmo
710 Fotos
Sofia Amorim
203 Fotos
Bianca Ambrósio
Premium 876 Fotos
Larissa Amâncio
166 Fotos
Amanda Alvarenga
71 Fotos
Gabriela Aguiar
734 Fotos
Bruna Agostini
Premium 225 Fotos
Tatiane Affonso
Premium 297 Fotos
Carla Adorno
Premium 3218 Fotos
Raquel Adami
Premium 1278 Fotos
Flávia Accioly
Premium 196 Fotos
Mirella Abrantes
Premium 784 Fotos
Samara Abib
Premium 1703 Fotos
Aline Abdalla
Premium 434 Fotos
Elisa Zylbersztajn
Premium 1798 Fotos
Cristiane Zucchi
Premium 217 Fotos
Daniela Zottis
Premium 165 Fotos
Paula Zorzetto
Premium 198 Fotos
Débora Zingano
Premium 450 Fotos
Tainá Zilli
Premium 971 Fotos
Yasmin Zerbinatti
Premium 216 Fotos
Heloísa Zeni
Premium 596 Fotos
Natália Zattar
Premium 162 Fotos
Priscila Zaidan
858 Fotos
Talita Yu
567 Fotos
Sabrina Youssef
Premium 248 Fotos
Renata Yunes
Premium 242 Fotos
Giovanna Yano
Premium 929 Fotos
Laura Yamada
Premium 844 Fotos
Fernanda Ximenes
Premium 131 Fotos
Milena Xavier da Luz
Premium 313 Fotos
Rafaela Wirth
Premium 1181 Fotos
Luana Willrich
Premium 1134 Fotos
Beatriz Wilke
Premium 3137 Fotos
Alice Wilbert
Premium 4197 Fotos
Sofia Wiggers
Premium 2176 Fotos
Isadora Westin
Premium 1834 Fotos
Amanda Werneck
Premium 105 Fotos
Nicole Weigert
876 Fotos
Carolina Weber
1245 Fotos
Bruna Wagner
4821 Fotos
Vitória Voss
2827 Fotos
Letícia Viriato
359 Fotos
Mariana Vidor
3699 Fotos
Gabriela Viana
498 Fotos
Larissa Vespasiano
Premium 3169 Fotos
Bianca Velloso
Premium 2159 Fotos
Camila Varella
508 Fotos
Júlia Valim
1444 Fotos
Maria Luiza Bicalho
2444 Fotos
Ana Júlia Bittar
Premium 196 Fotos
Maria Cecília Costa
Premium 1194 Fotos
Clara Martins
Premium 1634 Fotos
Lara Souza
Premium 978 Fotos
Ana Beatriz Ferreira
Premium 1600 Fotos
Vitória Almeida
Premium 2815 Fotos
Isadora Rocha
Premium 620 Fotos
Camila Nascimento
Premium 435 Fotos
Rafaela Silva
261 Fotos
Júlia Costa
Premium 829 Fotos
Ana Paula Delgado
Premium 707 Fotos
Juliana Salgado
Premium 1021 Fotos
Camila Valverde
551 Fotos
Mariana Bastiani
Premium 890 Fotos
Letícia Portela
Premium 117 Fotos
Vitória Seabra
Premium 4627 Fotos
Bruna Vidigal
Premium 491 Fotos
Carolina Viegas
Premium 324 Fotos
Nicole Tenório
Premium 271 Fotos
Amanda Arantes
Premium 715 Fotos
Isadora Caldas
Premium 266 Fotos
Sofia Dourado
Premium 967 Fotos
Alice Godoy
Premium 1574 Fotos
Beatriz Gusmão
Premium 382 Fotos
Rafaela Lins
Premium 1848 Fotos
Fernanda Loyola
646 Fotos
Tainá Lombardi
Premium 396 Fotos
Ingrid Grimaldi
Premium 952 Fotos
Yasmin Giordano
Premium 2083 Fotos
Júlia Magalhães
Premium 128 Fotos
Laura Mascarenhas
Premium 728 Fotos
Giovanna Medeiros
Premium 4291 Fotos
Renata Muniz
Premium 2123 Fotos
Sabrina Paiva
Premium 228 Fotos
Talita Pedrosa
90 Fotos
Priscila Peçanha
Premium 280 Fotos
Natália Pimentel
721 Fotos
Heloísa Quintela
Premium 603 Fotos
Yasmin Rangel
842 Fotos
Ingrid Rios
Premium 191 Fotos
Débora Sarmento
Premium 305 Fotos
Paula Seixas
Premium 432 Fotos
Daniela Serpa
Premium 1138 Fotos
Cristiane Sodré
Premium 2626 Fotos
Paula Marchetti
Premium 2240 Fotos
Elisa Souto
2030 Fotos
Aline Valente
3143 Fotos
Samara Valim
186 Fotos
Mirella Vilela
Premium 1224 Fotos
Flávia Vitorino
2087 Fotos
Raquel Xavier
223 Fotos
Carla Zamboni
182 Fotos
Tatiane Zanetti
438 Fotos
Bruna Zanon
Premium 818 Fotos
Gabriela Zilli
445 Fotos
Amanda Bellini
Premium 611 Fotos
Larissa Bianchi
Premium 340 Fotos
Bianca Bertolini
Premium 785 Fotos
Sofia Bonetti
298 Fotos
Carolina Bottini
Premium 2034 Fotos
Júlia Brunetti
208 Fotos
Camila Capuano
Premium 117 Fotos
Letícia Carbone
Premium 1684 Fotos
Mariana Castellani
531 Fotos
Alice Cipriani
Premium 1848 Fotos
Nicole Colucci
Premium 954 Fotos
Luana Coppola
Premium 870 Fotos
Rafaela D’Angelo
Premium 2345 Fotos
Milena De Luca
Premium 1571 Fotos
Fernanda Di Matteo
Premium 954 Fotos
Laura Donati
Premium 285 Fotos
Giovanna Esposito
Premium 1011 Fotos
Renata Fabbri
Premium 388 Fotos
Talita Fiorelli
Premium 249 Fotos
Paula Valadares
Premium 2243 Fotos
Heloísa Gatti
Premium 981 Fotos
Yasmin Monteiro
Premium 3207 Fotos
Vitória Duarte
Premium 175 Fotos
Valentina Oliveira
Premium 286 Fotos
Valentina Borges
Premium 995 Fotos
Thaís Amaral
Premium 2096 Fotos
Talita Campos
2632 Fotos
Tainá Cunha
Premium 2601 Fotos
Sthefany Barreto
Premium 2966 Fotos
Sabrina Duarte
Premium 328 Fotos
Sabrina Araújo
Premium 193 Fotos
Roberta Antunes
184 Fotos
Renata Pacheco
758 Fotos
Rebeca Lopes
Premium 4259 Fotos
Rayssa Melo
Premium 747 Fotos
Raquel Moraes
Premium 1207 Fotos
Rafaela Souza
Premium 3244 Fotos
Rafaela Staroski
Premium 2420 Fotos
Rafaela Rocha
604 Fotos
Rafaela Ribeiro
1067 Fotos
Rafaela Oliveira
Premium 244 Fotos
Priscila Assis
Premium 8732 Fotos
Pietra Nunes
Premium 116 Fotos
Paula Cardoso
548 Fotos
Patrícia Loureiro
Premium 3383 Fotos
Nicole Farias
1047 Fotos
Natália Figueiredo
Premium 691 Fotos
Nádia Varela
Premium 399 Fotos
Monique Xavier
Premium 2477 Fotos
Mirella Rocha
Premium 7271 Fotos
Mirela Diniz
2745 Fotos
Milena Rezende
1768 Fotos
Melissa Furtado
Premium 1792 Fotos
Marina Rocha
Premium 1387 Fotos
Marina Castro
Premium 3821 Fotos
Mariana Ribeiro
Premium 6591 Fotos
Maria Eduarda Rocha
Premium 193 Fotos
Maria Eduarda Lima
Premium 575 Fotos
Luiza Pimenta
558 Fotos
Luiza Almeida
422 Fotos
Lúcia Cunha
Premium 216 Fotos
Luana Bernardes
Premium 2301 Fotos
Lorena Dias
367 Fotos
Livia Campos
Premium 308 Fotos
Letícia Freitas
Premium 1022 Fotos
Letícia Duarte
Premium 6289 Fotos
Letícia Costa
319 Fotos
Laura Carvalho
Premium 90 Fotos
Larissa Tavares
Premium 4601 Fotos
Larissa Silva
Premium 791 Fotos
Larissa Rocha
Premium 114 Fotos
Kiara Freire
Premium 2706 Fotos
Julieta Neves
Premium 7775 Fotos
Juliana Ribeiro
Premium 54 Fotos
Juliana Mendes
Premium 731 Fotos
Juliana Melo
Premium 211 Fotos
Juliana Braga
Premium 469 Fotos
Júlia Pacheco
Premium 2380 Fotos
Júlia Nascimento
661 Fotos
Julia Mendes
Premium 1467 Fotos
Joyce Lima
Premium 781 Fotos
Jéssica Queiroz
Premium 204 Fotos
Isadora Ramos
Premium 785 Fotos
Isadora Morais
Premium 781 Fotos
Isabella Costa
Premium 259 Fotos
Isabela Silva
Premium 2439 Fotos
Isabela Nunes
Premium 712 Fotos
Isabela Correia
Premium 59 Fotos
Ingrid Silveira
Premium 993 Fotos
Heloísa Oliveira
Premium 563 Fotos
Heloísa Mattos
Premium 134 Fotos
Helena Moreira
Premium 1652 Fotos
Helena Azevedo
Premium 161 Fotos
Gabriela Nogueira
Premium 4244 Fotos
Gabriela Almeida
Premium 783 Fotos
Flávia Barroso
Premium 1617 Fotos
Fernanda Lopes
Premium 1019 Fotos
Fabiana Moura
Premium 240 Fotos
Estela Mourão
Premium 1353 Fotos
Eloá Lemos
421 Fotos
Elisa Dornelles
Premium 1276 Fotos
Elisa Cunha
Premium 1043 Fotos
Eliane Peixoto
Premium 1135 Fotos
Eduarda Tavares
Premium 213 Fotos
Eduarda Sales
Premium 759 Fotos
Eduarda Pereira
667 Fotos
Eduarda Campos
Premium 169 Fotos
Débora Coutinho
Premium 389 Fotos
Cristiane Lacerda
Premium 649 Fotos
Cristal Menezes
Premium 2928 Fotos
Clara Silvestre
Premium 323 Fotos
Cecília Bastos
Premium 850 Fotos
Caroline Brito
Premium 364 Fotos
Carolina Rocha
Premium 629 Fotos
Carolina Maia
Premium 1639 Fotos
Carolina Ferreira
Premium 378 Fotos
Camila Souza
Premium 181 Fotos
Camila Fernandes
Premium 273 Fotos
Bruna Teles
Premium 819 Fotos
Bruna Moreira
Premium 1042 Fotos
Bianca Ferreira
Premium 912 Fotos
Bianca Avelar
Premium 125 Fotos
Beatriz Martins
Premium 422 Fotos
Beatriz Lima
Premium 379 Fotos
Beatriz Castro
Premium 769 Fotos
Andressa Prado
Premium 2906 Fotos
Ana Clara Souza
Premium 1968 Fotos
Ana Beatriz Souza
Premium 852 Fotos
Amanda Oliveira
Premium 467 Fotos
Amanda Martins
Premium 381 Fotos
Amanda Correia
Premium 1315 Fotos
Aline Vasconcelos
386 Fotos
Alice Martins
Premium 374 Fotos
Alice Costa
Premium 2616 Fotos
Alice Cardim
Premium 832 Fotos
Agatha Prado
Premium 2420 Fotos
Agatha Prado
Premium 2420 Fotos
`;

// Helper to normalize names
function normalize(name) {
  if (!name) return '';
  return name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove non-alphanumeric
}

// 1. Parse user list
const lines = userListData.split('\n').map(l => l.trim()).filter(l => l);
const photoCountsMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Fotos')) {
    const prevLine = lines[i - 1];
    if (prevLine) {
      const matchNum = line.match(/\d+/);
      const photosCount = matchNum ? parseInt(matchNum[0], 10) : 100;
      const isPremium = line.includes('Premium');
      const normalizedName = normalize(prevLine);
      photoCountsMap.set(normalizedName, {
        name: prevLine,
        photosCount,
        isPremium
      });
    }
  }
}

console.log(`Parsed ${photoCountsMap.size} model photo counts from list.`);

// 2. Read existing initialModels.json
const initialModels = JSON.parse(fs.readFileSync(INITIAL_MODELS_PATH, 'utf-8'));

// 3. Scan backup directory and copy all media
const backupDirs = fs.readdirSync(BACKUP_DIR).filter(item => {
  return fs.statSync(path.join(BACKUP_DIR, item)).isDirectory();
});

console.log(`Found ${backupDirs.length} model folders in backup directory.`);

let copiedFilesCount = 0;

for (const dir of backupDirs) {
  const backupImgDir = path.join(BACKUP_DIR, dir, 'imagens');
  const destImgDir = path.join(PUBLIC_MODELS_DIR, dir);

  if (fs.existsSync(backupImgDir)) {
    if (!fs.existsSync(destImgDir)) {
      fs.mkdirSync(destImgDir, { recursive: true });
    }

    const files = fs.readdirSync(backupImgDir).filter(f => f.endsWith('.jpg'));
    for (const file of files) {
      const srcPath = path.join(backupImgDir, file);
      const destPath = path.join(destImgDir, file);
      
      // Copy only if size differs or not exists
      if (!fs.existsSync(destPath) || fs.statSync(srcPath).size !== fs.statSync(destPath).size) {
        fs.copyFileSync(srcPath, destPath);
        copiedFilesCount++;
      }
    }
    
    // Also guarantee cover.jpg exists (usually copied from imagem_1.jpg)
    const coverPath = path.join(destImgDir, 'cover.jpg');
    if (!fs.existsSync(coverPath)) {
      const imagem1 = path.join(destImgDir, 'imagem_1.jpg');
      if (fs.existsSync(imagem1)) {
        fs.copyFileSync(imagem1, coverPath);
      } else {
        const filesJpg = fs.readdirSync(destImgDir).filter(f => f.endsWith('.jpg') && f !== 'cover.jpg');
        if (filesJpg.length > 0) {
          fs.copyFileSync(path.join(destImgDir, filesJpg[0]), coverPath);
        }
      }
    }
  }
}

console.log(`Copied/Updated ${copiedFilesCount} media files.`);

// 4. Update models list with galleries and user list photo counts
let updatedCounts = 0;
let updatedPremium = 0;

const updatedModels = initialModels.map(model => {
  const normalizedModelName = normalize(model.name);
  let matched = photoCountsMap.get(normalizedModelName);

  // Fallback fuzzy search if exact normalized name didn't match (e.g. slight typo/accents in list name)
  if (!matched) {
    for (const [key, value] of photoCountsMap.entries()) {
      if (key.includes(normalizedModelName) || normalizedModelName.includes(key)) {
        matched = value;
        break;
      }
    }
  }

  // Determine actual images copied to destination folder
  const modelDirName = model.cover.split('/')[2]; // gets e.g. Agatha_Prado
  const destImgDir = path.join(PUBLIC_MODELS_DIR, modelDirName);
  let galleryPaths = [];

  if (fs.existsSync(destImgDir)) {
    const files = fs.readdirSync(destImgDir)
      .filter(f => f.endsWith('.jpg') && f !== 'cover.jpg')
      .sort((a, b) => {
        // Sort image_1, image_2, etc numerically
        const numA = parseInt(a.match(/\d+/) || '0');
        const numB = parseInt(b.match(/\d+/) || '0');
        return numA - numB;
      });

    galleryPaths = files.map(f => `/models/${modelDirName}/${f}`);
  }

  // Default to cover if no gallery images
  if (galleryPaths.length === 0) {
    galleryPaths = [model.cover];
  }

  const updatedModel = {
    ...model,
    gallery: galleryPaths
  };

  if (matched) {
    updatedModel.photosCount = matched.photosCount;
    updatedCounts++;
    
    if (matched.isPremium) {
      if (!updatedModel.categories.includes('Premium')) {
        updatedModel.categories.unshift('Premium');
      }
      updatedPremium++;
    }
  }

  return updatedModel;
});

// Save updated database
fs.writeFileSync(INITIAL_MODELS_PATH, JSON.stringify(updatedModels, null, 2), 'utf-8');
console.log(`Successfully updated initialModels.json:`);
console.log(`- Updated photo counts: ${updatedCounts}/${initialModels.length} models`);
console.log(`- Updated premium status: ${updatedPremium} models`);
console.log(`- Added gallery paths for all models.`);
