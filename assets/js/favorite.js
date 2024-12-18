const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //收藏清單
const dataPanel = document.querySelector('#data-panel')
const modeChangeSwitch = document.querySelector('#change-mode')


// 顯示電影清單
function renderMoviesList(data) {
  if(!data || data.length === 0){
    dataPanel.innerHTML = `
    <div class="col-12 text-center">
      <p class="fs-4">沒有任何項目!<br>請加入喜歡的電影!</p>
    </div>`
    return
  }
  const isCardMode = dataPanel.dataset.mode === 'card-mode'
  let htmlContent = ''
  data.forEach((item) => {
      if(isCardMode){
        htmlContent += cardTemplate(item)
      }else{
        htmlContent += listTemplate(item)
      }
  })
  dataPanel.innerHTML = isCardMode ?
  htmlContent : `<ul class="list-group col-sm-12 mb-2">${htmlContent}</ul>`
}

function cardTemplate(data){
  return`
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + data.image}" class="card-img-top" alt="Movie Poster"/>
          <div class="card-body">
            <h5 class="card-title">${data.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${data.id}">-</button>
          </div>
        </div>
      </div>
    </div>    
`
}
    
function listTemplate(data){
  return`
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">${sanitizeHTML(data.title)}</h5>
      <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
        <button class="btn btn-danger btn-remove-favorite" data-id="${data.id}">-</button>
      </div>
    </li>
  `
}

// 過濾 black attack
function sanitizeHTML(string){
  const div = document.createElement('div')
  div.textContent = string
  return div.innerHTML
}

// mode-state
function updateMode(mode){
  if (dataPanel.dataset.mode === mode) return 
  dataPanel.dataset.mode = mode
  renderMoviesList(movies)
}

// 顯示互動視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

// remove favorite movies
function removeFromFavorite(id) {
  if (!movies || !movies.length) return
  const mvoiesIndex = movies.findIndex((movie) => movie.id === id)
  if (mvoiesIndex === -1) return
  movies.splice(mvoiesIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMoviesList(movies)
}

// more & + 監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

// mode-change 監聽器
modeChangeSwitch.addEventListener('click', function onSwitchClicked(event){
  if(event.target.matches('#card-mode-button')){
    updateMode('card-mode')
  }else if(event.target.matches('#list-mode-button')){
    updateMode('list-mode')
  }
})

renderMoviesList(movies)