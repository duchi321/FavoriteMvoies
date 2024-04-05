const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const MOVIES_PER_PAGE = 12
let filteredMovies = []
const movies = []

// 取得第3方資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMoviesList(getMoviesByPage(2))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))

// 顯示電影清單
function renderMoviesList(data) {
  let htmlContent = ''
  data.forEach((item) => {
    htmlContent += `
              <div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img
          src="${POSTER_URL + item.image}"
          class="card-img-top"
          alt="Movie Poster"
        />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button class="btn btn-success btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>
        `
  })
  dataPanel.innerHTML = htmlContent
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let pageHtml = ''
  for (let i = 1; i <= numberOfPages; i++) {
    pageHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = pageHtml
}

function getMoviesByPage(page) {
  const starIndex = (page - 1) * MOVIES_PER_PAGE
  return movies.slice(starIndex, starIndex + MOVIES_PER_PAGE)
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

function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('已收藏清單!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 主畫面監聽器
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    console.log(e.target)
    console.log(e.target.dataset.id)
    showMovieModel(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

// 收尋按鈕監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 取消預設事件
  event.preventDefault()
  console.log('add success')
  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //條件篩選
  // 方法1 for of loops 
  // 使用 方法1 記得要clear filteredMovies，不然會累加
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 方法2 filter()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重新輸出至畫面
  renderMoviesList(filteredMovies)
})

paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  const page = Number(e.target.dataset.page)
  renderMoviesList(getMoviesByPage(page))
})