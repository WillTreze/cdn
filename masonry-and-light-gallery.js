import 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js';
import 'https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js';
import 'https://cdn.jsdelivr.net/npm/lightgallery.js@1.4.0/dist/js/lightgallery.min.js';
import 'https://cdn.rawgit.com/sachinchoolur/lg-fullscreen.js/master/dist/lg-fullscreen.js';
import 'https://cdn.rawgit.com/sachinchoolur/lg-zoom.js/master/dist/lg-zoom.js';
import 'https://sachinchoolur.github.io/lightgallery.js/lightgallery/js/lg-thumbnail.js';

function containsOnlyNumbers(fileName) {
  return /^\d+$/.test(fileName);
}
function allNamesContainOnlyNumbers(namesArray) {
  for (let i = 0; i < namesArray.length; i++) {
    if (!containsOnlyNumbers(namesArray[i])) {
      return false;
    }
  }
  return true;
}

async function masonryAndLightGallery(albumHash, accessToken) {
  let isThereAnError = false;

  try {
    const response = await fetch(`https://api.imgur.com/3/album/${albumHash}/images`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { data } = await response.json();
    const hasOnlyNumbers = allNamesContainOnlyNumbers(data.map(({name}) => name));

    if (hasOnlyNumbers) {
      data.sort((a, b) => a.name && parseInt(a.name) - parseInt(b.name));
    } else {
      data.sort((a, b) => {
        if (a.name) {
          const nomeA = a.name.toUpperCase();
          const nomeB = b.name.toUpperCase();
  
          if (nomeA < nomeB) {
            return -1;
          }
          if (nomeA > nomeB) {
            return 1;
          }
        }
        return 0;
      });
    }
    
    data.forEach(image => {
      const img = document.createElement('img');
      const div = document.createElement('div');
      div.setAttribute('data-src', image.link);
      div.setAttribute('id', image.id|| Math.random().toString(36).substring(2));
      div.setAttribute('data-thumb', image.link.replace(/(\.[^/.]+)$/, "t$1"))
      div.className = "grid-wrapper-item";

      img.src = image.link.replace(/(\.[^/.]+)$/, "l$1");
      img.title = image.name;
      img.className = "grid-item"

      div.appendChild(img);
      document.getElementById('light-gallery').appendChild(div);
    });

    isThereAnError = true;
  } catch (error) {
    throw new Error('Não foi possível listar as imagens do album \n' + error.message);
  } finally {
    if (isThereAnError) {
      // init light gallery
      lightGallery(document.getElementById('light-gallery'), {
        thumbnail: true,
        animateThumb: true,
        showThumbByDefault: false,
        selector: '.grid-wrapper-item',
        exThumbImage: 'data-thumb',
      });
      // init masonry
      const grid = document.querySelector('.grid');
      const masonry = new Masonry(grid, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true,
        gutter: 0,
      });
      // check if image loaded before mount masonry
      imagesLoaded(grid).on('progress', (_, image) => {
        masonry.layout();
        image.img.classList.add('fade-in');
      });
    }
  }
};

export default masonryAndLightGallery;