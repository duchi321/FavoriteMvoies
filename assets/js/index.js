const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeChangeSwitch = document.querySelector('#change-mode')

const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
let currentPage = 1

// 取得第3方資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMoviesList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))

// 顯示電影清單
function renderMoviesList(data) {
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
  htmlContent : `
  <div class="col-12">
  <ul class="list-group">${htmlContent}</ul>
  </div>`
}

function cardTemplate(data){
  return`
    <div class="col-3">
      <div class="mb-3">
        <div class="card">
          <img src="${POSTER_URL + data.image}" class="card-img-top" alt="Movie Poster"/>
          <div class="card-body">
            <h5 class="card-title">${data.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
            <button class="btn btn-success btn-add-favorite" data-id="${data.id}">+</button>
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
        <button class="btn btn-info btn-add-favorite" data-id="${data.id}">+</button>
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
  renderMoviesList(getMoviesByPage(currentPage))
}

// 動態顯示分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let pageHtml = ''
  for (let i = 1; i <= numberOfPages; i++) {
    pageHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = pageHtml
  const addAction = paginator.firstElementChild.firstElementChild
  addAction.classList.add('active')
}

// 顯示電影畫面數量(12頁)
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const starIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(starIndex, starIndex + MOVIES_PER_PAGE)
}

// 顯示互動視窗
function showMovieModel(id) {
  const modelTitle = document.querySelector('#movie-modal-title')
  const modelImg = document.querySelector('#movie-modal-image')
  const modelDate = document.querySelector('#movie-modal-date')
  const modelDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modelTitle.textContent = data.title
    modelImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    modelDate.textContent = `Release date: ${data.release_date}`
    modelDescription.textContent = data.description
  }).catch((err) =>
    console.log(err)
  )
}

// add localStorage
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('已收藏清單!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// more & + 監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModel(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 收尋按鈕監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  // 取消預設事件
  // 取得搜尋關鍵字
  const keyWord = searchInput.value.trim().toLowerCase()
  //錯誤處理：無符合條件的結果
  if (!keyWord) {
    alert('請輸入關鍵字！');
  }
  
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyWord)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyWord} 沒有符合條件的電影`)
  }
  
  //重新輸出至畫面
  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMoviesList(getMoviesByPage(currentPage))
})

// 分頁監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const activePage = paginator.querySelector('.page-link.active')
  let currentPage = Number(event.target.dataset.page)
  if(currentPage){
    activePage.classList.remove('active')
  }
  event.target.classList.add('active')
  renderMoviesList(getMoviesByPage(currentPage))
})

// mode-change 監聽器
modeChangeSwitch.addEventListener('click', function onSwitchClicked(event){
  if(event.target.matches('#card-mode-button')){
    updateMode('card-mode')
  }else if(event.target.matches('#list-mode-button')){
    updateMode('list-mode')
  }
})